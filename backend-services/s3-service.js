// S3 Service for file uploads
// Note: Run 'npm install aws-sdk @aws-sdk/client-s3 @aws-sdk/s3-request-presigner multer' to enable full functionality

const S3_CONFIG = require('./s3-config');

class S3Service {
  constructor() {
    this.config = S3_CONFIG;
    this.initialized = false;
    this.s3Client = null;
    
    // Try to initialize AWS SDK if available
    this.tryInitialize();
  }

  tryInitialize() {
    try {
      // Try to load AWS SDK v3
      const { S3Client } = require('@aws-sdk/client-s3');
      const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
      const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
      
      this.s3Client = new S3Client({
        region: this.config.region,
        credentials: {
          accessKeyId: this.config.accessKeyId,
          secretAccessKey: this.config.secretAccessKey
        }
      });
      
      this.PutObjectCommand = PutObjectCommand;
      this.GetObjectCommand = GetObjectCommand;
      this.DeleteObjectCommand = DeleteObjectCommand;
      this.getSignedUrl = getSignedUrl;
      
      this.initialized = true;
      console.log('✅ S3 Service initialized successfully');
      console.log(`📦 S3 Bucket: ${this.config.bucket}`);
      console.log(`🌍 S3 Region: ${this.config.region}`);
    } catch (error) {
      console.warn('⚠️ AWS SDK not installed. S3 functionality will be mocked.');
      console.warn('💡 Run: npm install aws-sdk @aws-sdk/client-s3 @aws-sdk/s3-request-presigner multer');
      this.initialized = false;
    }
  }

  async uploadFile(file, folder = 'documents') {
    if (!this.initialized) {
      // Mock upload for development
      const mockUrl = `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${folder}/${Date.now()}_${file.originalname}`;
      console.log('🔧 Mock S3 upload:', mockUrl);
      return {
        success: true,
        url: mockUrl,
        key: `${folder}/${Date.now()}_${file.originalname}`,
        bucket: this.config.bucket
      };
    }

    try {
      const key = `${folder}/${Date.now()}_${file.originalname}`;
      
      const command = new this.PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'private'
      });

      await this.s3Client.send(command);

      const url = `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`;

      return {
        success: true,
        url: url,
        key: key,
        bucket: this.config.bucket
      };
    } catch (error) {
      console.error('❌ S3 upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getSignedDownloadUrl(key, expiresIn = 3600) {
    if (!this.initialized) {
      // Mock signed URL
      const mockUrl = `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}?mock=true&expires=${expiresIn}`;
      console.log('🔧 Mock S3 signed URL:', mockUrl);
      return {
        success: true,
        url: mockUrl
      };
    }

    try {
      const command = new this.GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key
      });

      const signedUrl = await this.getSignedUrl(this.s3Client, command, { expiresIn });

      return {
        success: true,
        url: signedUrl
      };
    } catch (error) {
      console.error('❌ S3 signed URL error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteFile(key) {
    if (!this.initialized) {
      // Mock delete
      console.log('🔧 Mock S3 delete:', key);
      return {
        success: true,
        message: 'File deleted (mocked)'
      };
    }

    try {
      const command = new this.DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: key
      });

      await this.s3Client.send(command);

      return {
        success: true,
        message: 'File deleted successfully'
      };
    } catch (error) {
      console.error('❌ S3 delete error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async listFiles(folder = '') {
    if (!this.initialized) {
      // Mock list
      console.log('🔧 Mock S3 list for folder:', folder);
      return {
        success: true,
        files: []
      };
    }

    try {
      const { ListObjectsV2Command } = require('@aws-sdk/client-s3');
      
      const command = new ListObjectsV2Command({
        Bucket: this.config.bucket,
        Prefix: folder
      });

      const response = await this.s3Client.send(command);

      return {
        success: true,
        files: response.Contents || []
      };
    } catch (error) {
      console.error('❌ S3 list error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
const s3Service = new S3Service();
module.exports = s3Service;

