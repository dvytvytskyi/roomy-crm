'use client'

import { useState, useEffect } from 'react'
import { 
  User, Mail, Phone, Calendar, MapPin, Star, Crown, MessageSquare, 
  Edit, Trash2, Plus, Eye, ArrowLeft, FileText, Download, Upload,
  TrendingUp, Clock, DollarSign, Building, Users, Award
} from 'lucide-react'
import TopNavigation from '@/components/TopNavigation'
import { guestService, Guest, GuestDetailStats } from '@/lib/api/services/guestService'

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
          setGuest(response.data)
          
          // Load guest stats
          const statsResponse = await guestService.getGuestDetailStats(params.id)
          if (statsResponse.success && statsResponse.data) {
            setStats(statsResponse.data)
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
                  <span>{guest.name}</span>
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
              <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center space-x-2">
                <Edit size={16} />
                <span>Edit Guest</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-4 py-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Building className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-600 text-xs mb-1">Total Reservations</p>
                  <p className="text-2xl font-medium text-slate-900">{stats?.totalReservations || guest.reservationCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-600 text-xs mb-1">Total Nights</p>
                  <p className="text-2xl font-medium text-slate-900">{stats?.totalNights || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-600 text-xs mb-1">Lifetime Value</p>
                  <p className="text-2xl font-medium text-slate-900">AED {stats?.lifetimeValue?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-600 text-xs mb-1">Avg Booking Value</p>
                  <p className="text-2xl font-medium text-slate-900">AED {stats?.averageBookingValue?.toLocaleString() || '0'}</p>
                </div>
              </div>
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

              {/* Guest Categories */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-slate-700 mb-3">Categories</h3>
                <div className="space-y-2">
                  {guest.customCategories.map((category, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              {/* Guest Status */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-slate-700 mb-3">Status</h3>
                <div className="space-y-2">
                  {guest.starGuest && (
                    <div className="flex items-center space-x-2">
                      <Star size={16} className="text-yellow-500" />
                      <span className="text-sm text-slate-900">Star Guest</span>
                    </div>
                  )}
                  {guest.primaryGuest && (
                    <div className="flex items-center space-x-2">
                      <Crown size={16} className="text-orange-500" />
                      <span className="text-sm text-slate-900">Primary Guest</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Award size={16} className="text-blue-500" />
                    <span className="text-sm text-slate-900">{guest.loyaltyTier || 'Bronze'} Tier</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-gray-200 h-full overflow-y-auto custom-scrollbar p-4">
              {/* Comments */}
              <div className="mb-6">
                <h2 className="text-lg font-medium text-slate-900 mb-4">Comments</h2>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600">{guest.comments || 'No comments available'}</p>
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

              {/* Current Unit */}
              {guest.unit && (
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-slate-900 mb-4">Current Unit</h2>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Building size={16} className="text-orange-500" />
                      <span className="text-sm text-slate-900">{guest.unit}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Documents */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-slate-900">Documents</h2>
                  <button className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center space-x-2">
                    <Upload size={14} />
                    <span>Upload Document</span>
                  </button>
                </div>
                <div className="space-y-3">
                  {guest.documents && guest.documents.length > 0 ? (
                    guest.documents.map((doc, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText size={16} className="text-gray-400" />
                            <div>
                              <h3 className="font-medium text-slate-900">{doc.name}</h3>
                              <div className="flex items-center space-x-3 text-sm text-gray-500">
                                <span>{doc.type}</span>
                                <span>{doc.size}</span>
                                <span>{formatDate(doc.uploadedAt)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button className="p-1 text-slate-600 hover:bg-gray-100 rounded cursor-pointer" title="View document">
                              <Eye size={14} />
                            </button>
                            <button className="p-1 text-slate-600 hover:bg-gray-100 rounded cursor-pointer" title="Download document">
                              <Download size={14} />
                            </button>
                            <button className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer" title="Delete document">
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

              {/* Guest Activity */}
              <div>
                <h2 className="text-lg font-medium text-slate-900 mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Building size={16} className="text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900">Reservation Created</h3>
                        <p className="text-sm text-slate-600">New reservation for {guest.unit || 'property'}</p>
                        <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                          <span>by Admin</span>
                          <span>{formatDate(guest.lastModifiedAt || guest.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User size={16} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900">Profile Created</h3>
                        <p className="text-sm text-slate-600">Guest profile was created</p>
                        <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                          <span>by {guest.createdBy}</span>
                          <span>{formatDate(guest.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}