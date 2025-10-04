]'use client'

import { useState } from 'react'
import { X, Save, FileText } from 'lucide-react'

interface AddNoteModalProps {
  reservation: any
  onClose: () => void
  onSave: (note: any) => void
}

export default function AddNoteModal({ reservation, onClose, onSave }: AddNoteModalProps) {
  const [formData, setFormData] = useState({
    content: '',
    type: 'internal', // internal or special_request
    priority: 'normal' // low, normal, high
  })
  const [errors, setErrors] = useState<any>({})

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }))
    }
  }

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.content.trim()) {
      newErrors.content = 'Note content is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      const note = {
        id: Date.now(),
        reservation_id: reservation.id,
        content: formData.content,
        type: formData.type,
        priority: formData.priority,
        created_at: new Date().toISOString(),
        created_by: 'Current User' // In real app, this would be from auth context
      }
      onSave(note)
    }
  }

  const noteTypes = [
    { value: 'internal', label: 'Internal Note', description: 'For team members only' },
    { value: 'special_request', label: 'Special Request', description: 'Guest request or instruction' }
  ]

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add Note</h2>
            <p className="text-sm text-gray-600 mt-1">{reservation.reservation_id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Note Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Note Type</label>
              <div className="space-y-2">
                {noteTypes.map(type => (
                  <label key={type.value} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={formData.type === type.value}
                      onChange={(e) => handleChange('type', e.target.value)}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{type.label}</p>
                      <p className="text-xs text-gray-500">{type.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <div className="flex space-x-2">
                {priorities.map(priority => (
                  <button
                    key={priority.value}
                    onClick={() => handleChange('priority', priority.value)}
                    className={`px-3 py-2 text-sm rounded-lg border ${
                      formData.priority === priority.value
                        ? `${priority.color} border-current`
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {priority.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText size={16} className="inline mr-2" />
                Note Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical ${
                  errors.content ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your note here..."
              />
              {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
            </div>

            {/* Preview */}
            {formData.content && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                <div className={`p-3 rounded-lg border-l-4 ${
                  formData.type === 'special_request' 
                    ? 'bg-yellow-50 border-yellow-400'
                    : 'bg-blue-50 border-blue-400'
                }`}>
                  <p className="text-sm text-gray-900">{formData.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      priorities.find(p => p.value === formData.priority)?.color || 'bg-gray-100 text-gray-800'
                    }`}>
                      {priorities.find(p => p.value === formData.priority)?.label}
                    </span>
                    <p className="text-xs text-gray-500">Added by Current User</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
          >
            <Save size={16} />
            <span>Save Note</span>
          </button>
        </div>
      </div>
    </div>
  )
}
