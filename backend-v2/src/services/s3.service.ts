import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config';
import logger from '../utils/logger';
import axios from 'axios';

export interface S3UploadResult {
  key: string;
  bucket: string;
  url: string;
  signedUrl?: string;
}

export interface S3UploadOptions {
  bucket?: string;
  contentType?: string;
  isPublic?: boolean;
  expiresIn?: number; // For signed URLs
}

export class S3Service {
  private static instance: S3Service;
  private s3Client: S3Client | null = null;

  private constructor() {
    // Don't initialize S3Client in constructor to avoid errors at startup
  }

  public static getInstance(): S3Service {
    if (!S3Service.instance) {
      S3Service.instance = new S3Service();
    }
    return S3Service.instance;
  }

  private static s3Client: S3Client | null = null;

  private static getS3Client(): S3Client {
    if (!S3Service.s3Client) {
      // ✅ Додайте лог для перевірки, чи читаються змінні
      logger.debug('[S3Service] Initializing S3 Client with region:', config.aws.region);
      if (!config.aws.accessKeyId || !config.aws.secretAccessKey) {
        logger.error('[S3Service] AWS credentials are NOT defined in .env file!', {
          hasAccessKey: !!config.aws.accessKeyId,
          hasSecretKey: !!config.aws.secretAccessKey,
          hasRegion: !!config.aws.region,
          hasBucket: !!config.aws.s3BucketName
        });
        throw new Error('AWS credentials are missing');
      }

      logger.info('[S3Service] Creating new S3Client with config:', {
        region: config.aws.region,
        hasAccessKey: !!config.aws.accessKeyId,
        hasSecretKey: !!config.aws.secretAccessKey,
        bucket: config.aws.s3BucketName
      });
      
      S3Service.s3Client = new S3Client({
        region: config.aws.region,
        credentials: {
          accessKeyId: config.aws.accessKeyId,
          secretAccessKey: config.aws.secretAccessKey,
        },
      });
    }
    return S3Service.s3Client;
  }

  /**
   * Upload file to S3
   */
  public static async uploadFile(
    file: Buffer | Uint8Array | string,
    key: string,
    options: S3UploadOptions = {}
  ): Promise<S3UploadResult> {
    try {
      logger.info('[S3Service] Starting file upload:', {
        key,
        fileSize: file instanceof Buffer ? file.length : typeof file === 'string' ? file.length : 'unknown',
        contentType: options.contentType,
        isPublic: options.isPublic,
        bucket: config.aws.s3BucketName
      });

      const bucket = options.bucket || config.aws.s3BucketName;
      
      if (!bucket) {
        logger.error('[S3Service] S3 bucket name is not configured');
        throw new Error('S3 bucket name is not configured');
      }

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file,
        ContentType: options.contentType || 'application/octet-stream',
        // Removed ACL - modern S3 buckets use bucket policies instead
        // ACL: options.isPublic ? 'public-read' : 'private',
      });

      logger.info('[S3Service] Sending PutObjectCommand...');
      const result = await S3Service.getS3Client().send(command);
      logger.info('[S3Service] PutObjectCommand result:', result);

      const url = options.isPublic 
        ? `https://${bucket}.s3.${config.aws.region}.amazonaws.com/${key}`
        : undefined;

      logger.info(`[S3Service] File uploaded successfully: ${key}`);

