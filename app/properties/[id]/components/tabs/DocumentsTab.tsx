'use client'

import { useState, useEffect } from 'react'
import { Upload, File, Image as ImageIcon, Download, Trash2 } from 'lucide-react'
import Image from 'next/image'

interface DocumentsTabProps {
  propertyData: any
  onUpdate: (updates: any) => Promise<boolean>
}

export default function DocumentsTab({ propertyData, onUpdate }: DocumentsTabProps) {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadType, setUploadType] = useState<'photo' | 'document'>('photo')
  const [documents, setDocuments] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [documentTitle, setDocumentTitle] = useState('')
  const [documentType, setDocumentType] = useState('CONTRACT')
  
  // Load documents on mount
  useEffect(() => {
    if (propertyData?.id) {
      loadDocuments()
    }
  }, [propertyData?.id])
  
  // Load documents from API
  const loadDocuments = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_V2_URL}/properties/${propertyData.id}/documents`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setDocuments(result.data || [])
        }
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    }
  }
  
  // Handle photo upload
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    
    const token = localStorage.getItem('accessToken')
    if (!token) {
      alert('Authentication required')
      return
    }
    
    setIsUploading(true)
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('photo', file)
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_V2_URL}/properties/${propertyData.id}/photos`,
          {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
          }
        )
        
        if (!response.ok) {
          throw new Error(`Failed to upload photo: ${response.status}`)
        }
      }
      
      alert('Photos uploaded successfully!')
      setShowUploadModal(false)
      loadDocuments() // Reload documents
      
      // Trigger property data refresh
      window.dispatchEvent(new CustomEvent('property:updated', { 
        detail: { propertyId: propertyData.id } 
      }))
      
    } catch (error) {
      console.error('Error uploading photos:', error)
      alert('Failed to upload photos')
    } finally {
      setIsUploading(false)
    }
  }

  // Handle document upload
  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    
    const token = localStorage.getItem('accessToken')
    if (!token) {
      alert('Authentication required')
      return
    }
    
    setIsUploading(true)
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('document', file)
        formData.append('documentType', documentType)
        formData.append('title', documentTitle || file.name)
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_V2_URL}/properties/${propertyData.id}/documents`,
          {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
          }
        )
        
        if (!response.ok) {
          throw new Error(`Failed to upload document: ${response.status}`)
        }
      }
      
      alert('Documents uploaded successfully!')
      setShowUploadModal(false)
      setDocumentTitle('')
      loadDocuments() // Reload documents
      
      // Trigger property data refresh
      window.dispatchEvent(new CustomEvent('property:updated', { 
        detail: { propertyId: propertyData.id } 
      }))
      
    } catch (error) {
      console.error('Error uploading documents:', error)
      alert('Failed to upload documents')
    } finally {
      setIsUploading(false)
    }
  }
  
  // Handle document delete
  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    
    const token = localStorage.getItem('accessToken')
    if (!token) {
      alert('Authentication required')
      return
    }
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_V2_URL}/properties/${propertyData.id}/documents/${documentId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      
      if (!response.ok) {
        throw new Error(`Failed to delete document: ${response.status}`)
      }
      
      alert('Document deleted successfully!')
      loadDocuments() // Reload documents
      
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Failed to delete document')
    }
  }
  
  // Handle document download
  const handleDownloadDocument = async (documentId: string) => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      alert('Authentication required')
      return
    }
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_V2_URL}/properties/${propertyData.id}/documents/${documentId}/download`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      
      if (!response.ok) {
        throw new Error(`Failed to get download URL: ${response.status}`)
      }
      
      const result = await response.json()
      if (result.success && result.data.url) {
        window.open(result.data.url, '_blank')
      }
      
    } catch (error) {
      console.error('Error downloading document:', error)
      alert('Failed to download document')
    }
  }

  return (
    <div className="space-y-6">
      {/* Photos Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Photos</h2>
          <button
            onClick={() => {
              setUploadType('photo')
              setShowUploadModal(true)
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            <Upload size={16} />
            <span>Upload Photo</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {documents && documents.length > 0 ? (
            documents
              .filter((doc: any) => doc.mimeType && doc.mimeType.startsWith('image/'))
              .map((photo: any, index: number) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={photo.filePath || '/placeholder-image.jpg'}
                      alt={photo.title || `Photo ${index + 1}`}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                      onError={async (e) => {
                        // Try to get signed URL if direct URL fails
                        console.log('Image failed to load, trying signed URL...')
                        const target = e.target as HTMLImageElement
                        
                        try {
                          const token = localStorage.getItem('accessToken')
                          if (token) {
                            const response = await fetch(
                              `${process.env.NEXT_PUBLIC_API_V2_URL}/properties/${propertyData.id}/photos/${photo.id}/url`,
                              {
                                headers: { 'Authorization': `Bearer ${token}` }
                              }
                            )
                            
                            if (response.ok) {
                              const result = await response.json()
                              if (result.success && result.data.url) {
                                target.src = result.data.url
                                return
                              }
                            }
                          }
                        } catch (error) {
                          console.error('Failed to get signed URL:', error)
                        }
                        
                        // Final fallback
                        target.src = '/placeholder-image.jpg'
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button 
                      onClick={() => handleDownloadDocument(photo.id)}
                      className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors mr-2"
                    >
                      <Download size={16} className="text-gray-700" />
                    </button>
                    <button 
                      onClick={() => handleDeleteDocument(photo.id)}
                      className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={16} className="text-white" />
                    </button>
                  </div>
                </div>
              ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              <ImageIcon size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No photos uploaded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Documents Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
          <button
            onClick={() => {
              setUploadType('document')
              setShowUploadModal(true)
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            <Upload size={16} />
            <span>Upload Document</span>
          </button>
        </div>

        <div className="space-y-2">
          {documents && documents.length > 0 ? (
            documents.map((doc: any) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <File size={20} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{doc.title || doc.fileName}</p>
                    <p className="text-xs text-gray-500">
                      {doc.type} • {doc.fileSize} • {new Date(doc.uploadDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      Uploaded by: {doc.uploadedBy}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleDownloadDocument(doc.id)}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Download size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="p-2 text-red-600 hover:text-red-900 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <File size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No documents uploaded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Photo Upload Modal */}
      {showUploadModal && uploadType === 'photo' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Upload Photo
              </h3>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">
                Click to select photos
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG, GIF up to 10MB each
              </p>
              <input
                id="photo-upload"
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                disabled={isUploading}
              />
              <label
                htmlFor="photo-upload"
                className="inline-block mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg cursor-pointer transition-colors"
              >
                {isUploading ? 'Uploading...' : 'Select Photos'}
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && uploadType === 'document' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Upload Document
              </h3>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setDocumentTitle('')
                  setDocumentType('CONTRACT')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {/* Document Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="CONTRACT">Contract</option>
                <option value="INVOICE">Invoice</option>
                <option value="RECEIPT">Receipt</option>
                <option value="PERMIT">Permit</option>
                <option value="INSURANCE">Insurance</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Document Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title (Optional)
              </label>
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Enter document title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">
                Click to select file
              </p>
              <p className="text-xs text-gray-500">
                PDF, DOC, DOCX, XLS, XLSX up to 50MB
              </p>
              <input
                id="document-upload"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                onChange={handleDocumentUpload}
                disabled={isUploading}
              />
              <label
                htmlFor="document-upload"
                className="inline-block mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg cursor-pointer transition-colors"
              >
                {isUploading ? 'Uploading...' : 'Select File'}
              </label>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setDocumentTitle('')
                  setDocumentType('CONTRACT')
                }}
                disabled={isUploading}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

