'use client'

import { useState, useRef } from 'react'
import { X, Upload, FileText } from 'lucide-react'

interface UploadDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (data: { name: string; type: string; file: File }) => void
}

const documentTypes = [
  'Contract',
  'ID/Passport',
  'Emirates ID',
  'Visa',
  'Trade License',
  'Certificate',
  'Invoice',
  'Receipt',
  'Agreement',
  'Other'
]

export default function UploadDocumentModal({ isOpen, onClose, onUpload }: UploadDocumentModalProps) {
  const [documentName, setDocumentName] = useState('')
  const [documentType, setDocumentType] = useState('Other')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (!documentName) {
        // Auto-fill document name from filename (without extension)
        setDocumentName(file.name.replace(/\.[^/.]+$/, ""))
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
      if (!documentName) {
        setDocumentName(file.name.replace(/\.[^/.]+$/, ""))
      }
    }
  }

  const handleSubmit = () => {
    if (!documentName.trim()) {
      alert('Please enter document name')
      return
    }
    if (!selectedFile) {
      alert('Please select a file')
      return
    }

    onUpload({
      name: documentName.trim(),
      type: documentType,
      file: selectedFile
    })

    // Reset form
    setDocumentName('')
    setDocumentType('Other')
    setSelectedFile(null)
    onClose()
  }

  const handleClose = () => {
    // Reset form
    setDocumentName('')
    setDocumentType('Other')
    setSelectedFile(null)
    onClose()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-slate-900">Upload Document</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-orange-500 bg-orange-50'
                  : selectedFile
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xls,.xlsx"
              />
              {selectedFile ? (
                <div className="flex items-center justify-center space-x-2">
                  <FileText className="text-green-600" size={24} />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-600">
                    Drag & drop or <span className="text-orange-600 font-medium">browse</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PDF, DOC, JPG, PNG, TXT, XLS (Max 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Document Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Name *
            </label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter document name"
            />
          </div>

          {/* Document Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type *
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {documentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!documentName.trim() || !selectedFile}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upload Document
          </button>
        </div>
      </div>
    </div>
  )
}