      return {
        key,
        bucket,
        url: url || '',
      };
    } catch (error) {
      logger.error(`[S3Service] Error uploading file ${key}:`, error);
      throw error;
    }
  }

  /**
   * Upload file from URL to S3
   * Downloads image from external URL and uploads to S3
   */
  public async uploadFromUrl(
    imageUrl: string,
    propertyId: string,
    index: number = 0,
    options: S3UploadOptions = {}
  ): Promise<S3UploadResult> {
    try {
      logger.info(`[S3Service] Downloading image from URL: ${imageUrl}`);
      
      // Download image from URL
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000, // 30 second timeout
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RoomyCRM/1.0)',
        }
      });

      const imageBuffer = Buffer.from(response.data);
      logger.info(`[S3Service] Downloaded image, size: ${imageBuffer.length} bytes`);

      // Determine content type from response or URL
      const contentType = response.headers['content-type'] || this.getContentTypeFromUrl(imageUrl);
      
      // Generate S3 key
      const extension = this.getExtensionFromUrl(imageUrl) || 'jpg';
      const key = `properties/${propertyId}/photos/${Date.now()}-${index}.${extension}`;
      
      logger.info(`[S3Service] Uploading to S3 with key: ${key}`);

      // Upload to S3
      const result = await this.uploadFile(imageBuffer, key, {
        ...options,
        contentType,
        isPublic: true, // Property photos should be public
      });

      logger.info(`[S3Service] Successfully uploaded image from URL to S3: ${key}`);
      
      return result;
    } catch (error: any) {
      logger.error(`[S3Service] Error uploading from URL ${imageUrl}:`, error.message);
      throw new Error(`Failed to upload image from URL: ${error.message}`);
    }
  }

  /**
   * Get content type from URL
   */
  private getContentTypeFromUrl(url: string): string {
    const extension = this.getExtensionFromUrl(url);
    const contentTypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
    };
    return contentTypes[extension || 'jpg'] || 'image/jpeg';
  }

  /**
   * Get file extension from URL
   */
  private getExtensionFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const match = pathname.match(/\.([a-z0-9]+)$/i);
      return match ? match[1].toLowerCase() : null;
    } catch {
      return null;
    }
  }

  /**
   * Delete file from S3
   */
  public async deleteFile(key: string, bucket?: string): Promise<void> {
    try {
      const bucketName = bucket || config.aws.s3BucketName;
      
      if (!bucketName) {
        throw new Error('S3 bucket name is not configured');
      }

      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      await this.getS3Client().send(command);
      logger.info(`[S3Service] File deleted successfully: ${key}`);
    } catch (error) {
      logger.error(`[S3Service] Error deleting file ${key}:`, error);
      throw error;
    }
  }

  /**
   * Generate signed URL for private file access
   */
  public async getSignedUrl(
    key: string,
    expiresIn: number = 3600, // 1 hour default
    bucket?: string
  ): Promise<string> {
    try {
      const bucketName = bucket || config.aws.s3BucketName;
      
      if (!bucketName) {
        throw new Error('S3 bucket name is not configured');
      }

      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.getS3Client(), command, {
        expiresIn,
      });

      logger.info(`[S3Service] Generated signed URL for: ${key}`);
      return signedUrl;
    } catch (error) {
      logger.error(`[S3Service] Error generating signed URL for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Generate unique key for property photos
   */
  public generatePropertyPhotoKey(propertyId: string, filename: string): string {
    const timestamp = Date.now();
    const extension = filename.split('.').pop() || 'jpg';
    return `properties/${propertyId}/photos/${timestamp}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
  }

  /**
   * Generate unique key for documents
   */
  public generateDocumentKey(entityType: string, entityId: string, filename: string): string {
    const timestamp = Date.now();
    const extension = filename.split('.').pop() || 'pdf';
    return `${entityType.toLowerCase()}s/${entityId}/documents/${timestamp}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
  }

  /**
   * Check if S3 is configured
   */
  public isConfigured(): boolean {
    const hasCredentials = !!(config.aws.accessKeyId && config.aws.secretAccessKey && config.aws.region && config.aws.s3BucketName);
    logger.info(`[S3Service] Configuration check:`, {
      hasAccessKey: !!config.aws.accessKeyId,
      hasSecretKey: !!config.aws.secretAccessKey,
      hasRegion: !!config.aws.region,
      hasBucket: !!config.aws.s3BucketName,
      configured: hasCredentials
    });
    return hasCredentials;
  }

  /**
   * Generate a unique key for property photos
   */
  public generatePropertyPhotoKey(propertyId: string, originalName: string): string {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop();
    return `properties/${propertyId}/photos/${timestamp}-${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  }
}

// Export instance only when needed, not at module load
export default S3Service;
