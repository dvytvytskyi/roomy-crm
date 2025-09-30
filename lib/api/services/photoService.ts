import { api } from '../config'

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
      const response = await fetch(`${api.baseURL}/api/properties/${propertyId}/photos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.photos || []
    } catch (error) {
      console.error('Error fetching photos:', error)
      // Повертаємо з localStorage як fallback
      const savedPhotos = localStorage.getItem(`propertyPhotos_${propertyId}`)
      return savedPhotos ? JSON.parse(savedPhotos) : []
    }
  },

  // Завантажити нові фото
  uploadPhotos: async (propertyId: string, files: File[]): Promise<PhotoUploadResponse> => {
    try {
      const formData = new FormData()
      files.forEach((file, index) => {
        formData.append(`photos`, file)
      })

      const response = await fetch(`${api.baseURL}/api/properties/${propertyId}/photos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error uploading photos:', error)
      
      // Fallback: створюємо фото локально
      const newPhotos: Photo[] = files.map((file, index) => ({
        id: `photo_${Date.now()}_${index}`,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        isCover: false,
        uploadedAt: new Date().toISOString()
      }))

      return {
        success: true,
        photos: newPhotos,
        message: 'Photos uploaded locally (offline mode)'
      }
    }
  },

  // Встановити обкладинку
  setCoverPhoto: async (propertyId: string, photoId: string): Promise<Photo[]> => {
    try {
      const response = await fetch(`${api.baseURL}/api/properties/${propertyId}/photos/${photoId}/cover`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.photos || []
    } catch (error) {
      console.error('Error setting cover photo:', error)
      throw error
    }
  },

  // Видалити фото
  deletePhoto: async (propertyId: string, photoId: string): Promise<Photo[]> => {
    try {
      const response = await fetch(`${api.baseURL}/api/properties/${propertyId}/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.photos || []
    } catch (error) {
      console.error('Error deleting photo:', error)
      throw error
    }
  },

  // Зберегти фото локально (для offline режиму)
  savePhotosLocally: (propertyId: string, photos: Photo[]) => {
    localStorage.setItem(`propertyPhotos_${propertyId}`, JSON.stringify(photos))
  },

  // Завантажити фото з локального сховища
  loadPhotosLocally: (propertyId: string): Photo[] => {
    const savedPhotos = localStorage.getItem(`propertyPhotos_${propertyId}`)
    return savedPhotos ? JSON.parse(savedPhotos) : []
  }
}
