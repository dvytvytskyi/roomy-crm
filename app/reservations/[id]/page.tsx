'use client'

import { useState } from 'react'
import { ArrowLeft, Edit, Edit2, MessageSquare, Download, CreditCard, Calendar, MapPin, User, Phone, Mail, Clock, AlertCircle, CheckCircle, XCircle, FileText, Send, DollarSign, Tag, Plus, Trash2, X } from 'lucide-react'
import TopNavigation from '@/components/TopNavigation'
import EditDatesModal from '@/components/reservations/EditDatesModal'
import AddPaymentModal from '@/components/reservations/AddPaymentModal'
import AddNoteModal from '@/components/reservations/AddNoteModal'
import SendMessageModal from '@/components/reservations/SendMessageModal'
import GenerateInvoiceModal from '@/components/reservations/GenerateInvoiceModal'
import EditPricingModal from '@/components/reservations/EditPricingModal'
import AddAdjustmentModal from '@/components/reservations/AddAdjustmentModal'

interface ReservationDetailsPageProps {
  params: {
    id: string
  }
}

export default function ReservationDetailsPage({ params }: ReservationDetailsPageProps) {
  // Mock data for the specific reservation
  const mockReservation = {
    id: parseInt(params.id),
    guest_name: 'John Smith',
    guest_email: 'john.smith@example.com',
    guest_phone: '+1 (555) 123-4567',
    guest_whatsapp: '+1 (555) 123-4567',
    check_in: '2024-08-15',
    check_out: '2024-08-18',
    status: 'confirmed',
    reservation_id: 'RES-001',
    total_amount: 450,
    paid_amount: 450,
    outstanding_balance: 0,
    unit_property: 'Apartment Burj Khalifa 1A',
    source: 'Direct',
    nights: 3,
    number_of_guests: 2,
    notes: 'Guest requested late check-in',
    created_at: '2024-07-01T10:30:00Z',
    updated_at: '2024-07-15T14:20:00Z',
    created_by: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com'
    }
  }

  // State declarations
  const [activeTab, setActiveTab] = useState('overview')
  const [editModal, setEditModal] = useState<{
    isOpen: boolean
    type: string
    field: string
    currentValue: string
    title: string
    inputType: string
  }>({
    isOpen: false,
    type: '',
    field: '',
    currentValue: '',
    title: '',
    inputType: 'text'
  })
  const [isEditingDates, setIsEditingDates] = useState(false)
  const [isAddingPayment, setIsAddingPayment] = useState(false)
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false)
  const [isEditingPricing, setIsEditingPricing] = useState(false)
  const [isAddingAdjustment, setIsAddingAdjustment] = useState(false)
  const [reservationData, setReservationData] = useState(mockReservation)
  const [notes, setNotes] = useState(mockReservation.notes || '')
  const [notesList, setNotesList] = useState([
    {
      id: 1,
      content: mockReservation.notes || '',
      createdAt: new Date().toISOString(),
      createdBy: 'Admin'
    }
  ])
  const [adjustments, setAdjustments] = useState([
    {
      id: 1,
      type: 'refund',
      amount: -50,
      reason: 'Cleaning fee refund',
      date: '2024-08-16',
      created_by: 'Sarah Johnson'
    }
  ])

  // Mock data for payments
  const payments = [
    {
      id: 1,
      amount: 450,
      date: '2024-07-01',
      method: 'Credit Card',
      status: 'completed',
      transaction_id: 'TXN-001'
    }
  ]

  // Mock data for pricing history
  const pricingHistory = [
    {
      id: 1,
      date: '2024-07-01',
      price_per_night: 150,
      total_amount: 450,
      changed_by: 'Sarah Johnson',
      reason: 'Initial booking'
    }
  ]

  // Mock data for communication history
  const communicationHistory = [
    {
      id: 1,
      type: 'email',
      subject: 'Welcome to your stay',
      date: '2024-07-01T10:30:00Z',
      status: 'sent'
    },
    {
      id: 2,
      type: 'whatsapp',
      subject: 'Check-in instructions',
      date: '2024-07-15T14:20:00Z',
      status: 'sent'
    }
  ]

  // Event handlers
  const handleEditDates = (newDates: { check_in: string; check_out: string }) => {
    setReservationData(prev => ({ ...prev, ...newDates }))
    setIsEditingDates(false)
  }

  const handleAddPayment = (payment: { amount: number; method: string; date: string }) => {
    // In a real app, this would make an API call
    console.log('Adding payment:', payment)
    setIsAddingPayment(false)
  }

  const handleAddNote = (note: string) => {
    // In a real app, this would make an API call
    console.log('Adding note:', note)
    setIsAddingNote(false)
  }

  const handleSendMessage = (message: { type: string; subject: string; content: string }) => {
    // In a real app, this would make an API call
    console.log('Sending message:', message)
    setIsSendingMessage(false)
  }

  const handleGenerateInvoice = (invoiceData: any) => {
    // In a real app, this would generate and send an invoice
    console.log('Generating invoice:', invoiceData)
    setIsGeneratingInvoice(false)
  }

  const handleEditPricing = (pricingData: { price_per_night: number; total_amount: number }) => {
    setReservationData(prev => ({ ...prev, ...pricingData }))
    setIsEditingPricing(false)
  }

  const handleAddAdjustment = (adjustment: { type: string; amount: number; reason: string }) => {
    const newAdjustment = {
      id: adjustments.length + 1,
      ...adjustment,
      date: new Date().toISOString().split('T')[0],
      created_by: 'Current User'
    }
    setAdjustments(prev => [...prev, newAdjustment])
    setReservationData(prev => ({ ...prev, total_amount: prev.total_amount + adjustment.amount }))
    setIsAddingAdjustment(false)
  }

  const handleRemoveAdjustment = (adjustmentId: number) => {
    const adjustment = adjustments.find(adj => adj.id === adjustmentId)
    if (adjustment) {
      setAdjustments(prev => prev.filter(adj => adj.id !== adjustmentId))
      setReservationData(prev => ({ ...prev, total_amount: prev.total_amount - adjustment.amount }))
    }
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'message':
        setIsSendingMessage(true)
        break
      case 'payment':
        setIsAddingPayment(true)
        break
      case 'invoice':
        setIsGeneratingInvoice(true)
        break
      case 'dates':
        setIsEditingDates(true)
        break
      case 'pricing':
        setIsEditingPricing(true)
        break
      default:
        console.log('Unknown action:', action)
    }
  }

  const handleEditField = (type: string, field: string, currentValue: string, title: string, inputType: string = 'text') => {
    setEditModal({
      isOpen: true,
      type,
      field,
      currentValue,
      title,
      inputType
    })
  }

  const handleSaveEdit = (newValue: string) => {
    console.log(`Saving ${editModal.field}: ${newValue}`)
    
    if (editModal.type === 'add-note') {
      handleSaveNewNote(newValue)
    } else if (editModal.type === 'edit-note') {
      const noteId = parseInt(editModal.field)
      setNotesList(notesList.map(note => 
        note.id === noteId ? { ...note, content: newValue } : note
      ))
    } else if (editModal.field === 'notes') {
      setNotes(newValue)
    }
    
    setEditModal({ ...editModal, isOpen: false })
  }

  const handleCloseEdit = () => {
    setEditModal({ ...editModal, isOpen: false })
  }

  const handleAddNewNote = () => {
    setEditModal({
      isOpen: true,
      type: 'add-note',
      field: 'new-note',
      currentValue: '',
      title: 'Add New Note',
      inputType: 'textarea'
    })
  }

  const handleSaveNewNote = (content: string) => {
    const newNote = {
      id: Date.now(),
      content,
      createdAt: new Date().toISOString(),
      createdBy: 'Admin'
    }
    setNotesList([newNote, ...notesList])
    setEditModal({ ...editModal, isOpen: false })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={16} className="text-green-600" />
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />
      case 'canceled':
        return <XCircle size={16} className="text-red-600" />
      case 'completed':
        return <CheckCircle size={16} className="text-blue-600" />
      default:
        return <AlertCircle size={16} className="text-slate-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmed' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      canceled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Canceled' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    
    return (
      <span className={`px-3 py-1 text-sm ${config.bg} ${config.text} rounded-full flex items-center space-x-2`}>
        {getStatusIcon(status)}
        <span>{config.label}</span>
      </span>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'financial', label: 'Financial' },
    { id: 'communication', label: 'Communication' },
    { id: 'history', label: 'History' }
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNavigation />
      
      {/* Header - positioned below the fixed navigation */}
      <div className="bg-white border-b border-gray-200 px-2 sm:px-3 lg:px-4 py-1.5" style={{ marginTop: '64px' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.history.back()}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-medium text-slate-900">
                Reservation {reservationData.reservation_id}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {reservationData.guest_name} • {reservationData.unit_property}
              </p>
            </div>
          </div>
                  <div className="flex items-center space-x-3">
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer">
                      Send Message
                    </button>
                  </div>
        </div>
      </div>

      <div>

        {/* Status Bar */}
        <div className="bg-white border-b border-gray-200 px-2 sm:px-3 lg:px-4 py-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {getStatusBadge(reservationData.status)}
              <div className="text-sm text-slate-600">
                <span className="font-medium">Check-in:</span> {reservationData.check_in}
              </div>
              <div className="text-sm text-slate-600">
                <span className="font-medium">Check-out:</span> {reservationData.check_out}
              </div>
            </div>
            <div className="text-sm text-slate-600">
              <span className="font-medium">Total:</span> AED {reservationData.total_amount}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-4">
          <div className="flex gap-4">
            {/* Left Sidebar */}
            <div className="w-80 flex-shrink-0">
              {/* Upcoming Events */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                <h3 className="text-sm font-medium text-slate-900 mb-3">Upcoming Events</h3>
                <div className="space-y-2">
                  <div className="text-sm text-slate-600">
                    <span className="font-medium">Check-in:</span> {reservationData.check_in}
                  </div>
                  <div className="text-sm text-slate-600">
                    <span className="font-medium">Check-out:</span> {reservationData.check_out}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                <h3 className="text-sm font-medium text-slate-900 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleQuickAction('message')}
                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
                  >
                    <MessageSquare size={16} className="inline mr-1" />
                    Message
                  </button>
                  <button 
                    onClick={() => handleQuickAction('payment')}
                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
                  >
                    <CreditCard size={16} className="inline mr-1" />
                    Payment
                  </button>
                  <button 
                    onClick={() => handleQuickAction('invoice')}
                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
                  >
                    <FileText size={16} className="inline mr-1" />
                    Invoice
                  </button>
                  <button 
                    onClick={() => handleQuickAction('dates')}
                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
                  >
                    <Calendar size={16} className="inline mr-1" />
                    Dates
                  </button>
                </div>
              </div>

              {/* Payment Status */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                <h3 className="text-sm font-medium text-slate-900 mb-3">Payment Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Paid</span>
                    <span className="text-slate-900">AED {reservationData.paid_amount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Outstanding</span>
                    <span className={`text-sm font-medium ${
                      reservationData.outstanding_balance > 0 
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`}>
                      AED {reservationData.outstanding_balance}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      reservationData.outstanding_balance === 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {reservationData.outstanding_balance === 0 ? 'Fully Paid' : 'Outstanding Balance'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                <h3 className="text-sm font-medium text-slate-900 mb-3">Key Metrics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Nights</span>
                    <span className="text-slate-900 font-medium">{reservationData.nights}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Amount</span>
                    <span className="text-slate-900 font-medium">AED {reservationData.total_amount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Guests</span>
                    <span className="text-slate-900 font-medium">{reservationData.number_of_guests}</span>
                  </div>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-slate-900 mb-3">Navigation</h3>
                <div className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                        activeTab === tab.id
                          ? 'bg-orange-100 text-orange-700 border border-orange-200'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 min-w-0">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Guest Information */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-6">Guest Information</h2>
                      <div className="space-y-4">
                        {[
                          { label: 'Name', value: reservationData.guest_name },
                          { label: 'Email', value: reservationData.guest_email },
                          { label: 'Phone', value: reservationData.guest_phone },
                          { label: 'WhatsApp', value: reservationData.guest_whatsapp, isLink: true }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-600">{item.label}:</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              {item.isLink ? (
                                <a 
                                  href={`https://wa.me/${item.value.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-orange-600 hover:text-orange-700 cursor-pointer text-sm"
                                >
                                  {item.value}
                                </a>
                              ) : (
                                <span className="text-sm text-gray-900">{item.value}</span>
                              )}
                              <button 
                                onClick={() => console.log(`Edit ${item.label}`)}
                                className="text-orange-600 hover:text-orange-700 cursor-pointer"
                              >
                                <Edit size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reservation Details */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-6">Reservation Details</h2>
                      <div className="space-y-4">
                        {[
                          { label: 'Unit', value: reservationData.unit_property },
                          { label: 'Source', value: reservationData.source },
                          { label: 'Number of Guests', value: reservationData.number_of_guests },
                          { label: 'Nights', value: reservationData.nights }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-600">{item.label}:</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-gray-900">{item.value}</span>
                              <button 
                                onClick={() => console.log(`Edit ${item.label}`)}
                                className="text-orange-600 hover:text-orange-700 cursor-pointer"
                              >
                                <Edit size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={handleAddNewNote}
                          className="text-orange-600 hover:text-orange-700 cursor-pointer flex items-center space-x-1"
                        >
                          <Plus size={16} />
                          <span className="text-sm">Add New</span>
                        </button>
                        {notes && (
                          <button 
                            onClick={() => handleEditField('notes', 'notes', notes, 'Edit Notes', 'textarea')}
                            className="text-orange-600 hover:text-orange-700 cursor-pointer"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {notesList.length > 0 ? (
                      <div className="space-y-4">
                        {notesList.map((note) => (
                          <div key={note.id} className="border border-gray-100 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-600">{note.createdBy}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-400">
                                  {new Date(note.createdAt).toLocaleDateString()} {new Date(note.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                              <button 
                                onClick={() => handleEditField('edit-note', note.id.toString(), note.content, 'Edit Note', 'textarea')}
                                className="text-gray-400 hover:text-gray-600 cursor-pointer"
                              >
                                <Edit size={14} />
                              </button>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No notes added yet. Click "Add New" to add your first note.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'financial' && (
                <div className="space-y-4">
                  {/* Financial Grid - 2x2 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Financial Summary */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-6">Financial Summary</h2>
                      <div className="space-y-4">
                        {[
                          { label: 'Total Amount', value: `AED ${reservationData.total_amount}`, color: 'text-gray-900' },
                          { label: 'Paid', value: `AED ${reservationData.paid_amount}`, color: 'text-green-600' },
                          { label: 'Outstanding', value: `AED ${reservationData.outstanding_balance}`, color: reservationData.outstanding_balance > 0 ? 'text-red-600' : 'text-green-600' }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-600">{item.label}:</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`text-sm font-medium ${item.color}`}>{item.value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment Breakdown */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Payment Breakdown</h2>
                        <button 
                          onClick={() => setIsAddingAdjustment(true)}
                          className="text-orange-600 hover:text-orange-700 cursor-pointer flex items-center space-x-1"
                        >
                          <Plus size={16} />
                          <span className="text-sm">Add Adjustment</span>
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600">Base Rate (3 nights × AED 150):</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-900">AED 450</span>
                          </div>
                        </div>
                        {adjustments.map((adjustment) => (
                          <div key={adjustment.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-600">{adjustment.reason}:</span>
                              <button
                                onClick={() => handleRemoveAdjustment(adjustment.id)}
                                className="text-red-500 hover:text-red-700 cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`text-sm font-medium ${adjustment.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {adjustment.amount < 0 ? '' : '+'}AED {adjustment.amount}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment History */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
                        <button 
                          onClick={() => setIsAddingPayment(true)}
                          className="text-orange-600 hover:text-orange-700 cursor-pointer flex items-center space-x-1"
                        >
                          <Plus size={16} />
                          <span className="text-sm">Add Payment</span>
                        </button>
                      </div>
                      <div className="space-y-4">
                        {payments.map((payment) => (
                          <div key={payment.id} className="border border-gray-100 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-600">AED {payment.amount}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-400">{payment.method}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-400">{payment.date}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-green-600">{payment.status}</div>
                                <div className="text-xs text-gray-400">{payment.transaction_id}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pricing History */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-6">Pricing History</h2>
                      <div className="space-y-4">
                        {pricingHistory.map((price) => (
                          <div key={price.id} className="border border-gray-100 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-600">AED {price.price_per_night}/night</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-400">{price.reason}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-400">{price.date}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">AED {price.total_amount}</div>
                                <div className="text-xs text-gray-400">{price.changed_by}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Invoice Actions - Full Width */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Invoice Actions</h2>
                    <div className="flex space-x-3">
                      <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer">
                        <Download size={16} className="inline mr-2" />
                        Download Invoice
                      </button>
                      <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer">
                        <Send size={16} className="inline mr-2" />
                        Send Invoice
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'communication' && (
                <div className="space-y-4">
                  {/* Communication Grid - 2x1 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Communication Actions */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-6">Communication Actions</h2>
                      <div className="space-y-3">
                        <button 
                          onClick={() => handleQuickAction('message')}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg text-sm font-medium cursor-pointer flex items-center justify-center"
                        >
                          <MessageSquare size={16} className="mr-2" />
                          Send Message
                        </button>
                        <button 
                          onClick={() => handleQuickAction('invoice')}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg text-sm font-medium cursor-pointer flex items-center justify-center"
                        >
                          <FileText size={16} className="mr-2" />
                          Send Invoice
                        </button>
                      </div>
                    </div>

                    {/* Communication History */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-6">Communication History</h2>
                      <div className="space-y-4">
                        {communicationHistory.map((comm) => (
                          <div key={comm.id} className="border border-gray-100 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-600">{comm.subject}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-400">{comm.type}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-400">{new Date(comm.date).toLocaleDateString()}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-green-600">{comm.status}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-4">
                  {/* Reservation History */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Reservation History</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <div>
                          <div className="font-medium text-slate-900">Reservation Created</div>
                          <div className="text-sm text-slate-600">{new Date(reservationData.created_at).toLocaleDateString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-slate-900">{reservationData.created_by.name}</div>
                          <div className="text-xs text-slate-500">{reservationData.created_by.email}</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <div>
                          <div className="font-medium text-slate-900">Last Updated</div>
                          <div className="text-sm text-slate-600">{new Date(reservationData.updated_at).toLocaleDateString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-slate-900">System</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isEditingDates && (
        <EditDatesModal
          reservation={reservationData}
          onClose={() => setIsEditingDates(false)}
          onSave={handleEditDates}
        />
      )}

      {isAddingPayment && (
        <AddPaymentModal
          reservation={reservationData}
          onClose={() => setIsAddingPayment(false)}
          onSave={handleAddPayment}
        />
      )}

      {isAddingNote && (
        <AddNoteModal
          reservation={reservationData}
          onClose={() => setIsAddingNote(false)}
          onSave={handleAddNote}
        />
      )}

      {isSendingMessage && (
        <SendMessageModal
          reservation={reservationData}
          onClose={() => setIsSendingMessage(false)}
          onSend={handleSendMessage}
        />
      )}

      {isGeneratingInvoice && (
        <GenerateInvoiceModal
          reservation={reservationData}
          onClose={() => setIsGeneratingInvoice(false)}
          onGenerate={handleGenerateInvoice}
        />
      )}

      {isEditingPricing && (
        <EditPricingModal
          reservation={reservationData}
          onClose={() => setIsEditingPricing(false)}
          onSave={handleEditPricing}
        />
      )}

      {isAddingAdjustment && (
        <AddAdjustmentModal
          onClose={() => setIsAddingAdjustment(false)}
          onSave={handleAddAdjustment}
        />
      )}

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit {editModal.title}</h3>
              <button
                onClick={handleCloseEdit}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {editModal.title}
              </label>
              {editModal.inputType === 'textarea' ? (
                <textarea
                  defaultValue={editModal.currentValue}
                  className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical"
                  autoFocus
                />
              ) : (
                <input
                  type={editModal.inputType}
                  defaultValue={editModal.currentValue}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  autoFocus
                />
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseEdit}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const input = document.querySelector('input, textarea') as HTMLInputElement | HTMLTextAreaElement
                  if (input) {
                    handleSaveEdit(input.value)
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}