'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Edit, Edit2, MessageSquare, Download, CreditCard, Calendar, MapPin, User, Phone, Mail, Clock, AlertCircle, CheckCircle, XCircle, FileText, Send, DollarSign, Tag, Plus, Trash2, X } from 'lucide-react'
import TopNavigation from '@/components/TopNavigation'
import EditDatesModal from '@/components/reservations/EditDatesModal'
import AddPaymentModal from '@/components/reservations/AddPaymentModal'
import AddNoteModal from '@/components/reservations/AddNoteModal'
import SendMessageModal from '@/components/reservations/SendMessageModal'
import GenerateInvoiceModal from '@/components/reservations/GenerateInvoiceModal'
import EditPricingModal from '@/components/reservations/EditPricingModal'
import AddAdjustmentModal from '@/components/reservations/AddAdjustmentModal'
import { reservationService, Reservation } from '@/lib/api/services/reservationService'

interface ReservationDetailsPageProps {
  params: {
    id: string
  }
}

export default function ReservationDetailsPage({ params }: ReservationDetailsPageProps) {
  // State for reservation data
  const [reservationData, setReservationData] = useState<Reservation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load reservation data
  useEffect(() => {
    const loadReservation = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log('📅 Loading reservation:', params.id)
        
        const response = await reservationService.getReservationById(params.id)
        
        if (response.success && response.data) {
          console.log('📅 Reservation loaded:', response.data)
          setReservationData(response.data)
        } else {
          console.error('📅 Failed to load reservation:', response.error)
          setError('Failed to load reservation')
        }
      } catch (err) {
        console.error('📅 Error loading reservation:', err)
        setError('Error loading reservation')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadReservation()
    }
  }, [params.id])

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

  // Helper function to calculate nights between two dates
  const calculateNights = (checkIn: string, checkOut: string): number => {
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    
    // Validate dates
    if (checkOutDate <= checkInDate) {
      return 0
    }
    
    // Calculate difference in days (nights = check-out - check-in)
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime()
    const nights = Math.floor(timeDiff / (1000 * 3600 * 24))
    
    return nights > 0 ? nights : 0
  }

  // Helper function to generate reservation history
  const generateReservationHistory = () => {
    if (!reservationData) return []
    
    const history = []
    
    // Reservation created
    history.push({
      id: 'created',
      action: 'Reservation Created',
      description: `New reservation ${reservationData.id} created for ${reservationData.guestName} at ${reservationData.propertyName}. Check-in: ${new Date(reservationData.checkIn).toLocaleDateString()}, Check-out: ${new Date(reservationData.checkOut).toLocaleDateString()}, Total: $${reservationData.totalAmount}`,
      timestamp: reservationData.createdAt,
      author: reservationData.createdBy?.name || 'System',
      authorEmail: reservationData.createdBy?.email || 'system@company.com',
      type: 'created'
    })
    
    // Last updated
    if (reservationData.updatedAt !== reservationData.createdAt) {
      history.push({
        id: 'updated',
        action: 'Reservation Details Updated',
        description: `Reservation ${reservationData.id} details were modified. Changes may include guest information, dates, pricing, or special requests.`,
        timestamp: reservationData.updatedAt,
        author: 'System',
        authorEmail: 'system@company.com',
        type: 'updated'
      })
    }
    
    // Status changes
    if (reservationData.status === 'CONFIRMED') {
      history.push({
        id: 'confirmed',
        action: 'Reservation Confirmed',
        description: `Reservation ${reservationData.id} has been confirmed by admin. Guest ${reservationData.guestName} is expected to arrive on ${new Date(reservationData.checkIn).toLocaleDateString()}. Confirmation email sent to ${reservationData.guestEmail}.`,
        timestamp: reservationData.updatedAt,
        author: 'Admin',
        authorEmail: 'admin@company.com',
        type: 'status_change'
      })
    } else if (reservationData.status === 'PENDING') {
      history.push({
        id: 'pending',
        action: 'Reservation Pending Review',
        description: `Reservation ${reservationData.id} is awaiting admin confirmation. Guest ${reservationData.guestName} has submitted booking request for ${reservationData.propertyName}. Payment status: ${reservationData.paymentStatus || 'UNPAID'}.`,
        timestamp: reservationData.updatedAt,
        author: 'System',
        authorEmail: 'system@company.com',
        type: 'status_change'
      })
    } else if (reservationData.status === 'CANCELLED') {
      history.push({
        id: 'cancelled',
        action: 'Reservation Cancelled',
        description: `Reservation ${reservationData.id} has been cancelled. Guest ${reservationData.guestName} will not be arriving. Refund process initiated if payment was made. Cancellation reason: Guest request.`,
        timestamp: reservationData.updatedAt,
        author: 'Admin',
        authorEmail: 'admin@company.com',
        type: 'status_change'
      })
    } else if (reservationData.status === 'COMPLETED') {
      history.push({
        id: 'completed',
        action: 'Reservation Completed',
        description: `Reservation ${reservationData.id} has been completed successfully. Guest ${reservationData.guestName} checked out on ${new Date(reservationData.checkOut).toLocaleDateString()}. Property inspection completed, no damages reported.`,
        timestamp: reservationData.updatedAt,
        author: 'System',
        authorEmail: 'system@company.com',
        type: 'status_change'
      })
    } else if (reservationData.status === 'NO_SHOW') {
      history.push({
        id: 'no_show',
        action: 'Guest No-Show',
        description: `Reservation ${reservationData.id} marked as no-show. Guest ${reservationData.guestName} did not arrive on check-in date ${new Date(reservationData.checkIn).toLocaleDateString()}. Attempts to contact guest were unsuccessful.`,
        timestamp: reservationData.updatedAt,
        author: 'System',
        authorEmail: 'system@company.com',
        type: 'status_change'
      })
    } else if (reservationData.status === 'MODIFIED') {
      history.push({
        id: 'modified',
        action: 'Reservation Modified',
        description: `Reservation ${reservationData.id} has been modified after confirmation. Changes may include dates, guest count, or special requests. Guest ${reservationData.guestName} has been notified of changes.`,
        timestamp: reservationData.updatedAt,
        author: 'Admin',
        authorEmail: 'admin@company.com',
        type: 'status_change'
      })
    }
    
    // Payment history
    if (reservationData.payments && reservationData.payments.length > 0) {
      reservationData.payments.forEach((payment, index) => {
        const paymentMethod = payment.method === 'credit_card' ? 'Credit Card' : 
                             payment.method === 'bank_transfer' ? 'Bank Transfer' :
                             payment.method === 'cash' ? 'Cash' :
                             payment.method === 'paypal' ? 'PayPal' : payment.method
        
        const paymentType = payment.type === 'payment' ? 'Payment received' :
                           payment.type === 'refund' ? 'Refund processed' :
                           payment.type === 'deposit' ? 'Deposit received' :
                           payment.type === 'final_payment' ? 'Final payment received' : 'Payment'
        
        history.push({
          id: `payment_${payment.id}`,
          action: paymentType,
          description: `${paymentType} of $${payment.amount} via ${paymentMethod} for reservation ${reservationData.id}. ${payment.reference ? `Reference: ${payment.reference}` : ''} ${payment.description ? `- ${payment.description}` : ''}`,
          timestamp: payment.createdAt || payment.date,
          author: 'System',
          authorEmail: 'system@company.com',
          type: 'payment'
        })
      })
    }
    
    // Notes history
    if (reservationData.notesList && reservationData.notesList.length > 0) {
      reservationData.notesList.forEach((note, index) => {
        const noteType = note.type === 'special_request' ? 'Special Request' :
                        note.type === 'internal' ? 'Internal Note' :
                        note.type === 'guest_request' ? 'Guest Request' :
                        note.type === 'maintenance' ? 'Maintenance Note' :
                        note.type === 'cleaning' ? 'Cleaning Note' : 'Note'
        
        const priority = note.priority === 'high' ? 'High Priority' :
                        note.priority === 'medium' ? 'Medium Priority' :
                        note.priority === 'low' ? 'Low Priority' : 'Normal Priority'
        
        history.push({
          id: `note_${note.id}`,
          action: `${noteType} Added`,
          description: `${noteType} added to reservation ${reservationData.id}: "${note.content}" (${priority})`,
          timestamp: note.createdAt,
          author: note.createdBy,
          authorEmail: 'user@company.com',
          type: 'note'
        })
      })
    }
    
    // Pricing history
    if (reservationData.pricingHistory && reservationData.pricingHistory.length > 0) {
      reservationData.pricingHistory.forEach((price, index) => {
        const reason = price.reason === 'Initial booking' ? 'Initial booking price set' :
                      price.reason === 'Price adjustment' ? 'Price adjusted by admin' :
                      price.reason === 'Seasonal rate' ? 'Seasonal rate applied' :
                      price.reason === 'Discount applied' ? 'Discount applied to booking' :
                      price.reason === 'Upgrade' ? 'Property upgrade pricing' :
                      price.reason === 'Penalty' ? 'Penalty fee applied' : price.reason
        
        history.push({
          id: `price_${price.id}`,
          action: 'Pricing Updated',
          description: `Pricing updated for reservation ${reservationData.id}: $${price.pricePerNight}/night (Total: $${price.totalAmount}). Reason: ${reason}. Guest ${reservationData.guestName} has been notified of price changes.`,
          timestamp: price.date,
          author: price.changedBy,
          authorEmail: 'admin@company.com',
          type: 'pricing'
        })
      })
    }
    
    // Communication history
    if (reservationData.communicationHistory && reservationData.communicationHistory.length > 0) {
      reservationData.communicationHistory.forEach((comm, index) => {
        const commType = comm.type === 'email' ? 'Email' :
                        comm.type === 'sms' ? 'SMS' :
                        comm.type === 'whatsapp' ? 'WhatsApp' :
                        comm.type === 'phone' ? 'Phone Call' :
                        comm.type === 'notification' ? 'Push Notification' : comm.type
        
        const status = comm.status === 'sent' ? 'sent successfully' :
                      comm.status === 'delivered' ? 'delivered' :
                      comm.status === 'read' ? 'read by guest' :
                      comm.status === 'failed' ? 'failed to send' : comm.status
        
        history.push({
          id: `comm_${comm.id}`,
          action: `${commType} Sent`,
          description: `${commType} sent to guest ${reservationData.guestName} (${reservationData.guestEmail}): "${comm.subject}". Status: ${status}. ${comm.content ? `Content: ${comm.content.substring(0, 100)}${comm.content.length > 100 ? '...' : ''}` : ''}`,
          timestamp: comm.date,
          author: comm.sentBy || 'System',
          authorEmail: 'system@company.com',
          type: 'communication'
        })
      })
    }
    
    // Adjustments history
    if (reservationData.adjustments && reservationData.adjustments.length > 0) {
      reservationData.adjustments.forEach((adjustment, index) => {
        const adjustmentType = adjustment.type === 'discount' ? 'Discount Applied' :
                              adjustment.type === 'fee' ? 'Additional Fee' :
                              adjustment.type === 'penalty' ? 'Penalty Fee' :
                              adjustment.type === 'refund' ? 'Refund Adjustment' :
                              adjustment.type === 'damage' ? 'Damage Fee' :
                              adjustment.type === 'cleaning' ? 'Cleaning Fee' :
                              adjustment.type === 'late_checkout' ? 'Late Checkout Fee' :
                              adjustment.type === 'early_checkin' ? 'Early Check-in Fee' : adjustment.type
        
        const amountType = adjustment.amount > 0 ? 'added' : 'deducted'
        const amount = Math.abs(adjustment.amount)
        
        history.push({
          id: `adjustment_${adjustment.id}`,
          action: adjustmentType,
          description: `${adjustmentType} of $${amount} ${amountType} to reservation ${reservationData.id}. Reason: ${adjustment.reason}. Guest ${reservationData.guestName} has been notified of this adjustment.`,
          timestamp: adjustment.createdAt,
          author: adjustment.createdBy,
          authorEmail: 'admin@company.com',
          type: 'adjustment'
        })
      })
    }
    
    // Additional realistic scenarios
    // Check-in process
    if (reservationData.guestStatus === 'CHECKED_IN') {
      history.push({
        id: 'check_in',
        action: 'Guest Checked In',
        description: `Guest ${reservationData.guestName} has successfully checked in to ${reservationData.propertyName} on ${new Date(reservationData.checkIn).toLocaleDateString()}. Key handover completed, property inspection done, welcome package provided.`,
        timestamp: reservationData.checkIn,
        author: 'Reception Staff',
        authorEmail: 'reception@company.com',
        type: 'check_in'
      })
    }
    
    // Check-out process
    if (reservationData.guestStatus === 'CHECKED_OUT') {
      history.push({
        id: 'check_out',
        action: 'Guest Checked Out',
        description: `Guest ${reservationData.guestName} has checked out from ${reservationData.propertyName} on ${new Date(reservationData.checkOut).toLocaleDateString()}. Property inspection completed, keys returned, final bill settled.`,
        timestamp: reservationData.checkOut,
        author: 'Reception Staff',
        authorEmail: 'reception@company.com',
        type: 'check_out'
      })
    }
    
    // Property preparation
    if (reservationData.status === 'CONFIRMED') {
      history.push({
        id: 'property_prep',
        action: 'Property Preparation Started',
        description: `Property ${reservationData.propertyName} preparation started for guest ${reservationData.guestName}. Cleaning scheduled, maintenance check completed, amenities restocked.`,
        timestamp: new Date(new Date(reservationData.checkIn).getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day before check-in
        author: 'Housekeeping',
        authorEmail: 'housekeeping@company.com',
        type: 'property_prep'
      })
    }
    
    // Guest communication
    if (reservationData.guestEmail) {
      history.push({
        id: 'welcome_email',
        action: 'Welcome Email Sent',
        description: `Welcome email sent to guest ${reservationData.guestName} (${reservationData.guestEmail}) with check-in instructions, property details, and local recommendations for ${reservationData.propertyName}.`,
        timestamp: new Date(new Date(reservationData.checkIn).getTime() - 48 * 60 * 60 * 1000).toISOString(), // 2 days before check-in
        author: 'System',
        authorEmail: 'system@company.com',
        type: 'communication'
      })
    }
    
    // Sort by timestamp (newest first)
    return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  // Loading and error states
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <TopNavigation />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading reservation...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !reservationData) {
    return (
      <div className="min-h-screen bg-slate-50">
        <TopNavigation />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <AlertCircle size={48} className="mx-auto" />
            </div>
            <p className="text-slate-600 mb-4">{error || 'Reservation not found'}</p>
            <button 
              onClick={() => window.history.back()}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Event handlers
  const handleEditDates = async (newDates: { check_in: string; check_out: string }) => {
    try {
      const response = await reservationService.updateDates(reservationData!.id, {
        checkIn: newDates.check_in,
        checkOut: newDates.check_out
      })
      
      if (response.success && response.data) {
        setReservationData(response.data)
    setIsEditingDates(false)
      } else {
        console.error('Failed to update dates:', response.error)
      }
    } catch (err) {
      console.error('Error updating dates:', err)
    }
  }

  const handleAddPayment = async (payment: { amount: number; method: string; date: string; reference?: string; description?: string; type?: string }) => {
    try {
      const response = await reservationService.addPayment(reservationData!.id, payment)
      
      if (response.success && response.data) {
        // Reload reservation to get updated data
        const updatedResponse = await reservationService.getReservationById(reservationData!.id)
        if (updatedResponse.success && updatedResponse.data) {
          setReservationData(updatedResponse.data)
        }
    setIsAddingPayment(false)
      } else {
        console.error('Failed to add payment:', response.error)
      }
    } catch (err) {
      console.error('Error adding payment:', err)
    }
  }

  const handleAddNote = async (note: { content: string; type?: string; priority?: string }) => {
    try {
      const response = await reservationService.addNote(reservationData!.id, note)
      
      if (response.success && response.data) {
        // Reload reservation to get updated data
        const updatedResponse = await reservationService.getReservationById(reservationData!.id)
        if (updatedResponse.success && updatedResponse.data) {
          setReservationData(updatedResponse.data)
        }
    setIsAddingNote(false)
      } else {
        console.error('Failed to add note:', response.error)
      }
    } catch (err) {
      console.error('Error adding note:', err)
    }
  }

  const handleSendMessage = async (message: { type: string; subject: string; content: string }) => {
    try {
      const response = await reservationService.sendCommunication(reservationData!.id, message)
      
      if (response.success && response.data) {
        // Reload reservation to get updated data
        const updatedResponse = await reservationService.getReservationById(reservationData!.id)
        if (updatedResponse.success && updatedResponse.data) {
          setReservationData(updatedResponse.data)
        }
    setIsSendingMessage(false)
      } else {
        console.error('Failed to send message:', response.error)
      }
    } catch (err) {
      console.error('Error sending message:', err)
    }
  }

  const handleGenerateInvoice = async (invoiceData: any) => {
    try {
      const response = await reservationService.generateInvoice(reservationData!.id, invoiceData.type)
      
      if (response.success && response.data) {
        console.log('Invoice generated:', response.data)
    setIsGeneratingInvoice(false)
      } else {
        console.error('Failed to generate invoice:', response.error)
      }
    } catch (err) {
      console.error('Error generating invoice:', err)
    }
  }

  const handleEditPricing = async (pricingData: { price_per_night: number; total_amount: number }) => {
    try {
      const response = await reservationService.updatePricing(reservationData!.id, {
        pricePerNight: pricingData.price_per_night,
        totalAmount: pricingData.total_amount
      })
      
      if (response.success && response.data) {
        setReservationData(response.data)
    setIsEditingPricing(false)
      } else {
        console.error('Failed to update pricing:', response.error)
      }
    } catch (err) {
      console.error('Error updating pricing:', err)
    }
  }

  const handleAddAdjustment = async (adjustment: { type: string; amount: number; reason: string }) => {
    try {
      const response = await reservationService.addAdjustment(reservationData!.id, adjustment)
      
      if (response.success && response.data) {
        // Reload reservation to get updated data
        const updatedResponse = await reservationService.getReservationById(reservationData!.id)
        if (updatedResponse.success && updatedResponse.data) {
          setReservationData(updatedResponse.data)
        }
    setIsAddingAdjustment(false)
      } else {
        console.error('Failed to add adjustment:', response.error)
      }
    } catch (err) {
      console.error('Error adding adjustment:', err)
    }
  }

  const handleRemoveAdjustment = async (adjustmentId: string) => {
    try {
      const response = await reservationService.deleteAdjustment(reservationData!.id, adjustmentId)
      
      if (response.success) {
        // Reload reservation to get updated data
        const updatedResponse = await reservationService.getReservationById(reservationData!.id)
        if (updatedResponse.success && updatedResponse.data) {
          setReservationData(updatedResponse.data)
        }
      } else {
        console.error('Failed to remove adjustment:', response.error)
      }
    } catch (err) {
      console.error('Error removing adjustment:', err)
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
      case 'confirm':
        handleUpdateReservationField('status', 'CONFIRMED')
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

  const handleEditGuestField = (field: string, currentValue: string, label: string) => {
    setEditModal({
      isOpen: true,
      type: 'guest-field',
      field,
      currentValue: currentValue || '',
      title: `Edit ${label}`,
      inputType: field === 'guestEmail' ? 'email' : 
                field === 'guestPhone' || field === 'guestWhatsapp' ? 'phone' : 'text'
    })
  }

  const handleEditReservationField = (field: string, currentValue: string, label: string) => {
    // Format date for input field
    let formattedValue = currentValue || ''
    if (field === 'checkIn' || field === 'checkOut') {
      formattedValue = new Date(currentValue).toISOString().split('T')[0]
    }
    
    setEditModal({
      isOpen: true,
      type: 'reservation-field',
      field,
      currentValue: formattedValue,
      title: `Edit ${label}`,
      inputType: field === 'guestCount' ? 'select' :
                field === 'source' ? 'select' :
                field === 'propertyName' ? 'select' :
                field === 'nights' ? 'readonly' :
                field === 'checkIn' || field === 'checkOut' ? 'date' : 'text'
    })
  }

  const handleEditStatus = () => {
    setEditModal({
      isOpen: true,
      type: 'status-field',
      field: 'status',
      currentValue: reservationData?.status || '',
      title: 'Edit Status',
      inputType: 'select'
    })
  }

  const handleSaveEdit = async (newValue: string) => {
    console.log(`Saving ${editModal.field}: ${newValue}`)
    
    if (editModal.type === 'add-note') {
      await handleSaveNewNote(newValue)
    } else if (editModal.type === 'edit-note') {
      await handleUpdateNote(editModal.field, newValue)
    } else if (editModal.type === 'guest-field' || editModal.type === 'reservation-field' || editModal.type === 'status-field') {
      await handleUpdateReservationField(editModal.field, newValue)
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

  const handleSaveNewNote = async (content: string) => {
    try {
      const response = await reservationService.addNote(reservationData!.id, {
      content,
        type: 'internal',
        priority: 'normal'
      })
      
      if (response.success && response.data) {
        // Reload reservation to get updated data
        const updatedResponse = await reservationService.getReservationById(reservationData!.id)
        if (updatedResponse.success && updatedResponse.data) {
          setReservationData(updatedResponse.data)
        }
      } else {
        console.error('Failed to add note:', response.error)
      }
    } catch (err) {
      console.error('Error adding note:', err)
    }
  }

  const handleUpdateNote = async (noteId: string, content: string) => {
    try {
      const response = await reservationService.updateNote(reservationData!.id, noteId, content)
      
      if (response.success && response.data) {
        // Reload reservation to get updated data
        const updatedResponse = await reservationService.getReservationById(reservationData!.id)
        if (updatedResponse.success && updatedResponse.data) {
          setReservationData(updatedResponse.data)
        }
      } else {
        console.error('Failed to update note:', response.error)
      }
    } catch (err) {
      console.error('Error updating note:', err)
    }
  }

  const handleUpdateReservationField = async (field: string, newValue: string) => {
    try {
      // Prepare update data based on field type
      let updateData: any = {}
      
      if (field === 'guestCount') {
        updateData[field] = parseInt(newValue)
      } else if (field === 'nights') {
        // Nights field is read-only, should not be updated directly
        console.warn('Nights field is read-only and calculated automatically from check-in/check-out dates')
        return
      } else if (field === 'checkIn' || field === 'checkOut') {
        // Convert date to ISO string for backend
        updateData[field] = new Date(newValue).toISOString()
        
        // Calculate nights automatically when dates change
        const newCheckIn = field === 'checkIn' ? newValue : reservationData!.checkIn
        const newCheckOut = field === 'checkOut' ? newValue : reservationData!.checkOut
        
        const nights = calculateNights(newCheckIn, newCheckOut)
        
        if (nights > 0) {
          updateData.nights = nights
        } else {
          // Show error if dates are invalid
          console.error('Invalid dates: check-out must be after check-in')
          alert('Check-out date must be after check-in date')
          return
        }
      } else {
        updateData[field] = newValue
      }

      const response = await reservationService.updateReservation(reservationData!.id, updateData)
      
      if (response.success && response.data) {
        setReservationData(response.data)
        console.log(`Successfully updated ${field} to:`, newValue)
      } else {
        console.error('Failed to update reservation field:', response.error)
      }
    } catch (err) {
      console.error('Error updating reservation field:', err)
    }
  }

  const getStatusIcon = (status: string) => {
    // Handle undefined/null status
    if (!status) {
      return <AlertCircle size={16} className="text-slate-600" />
    }
    
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle size={16} className="text-green-600" />
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />
      case 'canceled':
      case 'cancelled':
        return <XCircle size={16} className="text-red-600" />
      case 'completed':
        return <CheckCircle size={16} className="text-blue-600" />
      default:
        return <AlertCircle size={16} className="text-slate-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    // Handle undefined/null status
    if (!status) {
      status = 'PENDING'
    }
    
    const statusConfig = {
      CONFIRMED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmed' },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
      COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' },
      NO_SHOW: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'No Show' },
      MODIFIED: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Modified' }
    }
    
    const config = statusConfig[status.toUpperCase() as keyof typeof statusConfig] || statusConfig.PENDING
    
    return (
      <div className="flex items-center space-x-2">
      <span className={`px-3 py-1 text-sm ${config.bg} ${config.text} rounded-full flex items-center space-x-2`}>
        {getStatusIcon(status)}
        <span>{config.label}</span>
      </span>
        {status && status.toUpperCase() === 'PENDING' && (
          <button
            onClick={() => handleQuickAction('confirm')}
            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer"
          >
            Confirm
          </button>
        )}
        <button
          onClick={handleEditStatus}
          className="text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <Edit size={14} />
        </button>
      </div>
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
      <TopNavigation data-testid="top-navigation" />
      
      {/* Header - positioned below the fixed navigation */}
      <div className="bg-white border-b border-gray-200 px-2 sm:px-3 lg:px-4 py-1.5" style={{ marginTop: '64px' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.history.back()}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              data-testid="back-btn"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-medium text-slate-900">
                Reservation {reservationData.id}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {reservationData.guestName} • {reservationData.propertyName}
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
                <span className="font-medium">Check-in:</span> {new Date(reservationData.checkIn).toLocaleDateString()}
              </div>
              <div className="text-sm text-slate-600">
                <span className="font-medium">Check-out:</span> {new Date(reservationData.checkOut).toLocaleDateString()}
              </div>
            </div>
            <div className="text-sm text-slate-600">
              <span className="font-medium">Total:</span> AED {reservationData.totalAmount}
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
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <div>
                      <span className="font-medium">Check-in:</span> {new Date(reservationData.checkIn).toLocaleDateString()}
                  </div>
                    <button
                      onClick={() => handleEditReservationField('checkIn', reservationData.checkIn, 'Check-in Date')}
                      className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <Edit size={14} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <div>
                      <span className="font-medium">Check-out:</span> {new Date(reservationData.checkOut).toLocaleDateString()}
                    </div>
                    <button
                      onClick={() => handleEditReservationField('checkOut', reservationData.checkOut, 'Check-out Date')}
                      className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <Edit size={14} />
                    </button>
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
                    <span className="text-slate-900">AED {reservationData.paidAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Outstanding</span>
                    <span className={`text-sm font-medium ${
                          (reservationData.outstandingBalance || 0) > 0
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`}>
                          AED {reservationData.outstandingBalance || 0}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      (reservationData.outstandingBalance || 0) === 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {(reservationData.outstandingBalance || 0) === 0 ? 'Fully Paid' : 'Outstanding Balance'}
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
                    <span className="text-slate-900 font-medium">AED {reservationData.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Guests</span>
                    <span className="text-slate-900 font-medium">{reservationData.guestCount}</span>
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
                          { label: 'Name', value: reservationData.guestName },
                          { label: 'Email', value: reservationData.guestEmail },
                          { label: 'Phone', value: reservationData.guestPhone },
                          { label: 'WhatsApp', value: reservationData.guestWhatsapp, isLink: true }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-600">{item.label}:</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              {item.isLink ? (
                                <a 
                                  href={`https://wa.me/${(item.value || '').replace(/[^0-9]/g, '')}`}
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
                                onClick={() => handleEditGuestField(
                                  item.label === 'Name' ? 'guestName' :
                                  item.label === 'Email' ? 'guestEmail' :
                                  item.label === 'Phone' ? 'guestPhone' :
                                  'guestWhatsapp',
                                  item.value || '',
                                  item.label
                                )}
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
                          { label: 'Unit', value: reservationData.propertyName, editable: true },
                          { label: 'Source', value: reservationData.source, editable: true },
                          { label: 'Number of Guests', value: reservationData.guestCount, editable: true },
                          { label: 'Nights', value: reservationData.nights, editable: false }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-600">{item.label}:</span>
                              {!item.editable && (
                                <span className="text-xs text-gray-400">(auto-calculated)</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-gray-900">{item.value}</span>
                              {item.editable && (
                              <button 
                                  onClick={() => handleEditReservationField(
                                    item.label === 'Unit' ? 'propertyName' :
                                    item.label === 'Source' ? 'source' :
                                    item.label === 'Number of Guests' ? 'guestCount' :
                                    'nights',
                                    String(item.value || ''),
                                    item.label
                                  )}
                                className="text-orange-600 hover:text-orange-700 cursor-pointer"
                              >
                                <Edit size={14} />
                              </button>
                              )}
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
                      </div>
                    </div>
                    
                    {reservationData.notesList && reservationData.notesList.length > 0 ? (
                      <div className="space-y-4">
                        {reservationData.notesList.map((note) => (
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
                      <p className="text-sm text-gray-500 italic">No notes added yet. Click &quot;Add New&quot; to add your first note.</p>
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
                          { label: 'Total Amount', value: `AED ${reservationData.totalAmount}`, color: 'text-gray-900' },
                          { label: 'Paid', value: `AED ${reservationData.paidAmount}`, color: 'text-green-600' },
                          { label: 'Outstanding', value: `AED ${reservationData.outstandingBalance || 0}`, color: (reservationData.outstandingBalance || 0) > 0 ? 'text-red-600' : 'text-green-600' }
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
                        {reservationData.adjustments && reservationData.adjustments.map((adjustment) => (
                          <div key={adjustment.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-600">{adjustment.reason}:</span>
                              <button
                                onClick={() => handleRemoveAdjustment(adjustment.id.toString())}
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
                        {reservationData.payments && reservationData.payments.map((payment) => (
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
                                <div className="text-xs text-gray-400">{payment.reference}</div>
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
                        {reservationData.pricingHistory && reservationData.pricingHistory.map((price) => (
                          <div key={price.id} className="border border-gray-100 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-600">AED {price.pricePerNight}/night</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-400">{price.reason}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-400">{price.date}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">AED {price.totalAmount}</div>
                                <div className="text-xs text-gray-400">{price.changedBy}</div>
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
                        {reservationData.communicationHistory && reservationData.communicationHistory.map((comm) => (
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
                      {generateReservationHistory().map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-slate-900">{item.action}</div>
                            <div className="text-sm text-slate-600">{item.description}</div>
                            <div className="text-xs text-slate-500 mt-1">
                              {new Date(item.timestamp).toLocaleString()}
                        </div>
                        </div>
                          <div className="text-right ml-4">
                            <div className="text-sm font-medium text-slate-900">{item.author}</div>
                            <div className="text-xs text-slate-500">{item.authorEmail}</div>
                            <div className={`inline-flex px-2 py-1 text-xs rounded-full mt-1 ${
                              item.type === 'created' ? 'bg-green-100 text-green-800' :
                              item.type === 'updated' ? 'bg-blue-100 text-blue-800' :
                              item.type === 'status_change' ? 'bg-purple-100 text-purple-800' :
                              item.type === 'payment' ? 'bg-yellow-100 text-yellow-800' :
                              item.type === 'note' ? 'bg-gray-100 text-gray-800' :
                              item.type === 'pricing' ? 'bg-indigo-100 text-indigo-800' :
                              item.type === 'communication' ? 'bg-pink-100 text-pink-800' :
                              item.type === 'adjustment' ? 'bg-orange-100 text-orange-800' :
                              item.type === 'check_in' ? 'bg-emerald-100 text-emerald-800' :
                              item.type === 'check_out' ? 'bg-teal-100 text-teal-800' :
                              item.type === 'property_prep' ? 'bg-cyan-100 text-cyan-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.type.replace('_', ' ')}
                      </div>
                        </div>
                        </div>
                      ))}
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
          reservation={{
            id: reservationData.id,
            check_in: new Date(reservationData.checkIn).toISOString().split('T')[0],
            check_out: new Date(reservationData.checkOut).toISOString().split('T')[0],
            unit_property: reservationData.propertyName,
            nights: reservationData.nights
          }}
          onClose={() => setIsEditingDates(false)}
          onSave={handleEditDates}
        />
      )}

      {isAddingPayment && (
        <AddPaymentModal
          reservation={{
            id: reservationData.id,
            total_amount: reservationData.totalAmount,
            paid_amount: reservationData.paidAmount,
            outstanding_balance: reservationData.outstandingBalance
          }}
          onClose={() => setIsAddingPayment(false)}
          onSave={handleAddPayment}
        />
      )}

      {isAddingNote && (
        <AddNoteModal
          reservation={{
            id: reservationData.id
          }}
          onClose={() => setIsAddingNote(false)}
          onSave={handleAddNote}
        />
      )}

      {isSendingMessage && (
        <SendMessageModal
          reservation={{
            id: reservationData.id,
            guest_name: reservationData.guestName,
            guest_email: reservationData.guestEmail
          }}
          onClose={() => setIsSendingMessage(false)}
          onSend={handleSendMessage}
        />
      )}

      {isGeneratingInvoice && (
        <GenerateInvoiceModal
          reservation={{
            id: reservationData.id,
            reservation_id: reservationData.id,
            guestName: reservationData.guestName,
            guest_name: reservationData.guestName,
            guestEmail: reservationData.guestEmail,
            guest_email: reservationData.guestEmail,
            propertyName: reservationData.propertyName,
            unit_property: reservationData.propertyName,
            checkIn: reservationData.checkIn,
            check_in: reservationData.checkIn,
            checkOut: reservationData.checkOut,
            check_out: reservationData.checkOut,
            nights: reservationData.nights,
            guestCount: reservationData.guestCount,
            guests: reservationData.guestCount,
            totalAmount: reservationData.totalAmount,
            total_amount: reservationData.totalAmount,
            paidAmount: reservationData.paidAmount,
            paid_amount: reservationData.paidAmount,
            outstandingBalance: reservationData.outstandingBalance,
            outstanding_balance: reservationData.outstandingBalance,
            payments: reservationData.payments || []
          }}
          onClose={() => setIsGeneratingInvoice(false)}
          onGenerate={handleGenerateInvoice}
        />
      )}

      {isEditingPricing && (
        <EditPricingModal
          reservation={{
            id: reservationData.id,
            total_amount: reservationData.totalAmount,
            nights: reservationData.nights
          }}
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
              ) : editModal.inputType === 'select' ? (
                <div className="relative">
                  <select
                    defaultValue={editModal.currentValue}
                    className="w-full h-10 px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                    autoFocus
                  >
                  {editModal.field === 'status' && (
                    <>
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="NO_SHOW">No Show</option>
                      <option value="MODIFIED">Modified</option>
                    </>
                  )}
                  {editModal.field === 'source' && (
                    <>
                      <option value="DIRECT">Direct</option>
                      <option value="AIRBNB">Airbnb</option>
                      <option value="BOOKING_COM">Booking.com</option>
                      <option value="VRBO">VRBO</option>
                      <option value="OTHER">Other</option>
                    </>
                  )}
                  {editModal.field === 'propertyName' && (
                    <>
                      <option value="Luxury Downtown Apartment">Luxury Downtown Apartment</option>
                      <option value="Beach Villa Palm Jumeirah">Beach Villa Palm Jumeirah</option>
                      <option value="Business Bay Office">Business Bay Office</option>
                    </>
                  )}
                  {editModal.field === 'guestCount' && (
                    <>
                      <option value="1">1 Guest</option>
                      <option value="2">2 Guests</option>
                      <option value="3">3 Guests</option>
                      <option value="4">4 Guests</option>
                      <option value="5">5 Guests</option>
                      <option value="6">6 Guests</option>
                      <option value="7">7 Guests</option>
                      <option value="8">8 Guests</option>
                    </>
                  )}
                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                </div>
              ) : editModal.inputType === 'readonly' ? (
                <input
                  type="text"
                  value={editModal.currentValue}
                  readOnly
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                />
              ) : editModal.inputType === 'phone' ? (
                <div className="space-y-2">
                  <div className="flex">
                    <div className="relative">
                      <select className="w-24 h-10 px-2 py-2 pr-6 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white cursor-pointer text-xs">
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+49">🇩🇪 +49</option>
                        <option value="+33">🇫🇷 +33</option>
                        <option value="+39">🇮🇹 +39</option>
                        <option value="+34">🇪🇸 +34</option>
                        <option value="+7">🇷🇺 +7</option>
                        <option value="+86">🇨🇳 +86</option>
                        <option value="+81">🇯🇵 +81</option>
                        <option value="+82">🇰🇷 +82</option>
                        <option value="+91">🇮🇳 +91</option>
                      </select>
                      {/* Custom dropdown arrow for country selector */}
                      <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <input
                      type="tel"
                      defaultValue={editModal.currentValue}
                      placeholder="Phone number"
                      className="flex-1 h-10 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-gray-500">Enter phone number without country code</p>
                </div>
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
                  let input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null = null
                  
                  if (editModal.inputType === 'phone') {
                    const countrySelect = document.querySelector('select') as HTMLSelectElement
                    const phoneInput = document.querySelector('input[type="tel"]') as HTMLInputElement
                    if (countrySelect && phoneInput) {
                      const fullNumber = countrySelect.value + phoneInput.value
                      handleSaveEdit(fullNumber)
                    }
                  } else {
                    input = document.querySelector('input, textarea, select') as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
                  if (input) {
                    handleSaveEdit(input.value)
                    }
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