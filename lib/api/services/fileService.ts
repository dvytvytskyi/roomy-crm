import { apiClient } from '../client';
import { ApiResponse } from '../client';

export interface UploadFileResponse {
  success: boolean;
  url: string;
  key: string;
  bucket: string;
  size: number;
  filename: string;
}

export interface SignedUrlResponse {
  success: boolean;
  url: string;
  expiresIn: number;
}

class FileService {
  /**
   * Upload file to S3
   * @param file - File to upload
   * @param folder - Folder in S3 bucket (e.g., 'documents', 'photos', 'profiles')
   */
  async uploadFile(file: File, folder: string = 'documents'): Promise<ApiResponse<UploadFileResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get signed URL for secure file download
   * @param key - S3 file key
   */
  async getSignedUrl(key: string): Promise<ApiResponse<SignedUrlResponse>> {
    const response = await apiClient.get<SignedUrlResponse>(`/files/signed-url?key=${encodeURIComponent(key)}`);
    return response;
  }

  /**
   * Delete file from S3
   * @param key - S3 file key
   */
  async deleteFile(key: string): Promise<ApiResponse<any>> {
    const response = await apiClient.delete<any>(`/files/${encodeURIComponent(key)}`);
    return response;
  }

  /**
   * List files in a folder
   * @param folder - Folder path in S3
   */
  async listFiles(folder: string = ''): Promise<ApiResponse<{ files: any[] }>> {
    const response = await apiClient.get<{ files: any[] }>(`/files/list?folder=${encodeURIComponent(folder)}`);
    return response;
  }

  /**
   * Helper to get file extension
   */
  getFileExtension(filename: string): string {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }

  /**
   * Helper to format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Helper to check if file is image
   */
  isImage(filename: string): boolean {
    const ext = this.getFileExtension(filename).toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
  }

  /**
   * Helper to check if file is PDF
   */
  isPDF(filename: string): boolean {
    return this.getFileExtension(filename).toLowerCase() === 'pdf';
  }
}

export const fileService = new FileService();

