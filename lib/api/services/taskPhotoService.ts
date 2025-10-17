import { apiClientV2 } from '../client-v2';
import { ApiResponseV2 } from '../types';

export interface TaskPhoto {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  s3Url: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
  uploadedAt: string;
}

export interface UploadPhotoResponse {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  s3Url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface DownloadUrlResponse {
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

class TaskPhotoService {
  /**
   * Get all photos for a maintenance task
   */
  async getTaskPhotos(taskId: string): Promise<ApiResponseV2<TaskPhoto[]>> {
    try {
      console.log('📸 TaskPhotoService: Fetching photos for task:', taskId);
      
      const response = await apiClientV2.get(`/tasks/${taskId}/photos`);
      console.log('📸 TaskPhotoService: Raw API Response:', response);
      
      return {
        success: response.success,
        data: response.data || [],
        message: response.message || 'Photos retrieved successfully',
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error: any) {
      console.error('📸 TaskPhotoService: Error fetching photos:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Unknown error',
        message: error.response?.data?.message || 'Failed to fetch photos',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Upload photo for a maintenance task
   */
  async uploadPhoto(taskId: string, photoFile: File): Promise<ApiResponseV2<UploadPhotoResponse>> {
    try {
      console.log('📸 TaskPhotoService: Uploading photo for task:', taskId);
      console.log('📸 TaskPhotoService: Photo file:', photoFile.name, photoFile.size, photoFile.type);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('photo', photoFile);
      
      const response = await apiClientV2.post(`/tasks/${taskId}/photos`, formData);
      
      console.log('📸 TaskPhotoService: Upload response:', response);
      
      return {
        success: response.success,
        data: response.data,
        message: response.message || 'Photo uploaded successfully',
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error: any) {
      console.error('📸 TaskPhotoService: Error uploading photo:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Unknown error',
        message: error.response?.data?.message || 'Failed to upload photo',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Delete photo from maintenance task
   */
  async deletePhoto(taskId: string, photoId: string): Promise<ApiResponseV2<void>> {
    try {
      console.log('📸 TaskPhotoService: Deleting photo:', photoId, 'from task:', taskId);
      
      const response = await apiClientV2.delete(`/tasks/${taskId}/photos/${photoId}`);
      console.log('📸 TaskPhotoService: Delete response:', response);
      
      return {
        success: response.success,
        data: undefined,
        message: response.message || 'Photo deleted successfully',
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error: any) {
      console.error('📸 TaskPhotoService: Error deleting photo:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Unknown error',
        message: error.response?.data?.message || 'Failed to delete photo',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get download URL for photo
   */
  async getDownloadUrl(taskId: string, photoId: string): Promise<ApiResponseV2<DownloadUrlResponse>> {
    try {
      console.log('📸 TaskPhotoService: Getting download URL for photo:', photoId);
      
      const response = await apiClientV2.get(`/tasks/${taskId}/photos/${photoId}/download`);
      console.log('📸 TaskPhotoService: Download URL response:', response);
      
      return {
        success: response.success,
        data: response.data,
        message: response.message || 'Download URL generated successfully',
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error: any) {
      console.error('📸 TaskPhotoService: Error getting download URL:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Unknown error',
        message: error.response?.data?.message || 'Failed to get download URL',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Check if file is an image
   */
  isImageFile(file: File): boolean {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return imageTypes.includes(file.type);
  }

  /**
   * Validate image file
   */
  validateImageFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    if (!this.isImageFile(file)) {
      return {
        isValid: false,
        error: 'Please select an image file (JPEG, PNG, GIF, WebP)'
      };
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size must be less than 10MB'
      };
    }

    return { isValid: true };
  }
}

export const taskPhotoService = new TaskPhotoService();
