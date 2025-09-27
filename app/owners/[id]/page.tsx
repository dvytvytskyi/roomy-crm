'use client'

import { useState } from 'react'
import { 
  User, Mail, Phone, Calendar, MapPin, Building, DollarSign, MessageSquare, 
  Edit, Trash2, Plus, Eye, Star, Crown, Download, Upload, FileText, 
  ArrowLeft, Settings, CreditCard, TrendingUp, Clock, AlertCircle, XCircle
} from 'lucide-react'
import TopNavigation from '@/components/TopNavigation'
import CashPaymentModal from '@/components/owners/CashPaymentModal'
import BankPaymentModal from '@/components/owners/BankPaymentModal'
import AddBankAccountModal from '@/components/owners/AddBankAccountModal'

interface OwnerDetailsPageProps {
  params: {
    id: string
  }
}

export default function OwnerDetailsPage({ params }: OwnerDetailsPageProps) {
  // Mock data for the specific owner
  const mockOwner = {
    id: parseInt(params.id),
    name: 'Ahmed Al-Rashid',
    nationality: 'Emirati',
    dateOfBirth: '1975-03-15',
    email: 'ahmed.alrashid@example.com',
    phone: '+971 50 123 4567',
    whatsapp: '+971 50 123 4567',
    telegram: '@ahmedrashid',
    reservationCount: 45,
    units: [
      {
        id: 1,
        name: 'Burj Khalifa Studio',
        nickname: 'BK Studio',
        location: 'Downtown Dubai',
        profitFormula: '70% Owner / 30% Company',
        totalProfit: 12500,
        photo: '/api/placeholder/150/100'
      },
      {
        id: 2,
        name: 'Marina View',
        nickname: 'Marina Apt',
        location: 'Marina District',
        profitFormula: '65% Owner / 35% Company',
        totalProfit: 18750,
        photo: '/api/placeholder/150/100'
      },
      {
        id: 3,
        name: 'Downtown Loft',
        nickname: 'DT Loft',
        location: 'Business Bay',
        profitFormula: '75% Owner / 25% Company',
        totalProfit: 9800,
        photo: '/api/placeholder/150/100'
      }
    ],
    comments: 'VIP owner, prefers bank transfer payments',
    status: 'Active',
    vipStatus: true,
    paymentPreferences: 'Bank Transfer',
    personalStayDays: 30,
    totalUnits: 3,
    totalProfit: 41050,
    lifetimeValue: 287500,
    documents: [
      {
        id: 1,
        name: 'Property Ownership Agreement.pdf',
        type: 'Contract',
        uploadedAt: '2024-01-15T10:30:00Z',
        size: '2.3 MB'
      },
      {
        id: 2,
        name: 'ID Copy.pdf',
        type: 'ID',
        uploadedAt: '2024-01-15T10:35:00Z',
        size: '1.1 MB'
      }
    ],
    createdBy: 'Admin',
    createdAt: '2024-01-15T10:30:00Z',
    lastModifiedBy: 'Manager',
    lastModifiedAt: '2024-07-20T14:20:00Z'
  }

  // Mock activity log
  const mockActivityLog = [
    {
      id: 1,
      action: 'Unit Added',
      description: 'Added "Downtown Loft" to owner portfolio',
      user: 'Manager',
      timestamp: '2024-07-20T14:20:00Z',
      type: 'unit'
    },
    {
      id: 2,
      action: 'Payment Method Updated',
      description: 'Changed payment preference to Bank Transfer',
      user: 'Admin',
      timestamp: '2024-06-15T11:45:00Z',
      type: 'payment'
    },
    {
      id: 3,
      action: 'Status Changed',
      description: 'Updated status to VIP',
      user: 'Admin',
      timestamp: '2024-05-10T09:30:00Z',
      type: 'status'
    },
    {
      id: 4,
      action: 'Profile Created',
      description: 'Owner profile created',
      user: 'Admin',
      timestamp: '2024-01-15T10:30:00Z',
      type: 'create'
    }
  ]

  // State declarations
  const [isCashPaymentModalOpen, setIsCashPaymentModalOpen] = useState(false)
  const [isBankPaymentModalOpen, setIsBankPaymentModalOpen] = useState(false)
  const [isAddBankAccountModalOpen, setIsAddBankAccountModalOpen] = useState(false)
  const [editModal, setEditModal] = useState<{
    isOpen: boolean
    field: string
    currentValue: string
    title: string
    inputType: string
  }>({
    isOpen: false,
    field: '',
    currentValue: '',
    title: '',
    inputType: 'text'
  })

  // Bank details state
  const [bankDetails, setBankDetails] = useState([
    {
      id: 1,
      bankName: 'Emirates NBD',
      accountHolderName: 'Ahmed Al-Rashid',
      accountNumber: '1012345678901',
      iban: 'AE070331234567890123456',
      swiftCode: 'EBILAEAD',
      bankAddress: 'Sheikh Zayed Road, Dubai, UAE',
      isPrimary: true,
      addedDate: '2024-01-15T10:30:00Z',
      addedBy: 'Admin',
      addedByEmail: 'admin@company.com'
    },
    {
      id: 2,
      bankName: 'ADCB',
      accountHolderName: 'Ahmed Al-Rashid',
      accountNumber: '2012345678902',
      iban: 'AE070331234567890123457',
      swiftCode: 'ADCBAEAA',
      bankAddress: 'Corniche Road, Abu Dhabi, UAE',
      isPrimary: false,
      addedDate: '2024-02-20T14:15:00Z',
      addedBy: 'Manager',
      addedByEmail: 'manager@company.com'
    }
  ])

  // Transaction history state
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      type: 'payment',
      amount: 2500.00,
      currency: 'AED',
      description: 'Monthly rental income - Burj Khalifa Studio',
      bankDetailId: 1,
      status: 'completed',
      date: '2024-01-15T10:30:00Z',
      processedBy: 'Admin',
      processedByEmail: 'admin@company.com',
      reference: 'PAY-2024-001'
    },
    {
      id: 2,
      type: 'payment',
      amount: 1800.00,
      currency: 'AED',
      description: 'Monthly rental income - Downtown Studio',
      bankDetailId: 1,
      status: 'completed',
      date: '2024-01-15T10:30:00Z',
      processedBy: 'Admin',
      processedByEmail: 'admin@company.com',
      reference: 'PAY-2024-002'
    },
    {
      id: 3,
      type: 'payment',
      amount: 3200.00,
      currency: 'AED',
      description: 'Monthly rental income - Marina View',
      bankDetailId: 2,
      status: 'pending',
      date: '2024-02-15T09:15:00Z',
      processedBy: 'Manager',
      processedByEmail: 'manager@company.com',
      reference: 'PAY-2024-003'
    },
    {
      id: 4,
      type: 'refund',
      amount: -500.00,
      currency: 'AED',
      description: 'Security deposit refund - Burj Khalifa Studio',
      bankDetailId: 1,
      status: 'completed',
      date: '2024-02-10T14:20:00Z',
      processedBy: 'Admin',
      processedByEmail: 'admin@company.com',
      reference: 'REF-2024-001'
    },
    {
      id: 5,
      type: 'cash_payment',
      amount: 1500.00,
      currency: 'AED',
      description: 'Cash payment - Monthly bonus',
      bankDetailId: null,
      status: 'completed',
      date: '2024-02-25T16:45:00Z',
      processedBy: 'Manager',
      processedByEmail: 'manager@company.com',
      reference: 'CASH-2024-001',
      title: 'Monthly Performance Bonus',
      responsible: 'Sarah Johnson'
    },
    {
      id: 6,
      type: 'cash_payment',
      amount: 800.00,
      currency: 'AED',
      description: 'Cash payment - Maintenance refund',
      bankDetailId: null,
      status: 'completed',
      date: '2024-03-01T11:30:00Z',
      processedBy: 'Admin',
      processedByEmail: 'admin@company.com',
      reference: 'CASH-2024-002',
      title: 'Maintenance Cost Refund',
      responsible: 'Mike Chen'
    }
  ])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      'United Arab Emirates': '🇦🇪',
      'UAE': '🇦🇪',
      'Emirati': '🇦🇪',
      'Saudi Arabia': '🇸🇦',
      'Kuwait': '🇰🇼',
      'Qatar': '🇶🇦',
      'Bahrain': '🇧🇭',
      'Oman': '🇴🇲',
      'Egypt': '🇪🇬',
      'Jordan': '🇯🇴',
      'Lebanon': '🇱🇧',
      'Syria': '🇸🇾',
      'Iraq': '🇮🇶',
      'Iran': '🇮🇷',
      'Turkey': '🇹🇷',
      'India': '🇮🇳',
      'Pakistan': '🇵🇰',
      'Bangladesh': '🇧🇩',
      'Sri Lanka': '🇱🇰',
      'Philippines': '🇵🇭',
      'Indonesia': '🇮🇩',
      'Malaysia': '🇲🇾',
      'Thailand': '🇹🇭',
      'Vietnam': '🇻🇳',
      'China': '🇨🇳',
      'Japan': '🇯🇵',
      'South Korea': '🇰🇷',
      'United States': '🇺🇸',
      'USA': '🇺🇸',
      'United Kingdom': '🇬🇧',
      'UK': '🇬🇧',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'Italy': '🇮🇹',
      'Spain': '🇪🇸',
      'Netherlands': '🇳🇱',
      'Canada': '🇨🇦',
      'Australia': '🇦🇺',
      'Russia': '🇷🇺',
      'Brazil': '🇧🇷',
      'Argentina': '🇦🇷',
      'Mexico': '🇲🇽',
      'South Africa': '🇿🇦',
      'Nigeria': '🇳🇬',
      'Kenya': '🇰🇪',
      'Morocco': '🇲🇦',
      'Algeria': '🇩🇿',
      'Tunisia': '🇹🇳'
    }
    return flags[country] || '🏳️'
  }

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'VIP': return 'bg-purple-100 text-purple-800'
      case 'Inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleEditField = (field: string, currentValue: string, title: string, inputType: string = 'text') => {
    setEditModal({
      isOpen: true,
      field,
      currentValue,
      title,
      inputType
    })
  }

  const handleSaveEdit = (newValue: string) => {
    // In real app, this would update the backend
    console.log(`Updating ${editModal.field} to:`, newValue)
    setEditModal({ isOpen: false, field: '', currentValue: '', title: '', inputType: 'text' })
  }

  const handleCloseEdit = () => {
    setEditModal({ isOpen: false, field: '', currentValue: '', title: '', inputType: 'text' })
  }

  const handleRemoveBankDetail = (bankDetailId: number) => {
    if (confirm('Are you sure you want to delete this bank detail?')) {
      setBankDetails(prev => prev.filter(detail => detail.id !== bankDetailId))
    }
  }

  const handleSetPrimaryBank = (bankDetailId: number) => {
    setBankDetails(prev => prev.map(detail => ({
      ...detail,
      isPrimary: detail.id === bankDetailId
    })))
  }

  const handleMakePayment = () => {
    setIsBankPaymentModalOpen(true)
  }

  const handleCashPayment = () => {
    setIsCashPaymentModalOpen(true)
  }

  const handleAddBankAccount = () => {
    setIsAddBankAccountModalOpen(true)
  }

  const handleSaveCashPayment = (paymentData: {
    amount: number
    date: string
    title: string
    responsible: string
    description: string
  }) => {
    // Create new transaction
    const newTransaction = {
      id: transactions.length + 1,
      type: 'cash_payment' as const,
      amount: paymentData.amount,
      currency: 'AED',
      description: paymentData.description || `Cash payment - ${paymentData.title}`,
      bankDetailId: null,
      status: 'completed' as const,
      date: new Date(paymentData.date).toISOString(),
      processedBy: 'Current User', // In real app, this would be the logged-in user
      processedByEmail: 'user@company.com',
      reference: `CASH-2024-${String(transactions.length + 1).padStart(3, '0')}`,
      title: paymentData.title,
      responsible: paymentData.responsible
    }

    setTransactions(prev => [newTransaction, ...prev])
  }

  const handleSaveBankPayment = (paymentData: {
    amount: number
    date: string
    description: string
    bankAccountId: number
  }) => {
    // Create new transaction
    const newTransaction = {
      id: transactions.length + 1,
      type: 'payment' as const,
      amount: paymentData.amount,
      currency: 'AED',
      description: paymentData.description,
      bankDetailId: paymentData.bankAccountId,
      status: 'completed' as const,
      date: new Date(paymentData.date).toISOString(),
      processedBy: 'Current User', // In real app, this would be the logged-in user
      processedByEmail: 'user@company.com',
      reference: `PAY-2024-${String(transactions.length + 1).padStart(3, '0')}`
    }

    setTransactions(prev => [newTransaction, ...prev])
  }

  const handleSaveBankAccount = (bankData: {
    bankName: string
    accountHolderName: string
    accountNumber: string
    iban: string
    swiftCode: string
    bankAddress: string
  }) => {
    // Create new bank account
    const newBankAccount = {
      id: bankDetails.length + 1,
      bankName: bankData.bankName,
      accountHolderName: bankData.accountHolderName,
      accountNumber: bankData.accountNumber,
      iban: bankData.iban,
      swiftCode: bankData.swiftCode,
      bankAddress: bankData.bankAddress,
      isPrimary: bankDetails.length === 0, // First account is primary
      addedDate: new Date().toISOString(),
      addedBy: 'Current User', // In real app, this would be the logged-in user
      addedByEmail: 'user@company.com'
    }

    setBankDetails(prev => [...prev, newBankAccount])
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
                <h1 className="text-xl font-medium text-slate-900">{mockOwner.name}</h1>
                <p className="text-sm text-slate-600">{mockOwner.nationality} • {getAge(mockOwner.dateOfBirth)} years old</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(mockOwner.status)}`}>
                {mockOwner.vipStatus && <Star size={16} className="mr-2 text-yellow-500" />}
                {mockOwner.status === 'VIP' && <Crown size={16} className="mr-2 text-purple-500" />}
                <span>{mockOwner.status}</span>
              </span>
              <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center">
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
                  <Building className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-1">Total Units</p>
                  <p className="text-2xl font-medium text-slate-900">{mockOwner.totalUnits}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-1">Total Profit</p>
                  <p className="text-2xl font-medium text-slate-900">${mockOwner.totalProfit.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <User className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-1">Nationality</p>
                  <p className="text-2xl font-medium text-slate-900 flex items-center space-x-2">
                    <span>{getCountryFlag(mockOwner.nationality)}</span>
                    <span>{mockOwner.nationality}</span>
                  </p>
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
              {/* Owner Details */}
              <h2 className="text-lg font-medium text-slate-900 mb-4">Owner Details</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Email:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-900">{mockOwner.email}</span>
                      <button 
                        onClick={() => handleEditField('email', mockOwner.email, 'Email', 'email')}
                        className="p-1 text-orange-600 hover:bg-orange-100 rounded cursor-pointer"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Phone:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-900">{mockOwner.phone}</span>
                      <button 
                        onClick={() => handleEditField('phone', mockOwner.phone, 'Phone', 'tel')}
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
                        <span>{getCountryFlag(mockOwner.nationality)}</span>
                        <span>{mockOwner.nationality}</span>
                      </span>
                      <button 
                        onClick={() => handleEditField('nationality', mockOwner.nationality, 'Nationality', 'text')}
                        className="p-1 text-orange-600 hover:bg-orange-100 rounded cursor-pointer"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Birth Date:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-900">{formatDate(mockOwner.dateOfBirth)}</span>
                      <button 
                        onClick={() => handleEditField('dateOfBirth', mockOwner.dateOfBirth, 'Birth Date', 'date')}
                        className="p-1 text-orange-600 hover:bg-orange-100 rounded cursor-pointer"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Age:</span>
                    <span className="text-sm text-slate-900">{getAge(mockOwner.dateOfBirth)} years</span>
                  </div>
                </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-gray-200 h-full overflow-y-auto custom-scrollbar p-4">
              {/* Description */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-slate-900">Description</h2>
                  <button 
                    onClick={() => handleEditField('comments', mockOwner.comments, 'Description', 'textarea')}
                    className="p-1 text-orange-600 hover:bg-orange-100 rounded cursor-pointer"
                  >
                    <Edit size={16} />
                  </button>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600">{mockOwner.comments || 'No description available for this owner.'}</p>
                </div>
              </div>

              {/* Units */}
              <div className="mb-6">
                <h2 className="text-lg font-medium text-slate-900 mb-4">Linked Units</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockOwner.units.map(unit => (
                    <div key={unit.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-slate-900">{unit.name}</h3>
                          <p className="text-sm text-slate-600">{unit.nickname}</p>
                          <p className="text-xs text-gray-500">{unit.location}</p>
                        </div>
                        <button className="p-1 text-orange-600 hover:bg-orange-100 rounded cursor-pointer">
                          <Edit size={14} />
                        </button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Profit Formula:</span>
                          <span className="text-slate-900">{unit.profitFormula}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Total Profit:</span>
                          <span className="font-medium text-green-600">${unit.totalProfit.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bank Details */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-slate-900">Bank Details</h2>
                  <button 
                    onClick={handleAddBankAccount}
                    className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium cursor-pointer"
                  >
                    Add Bank Account
                  </button>
                </div>
                <div className="space-y-3">
                  {bankDetails.map((bankDetail) => (
                    <div key={bankDetail.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-slate-900">{bankDetail.bankName}</h3>
                            {bankDetail.isPrimary && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                                Primary
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-slate-600">Account Holder:</span>
                              <span className="ml-2 text-slate-900">{bankDetail.accountHolderName}</span>
                            </div>
                            <div>
                              <span className="text-slate-600">Account Number:</span>
                              <span className="ml-2 text-slate-900 font-mono">{bankDetail.accountNumber}</span>
                            </div>
                            <div>
                              <span className="text-slate-600">IBAN:</span>
                              <span className="ml-2 text-slate-900 font-mono">{bankDetail.iban}</span>
                            </div>
                            <div>
                              <span className="text-slate-600">SWIFT:</span>
                              <span className="ml-2 text-slate-900 font-mono">{bankDetail.swiftCode}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {!bankDetail.isPrimary && (
                            <button
                              onClick={() => handleSetPrimaryBank(bankDetail.id)}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 cursor-pointer"
                            >
                              Set Primary
                            </button>
                          )}
                          <button className="p-1 text-slate-600 hover:bg-gray-100 rounded cursor-pointer">
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleRemoveBankDetail(bankDetail.id)}
                            className="p-1 text-slate-600 hover:bg-gray-100 rounded cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transaction History */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-slate-900">Transaction History</h2>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={handleCashPayment}
                      className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium cursor-pointer"
                    >
                      Cash Payment
                    </button>
                    <button 
                      onClick={handleMakePayment}
                      className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium cursor-pointer"
                    >
                      Make Payment
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {transactions.map((transaction) => {
                    const bankDetail = transaction.bankDetailId ? bankDetails.find(bd => bd.id === transaction.bankDetailId) : null
                    const isPayment = transaction.type === 'payment' || transaction.type === 'cash_payment'
                    const isCashPayment = transaction.type === 'cash_payment'
                    const amountColor = transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    const statusColor = transaction.status === 'completed' ? 'bg-gray-100 text-gray-800' : 
                                      transaction.status === 'pending' ? 'bg-gray-100 text-gray-800' : 
                                      'bg-gray-100 text-gray-800'
                    
                    return (
                      <div key={transaction.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium text-slate-900">
                                {isCashPayment && transaction.title ? transaction.title : transaction.description}
                              </h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${statusColor}`}>
                                {transaction.status}
                              </span>
                              {isCashPayment && (
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                                  Cash Payment
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-slate-600">
                              <span>Ref: {transaction.reference}</span>
                              {bankDetail && <span className="ml-3">Bank: {bankDetail.bankName}</span>}
                              {isCashPayment && transaction.responsible && (
                                <span className="ml-3">Responsible: {transaction.responsible}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-semibold ${amountColor}`}>
                              {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toLocaleString()} {transaction.currency}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(transaction.date)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Documents */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-slate-900">Documents</h2>
                  <button className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium cursor-pointer">
                    Upload Document
                  </button>
                </div>
                <div className="space-y-3">
                  {mockOwner.documents.map(document => (
                    <div key={document.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-slate-900">{document.name}</h3>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <span>{document.type}</span>
                            <span>{document.size}</span>
                            <span>{formatDateTime(document.uploadedAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button className="p-1 text-slate-600 hover:bg-gray-100 rounded cursor-pointer">
                            <Eye size={14} />
                          </button>
                          <button className="p-1 text-slate-600 hover:bg-gray-100 rounded cursor-pointer">
                            <Download size={14} />
                          </button>
                          <button className="p-1 text-slate-600 hover:bg-gray-100 rounded cursor-pointer">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Log */}
              <div>
                <h2 className="text-lg font-medium text-slate-900 mb-4">Activity Log</h2>
                <div className="space-y-3">
                  {mockActivityLog.map(activity => (
                    <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900">{activity.action}</h3>
                        <p className="text-sm text-slate-600">{activity.description}</p>
                        <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                          <span>by {activity.user}</span>
                          <span>{formatDateTime(activity.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Field Modal */}
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
                  <XCircle size={16} />
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
                    <option value="Emirati">Emirati</option>
                    <option value="British">British</option>
                    <option value="Canadian">Canadian</option>
                    <option value="American">American</option>
                    <option value="Indian">Indian</option>
                    <option value="Pakistani">Pakistani</option>
                    <option value="Filipino">Filipino</option>
                    <option value="Egyptian">Egyptian</option>
                    <option value="Other">Other</option>
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

      {/* Cash Payment Modal */}
      <CashPaymentModal
        isOpen={isCashPaymentModalOpen}
        onClose={() => setIsCashPaymentModalOpen(false)}
        onSave={handleSaveCashPayment}
      />

      {/* Bank Payment Modal */}
      <BankPaymentModal
        isOpen={isBankPaymentModalOpen}
        onClose={() => setIsBankPaymentModalOpen(false)}
        onSave={handleSaveBankPayment}
        bankAccounts={bankDetails.map(detail => ({
          id: detail.id,
          bankName: detail.bankName,
          accountNumber: detail.accountNumber,
          iban: detail.iban
        }))}
      />

      {/* Add Bank Account Modal */}
      <AddBankAccountModal
        isOpen={isAddBankAccountModalOpen}
        onClose={() => setIsAddBankAccountModalOpen(false)}
        onSave={handleSaveBankAccount}
      />
    </div>
  )
}