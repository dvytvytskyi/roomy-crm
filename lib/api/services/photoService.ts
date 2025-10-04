import { API_ENDPOINTS } from '../config'
import { apiClient } from '../client'

export interface Photo {
  id: string
  url: string
  name: string
  size: number
  isCover: boolean
  uploadedAt: string
}

export interface PhotoUploadResponse {
  success: boolean
  photos: Photo[]
  message?: string
}

export const photoService = {
  // Отримати всі фото для властивості
  getPhotos: async (propertyId: string): Promise<Photo[]> => {
    try {
      console.log(`API: Fetching photos for property ${propertyId}`)
      
      const response = await apiClient.get(API_ENDPOINTS.PROPERTIES.PHOTOS(propertyId))
      
      if (response.data.success) {
        return response.data.data || []
      } else {
        throw new Error(response.data.message || 'Failed to fetch photos')
      }
    } catch (error) {
      console.error('Error fetching photos:', error)
      // Повертаємо з localStorage як fallback
      return photoService.loadFromLocalStorage(propertyId)
    }
  },

  // Завантажити нові фото
  uploadPhotos: async (propertyId: string, files: File[]): Promise<PhotoUploadResponse> => {
    try {
      console.log(`API: Uploading ${files.length} photos for property ${propertyId}`)
      
      // Створюємо FormData для завантаження файлів
      const formData = new FormData()
      files.forEach((file, index) => {
        formData.append(`photos`, file)
      })
      
      const response = await apiClient.post(
        API_ENDPOINTS.PROPERTIES.UPLOAD_PHOTOS(propertyId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      
      if (response.data.success) {
        return {
          success: true,
          photos: response.data.data || [],
          message: response.data.message || `Successfully uploaded ${files.length} photos`
        }
      } else {
        throw new Error(response.data.message || 'Failed to upload photos')
      }
    } catch (error) {
      console.error('Error uploading photos:', error)
      throw error
    }
  },

  // Встановити обкладинку
  setCoverPhoto: async (propertyId: string, photoId: string): Promise<Photo[]> => {
    try {
      console.log(`API: Setting cover photo ${photoId} for property ${propertyId}`)
      
      const response = await apiClient.post(
        API_ENDPOINTS.PROPERTIES.SET_COVER_PHOTO(propertyId, photoId)
      )
      
      if (response.data.success) {
        return response.data.data || []
      } else {
        throw new Error(response.data.message || 'Failed to set cover photo')
      }
    } catch (error) {
      console.error('Error setting cover photo:', error)
      throw error
    }
  },

  // Видалити фото
  deletePhoto: async (propertyId: string, photoId: string): Promise<Photo[]> => {
    try {
      console.log(`API: Deleting photo ${photoId} for property ${propertyId}`)
      
      const response = await apiClient.delete(
        API_ENDPOINTS.PROPERTIES.DELETE_PHOTO(propertyId, photoId)
      )
      
      if (response.data.success) {
        return response.data.data || []
      } else {
        throw new Error(response.data.message || 'Failed to delete photo')
      }
    } catch (error) {
      console.error('Error deleting photo:', error)
      throw error
    }
  },

  // Зберегти фото локально (тимчасово поки не готовий S3 бекенд)
  saveToLocalStorage: (propertyId: string, photos: Photo[]) => {
    localStorage.setItem(`propertyPhotos_${propertyId}`, JSON.stringify(photos))
  },

  // Завантажити фото з локального сховища (тимчасово поки не готовий S3 бекенд)
  loadFromLocalStorage: (propertyId: string): Photo[] => {
    const savedPhotos = localStorage.getItem(`propertyPhotos_${propertyId}`)
    return savedPhotos ? JSON.parse(savedPhotos) : []
  },

  // Конвертувати файл в base64
  fileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('Failed to convert file to base64'))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

}
