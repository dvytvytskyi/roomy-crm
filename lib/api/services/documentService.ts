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
  key?: string
  mimeType?: string
}

interface UploadDocumentMetadata {
  title: string
  documentType: string
}

export const documentService = {
  /**
   * Get all documents for a property
   */
  getDocuments: async (propertyId: string): Promise<Document[]> => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/properties/${propertyId}/documents`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch documents')
      }

      const result = await response.json()
      return result.data || []
    } catch (error) {
      console.error('Error fetching documents:', error)
      throw error
    }
  },

  /**
   * Upload a new document
   */
  uploadDocument: async (
    propertyId: string,
    file: File,
    metadata: UploadDocumentMetadata
  ): Promise<Document> => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Create FormData for multipart/form-data upload
      const formData = new FormData()
      formData.append('document', file)
      formData.append('title', metadata.title)
      formData.append('documentType', metadata.documentType)

      console.log(`[DocumentService] Uploading document for property ${propertyId}:`, {
        fileName: file.name,
        fileSize: file.size,
        title: metadata.title,
        documentType: metadata.documentType
      })

      const response = await fetch(`${API_CONFIG.BASE_URL}/properties/${propertyId}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Note: Don't set Content-Type header - browser will set it automatically with boundary
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to upload document')
      }

      const result = await response.json()
      console.log('[DocumentService] Document uploaded successfully:', result.data)
      
      return result.data
    } catch (error) {
      console.error('Error uploading document:', error)
      throw error
    }
  },

  /**
   * Delete a document
   */
  deleteDocument: async (propertyId: string, documentId: string): Promise<void> => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/properties/${propertyId}/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete document')
      }

      console.log(`[DocumentService] Document ${documentId} deleted successfully`)
    } catch (error) {
      console.error('Error deleting document:', error)
      throw error
    }
  },

  /**
   * Get download URL for a document
   */
  getDownloadUrl: async (propertyId: string, documentId: string): Promise<string> => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/properties/${propertyId}/documents/${documentId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to get download URL')
      }

      const result = await response.json()
      return result.data.url
    } catch (error) {
      console.error('Error getting download URL:', error)
      throw error
    }
  },

  /**
   * Download a document
   */
  downloadDocument: async (propertyId: string, documentId: string, fileName: string): Promise<void> => {
    try {
      const url = await documentService.getDownloadUrl(propertyId, documentId)
      
      // Create a temporary link and trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      console.log(`[DocumentService] Document ${fileName} download started`)
    } catch (error) {
      console.error('Error downloading document:', error)
      throw error
    }
  },
}
