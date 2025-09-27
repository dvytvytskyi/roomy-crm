'use client'

import { useState } from 'react'
import { X, Send, Mail, MessageSquare, Phone, FileText, Paperclip } from 'lucide-react'

interface SendMessageModalProps {
  reservation: any
  onClose: () => void
  onSend: (message: any) => void
}

export default function SendMessageModal({ reservation, onClose, onSend }: SendMessageModalProps) {
  const [formData, setFormData] = useState({
    type: 'email', // email, sms, message
    subject: '',
    content: '',
    attachments: [] as File[]
  })
  const [errors, setErrors] = useState<any>({})
  const [isSending, setIsSending] = useState(false)

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }))
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles]
      }))
    }
  }

  const handleRemoveFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const newErrors: any = {}

    if (formData.type === 'email' && !formData.subject.trim()) {
      newErrors.subject = 'Subject is required for emails'
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Message content is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSending(true)
      
      // Special handling for WhatsApp
      if (formData.type === 'whatsapp') {
        const cleanNumber = reservation.guest_whatsapp?.replace(/[^\d+]/g, '') || reservation.guest_phone.replace(/[^\d+]/g, '')
        const whatsappUrl = `https://wa.me/${cleanNumber.replace('+', '')}?text=${encodeURIComponent(formData.content)}`
        window.open(whatsappUrl, '_blank')
        setIsSending(false)
        onSend({
          id: Date.now(),
          reservation_id: reservation.id,
          guest_id: reservation.guest_id,
          type: 'whatsapp',
          content: formData.content,
          sent_at: new Date().toISOString(),
          sent_by: 'Current User',
          status: 'sent'
        })
        return
      }
      
      // Simulate sending delay for other message types
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const message = {
        id: Date.now(),
        reservation_id: reservation.id,
        guest_id: reservation.guest_id,
        type: formData.type,
        subject: formData.subject,
        content: formData.content,
        attachments: formData.attachments,
        sent_at: new Date().toISOString(),
        sent_by: 'Current User',
        status: 'sent'
      }
      
      onSend(message)
      setIsSending(false)
    }
  }

  const messageTypes = [
    { 
      value: 'email', 
      label: 'Email', 
      icon: Mail, 
      description: 'Send via email to guest',
      placeholder: 'Type your email message...'
    },
    { 
      value: 'whatsapp', 
      label: 'WhatsApp', 
      icon: MessageSquare, 
      description: 'Send WhatsApp message',
      placeholder: 'Type your WhatsApp message...',
      color: 'text-green-600'
    },
    { 
      value: 'sms', 
      label: 'SMS', 
      icon: MessageSquare, 
      description: 'Send text message',
      placeholder: 'Type your SMS message...'
    },
    { 
      value: 'message', 
      label: 'Platform Message', 
      icon: MessageSquare, 
      description: 'Send through booking platform',
      placeholder: 'Type your message...'
    }
  ]

  const getMessageTypeConfig = () => {
    return messageTypes.find(type => type.value === formData.type) || messageTypes[0]
  }

  const currentType = getMessageTypeConfig()
  const IconComponent = currentType.icon

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Send Message</h2>
            <p className="text-sm text-gray-600 mt-1">To: {reservation.guest_name} ({reservation.reservation_id})</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            {/* Message Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message Type</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {messageTypes.map(type => {
                  const Icon = type.icon
                  const isWhatsApp = type.value === 'whatsapp'
                  return (
                    <button
                      key={type.value}
                      onClick={() => handleChange('type', type.value)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        formData.type === type.value
                          ? isWhatsApp ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {isWhatsApp ? (
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                            </svg>
                          </div>
                        ) : (
                          <Icon size={16} className={formData.type === type.value ? 'text-blue-600' : 'text-gray-400'} />
                        )}
                        <span className={`text-sm font-medium ${
                          formData.type === type.value 
                            ? isWhatsApp ? 'text-green-900' : 'text-blue-900' 
                            : 'text-gray-700'
                        }`}>
                          {type.label}
                        </span>
                      </div>
                      <p className={`text-xs ${
                        formData.type === type.value 
                          ? isWhatsApp ? 'text-green-700' : 'text-blue-700' 
                          : 'text-gray-500'
                      }`}>
                        {type.description}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Subject (for emails) */}
            {formData.type === 'email' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Subject *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.subject ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter email subject..."
                />
                {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
              </div>
            )}

            {/* Message Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <IconComponent size={16} className="inline mr-2" />
                Message Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                rows={6}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical ${
                  errors.content ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={currentType.placeholder}
              />
              {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
            </div>

            {/* Attachments (for emails) */}
            {formData.type === 'email' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Paperclip size={16} className="inline mr-2" />
                  Attachments
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                />
                
                {/* Display selected files */}
                {formData.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-gray-600">Attachments:</p>
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Guest Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recipient Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p><strong>Name:</strong> {reservation.guest_name}</p>
                  <p><strong>Email:</strong> {reservation.guest_email}</p>
                </div>
                <div>
                  <p><strong>Phone:</strong> {reservation.guest_phone}</p>
                  <p><strong>Reservation:</strong> {reservation.reservation_id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isSending}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSending}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2"
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Send {currentType.label}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
