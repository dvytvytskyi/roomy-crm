'use client'

import { useState, useEffect } from 'react'
import { 
  User, Mail, Phone, Calendar, MapPin, MessageSquare, 
  Edit, Trash2, Plus, Eye, ArrowLeft, FileText, Download, Upload,
  Building, Users, Star, Crown, DollarSign
} from 'lucide-react'
import TopNavigation from '@/components/TopNavigation'
import AddGuestModal from '@/components/guests/AddGuestModal'
import { guestService, Guest, GuestDetailStats } from '@/lib/api/services/guestService'
import { guestDocumentService, GuestDocument } from '@/lib/api/services/guestDocumentService'
import { userServiceAdapter } from '@/lib/api/adapters/apiAdapter'
import { useGuestEvents } from '@/hooks/useEventBus'
import { showToast } from '@/lib/utils/toast'

interface GuestDetailsPageProps {
  params: {
    id: string
  }
}

export default function GuestDetailsPage({ params }: GuestDetailsPageProps) {
  const [guest, setGuest] = useState<Guest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<GuestDetailStats | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [documents, setDocuments] = useState<GuestDocument[]>([])
  const [isUploadingDocument, setIsUploadingDocument] = useState(false)
  const { emitGuestUpdated } = useGuestEvents()

  // Load guest data
  useEffect(() => {
    const loadGuest = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log('👤 Loading guest details from API...')
        
        const response = await guestService.getGuestById(params.id)
        if (response.success && response.data) {
          console.log('👤 Guest details loaded:', response.data)
          console.log('👤 Guest reservations:', response.data.guestReservations)
          setGuest(response.data)
          
          // Load guest stats
          const statsResponse = await guestService.getGuestDetailStats(params.id)
          if (statsResponse.success && statsResponse.data) {
            setStats(statsResponse.data)
          }

          // Load guest documents
          const documentsResponse = await guestDocumentService.getGuestDocuments(params.id)
          if (documentsResponse.success) {
            setDocuments(documentsResponse.data)
          }
        } else {
          setError('Guest not found')
        }
      } catch (err) {
        console.error('👤 Error loading guest:', err)
        setError('Failed to load guest data')
      } finally {
        setIsLoading(false)
      }
    }

    loadGuest()
  }, [params.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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

  const getLoyaltyTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'bg-purple-100 text-purple-800'
      case 'Gold': return 'bg-yellow-100 text-yellow-800'
      case 'Silver': return 'bg-gray-100 text-gray-800'
      case 'Bronze': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCountryFlag = (nationality: string) => {
    const flags: { [key: string]: string } = {
      'American': '🇺🇸',
      'Spanish': '🇪🇸',
      'Egyptian': '🇪🇬',
      'British': '🇬🇧',
      'Chinese': '🇨🇳',
      'Australian': '🇦🇺',
      'Canadian': '🇨🇦',
      'French': '🇫🇷',
      'German': '🇩🇪',
      'Italian': '🇮🇹',
      'Russian': '🇷🇺',
      'Japanese': '🇯🇵',
      'Korean': '🇰🇷',
      'Indian': '🇮🇳',
      'Brazilian': '🇧🇷'
    }
    return flags[nationality] || '🌍'
  }

  const handleEditGuest = () => {
    setIsEditModalOpen(true)
  }

  const handleGuestUpdated = (updatedGuest: any) => {
    // Update the guest state with the new data
    setGuest(prevGuest => ({
      ...prevGuest,
      ...updatedGuest,
      firstName: updatedGuest.firstName,
      lastName: updatedGuest.lastName,
      email: updatedGuest.email,
      phone: updatedGuest.phone,
      nationality: updatedGuest.nationality,
      dateOfBirth: updatedGuest.dateOfBirth,
      comments: updatedGuest.comments
    }))
    
    // Emit event to notify other components about the update
    if (guest?.id) {
      emitGuestUpdated(guest.id, updatedGuest)
      console.log('📡 Guest updated event emitted for guest:', guest.id)
    }
    
    setIsEditModalOpen(false)
  }

  // Handle adding a new comment
  const handleAddComment = async () => {
    if (!newComment.trim() || !guest) return

    const loadingToast = showToast.loading('Adding comment...')

    try {
      const updatedComments = guest.comments 
        ? `${guest.comments}\n\n${new Date().toLocaleDateString()} - ${newComment}`
        : `${new Date().toLocaleDateString()} - ${newComment}`

      const response = await userServiceAdapter.updateUser(guest.id, {
        comments: updatedComments
      })

      if (response.success) {
        setGuest(prev => prev ? { ...prev, comments: updatedComments } : null)
        setNewComment('')
        setIsAddingComment(false)
        showToast.dismiss(loadingToast)
        showToast.success('Comment added successfully!')
        console.log('✅ Comment added successfully')
      } else {
        showToast.dismiss(loadingToast)
        showToast.error('Failed to add comment')
        console.error('❌ Failed to add comment:', response.error)
      }
    } catch (error) {
      showToast.dismiss(loadingToast)
      showToast.error('Error adding comment')
      console.error('❌ Error adding comment:', error)
    }
  }

  // Handle editing comments
  const handleEditComments = async (updatedComments: string) => {
    if (!guest) return

    const loadingToast = showToast.loading('Updating comments...')

    try {
      const response = await userServiceAdapter.updateUser(guest.id, {
        comments: updatedComments
      })

      if (response.success) {
        setGuest(prev => prev ? { ...prev, comments: updatedComments } : null)
        showToast.dismiss(loadingToast)
        showToast.success('Comment deleted successfully!')
        console.log('✅ Comments updated successfully')
      } else {
        showToast.dismiss(loadingToast)
        showToast.error('Failed to delete comment')
        console.error('❌ Failed to update comments:', response.error)
      }
    } catch (error) {
      showToast.dismiss(loadingToast)
      showToast.error('Error deleting comment')
      console.error('❌ Error updating comments:', error)
    }
  }

  // Handle document upload
  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !guest) return

    setIsUploadingDocument(true)
    const loadingToast = showToast.loading('Uploading document...')

    try {
      const response = await guestDocumentService.uploadDocument(
        guest.id,
        file,
        'OTHER',
        file.name
      )

      if (response.success) {
        // Reload documents
        const documentsResponse = await guestDocumentService.getGuestDocuments(guest.id)
        if (documentsResponse.success) {
          setDocuments(documentsResponse.data)
        }
        
        showToast.dismiss(loadingToast)
        showToast.success('Document uploaded successfully!')
        console.log('✅ Document uploaded successfully')
      } else {
        showToast.dismiss(loadingToast)
        showToast.error(response.error || 'Failed to upload document')
        console.error('❌ Failed to upload document:', response.error)
      }
    } catch (error) {
      showToast.dismiss(loadingToast)
      showToast.error('Error uploading document')
      console.error('❌ Error uploading document:', error)
    } finally {
      setIsUploadingDocument(false)
      // Reset file input
      event.target.value = ''
    }
  }

  // Handle document download
  const handleDocumentDownload = async (document: GuestDocument) => {
    if (!guest) return

    try {
      const response = await guestDocumentService.getDownloadUrl(guest.id, document.id)
      
      if (response.success && response.data) {
        // Open download URL in new tab
        window.open(response.data.url, '_blank')
        console.log('✅ Document download initiated')
      } else {
        showToast.error('Failed to get download URL')
        console.error('❌ Failed to get download URL:', response.error)
      }
    } catch (error) {
      showToast.error('Error downloading document')
      console.error('❌ Error downloading document:', error)
    }
  }

  // Handle document deletion
  const handleDocumentDelete = async (document: GuestDocument) => {
    if (!guest) return

    const loadingToast = showToast.loading('Deleting document...')

    try {
      const response = await guestDocumentService.deleteDocument(guest.id, document.id)
      
      if (response.success) {
        // Remove document from state
        setDocuments(prev => prev.filter(doc => doc.id !== document.id))
        showToast.dismiss(loadingToast)
        showToast.success('Document deleted successfully!')
        console.log('✅ Document deleted successfully')
      } else {
        showToast.dismiss(loadingToast)
        showToast.error(response.error || 'Failed to delete document')
        console.error('❌ Failed to delete document:', response.error)
      }
    } catch (error) {
      showToast.dismiss(loadingToast)
      showToast.error('Error deleting document')
      console.error('❌ Error deleting document:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-slate-50 overflow-hidden flex flex-col">
        <TopNavigation />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading guest details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !guest) {
    return (
      <div className="h-screen bg-slate-50 overflow-hidden flex flex-col">
        <TopNavigation />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading guest</p>
            <p className="text-slate-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
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
                <h1 className="text-xl font-medium text-slate-900 flex items-center space-x-2">
                  <span>{guest.firstName} {guest.lastName}</span>
                  {guest.starGuest && <Star size={20} className="text-yellow-500" />}
                  {guest.primaryGuest && <Crown size={20} className="text-orange-500" />}
                </h1>
                <p className="text-sm text-slate-600 flex items-center space-x-2">
                  <span>{getCountryFlag(guest.nationality)}</span>
                  <span>{guest.nationality}</span>
                  <span>•</span>
                  <span>{getAge(guest.dateOfBirth)} years old</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getLoyaltyTierColor(guest.loyaltyTier || 'Bronze')}`}>
                {guest.loyaltyTier || 'Bronze'}
              </span>
              <button 
                onClick={handleEditGuest}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center space-x-2"
              >
                <Edit size={16} />
                <span>Edit Guest</span>
              </button>
            </div>
          </div>
        </div>


        {/* Main Content */}
        <div className="flex-1 flex gap-4 px-4 py-3 min-h-0 overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 h-full p-4">
              {/* Guest Details */}
              <h2 className="text-lg font-medium text-slate-900 mb-4">Guest Details</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Email:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-900">{guest.email}</span>
                    <button className="p-1 text-orange-600 hover:bg-orange-100 rounded cursor-pointer">
                      <Mail size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Phone:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-900">{guest.phone}</span>
                    <button className="p-1 text-orange-600 hover:bg-orange-100 rounded cursor-pointer">
                      <Phone size={14} />
                    </button>
                  </div>
                </div>
                {guest.whatsapp && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">WhatsApp:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-900">{guest.whatsapp}</span>
                      <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
                {guest.telegram && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Telegram:</span>
                    <span className="text-sm text-slate-900">{guest.telegram}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Birth Date:</span>
                  <span className="text-sm text-slate-900">{formatDate(guest.dateOfBirth)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Age:</span>
                  <span className="text-sm text-slate-900">{getAge(guest.dateOfBirth)} years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Preferred Language:</span>
                  <span className="text-sm text-slate-900">{guest.preferredLanguage || 'English'}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-gray-200 h-full overflow-y-auto custom-scrollbar p-4">
              {/* Comments */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-slate-900">Comments</h2>
                  <button
                    onClick={() => setIsAddingComment(true)}
                    className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center space-x-2"
                  >
                    <Plus size={14} />
                    <span>Add Comment</span>
                  </button>
                </div>
                
                {/* Add Comment Form */}
                {isAddingComment && (
                  <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a new comment..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                    <div className="flex justify-end space-x-2 mt-3">
                      <button
                        onClick={() => {
                          setIsAddingComment(false)
                          setNewComment('')
                        }}
                        className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="px-3 py-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium cursor-pointer"
                      >
                        Add Comment
                      </button>
                    </div>
                  </div>
                )}

                {/* Comments Display */}
                <div className="bg-slate-50 rounded-lg p-4">
                  {guest.comments ? (
                    <div className="space-y-3">
                      {guest.comments.split('\n\n').map((comment, index) => (
                        <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                          <div className="flex items-start justify-between">
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment}</p>
                            <button
                              onClick={() => {
                                const updatedComments = guest.comments
                                  ?.split('\n\n')
                                  .filter((_, i) => i !== index)
                                  .join('\n\n') || ''
                                handleEditComments(updatedComments)
                              }}
                              className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                              title="Delete comment"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600">No comments available</p>
                  )}
                </div>
              </div>

              {/* Special Requests */}
              {guest.specialRequests && (
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-slate-900 mb-4">Special Requests</h2>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600">{guest.specialRequests}</p>
                  </div>
                </div>
              )}


              {/* Documents */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-slate-900">Documents</h2>
                  <div className="relative">
                    <input
                      type="file"
                      id="document-upload"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp"
                      onChange={handleDocumentUpload}
                      disabled={isUploadingDocument}
                    />
                    <label
                      htmlFor="document-upload"
                      className={`px-3 py-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center space-x-2 ${isUploadingDocument ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Upload size={14} />
                      <span>{isUploadingDocument ? 'Uploading...' : 'Upload Document'}</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-3">
                  {documents && documents.length > 0 ? (
                    documents.map((doc) => (
                      <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText size={16} className="text-gray-400" />
                            <div>
                              <h3 className="font-medium text-slate-900">{doc.title}</h3>
                              <div className="flex items-center space-x-3 text-sm text-gray-500">
                                <span>{doc.type}</span>
                                <span>{doc.fileSize}</span>
                                <span>{formatDate(doc.uploadDate)}</span>
                                <span>by {doc.uploadedBy}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleDocumentDownload(doc)}
                              className="p-1 text-orange-600 hover:bg-orange-100 rounded cursor-pointer"
                              title="Download document"
                            >
                              <Download size={14} />
                            </button>
                            <button
                              onClick={() => handleDocumentDelete(doc)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded cursor-pointer"
                              title="Delete document"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText size={48} className="mx-auto mb-2 opacity-50" />
                      <p>No documents uploaded yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Reservations */}
              <div className="mb-6">
                <h2 className="text-lg font-medium text-slate-900 mb-4">Recent Reservations</h2>
                <div className="space-y-3">
                  {guest.guestReservations && guest.guestReservations.length > 0 ? (
                    guest.guestReservations.map((reservation, index) => (
                      <div key={reservation.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <Building size={16} className="text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-900">
                              {reservation.properties?.name || reservation.properties?.nickname || 'Property'}
                            </h3>
                            <p className="text-sm text-slate-600">
                              {formatDate(reservation.check_in)} - {formatDate(reservation.check_out)}
                            </p>
                            <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                              <span>Status: {reservation.status}</span>
                              <span>Guests: {reservation.guests}</span>
                              <span>{formatDate(reservation.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Building size={48} className="mx-auto mb-2 opacity-50" />
                      <p>No reservations found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Log */}
              <div className="mb-6">
                <h2 className="text-lg font-medium text-slate-900 mb-4">Activity Log</h2>
                <div className="space-y-3">
                  {guest.auditLogs && guest.auditLogs.length > 0 ? (
                    guest.auditLogs.map((activity, index) => (
                      <div key={activity.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            {activity.type === 'document' ? (
                              <FileText size={16} className="text-orange-600" />
                            ) : activity.type === 'payment' ? (
                              <DollarSign size={16} className="text-orange-600" />
                            ) : activity.type === 'unit' ? (
                              <Building size={16} className="text-orange-600" />
                            ) : (
                              <User size={16} className="text-orange-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-900">{activity.action}</h3>
                            <p className="text-sm text-slate-600">{activity.description}</p>
                            <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                              <span>by {activity.performed_by || 'System'}</span>
                              <span>{formatDate(activity.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <User size={48} className="mx-auto mb-2 opacity-50" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Guest Modal */}
      <AddGuestModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        guest={guest}
        onGuestUpdated={handleGuestUpdated}
      />
    </div>
  )
}