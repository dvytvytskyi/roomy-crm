// Simple API client for documents
const API_BASE_URL = 'http://localhost:3002/api/v2'

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token')
  
  const defaultHeaders = {
    'Authorization': token ? `Bearer ${token}` : '',
    ...options.headers
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: defaultHeaders
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

export interface GuestDocument {
  id: string
  title: string
  fileName: string
  uploadDate: string
  fileSize: string
  type: string
  uploadedBy: string
  uploadedByEmail: string
  url: string
  key: string
  mimeType: string
  source: string
}

export interface UploadDocumentResponse {
  success: boolean
  data: {
    id: string
    key: string
    originalName: string
    size: number
    mimeType: string
    documentType: string
    title: string
    uploadedBy: string
    uploadedByEmail: string
    uploadDate: string
  }
  message: string
  timestamp: string
}

export interface DownloadUrlResponse {
  success: boolean
  data: {
    url: string
    filename: string
    expiresIn: number
  }
  message: string
  timestamp: string
}

class GuestDocumentService {
  /**
   * Get all documents for a guest
   */
  async getGuestDocuments(guestId: string): Promise<{ success: boolean; data: GuestDocument[]; error?: string }> {
    try {
      console.log(`📄 [GuestDocumentService] Fetching documents for guest ${guestId}`)
      
      const response = await apiRequest(`/guests/${guestId}/documents`)
      
      if (response.success) {
        console.log(`📄 [GuestDocumentService] Found ${response.data.length} documents`)
        return {
          success: true,
          data: response.data
        }
      } else {
        console.error(`📄 [GuestDocumentService] API returned error:`, response.error)
        return {
          success: false,
          data: [],
          error: response.error || 'Failed to fetch documents'
        }
      }
    } catch (error: any) {
      console.error(`📄 [GuestDocumentService] Error fetching documents:`, error)
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || error.message || 'Failed to fetch documents'
      }
    }
  }

  /**
   * Upload a document for a guest
   */
  async uploadDocument(
    guestId: string, 
    file: File, 
    documentType: string = 'OTHER', 
    title?: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log(`📄 [GuestDocumentService] Uploading document for guest ${guestId}:`, {
        fileName: file.name,
        fileSize: file.size,
        documentType,
        title
      })

      const formData = new FormData()
      formData.append('document', file)
      formData.append('documentType', documentType)
      if (title) {
        formData.append('title', title)
      }

      const response = await apiRequest(`/guests/${guestId}/documents`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it with boundary
      })

      if (response.success) {
        console.log(`📄 [GuestDocumentService] Document uploaded successfully:`, response.data)
        return {
          success: true,
          data: response.data
        }
      } else {
        console.error(`📄 [GuestDocumentService] Upload failed:`, response.error)
        return {
          success: false,
          error: response.error || 'Failed to upload document'
        }
      }
    } catch (error: any) {
      console.error(`📄 [GuestDocumentService] Error uploading document:`, error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to upload document'
      }
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(guestId: string, documentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`📄 [GuestDocumentService] Deleting document ${documentId} for guest ${guestId}`)

      const response = await apiRequest(`/guests/${guestId}/documents/${documentId}`, {
        method: 'DELETE'
      })

      if (response.success) {
        console.log(`📄 [GuestDocumentService] Document deleted successfully`)
        return { success: true }
      } else {
        console.error(`📄 [GuestDocumentService] Delete failed:`, response.error)
        return {
          success: false,
          error: response.error || 'Failed to delete document'
        }
      }
    } catch (error: any) {
      console.error(`📄 [GuestDocumentService] Error deleting document:`, error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to delete document'
      }
    }
  }

  /**
   * Get download URL for a document
   */
  async getDownloadUrl(guestId: string, documentId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log(`📄 [GuestDocumentService] Getting download URL for document ${documentId}`)

      const response = await apiRequest(`/guests/${guestId}/documents/${documentId}/download`)

      if (response.success) {
        console.log(`📄 [GuestDocumentService] Download URL generated successfully`)
        return {
          success: true,
          data: response.data
        }
      } else {
        console.error(`📄 [GuestDocumentService] Failed to get download URL:`, response.error)
        return {
          success: false,
          error: response.error || 'Failed to get download URL'
        }
      }
    } catch (error: any) {
      console.error(`📄 [GuestDocumentService] Error getting download URL:`, error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to get download URL'
      }
    }
  }
}

export const guestDocumentService = new GuestDocumentService()
