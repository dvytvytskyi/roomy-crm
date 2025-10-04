import { API_CONFIG, API_ENDPOINTS, apiClient } from '../config'

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
      
      // Тимчасово використовуємо localStorage поки не готовий S3 бекенд
      return photoService.loadFromLocalStorage(propertyId)
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
      
      // Конвертуємо файли в base64 для збереження в localStorage
      const newPhotos: Photo[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const base64 = await photoService.fileToBase64(file)
        
        newPhotos.push({
          id: `photo_${Date.now()}_${i}`,
          url: base64,
          name: file.name,
          size: file.size,
          isCover: false,
          uploadedAt: new Date().toISOString()
        })
      }

      // Отримуємо існуючі фото
      const existingPhotos = photoService.loadFromLocalStorage(propertyId)
      const updatedPhotos = [...existingPhotos, ...newPhotos]

      // Зберігаємо в localStorage
      photoService.saveToLocalStorage(propertyId, updatedPhotos)

      return {
        success: true,
        photos: newPhotos,
        message: `Successfully uploaded ${files.length} photos`
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
      
      // Тимчасово використовуємо localStorage поки не готовий S3 бекенд
      const photos = photoService.loadFromLocalStorage(propertyId)
      
      // Оновлюємо фото
      const updatedPhotos = photos.map(photo => ({
        ...photo,
        isCover: photo.id === photoId
      }))

      // Зберігаємо в localStorage
      photoService.saveToLocalStorage(propertyId, updatedPhotos)

      return updatedPhotos
    } catch (error) {
      console.error('Error setting cover photo:', error)
      throw error
    }
  },

  // Видалити фото
  deletePhoto: async (propertyId: string, photoId: string): Promise<Photo[]> => {
    try {
      console.log(`API: Deleting photo ${photoId} for property ${propertyId}`)
      
      // Тимчасово використовуємо localStorage поки не готовий S3 бекенд
      const photos = photoService.loadFromLocalStorage(propertyId)
      
      // Видаляємо фото
      const updatedPhotos = photos.filter(photo => photo.id !== photoId)
      
      // Якщо видаляємо обкладинку, встановлюємо нову
      const deletedPhoto = photos.find(photo => photo.id === photoId)
      if (deletedPhoto?.isCover && updatedPhotos.length > 0) {
        updatedPhotos[0].isCover = true
      }

      // Зберігаємо в localStorage
      photoService.saveToLocalStorage(propertyId, updatedPhotos)

      return updatedPhotos
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
