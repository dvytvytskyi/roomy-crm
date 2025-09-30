import { API_CONFIG } from '../config'

export interface Document {
  id: string
  title: string
  fileName: string
  uploadDate: string
  fileSize: string
  type: string
  uploadedBy: string
  uploadedByEmail: string
  url?: string
}

export const documentService = {
  // Отримати документи для властивості
  getDocuments: async (propertyId: string): Promise<Document[]> => {
    try {
      // Симуляція API виклику
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log(`API: Fetching documents for property ${propertyId}`)
      
      // Повертаємо дані з localStorage або значення за замовчуванням
      return documentService.loadFromLocalStorage(propertyId)
    } catch (error) {
      console.error('Error fetching documents:', error)
      // Повертаємо з localStorage як fallback
      return documentService.loadFromLocalStorage(propertyId)
    }
  },

  // Завантажити новий документ
  uploadDocument: async (propertyId: string, file: File, metadata: {
    title: string
    type: string
    uploadedBy: string
    uploadedByEmail: string
  }): Promise<Document> => {
    try {
      // Симуляція API виклику
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log(`API: Uploading document for property ${propertyId}:`, metadata)
      
      // В реальному додатку тут буде завантаження файлу на сервер
      const newDocument: Document = {
        id: `doc_${Date.now()}_${propertyId}`,
        title: metadata.title,
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        type: metadata.type,
        uploadedBy: metadata.uploadedBy,
        uploadedByEmail: metadata.uploadedByEmail,
        url: URL.createObjectURL(file) // Для демонстрації
      }
      
      return newDocument
    } catch (error) {
      console.error('Error uploading document:', error)
      throw error
    }
  },

  // Видалити документ
  deleteDocument: async (propertyId: string, documentId: string): Promise<void> => {
    try {
      // Симуляція API виклику
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log(`API: Deleting document ${documentId} for property ${propertyId}`)
    } catch (error) {
      console.error('Error deleting document:', error)
      throw error
    }
  },

  // Завантажити документ
  downloadDocument: async (propertyId: string, documentId: string): Promise<void> => {
    try {
      // Симуляція API виклику
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log(`API: Downloading document ${documentId} for property ${propertyId}`)
      
      // В реальному додатку тут буде завантаження файлу
    } catch (error) {
      console.error('Error downloading document:', error)
      throw error
    }
  },

  // Зберегти документи в localStorage
  saveToLocalStorage: (propertyId: string, documents: Document[]) => {
    localStorage.setItem(`propertyDocuments_${propertyId}`, JSON.stringify(documents))
  },

  // Завантажити документи з localStorage
  loadFromLocalStorage: (propertyId: string): Document[] => {
    const saved = localStorage.getItem(`propertyDocuments_${propertyId}`)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (error) {
        console.error('Error parsing saved documents:', error)
      }
    }
    
    // Повертаємо порожній масив за замовчуванням
    return []
  }
}
