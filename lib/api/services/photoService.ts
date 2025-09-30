import { API_CONFIG } from '../config'

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
      // Симуляція API виклику
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log(`API: Fetching photos for property ${propertyId}`)
      
      // Повертаємо з localStorage
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
      // Симуляція API виклику
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log(`API: Uploading ${files.length} photos for property ${propertyId}`)
      
      // Створюємо нові фото з blob URL-ами
      const newPhotos: Photo[] = Array.from(files).map((file, index) => ({
        id: `photo_${Date.now()}_${index}`,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        isCover: false,
        uploadedAt: new Date().toISOString()
      }))

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
      // Симуляція API виклику
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log(`API: Setting cover photo ${photoId} for property ${propertyId}`)
      
      // Отримуємо поточні фото
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
      // Симуляція API виклику
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log(`API: Deleting photo ${photoId} for property ${propertyId}`)
      
      // Отримуємо поточні фото
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
