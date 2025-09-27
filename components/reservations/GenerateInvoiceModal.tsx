'use client'

import { useState } from 'react'
import { X, Download, Mail, FileText, DollarSign, Calendar, MapPin } from 'lucide-react'

interface GenerateInvoiceModalProps {
  reservation: any
  onClose: () => void
  onGenerate: (invoice: any) => void
}

export default function GenerateInvoiceModal({ reservation, onClose, onGenerate }: GenerateInvoiceModalProps) {
  const [formData, setFormData] = useState({
    type: 'receipt', // receipt, invoice, refund
    send_email: true,
    email_subject: `Invoice for Reservation ${reservation.reservation_id}`,
    additional_notes: '',
    include_breakdown: true
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    
    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const invoice = {
      id: `INV-${Date.now()}`,
      reservation_id: reservation.reservation_id,
      type: formData.type,
      amount: reservation.total_amount,
      generated_at: new Date().toISOString(),
      generated_by: 'Current User',
      status: 'generated',
      send_email: formData.send_email,
      email_subject: formData.email_subject,
      additional_notes: formData.additional_notes,
      include_breakdown: formData.include_breakdown
    }
    
    onGenerate(invoice)
    setIsGenerating(false)
  }

  const invoiceTypes = [
    { 
      value: 'receipt', 
      label: 'Receipt', 
      description: 'Payment confirmation',
      icon: FileText
    },
    { 
      value: 'invoice', 
      label: 'Invoice', 
      description: 'Payment request',
      icon: DollarSign
    },
    { 
      value: 'refund', 
      label: 'Refund Receipt', 
      description: 'Refund confirmation',
      icon: DollarSign
    }
  ]

  const getInvoicePreview = () => {
    const type = invoiceTypes.find(t => t.value === formData.type)
    return {
      title: `${type?.label} - ${reservation.reservation_id}`,
      date: new Date().toLocaleDateString(),
      amount: reservation.total_amount,
      status: formData.type === 'invoice' ? 'Outstanding' : 'Paid'
    }
  }

  const preview = getInvoicePreview()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Generate Invoice</h2>
            <p className="text-sm text-gray-600 mt-1">{reservation.reservation_id} • {reservation.guest_name}</p>
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
          <div className="space-y-6">
            {/* Invoice Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Type</label>
              <div className="grid grid-cols-3 gap-2">
                {invoiceTypes.map(type => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.value}
                      onClick={() => handleChange('type', type.value)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        formData.type === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <Icon size={16} className={formData.type === type.value ? 'text-blue-600' : 'text-gray-400'} />
                        <span className={`text-sm font-medium ${
                          formData.type === type.value ? 'text-blue-900' : 'text-gray-700'
                        }`}>
                          {type.label}
                        </span>
                      </div>
                      <p className={`text-xs ${
                        formData.type === type.value ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                        {type.description}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Email Options */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Mail size={16} className="text-gray-600" />
                <h4 className="text-sm font-medium text-gray-700">Email Options</h4>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.send_email}
                    onChange={(e) => handleChange('send_email', e.target.checked)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Send invoice via email to guest</span>
                </label>
                
                {formData.send_email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject</label>
                    <input
                      type="text"
                      value={formData.email_subject}
                      onChange={(e) => handleChange('email_subject', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Additional Options */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Options</h4>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.include_breakdown}
                    onChange={(e) => handleChange('include_breakdown', e.target.checked)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Include detailed payment breakdown</span>
                </label>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea
                  value={formData.additional_notes}
                  onChange={(e) => handleChange('additional_notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical text-sm"
                  placeholder="Add any additional notes for the invoice..."
                />
              </div>
            </div>

            {/* Invoice Preview */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Invoice Preview</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <div>
                    <h5 className="font-medium text-gray-900">{preview.title}</h5>
                    <p className="text-sm text-gray-500">Reservation: {reservation.reservation_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{preview.date}</p>
                    <p className={`text-sm font-medium ${
                      preview.status === 'Paid' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {preview.status}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Guest:</p>
                    <p className="font-medium">{reservation.guest_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Property:</p>
                    <p className="font-medium">{reservation.unit_property}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Amount:</span>
                    <span className="text-lg font-bold">${preview.amount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Generate & Download</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
