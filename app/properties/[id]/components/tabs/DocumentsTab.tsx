'use client'

import { useState } from 'react'
import { Upload, File, Image as ImageIcon, Download, Trash2 } from 'lucide-react'
import Image from 'next/image'

interface DocumentsTabProps {
  propertyData: any
  onUpdate: (updates: any) => Promise<boolean>
}

export default function DocumentsTab({ propertyData, onUpdate }: DocumentsTabProps) {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadType, setUploadType] = useState<'photo' | 'document'>('photo')

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
          {propertyData?.photos && propertyData.photos.length > 0 ? (
            propertyData.photos.map((photo: any, index: number) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={photo.url || '/placeholder-image.jpg'}
                    alt={photo.caption || `Photo ${index + 1}`}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors mr-2">
                    <Download size={16} className="text-gray-700" />
                  </button>
                  <button className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
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
          {propertyData?.documents && propertyData.documents.length > 0 ? (
            propertyData.documents.map((doc: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <File size={20} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                    <p className="text-xs text-gray-500">
                      {doc.type} • {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <Download size={16} />
                  </button>
                  <button className="p-2 text-red-600 hover:text-red-900 transition-colors">
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Upload {uploadType === 'photo' ? 'Photo' : 'Document'}
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">
                Drag and drop or click to upload
              </p>
              <p className="text-xs text-gray-500">
                {uploadType === 'photo' ? 'PNG, JPG up to 10MB' : 'PDF, DOC, DOCX up to 10MB'}
              </p>
              <input
                type="file"
                className="hidden"
                accept={uploadType === 'photo' ? 'image/*' : '.pdf,.doc,.docx'}
              />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

