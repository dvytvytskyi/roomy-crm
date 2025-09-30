'use client'

import { useState } from 'react'
import { X, Download, Mail, FileText, DollarSign, Calendar, MapPin } from 'lucide-react'
import { generateInvoicePDF, InvoiceData } from '@/lib/utils/pdfGenerator'

interface GenerateInvoiceModalProps {
  reservation: any
  onClose: () => void
  onGenerate: (invoice: any) => void
}

export default function GenerateInvoiceModal({ reservation, onClose, onGenerate }: GenerateInvoiceModalProps) {
  const [formData, setFormData] = useState({
    type: 'receipt', // receipt, invoice, refund
    send_email: false, // Disabled by default
    email_subject: `Invoice for Reservation ${reservation.reservation_id || reservation.id}`,
    additional_notes: '',
    include_breakdown: true
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleGenerate = async () => {
    console.log('🚀 Starting invoice generation process...')
    setIsGenerating(true)
    
    try {
      // Simulate generation delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('📋 Reservation data:', reservation)
      
      // Prepare invoice data for PDF generation
      const invoiceData: InvoiceData = {
        id: `INV-${Date.now()}`,
        type: formData.type as 'receipt' | 'invoice' | 'refund',
        reservationId: reservation.reservation_id || reservation.id,
        guestName: reservation.guest_name || reservation.guestName,
        guestEmail: reservation.guest_email || reservation.guestEmail,
        propertyName: reservation.unit_property || reservation.propertyName,
        checkIn: reservation.check_in || reservation.checkIn,
        checkOut: reservation.check_out || reservation.checkOut,
        nights: reservation.nights || 0,
        totalAmount: reservation.total_amount || reservation.totalAmount,
        paidAmount: reservation.paid_amount || reservation.paidAmount,
        outstandingBalance: reservation.outstanding_balance || reservation.outstandingBalance,
        generatedAt: new Date().toISOString(),
        generatedBy: 'Current User',
        additionalNotes: formData.additional_notes,
        includeBreakdown: formData.include_breakdown,
        payments: reservation.payments || []
      }
      
      console.log('📊 Invoice data prepared:', invoiceData)
      
      // Generate and download PDF
      console.log('📄 Calling generateInvoicePDF...')
      generateInvoicePDF(invoiceData)
      console.log('✅ PDF generation completed!')
      
      // Notify parent component
      const invoice = {
        id: invoiceData.id,
        reservation_id: invoiceData.reservationId,
        type: formData.type,
        amount: invoiceData.totalAmount,
        generated_at: invoiceData.generatedAt,
        generated_by: 'Current User',
        status: 'generated',
        send_email: formData.send_email,
        email_subject: formData.email_subject,
        additional_notes: formData.additional_notes,
        include_breakdown: formData.include_breakdown
      }
      
      onGenerate(invoice)
      
      // Show success message
      alert('Invoice generated successfully! Check your downloads folder.')
      
      // Close modal after successful generation
      setTimeout(() => {
        onClose()
      }, 500)
      
    } catch (error) {
      console.error('❌ Error generating invoice:', error)
      alert(`Error generating invoice: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`)
    } finally {
      setIsGenerating(false)
    }
  }

  const invoiceTypes = [
    { 
      value: 'receipt', 
      label: 'Payment Receipt', 
      description: 'Confirmation of payment received',
      icon: FileText
    },
    { 
      value: 'invoice', 
      label: 'Payment Invoice', 
      description: 'Request for payment due',
      icon: DollarSign
    },
    { 
      value: 'refund', 
      label: 'Refund Receipt', 
      description: 'Confirmation of refund processed',
      icon: DollarSign
    }
  ]

  const getInvoicePreview = () => {
    const type = invoiceTypes.find(t => t.value === formData.type)
    const resId = reservation.reservation_id || reservation.id || 'N/A'
    const totalAmount = reservation.totalAmount || reservation.total_amount || 0
    const paidAmount = reservation.paidAmount || reservation.paid_amount || 0
    const outstandingBalance = reservation.outstandingBalance || reservation.outstanding_balance || 0
    
    // Determine status based on payment data
    let status = 'Unpaid'
    if (outstandingBalance === 0 && totalAmount > 0) {
      status = 'Fully Paid'
    } else if (paidAmount > 0 && outstandingBalance > 0) {
      status = 'Partially Paid'
    } else if (formData.type === 'refund') {
      status = 'Refunded'
    }
    
    return {
      title: `${type?.label} - ${resId}`,
      date: new Date().toLocaleDateString(),
      amount: totalAmount,
      paidAmount: paidAmount,
      outstandingBalance: outstandingBalance,
      status: status
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
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <Icon size={16} className={formData.type === type.value ? 'text-orange-600' : 'text-gray-400'} />
                        <span className={`text-sm font-medium ${
                          formData.type === type.value ? 'text-orange-900' : 'text-gray-700'
                        }`}>
                          {type.label}
                        </span>
                      </div>
                      <p className={`text-xs ${
                        formData.type === type.value ? 'text-orange-700' : 'text-gray-500'
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
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
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
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical text-sm"
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
                    <p className="text-sm text-gray-500">Reservation: {reservation.reservation_id || reservation.id}</p>
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
                    <p className="font-medium">{reservation.guest_name || reservation.guestName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Property:</p>
                    <p className="font-medium">{reservation.unit_property || reservation.propertyName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Check-in:</p>
                    <p className="font-medium">
                      {(reservation.check_in || reservation.checkIn) 
                        ? new Date(reservation.check_in || reservation.checkIn).toLocaleDateString() 
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Check-out:</p>
                    <p className="font-medium">
                      {(reservation.check_out || reservation.checkOut) 
                        ? new Date(reservation.check_out || reservation.checkOut).toLocaleDateString() 
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Nights:</p>
                    <p className="font-medium">{reservation.nights || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Guests:</p>
                    <p className="font-medium">{reservation.guestCount || reservation.guests || 1}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-gray-900">AED {reservation.totalAmount || reservation.total_amount || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Paid Amount:</span>
                    <span className="font-semibold text-green-600">AED {reservation.paidAmount || reservation.paid_amount || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Outstanding:</span>
                    <span className={`font-semibold ${
                      (reservation.outstandingBalance || reservation.outstanding_balance || 0) > 0 
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`}>
                      AED {reservation.outstandingBalance || reservation.outstanding_balance || 0}
                    </span>
                  </div>
                  
                  {/* Payment Status Badge */}
                  <div className="pt-2 border-t border-gray-200">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                      (reservation.outstandingBalance || reservation.outstanding_balance || 0) === 0
                        ? 'bg-green-100 text-green-800'
                        : (reservation.paidAmount || reservation.paid_amount || 0) > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {(reservation.outstandingBalance || reservation.outstanding_balance || 0) === 0
                        ? 'Fully Paid'
                        : (reservation.paidAmount || reservation.paid_amount || 0) > 0
                        ? 'Partially Paid'
                        : 'Unpaid'}
                    </span>
                  </div>
                </div>
                
                {/* Payment History (if breakdown is enabled) */}
                {formData.include_breakdown && reservation.payments && reservation.payments.length > 0 && (
                  <div className="border-t border-gray-200 pt-3">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Payment History</h5>
                    <div className="space-y-2">
                      {reservation.payments.map((payment: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded">
                          <div>
                            <p className="font-medium text-gray-900">
                              {payment.method === 'credit_card' ? 'Credit Card' :
                               payment.method === 'bank_transfer' ? 'Bank Transfer' :
                               payment.method === 'cash' ? 'Cash' :
                               payment.method === 'paypal' ? 'PayPal' : payment.method}
                            </p>
                            <p className="text-gray-500">
                              {new Date(payment.date || payment.createdAt).toLocaleDateString()}
                              {payment.reference && ` • Ref: ${payment.reference}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">AED {payment.amount}</p>
                            <p className="text-gray-500">{payment.description || payment.type || 'Payment'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Generate PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
