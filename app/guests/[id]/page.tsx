'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Edit, Trash2, MessageSquare, Mail, Phone, Calendar, MapPin, User, Star, Crown, FileText, Download, Upload, Plus, X, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, XCircle as XCircleIcon } from 'lucide-react'
import TopNavigation from '@/components/TopNavigation'
import { guestService, Guest, GuestDetailStats, GuestActivity } from '@/lib/api/services/guestService'
import { fileService } from '@/lib/api/services/fileService'

interface GuestDetailsPageProps {
  params: {
    id: string
  }
}

export default function GuestDetailsPage({ params }: GuestDetailsPageProps) {
  const [guestData, setGuestData] = useState<Guest | null>(null)
  const [guestStats, setGuestStats] = useState<GuestDetailStats | null>(null)
  const [guestReservations, setGuestReservations] = useState<any[]>([])
  const [guestActivity, setGuestActivity] = useState<GuestActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploadingDocument, setIsUploadingDocument] = useState(false)
  const [uploadDocumentModal, setUploadDocumentModal] = useState(false)
  const [editModal, setEditModal] = useState<{
    isOpen: boolean
    field: string
    currentValue: string
    title: string
    inputType: string
    options?: { value: string; label: string }[]
  }>({
    isOpen: false,
    field: '',
    currentValue: '',
    title: '',
    inputType: 'text',
  })


  // Load guest data, stats, reservations, and activity from API
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log('👥 Loading guest data:', params.id)
        
        // Load guest info
        const guestResponse = await guestService.getGuestById(params.id)
        if (guestResponse.success && guestResponse.data) {
          console.log('👥 Guest loaded:', guestResponse.data)
          setGuestData(guestResponse.data)
        } else {
          setError('Failed to load guest')
          return
        }

        // Load guest stats
        const statsResponse = await guestService.getGuestDetailStats(params.id)
        if (statsResponse.success && statsResponse.data) {
          console.log('👥 Guest stats loaded:', statsResponse.data)
          setGuestStats(statsResponse.data)
        }

        // Load guest reservations
        const reservationsResponse = await guestService.getGuestReservations(params.id)
        if (reservationsResponse.success && reservationsResponse.data) {
          console.log('👥 Guest reservations loaded:', reservationsResponse.data)
          setGuestReservations(reservationsResponse.data)
        }

        // Load guest activity
        const activityResponse = await guestService.getGuestActivity(params.id)
        if (activityResponse.success && activityResponse.data) {
          console.log('👥 Guest activity loaded:', activityResponse.data)
          setGuestActivity(activityResponse.data)
        }
        
      } catch (err) {
        console.error('👥 Error loading guest data:', err)
        setError('Error loading guest')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadAllData()
    }
  }, [params.id])

  const [newComment, setNewComment] = useState('')
  const [commentsHistory, setCommentsHistory] = useState<Array<{
    id: string
    text: string
    author: string
    date: string
  }>>([
    {
      id: '1',
      text: 'Prefers high floors, late checkout, needs quiet room',
      author: 'Manager',
      date: '2024-07-20T14:20:00Z'
    }
  ])

  // Mock reservation history
  const mockReservations = [
    {
      id: 1,
      checkIn: '2024-08-15',
      checkOut: '2024-08-18',
      unit_nickname: 'Burj Khalifa Studio',
      reservation_code: 'RES-001',
      status: 'completed',
      totalAmount: 450,
      nights: 3,
      source: 'Airbnb'
    },
    {
      id: 2,
      checkIn: '2024-06-10',
      checkOut: '2024-06-15',
      unit_nickname: 'Marina View',
      reservation_code: 'RES-002',
      status: 'completed',
      totalAmount: 750,
      nights: 5,
      source: 'Direct',
      created_by: {
        name: 'Alex Thompson',
        email: 'alex.thompson@company.com'
      }
    },
    {
      id: 3,
      checkIn: '2024-04-20',
      checkOut: '2024-04-25',
      unit_nickname: 'Downtown Loft',
      reservation_code: 'RES-003',
      status: 'completed',
      totalAmount: 600,
      nights: 5,
      source: 'Booking.com'
    },
    {
      id: 4,
      checkIn: '2024-12-01',
      checkOut: '2024-12-08',
      unit_nickname: 'Skyline Penthouse',
      reservation_code: 'RES-004',
      status: 'confirmed',
      totalAmount: 1200,
      nights: 7,
      source: 'Direct',
      created_by: {
        name: 'Maria Rodriguez',
        email: 'maria.rodriguez@company.com'
      }
    }
  ]

  // Mock activity log
  const mockActivityLog = [
    {
      id: 1,
      action: 'Profile updated',
      details: 'Updated phone number',
      user: 'Manager',
      timestamp: '2024-07-20T14:20:00Z',
      type: 'update'
    },
    {
      id: 2,
      action: 'Document uploaded',
      details: 'Added loyalty card document',
      user: 'Admin',
      timestamp: '2024-02-10T14:20:00Z',
      type: 'document'
    },
    {
      id: 3,
      action: 'Reservation created',
      details: 'New booking for December 2024',
      user: 'System',
      timestamp: '2024-01-15T10:30:00Z',
      type: 'reservation'
    },
    {
      id: 4,
      action: 'Category added',
      details: 'Marked as Star Guest',
      user: 'Admin',
      timestamp: '2024-01-15T10:30:00Z',
      type: 'category'
    }
  ]

  const handleEditField = (field: string, currentValue: string, title: string, inputType: string, options?: { value: string; label: string }[]) => {
    setEditModal({
      isOpen: true,
      field,
      currentValue,
      title,
      inputType,
      options,
    })
  }

  const handleSaveEdit = async (newValue: string) => {
    if (!guestData) return
    
    try {
      const response = await guestService.updateGuest(guestData.id, {
        [editModal.field]: newValue
      })
      
      if (response.success && response.data) {
        setGuestData(response.data)
      } else {
        alert('Failed to update guest')
      }
    } catch (err) {
      console.error('Error updating guest:', err)
      alert('Error updating guest')
    }
    
    handleCloseEdit()
  }

  const handleCloseEdit = () => {
    setEditModal({
      isOpen: false,
      field: '',
      currentValue: '',
      title: '',
      inputType: 'text',
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const addComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        text: newComment.trim(),
        author: 'Current User', // In real app, this would be the actual logged-in user
        date: new Date().toISOString()
      }
      setCommentsHistory(prev => [comment, ...prev])
      setNewComment('')
      
      // Update the main comments field to include all comments
      const allComments = [comment, ...commentsHistory].map(c => c.text).join('\n\n')
      if (guestData) {
        setGuestData({ ...guestData, comments: allComments })
      }
    }
  }

  const removeComment = (commentId: string) => {
    const updatedHistory = commentsHistory.filter(c => c.id !== commentId)
    setCommentsHistory(updatedHistory)
    
    // Update the main comments field
    const allComments = updatedHistory.map(c => c.text).join('\n\n')
    if (guestData) {
      setGuestData({ ...guestData, comments: allComments })
    }
  }

  const getAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-600" />
      case 'confirmed':
        return <Clock size={16} className="text-blue-600" />
      case 'cancelled':
        return <XCircle size={16} className="text-red-600" />
      default:
        return <AlertCircle size={16} className="text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case 'completed':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Completed</span>
      case 'confirmed':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Confirmed</span>
      case 'cancelled':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Cancelled</span>
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Unknown</span>
    }
  }

  const getLoyaltyTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'bg-purple-100 text-purple-800'
      case 'Gold': return 'bg-yellow-100 text-yellow-800'
      case 'Silver': return 'bg-gray-100 text-gray-800'
      case 'Bronze': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'update':
        return <Edit size={16} className="text-blue-600" />
      case 'document':
        return <FileText size={16} className="text-green-600" />
      case 'reservation':
        return <Calendar size={16} className="text-purple-600" />
      case 'category':
        return <Star size={16} className="text-yellow-600" />
      default:
        return <AlertCircle size={16} className="text-gray-600" />
    }
  }

  const openWhatsApp = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '')
    const whatsappUrl = `https://wa.me/${cleanNumber.replace('+', '')}`
    window.open(whatsappUrl, '_blank')
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <TopNavigation />
        <div className="flex items-center justify-center h-64" style={{ marginTop: '64px' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading guest...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !guestData) {
    return (
      <div className="min-h-screen bg-slate-50">
        <TopNavigation />
        <div className="flex items-center justify-center h-64" style={{ marginTop: '64px' }}>
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <p className="text-slate-900 font-medium mb-2">Failed to load guest</p>
            <p className="text-slate-600 mb-4">{error || 'Guest not found'}</p>
            <button
              onClick={() => window.location.href = '/guests'}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer"
            >
              Back to Guests
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleDeleteGuest = async () => {
    if (confirm('Are you sure you want to delete this guest? This action cannot be undone.')) {
      setIsDeleting(true)
      try {
        const response = await guestService.deleteGuest(guestData.id)
        if (response.success) {
          window.location.href = '/guests'
        } else {
          alert('Failed to delete guest')
        }
      } catch (err) {
        console.error('Error deleting guest:', err)
        alert('Error deleting guest')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleUploadDocument = async (file: File) => {
    if (!guestData) return
    
    setIsUploadingDocument(true)
    try {
      const response = await guestService.uploadDocument(guestData.id, file)
      if (response.success && response.data) {
        // Refresh guest data to show new document
        const refreshResponse = await guestService.getGuestById(guestData.id)
        if (refreshResponse.success && refreshResponse.data) {
          setGuestData(refreshResponse.data)
        }
        setUploadDocumentModal(false)
        alert('Document uploaded successfully')
      } else {
        alert('Failed to upload document')
      }
    } catch (err) {
      console.error('Error uploading document:', err)
      alert('Error uploading document')
    } finally {
      setIsUploadingDocument(false)
    }
  }

  const handleDeleteDocument = async (docId: number) => {
    if (!guestData) return
    
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await guestService.deleteDocument(guestData.id, docId)
        if (response.success) {
          // Refresh guest data to remove deleted document
          const refreshResponse = await guestService.getGuestById(guestData.id)
          if (refreshResponse.success && refreshResponse.data) {
            setGuestData(refreshResponse.data)
          }
        } else {
          alert('Failed to delete document')
        }
      } catch (err) {
        console.error('Error deleting document:', err)
        alert('Error deleting document')
      }
    }
  }

  return (
    <div className="h-screen bg-slate-50 overflow-hidden flex flex-col">
      <TopNavigation />
      
      <div className="flex-1 flex flex-col min-h-0" style={{ marginTop: '52px' }}>
        {/* Header */}
        <div className="sticky top-[3.3rem] z-10 bg-white border border-gray-200 px-4 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h1 className="text-xl font-medium text-slate-900">{guestData.name}</h1>
                <p className="text-sm text-slate-600">{guestData.nationality} • {guestData.age || getAge(guestData.dateOfBirth)} years old</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                {guestData.starGuest && <Star size={16} className="mr-2 text-yellow-500" />}
                {guestData.primaryGuest && <Crown size={16} className="mr-2 text-orange-500" />}
                <span>VIP Guest</span>
              </span>
              <button 
                onClick={() => setIsDeleting(true)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center"
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-4 py-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-1">Total Reservations</p>
                  <p className="text-2xl font-medium text-slate-900">{guestStats?.totalReservations || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-1">Lifetime Value</p>
                  <p className="text-2xl font-medium text-slate-900">AED {guestStats?.lifetimeValue?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-1">Total Nights</p>
                  <p className="text-2xl font-medium text-slate-900">{guestStats?.totalNights || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-4 px-4 py-3 min-h-0 overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col">
              <div className="p-4">
                <h2 className="text-lg font-medium text-slate-900 mb-4">Guest Details</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Email:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-900">{guestData.email}</span>
                      <button 
                        onClick={() => handleEditField('email', guestData.email, 'Email', 'email')}
                        className="p-1 text-orange-600 hover:bg-orange-100 rounded cursor-pointer"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Phone:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-900">{guestData.phone}</span>
                      <button 
                        onClick={() => handleEditField('phone', guestData.phone, 'Phone', 'tel')}
                        className="p-1 text-orange-600 hover:bg-orange-100 rounded cursor-pointer"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Nationality:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-900 flex items-center space-x-1">
                        <span>🇺🇸</span>
                        <span>{guestData.nationality}</span>
                      </span>
                      <button
                        onClick={() => handleEditField('nationality', guestData.nationality, 'Nationality', 'select')}
                        className="p-1 text-orange-600 hover:bg-orange-100 rounded cursor-pointer"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Birth Date:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-900">{formatDate(guestData.dateOfBirth)}</span>
                      <button
                        onClick={() => handleEditField('dateOfBirth', guestData.dateOfBirth, 'Birth Date', 'date')}
                        className="p-1 text-orange-600 hover:bg-orange-100 rounded cursor-pointer"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Age:</span>
                    <span className="text-sm text-slate-900">{getAge(guestData.dateOfBirth)} years</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-gray-200 h-full overflow-y-auto custom-scrollbar">
              <div className="p-4">
              {/* Description */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-slate-900">Description</h3>
                  <button
                    onClick={() => handleEditField('comments', guestData.comments || '', 'Description', 'textarea')}
                    className="p-1 text-orange-600 hover:bg-orange-100 rounded cursor-pointer"
                  >
                    <Edit size={14} />
                  </button>
                </div>
                <div className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 min-h-[60px]">
                  {guestData.comments || 'No description available'}
                </div>
              </div>

              {/* Reservation History */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-slate-900 mb-3">Reservation History</h3>
                <div className="space-y-3">
                  {(guestReservations && guestReservations.length > 0) ? (
                    guestReservations.map((reservation) => (
                      <div 
                        key={reservation.id} 
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => window.location.href = `/reservations/${reservation.id}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-slate-100 rounded">
                            <Calendar size={16} className="text-slate-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{reservation.propertyName}</div>
                            <div className="text-xs text-slate-500">
                              {formatDate(reservation.checkIn)} - {formatDate(reservation.checkOut)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-slate-900">AED {reservation.totalAmount}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            reservation.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            reservation.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                            reservation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            reservation.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {reservation.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No reservations yet</p>
                  )}
                </div>
              </div>

              {/* Documents */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-slate-900">Documents</h3>
                  <button
                    onClick={() => setUploadDocumentModal(true)}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer"
                  >
                    <Upload size={14} />
                    <span>Upload</span>
                  </button>
                </div>
                <div className="space-y-3">
                  {(guestData.documents && guestData.documents.length > 0) ? (
                    guestData.documents.map((document) => (
                      <div key={document.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText size={16} className="text-slate-600" />
                          <div>
                            <div className="text-sm font-medium text-slate-900">{document.name}</div>
                            <div className="text-xs text-slate-500">{document.type} • {document.size}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => document.url && window.open(document.url, '_blank')}
                            className="p-1 text-slate-600 hover:bg-gray-100 rounded cursor-pointer"
                            title="Download"
                          >
                            <Download size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteDocument(document.id)}
                            className="p-1 text-slate-600 hover:bg-red-100 hover:text-red-600 rounded cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No documents uploaded yet</p>
                  )}
                </div>
              </div>

              {/* Activity Log */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-slate-900 mb-3">Activity Log</h3>
                <div className="space-y-3">
                  {(guestActivity && guestActivity.length > 0) ? (
                    guestActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                      <div className="p-1 bg-slate-100 rounded">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-900">{activity.action}</div>
                        <div className="text-xs text-slate-600 mt-1">{activity.details}</div>
                        <div className="text-xs text-slate-500 mt-1">by {activity.user} • {formatDateTime(activity.timestamp)}</div>
                      </div>
                    </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No activity yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Edit {editModal.title}</h3>
                <button
                  onClick={handleCloseEdit}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <XCircleIcon size={16} />
                </button>
              </div>

              <div className="mb-6">
                {editModal.inputType === 'textarea' ? (
                  <textarea
                    defaultValue={editModal.currentValue}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder={`Enter ${editModal.title.toLowerCase()}`}
                  />
                ) : editModal.inputType === 'select' ? (
                  <select
                    defaultValue={editModal.currentValue}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="American">🇺🇸 American</option>
                    <option value="British">🇬🇧 British</option>
                    <option value="Canadian">🇨🇦 Canadian</option>
                    <option value="French">🇫🇷 French</option>
                    <option value="German">🇩🇪 German</option>
                    <option value="Italian">🇮🇹 Italian</option>
                    <option value="Spanish">🇪🇸 Spanish</option>
                    <option value="Chinese">🇨🇳 Chinese</option>
                    <option value="Japanese">🇯🇵 Japanese</option>
                    <option value="Korean">🇰🇷 Korean</option>
                    <option value="Indian">🇮🇳 Indian</option>
                    <option value="Australian">🇦🇺 Australian</option>
                    <option value="Brazilian">🇧🇷 Brazilian</option>
                    <option value="Mexican">🇲🇽 Mexican</option>
                    <option value="Russian">🇷🇺 Russian</option>
                    <option value="Egyptian">🇪🇬 Egyptian</option>
                    <option value="Saudi Arabian">🇸🇦 Saudi Arabian</option>
                    <option value="Emirati">🇦🇪 Emirati</option>
                    <option value="Turkish">🇹🇷 Turkish</option>
                    <option value="Greek">🇬🇷 Greek</option>
                  </select>
                ) : (
                  <input
                    type={editModal.inputType}
                    defaultValue={editModal.currentValue}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder={`Enter ${editModal.title.toLowerCase()}`}
                  />
                )}
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={handleCloseEdit}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const input = document.querySelector('input, textarea, select') as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
                    if (input && input.value.trim()) {
                      handleSaveEdit(input.value.trim())
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {uploadDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Upload Document</h3>
                <button
                  onClick={() => setUploadDocumentModal(false)}
                  className="p-1 hover:bg-gray-100 rounded cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select file to upload
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleUploadDocument(file)
                    }
                  }}
                  disabled={isUploadingDocument}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: PDF, DOC, DOCX, JPG, PNG (max 10MB)
                </p>
              </div>
              {isUploadingDocument && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-full">
                  <Trash2 size={20} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Delete Guest</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-6">
                Are you sure you want to delete <strong>{guestData.name}</strong>? 
                This will permanently remove the guest profile and all associated data.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDeleting(false)}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteGuest}
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Delete Guest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}