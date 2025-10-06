'use client'

import { useState, useEffect } from 'react'
import { 
  User, Mail, Phone, Calendar, MapPin, Building, DollarSign, MessageSquare, 
  Edit, Trash2, Plus, Eye, Star, Crown, Download, Upload, FileText, 
  ArrowLeft, Settings, CreditCard, TrendingUp, Clock, AlertCircle, XCircle, X
} from 'lucide-react'
import TopNavigation from '@/components/TopNavigation'
import CashPaymentModal from '@/components/owners/CashPaymentModal'
import BankPaymentModal from '@/components/owners/BankPaymentModal'
import UploadDocumentModal from '@/components/owners/UploadDocumentModal'
import { userServiceAdapter } from '@/lib/api/adapters/apiAdapter'

interface OwnerDetailsPageProps {
  params: {
    id: string
  }
}

// Extended owner type that includes all fields from both API and mock data
interface ExtendedOwner {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  name?: string
  nationality?: string
  dateOfBirth?: string
  whatsapp?: string
  telegram?: string
  reservationCount?: number
  properties?: string[]
  totalUnits?: number
  comments?: string
  units?: Array<{
    id: number
    name: string
    nickname: string
    location: string
    profitFormula: string
    totalProfit: number
    photo: string
  }>
  bankDetails?: Array<{
    id: number
    bankName: string
    accountHolderName: string
    accountNumber: string
    iban: string
    swiftCode: string
    bankAddress: string
    isPrimary: boolean
    addedDate: string
    addedBy: string
    addedByEmail: string
  }>
  transactions?: Array<{
    id: number
    type: 'payment' | 'cash_payment' | 'refund'
    amount: number
    currency: string
    description: string
    bankDetailId: number | null
    status: 'completed' | 'pending' | 'failed'
    date: string
    processedBy: string
    processedByEmail: string
    reference: string
    title?: string
    responsible?: string
  }>
  status?: string
  vipStatus?: boolean
  paymentPreferences?: string
  personalStayDays?: number
  totalProfit?: number
  lifetimeValue?: number
  documents?: Array<{
    id: number
    name: string
    type: string
    uploadedAt: string
    size: string
    s3Key?: string
    s3Url?: string
    filename?: string
  }>
  activityLog?: Array<{
    id: number
    action: string
    description: string
    user: string
    timestamp: string
    type: 'create' | 'update' | 'delete' | 'payment' | 'document' | 'unit'
  }>
  createdBy?: string
  lastModifiedBy?: string
  lastModifiedAt?: string
}

// Function to get country flag emoji
const getCountryFlag = (nationality: string) => {
  const flagMap: { [key: string]: string } = {
    'Emirati': '🇦🇪',
    'British': '🇬🇧',
    'Canadian': '🇨🇦',
    'French': '🇫🇷',
    'German': '🇩🇪',
    'Italian': '🇮🇹',
    'Spanish': '🇪🇸',
    'Chinese': '🇨🇳',
    'Japanese': '🇯🇵',
    'Korean': '🇰🇷',
    'Indian': '🇮🇳',
    'Australian': '🇦🇺',
    'Brazilian': '🇧🇷',
    'Egyptian': '🇪🇬',
    'Saudi Arabian': '🇸🇦',
    'Turkish': '🇹🇷',
    'Greek': '🇬🇷',
    'Russian': '🇷🇺',
    'American': '🇺🇸',
    'Other': '🌍'
  }
  return flagMap[nationality] || '🌍'
}

export default function OwnerDetailsPage({ params }: OwnerDetailsPageProps) {
  // State for owner data
  const [owner, setOwner] = useState<Owner | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // State for document upload modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  
  // State for activity log
  const [activityLog, setActivityLog] = useState<Array<{
    id: number
    action: string
    description: string
    user: string
    timestamp: string
    type: 'create' | 'update' | 'delete' | 'payment' | 'document' | 'unit'
  }>>([])
  
  // State for documents
  const [documents, setDocuments] = useState<Array<{
    id: number
    name: string
    type: string
    uploadedAt: string
    size: string
    s3Key?: string
    s3Url?: string
    filename?: string
  }>>([])

  // Owner data will be loaded from API

  // Activity log will be loaded from API

  // Properties state - will be loaded from API
  const [properties, setProperties] = useState([])
  const [availableProperties, setAvailableProperties] = useState([])
  const [showLinkPropertyModal, setShowLinkPropertyModal] = useState(false)

  // Load owner data
  useEffect(() => {
    const loadOwner = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log('🏠 Loading owner details from API...')
        
        const response = await userServiceAdapter.getUserById(params.id)
        if (response.success && response.data) {
          console.log('🏠 Owner details loaded:', response.data)
          setOwner(response.data)
          
          // Load bank details if available
          if (response.data.bankDetails && Array.isArray(response.data.bankDetails)) {
            setBankDetails(response.data.bankDetails)
          }
          
          // Load transactions if available
          if (response.data.transactions && Array.isArray(response.data.transactions)) {
            setTransactions(response.data.transactions)
          }
          
          // Load activity log from API
          try {
            const activityLogResponse = await userServiceAdapter.getUserActivityLog(params.id)
            if (activityLogResponse.success && activityLogResponse.data) {
              setActivityLog(activityLogResponse.data)
            }
          } catch (error) {
            console.error('Error loading activity log:', error)
          }
          
          // Load documents from API
          try {
            const documentsResponse = await userServiceAdapter.getUserDocuments(params.id)
            if (documentsResponse.success && documentsResponse.data) {
              setDocuments(documentsResponse.data)
            }
          } catch (error) {
            console.error('Error loading documents:', error)
          }
        } else {
          setError('Owner not found')
        }

        // Load properties owned by this user
        console.log('🏠 Loading properties for owner...')
        const propertiesResponse = await userServiceAdapter.getUserProperties(params.id)
        if (propertiesResponse.success && propertiesResponse.data) {
          console.log('🏠 Properties loaded:', propertiesResponse.data)
          setProperties(propertiesResponse.data)
        }

        // Load bank accounts for this user
        console.log('🏦 Loading bank accounts for owner...')
        const bankAccountsResponse = await userServiceAdapter.getUserBankAccounts(params.id)
        if (bankAccountsResponse.success && bankAccountsResponse.data) {
          console.log('🏦 Bank accounts loaded:', bankAccountsResponse.data)
          setBankDetails(bankAccountsResponse.data)
        }

        // Load transactions for this user
        console.log('💰 Loading transactions for owner...')
        const transactionsResponse = await userServiceAdapter.getUserTransactions(params.id)
        if (transactionsResponse.success && transactionsResponse.data) {
          console.log('💰 Transactions loaded:', transactionsResponse.data)
          setTransactions(transactionsResponse.data)
        }
      } catch (err) {
        console.error('🏠 Error loading owner:', err)
        setError('Failed to load owner data')
      } finally {
        setIsLoading(false)
      }
    }

    loadOwner()
  }, [params.id])

  // Load available properties when modal opens
  useEffect(() => {
    const loadAvailableProperties = async () => {
      if (showLinkPropertyModal) {
        try {
          console.log('🏠 Loading available properties...')
          console.log('🏠 showLinkPropertyModal:', showLinkPropertyModal)
          const { propertyServiceAdapter } = await import('@/lib/api/adapters/apiAdapter')
          console.log('🏠 propertyServiceAdapter imported:', propertyServiceAdapter)
          const response = await propertyServiceAdapter.getAvailableProperties()
          console.log('🏠 API response:', response)
          if (response.success && response.data) {
            console.log('🏠 Available properties loaded:', response.data)
            console.log('🏠 Setting availableProperties to:', response.data)
            setAvailableProperties(response.data)
          } else {
            console.error('🏠 Failed to load available properties:', response.error)
            setAvailableProperties([])
          }
        } catch (error) {
          console.error('🏠 Error loading available properties:', error)
          setAvailableProperties([])
        }
      } else {
        console.log('🏠 Modal not open, not loading properties')
      }
    }
    loadAvailableProperties()
  }, [showLinkPropertyModal])


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

  // Bank details state - will be loaded from API
  const [bankDetails, setBankDetails] = useState([])

  // Transaction history state - will be loaded from API
  const [transactions, setTransactions] = useState([])

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

  const getAuthToken = () => {
    return localStorage.getItem('accessToken') || 'mock-token'
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

  const handleLinkProperty = async (propertyId: string) => {
    try {
      console.log('🔗 Linking property to owner...')
      const response = await userServiceAdapter.linkPropertyToUser(params.id, propertyId)
      if (response.success) {
        console.log('🔗 Property linked successfully')
        // Reload properties
        const propertiesResponse = await userServiceAdapter.getUserProperties(params.id)
        if (propertiesResponse.success && propertiesResponse.data) {
          setProperties(propertiesResponse.data)
        }
        setShowLinkPropertyModal(false)
      } else {
        console.error('🔗 Failed to link property:', response.error)
      }
    } catch (error) {
      console.error('🔗 Error linking property:', error)
    }
  }

  const handleUnlinkProperty = async (propertyId: string) => {
    try {
      console.log('🔗 Unlinking property from owner...')
      const response = await userServiceAdapter.unlinkPropertyFromUser(params.id, propertyId)
      if (response.success) {
        console.log('🔗 Property unlinked successfully')
        // Reload properties
        const propertiesResponse = await userServiceAdapter.getUserProperties(params.id)
        if (propertiesResponse.success && propertiesResponse.data) {
          setProperties(propertiesResponse.data)
        }
      } else {
        console.error('🔗 Failed to unlink property:', response.error)
      }
    } catch (error) {
      console.error('🔗 Error unlinking property:', error)
    }
  }

  const handleAddBankAccount = async (bankAccountData: any) => {
    try {
      console.log('🏦 Adding bank account...')
      const response = await userServiceAdapter.createUserBankAccount(params.id, bankAccountData)
      if (response.success) {
        console.log('🏦 Bank account added successfully')
        // Reload bank accounts
        const bankAccountsResponse = await userServiceAdapter.getUserBankAccounts(params.id)
        if (bankAccountsResponse.success && bankAccountsResponse.data) {
          setBankDetails(bankAccountsResponse.data)
        }
        setIsAddBankAccountModalOpen(false)
      } else {
        console.error('🏦 Failed to add bank account:', response.error)
      }
    } catch (error) {
      console.error('🏦 Error adding bank account:', error)
    }
  }

  const handleDeleteBankAccount = async (accountId: string) => {
    try {
      console.log('🏦 Deleting bank account...')
      const response = await userServiceAdapter.deleteUserBankAccount(params.id, accountId)
      if (response.success) {
        console.log('🏦 Bank account deleted successfully')
        // Reload bank accounts
        const bankAccountsResponse = await userServiceAdapter.getUserBankAccounts(params.id)
        if (bankAccountsResponse.success && bankAccountsResponse.data) {
          setBankDetails(bankAccountsResponse.data)
        }
      } else {
        console.error('🏦 Failed to delete bank account:', response.error)
      }
    } catch (error) {
      console.error('🏦 Error deleting bank account:', error)
    }
  }

  const handleCashPayment = async (paymentData: any) => {
    try {
      console.log('💰 Creating cash payment...')
      const transactionData = {
        type: 'PAYMENT',
        category: 'RENTAL_PAYMENT',
        amount: paymentData.amount,
        currency: paymentData.currency || 'AED',
        description: paymentData.description || 'Cash payment received',
        payment_method: 'CASH',
        payment_reference: `CASH_${Date.now()}`
      }
      
      const response = await userServiceAdapter.createUserTransaction(params.id, transactionData)
      if (response.success) {
        console.log('💰 Cash payment created successfully')
        // Reload transactions
        const transactionsResponse = await userServiceAdapter.getUserTransactions(params.id)
        if (transactionsResponse.success && transactionsResponse.data) {
          setTransactions(transactionsResponse.data)
        }
        setIsCashPaymentModalOpen(false)
      } else {
        console.error('💰 Failed to create cash payment:', response.error)
      }
    } catch (error) {
      console.error('💰 Error creating cash payment:', error)
    }
  }

  const handleBankPayment = async (paymentData: any) => {
    try {
      console.log('🏦 Creating bank payment...')
      const transactionData = {
        type: 'PAYMENT',
        category: 'RENTAL_PAYMENT',
        amount: paymentData.amount,
        currency: paymentData.currency || 'AED',
        description: paymentData.description || 'Bank transfer received',
        payment_method: 'BANK_TRANSFER',
        payment_reference: paymentData.reference || `BANK_${Date.now()}`,
        platform: paymentData.platform,
        platform_fee: paymentData.platform_fee || 0,
        transaction_fee: paymentData.transaction_fee || 0
      }
      
      const response = await userServiceAdapter.createUserTransaction(params.id, transactionData)
      if (response.success) {
        console.log('🏦 Bank payment created successfully')
        // Reload transactions
        const transactionsResponse = await userServiceAdapter.getUserTransactions(params.id)
        if (transactionsResponse.success && transactionsResponse.data) {
          setTransactions(transactionsResponse.data)
        }
        setIsBankPaymentModalOpen(false)
      } else {
        console.error('🏦 Failed to create bank payment:', response.error)
      }
    } catch (error) {
      console.error('🏦 Error creating bank payment:', error)
    }
  }

  const handleSaveEdit = async (newValue: string) => {
    if (!owner) return

    try {
      const updateData: any = {
        [editModal.field]: newValue
      }
      
      const response = await userServiceAdapter.updateUser(owner.id, updateData)
      if (response.success && response.data) {
        // Update the local state with the new value
        setOwner(prev => prev ? { ...prev, [editModal.field]: newValue } : null)
        console.log(`Updated ${editModal.field} to:`, newValue)
      } else {
        console.error('Failed to update owner')
        alert('Failed to update owner. Please try again.')
      }
    } catch (error) {
      console.error('Error updating owner:', error)
      alert('Failed to update owner. Please try again.')
    } finally {
    setEditModal({ isOpen: false, field: '', currentValue: '', title: '', inputType: 'text' })
    }
  }

  const handleCloseEdit = () => {
    setEditModal({ isOpen: false, field: '', currentValue: '', title: '', inputType: 'text' })
  }





  const handleSetPrimaryBank = async (accountId: string) => {
    try {
      console.log('🏦 Setting primary bank account...')
      const response = await userServiceAdapter.updateUserBankAccount(params.id, accountId, { is_primary: true })
      if (response.success) {
        console.log('🏦 Primary bank account updated successfully')
        // Reload bank accounts
        const bankAccountsResponse = await userServiceAdapter.getUserBankAccounts(params.id)
        if (bankAccountsResponse.success && bankAccountsResponse.data) {
          setBankDetails(bankAccountsResponse.data)
        }
      } else {
        console.error('🏦 Failed to update primary bank account:', response.error)
      }
    } catch (error) {
      console.error('🏦 Error updating primary bank account:', error)
    }
  }

  const handleMakePayment = () => {
    setIsBankPaymentModalOpen(true)
  }


  const handleUploadDocument = async (documentData: {
    name: string
    type: string
    file: File
  }) => {
    if (!owner) return

    try {
      // First, upload file to S3
      const formData = new FormData()
      formData.append('file', documentData.file)
      formData.append('folder', 'documents')
      formData.append('ownerId', owner.id)

      // Get the actual token from localStorage
      const token = getAuthToken()
      
      const uploadResponse = await fetch('http://localhost:3002/api/v2/files/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const uploadResult = await uploadResponse.json()

      if (!uploadResult.success) {
        throw new Error(uploadResult.message || 'Failed to upload file to S3')
      }

      // Create new document with S3 info
      const newDocument = {
        id: (documents.length || 0) + 1,
        name: documentData.name,
        type: documentData.type,
        created_at: new Date().toISOString(),
        size: `${(documentData.file.size / 1024 / 1024).toFixed(1)} MB`,
        s3_key: uploadResult.key,
        s3_url: uploadResult.url,
        filename: uploadResult.filename
      }

      // Save document to backend via API
      const apiDocumentData = {
        name: newDocument.name,
        type: newDocument.type,
        filename: newDocument.filename || documentData.file.name,
        size: newDocument.size,
        s3_key: newDocument.s3_key,
        s3_url: newDocument.s3_url,
        uploaded_by: 'Current User'
      }

      const response = await userServiceAdapter.createUserDocument(params.id, apiDocumentData)
      if (response.success) {
        console.log('Document uploaded and saved successfully')
        // Update local state with the response data
        const newDocuments = [...documents, response.data]
        setDocuments(newDocuments)
        
        // Add activity log entry
        await addActivityLogEntry('document', 'Document Uploaded', `Uploaded document: ${apiDocumentData.name} (${apiDocumentData.type})`)
      } else {
        console.error('Failed to save document metadata')
        alert('Failed to save document metadata. Please try again.')
      }
    } catch (error) {
      console.error('Error uploading document:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to upload document: ${errorMessage}`)
      // Revert local state on error
      setDocuments(documents)
      setOwner(prev => prev ? {
        ...prev,
        documents: documents
      } : null)
    }
  }

  const handleDeleteDocument = async (documentId: number) => {
    if (!owner) return
    if (!confirm('Are you sure you want to delete this document?')) return

    const documentToDelete = documents.find(doc => doc.id === documentId)
    if (!documentToDelete) return

    try {
      // Delete file from S3 if it has s3_key
      if (documentToDelete.s3_key) {
        const token = getAuthToken()
        const deleteResponse = await fetch(`http://localhost:3002/api/v2/files/${encodeURIComponent(documentToDelete.s3_key)}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const deleteResult = await deleteResponse.json()
        if (!deleteResult.success) {
          console.warn('Failed to delete file from S3:', deleteResult.message)
        }
      }

      // Delete document from backend via API
      const response = await userServiceAdapter.deleteUserDocument(params.id, documentId.toString())
      if (response.success) {
        console.log('Document deleted successfully')
        // Update local state
        const newDocuments = documents.filter(doc => doc.id !== documentId)
        setDocuments(newDocuments)
        
        // Add activity log entry
        await addActivityLogEntry('document', 'Document Deleted', `Deleted document: ${documentToDelete.name}`)
      } else {
        console.error('Failed to delete document')
        alert('Failed to delete document. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to delete document: ${errorMessage}`)
    }
  }

  // Function to add activity log entry
  const addActivityLogEntry = async (
    type: 'create' | 'update' | 'delete' | 'payment' | 'document' | 'unit',
    action: string,
    description: string
  ) => {
    if (!owner) return

    try {
      // Create activity log entry via API
      const activityData = {
      action,
      description,
        type,
        performed_by: 'Current User'
      }

      const response = await userServiceAdapter.createUserActivityLog(params.id, activityData)
      if (response.success) {
        console.log('Activity log entry created successfully')
        // Update local state with the response data
        const newActivityLog = [response.data, ...activityLog]
    setActivityLog(newActivityLog)
      } else {
        console.error('Failed to create activity log entry')
      }
    } catch (error) {
      console.error('Error creating activity log entry:', error)
    }
  }

  const handleAddUnit = async (unitData: {
    name: string
    nickname: string
    location: string
    profitFormula: string
  }) => {
    if (!owner) return

    // Create new unit
    const newUnit = {
      id: (currentOwner.units?.length || 0) + 1,
      name: unitData.name,
      nickname: unitData.nickname,
      location: unitData.location,
      profitFormula: unitData.profitFormula,
      totalProfit: 0,
      photo: '/api/placeholder/150/100'
    }

    // Update local state first
    setOwner(prev => prev ? {
      ...prev,
      units: [...(prev.units || []), newUnit],
      totalUnits: (prev.totalUnits || 0) + 1
    } : null)

    // Save to backend
    try {
      const apiOwnerData = {
        firstName: owner.firstName || '',
        lastName: owner.lastName || '',
        email: owner.email || '',
        phone: owner.phone || '',
        nationality: owner.nationality || '',
        dateOfBirth: owner.dateOfBirth || '',
        role: (owner.role || 'OWNER') as "ADMIN" | "MANAGER" | "AGENT" | "OWNER" | "GUEST" | "CLEANER" | "MAINTENANCE",
        isActive: owner.isActive,
        properties: [...(owner.properties || []), unitData.name],
        totalUnits: (owner.totalUnits || 0) + 1,
        comments: owner.comments || '',
        bankDetails: owner.bankDetails || [],
        transactions: owner.transactions || [],
        documents: owner.documents || [],
        units: [...(owner.units || []), newUnit]
      }

      const response = await userServiceAdapter.updateUser(owner.id, apiOwnerData)
      if (response.success) {
        console.log('Unit added successfully')
      } else {
        console.error('Failed to add unit')
        alert('Failed to add unit. Please try again.')
        // Revert local state on error
        setOwner(prev => prev ? {
          ...prev,
          units: prev.units?.filter(unit => unit.id !== newUnit.id) || [],
          totalUnits: prev.totalUnits || 0
        } : null)
      }
    } catch (error) {
      console.error('Error adding unit:', error)
      alert('Failed to add unit. Please try again.')
      // Revert local state on error
      setOwner(prev => prev ? {
        ...prev,
        units: prev.units?.filter(unit => unit.id !== newUnit.id) || [],
        totalUnits: prev.totalUnits || 0
      } : null)
    }
  }

  const handleRemoveUnit = async (unitId: number) => {
    if (!owner) return
    if (!confirm('Are you sure you want to remove this unit?')) return

    const unitToRemove = owner.units?.find(unit => unit.id === unitId)
    if (!unitToRemove) return

    const newUnits = (owner.units || []).filter(unit => unit.id !== unitId)
    const newProperties = (owner.properties || []).filter(prop => prop !== unitToRemove.name)

    // Update local state first
    setOwner(prev => prev ? {
      ...prev,
      units: newUnits,
      totalUnits: (prev.totalUnits || 0) - 1
    } : null)

    // Save to backend
    try {
      const apiOwnerData = {
        firstName: owner.firstName || '',
        lastName: owner.lastName || '',
        email: owner.email || '',
        phone: owner.phone || '',
        nationality: owner.nationality || '',
        dateOfBirth: owner.dateOfBirth || '',
        role: (owner.role || 'OWNER') as "ADMIN" | "MANAGER" | "AGENT" | "OWNER" | "GUEST" | "CLEANER" | "MAINTENANCE",
        isActive: owner.isActive,
        properties: newProperties,
        totalUnits: (owner.totalUnits || 0) - 1,
        comments: owner.comments || '',
        bankDetails: owner.bankDetails || [],
        transactions: owner.transactions || [],
        documents: owner.documents || [],
        units: newUnits
      }

      const response = await userServiceAdapter.updateUser(owner.id, apiOwnerData)
      if (response.success) {
        console.log('Unit removed successfully')
      } else {
        console.error('Failed to remove unit')
        alert('Failed to remove unit. Please try again.')
        // Revert local state on error
        setOwner(prev => prev ? {
          ...prev,
          units: owner.units || [],
          totalUnits: owner.totalUnits || 0
        } : null)
      }
    } catch (error) {
      console.error('Error removing unit:', error)
      alert('Failed to remove unit. Please try again.')
      // Revert local state on error
      setOwner(prev => prev ? {
        ...prev,
        units: owner.units || [],
        totalUnits: owner.totalUnits || 0
      } : null)
    }
  }



  // Use real owner data
  const currentOwner = owner

  if (isLoading) {
    return (
      <div className="h-screen bg-slate-50 overflow-hidden flex flex-col">
        <TopNavigation />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading owner details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !currentOwner) {
    return (
      <div className="h-screen bg-slate-50 overflow-hidden flex flex-col">
        <TopNavigation />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading owner</p>
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
                data-testid="back-btn"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h1 className="text-xl font-medium text-slate-900">{currentOwner.firstName} {currentOwner.lastName}</h1>
                <p className="text-sm text-slate-600">{currentOwner.nationality || 'n/a'} • {getAge(currentOwner.dateOfBirth || '1975-03-15')} years old</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(currentOwner.isActive ? 'Active' : 'Inactive')}`}>
                {currentOwner.comments?.includes('VIP') && <Star size={16} className="mr-2 text-yellow-500" />}
                <span>{currentOwner.isActive ? 'Active' : 'Inactive'}</span>
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
                <div className="flex-1">
                  <p className="text-slate-600 text-xs mb-1">Total Units</p>
                  <p className="text-2xl font-medium text-slate-900">{currentOwner.totalUnits || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-600 text-xs mb-1">Total Profit</p>
                  <p className="text-2xl font-medium text-slate-900">${(() => {
                    // Calculate total profit from transactions
                    const totalProfit = (currentOwner.transactions || [])
                      .filter((t: any) => t.amount > 0)
                      .reduce((sum: number, t: any) => sum + t.amount, 0)
                    return totalProfit.toLocaleString() || '0'
                  })()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <User className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-600 text-xs mb-1">Nationality</p>
                  <p className="text-2xl font-medium text-slate-900 flex items-center space-x-2">
                    <span>{getCountryFlag(currentOwner.nationality || 'Emirati')}</span>
                    <span>{currentOwner.nationality || 'n/a'}</span>
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
                      <span className="text-sm text-slate-900">{currentOwner.email || 'n/a'}</span>
                      <button 
                        onClick={() => handleEditField('email', currentOwner.email, 'Email', 'email')}
                        className="p-1 text-orange-600 hover:bg-orange-100 rounded cursor-pointer"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Phone:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-900">{currentOwner.phone || 'n/a'}</span>
                      <button 
                        onClick={() => handleEditField('phone', currentOwner.phone, 'Phone', 'tel')}
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
                        <span>{getCountryFlag(currentOwner.nationality || 'Emirati')}</span>
                        <span>{currentOwner.nationality || 'n/a'}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Birth Date:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-900">{currentOwner.dateOfBirth ? formatDate(currentOwner.dateOfBirth) : 'n/a'}</span>
                      <button 
                        onClick={() => handleEditField('dateOfBirth', currentOwner.dateOfBirth, 'Birth Date', 'date')}
                        className="p-1 text-orange-600 hover:bg-orange-100 rounded cursor-pointer"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Age:</span>
                    <span className="text-sm text-slate-900">{currentOwner.dateOfBirth ? getAge(currentOwner.dateOfBirth) : 'n/a'} years</span>
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
                    onClick={() => handleEditField('description', currentOwner.description, 'Description', 'textarea')}
                    className="p-1 text-orange-600 hover:bg-orange-100 rounded cursor-pointer"
                  >
                    <Edit size={16} />
                  </button>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600">{currentOwner.description || 'n/a'}</p>
                </div>
              </div>

              {/* Comments */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-slate-900">Comments</h2>
                  <button 
                    onClick={() => handleEditField('comments', currentOwner.comments, 'Comments', 'textarea')}
                    className="p-1 text-orange-600 hover:bg-orange-100 rounded cursor-pointer"
                  >
                    <Edit size={16} />
                  </button>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600">{currentOwner.comments || 'n/a'}</p>
                </div>
              </div>

              {/* Properties */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-slate-900">Properties</h2>
                  <button 
                    onClick={async () => {
                      setShowLinkPropertyModal(true)
                      // Load available properties immediately when opening modal
                      try {
                        console.log('🏠 Loading available properties immediately...')
                        const { propertyServiceAdapter } = await import('@/lib/api/adapters/apiAdapter')
                        const response = await propertyServiceAdapter.getAvailableProperties()
                        console.log('🏠 Immediate API response:', response)
                        if (response.success && response.data) {
                          console.log('🏠 Setting availableProperties immediately:', response.data)
                          setAvailableProperties(response.data)
                        } else {
                          console.error('🏠 Failed to load available properties immediately:', response.error)
                          setAvailableProperties([])
                        }
                      } catch (error) {
                        console.error('🏠 Error loading available properties immediately:', error)
                        setAvailableProperties([])
                      }
                    }}
                    className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium cursor-pointer"
                  >
                    Link Property
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {properties.map((property, index) => (
                    <div key={property.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-slate-900">{property.name}</h3>
                          <p className="text-sm text-slate-600">{property.type} - {property.type_of_unit}</p>
                          <p className="text-xs text-gray-500">{property.address}, {property.city}</p>
                        </div>
                        <button 
                          onClick={() => handleUnlinkProperty(property.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded cursor-pointer"
                          title="Unlink Property"
                        >
                          <XCircle size={14} />
                        </button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Capacity:</span>
                          <span className="text-slate-900">{property.capacity} guests</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Price per night:</span>
                          <span className="font-medium text-green-600">${property.price_per_night}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            property.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {property.is_published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {properties.length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      <Building size={48} className="mx-auto mb-2 opacity-50" />
                      <p>No properties linked yet</p>
                      <button 
                        onClick={async () => {
                          setShowLinkPropertyModal(true)
                          // Load available properties immediately when opening modal
                          try {
                            console.log('🏠 Loading available properties immediately...')
                            const { propertyServiceAdapter } = await import('@/lib/api/adapters/apiAdapter')
                            const response = await propertyServiceAdapter.getAvailableProperties()
                            console.log('🏠 Immediate API response:', response)
                            if (response.success && response.data) {
                              console.log('🏠 Setting availableProperties immediately:', response.data)
                              setAvailableProperties(response.data)
                            } else {
                              console.error('🏠 Failed to load available properties immediately:', response.error)
                              setAvailableProperties([])
                            }
                          } catch (error) {
                            console.error('🏠 Error loading available properties immediately:', error)
                            setAvailableProperties([])
                          }
                        }}
                        className="mt-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium"
                      >
                        Link First Property
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bank Details */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-slate-900">Bank Details</h2>
                  <button 
                    onClick={() => setIsAddBankAccountModalOpen(true)}
                    className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium cursor-pointer"
                    data-testid="add-bank-btn"
                  >
                    Add Bank Account
                  </button>
                </div>
                <div className="space-y-3">
                  {bankDetails && bankDetails.length > 0 ? bankDetails.map((bankDetail) => (
                    <div key={bankDetail.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-slate-900">{bankDetail.bank_name}</h3>
                            {bankDetail.is_primary && (
                              <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                                Primary
                              </span>
                            )}
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              bankDetail.account_type === 'CHECKING' ? 'bg-blue-100 text-blue-800' :
                              bankDetail.account_type === 'SAVINGS' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {bankDetail.account_type}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-slate-600">Account Holder:</span>
                              <span className="ml-2 text-slate-900">{bankDetail.account_holder}</span>
                            </div>
                            <div>
                              <span className="text-slate-600">Account Number:</span>
                              <span className="ml-2 text-slate-900 font-mono">{bankDetail.account_number}</span>
                            </div>
                            {bankDetail.iban && (
                            <div>
                              <span className="text-slate-600">IBAN:</span>
                              <span className="ml-2 text-slate-900 font-mono">{bankDetail.iban}</span>
                            </div>
                            )}
                            {bankDetail.swift_code && (
                            <div>
                              <span className="text-slate-600">SWIFT:</span>
                                <span className="ml-2 text-slate-900 font-mono">{bankDetail.swift_code}</span>
                              </div>
                            )}
                            <div>
                              <span className="text-slate-600">Currency:</span>
                              <span className="ml-2 text-slate-900">{bankDetail.currency}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {!bankDetail.is_primary && (
                            <button
                              onClick={() => handleSetPrimaryBank(bankDetail.id)}
                              className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 cursor-pointer"
                            >
                              Set Primary
                            </button>
                          )}
                          <button className="p-1 text-slate-600 hover:bg-gray-100 rounded cursor-pointer">
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteBankAccount(bankDetail.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded cursor-pointer"
                            title="Delete Bank Account"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <CreditCard size={48} className="mx-auto mb-2 opacity-50" />
                      <p>No bank accounts added yet</p>
                      <button 
                        onClick={() => setIsAddBankAccountModalOpen(true)}
                        className="mt-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium"
                      >
                        Add First Bank Account
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction History */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-slate-900">Transaction History</h2>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setIsCashPaymentModalOpen(true)}
                      className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium cursor-pointer"
                    >
                      Cash Payment
                    </button>
                    <button 
                      onClick={() => setIsBankPaymentModalOpen(true)}
                      className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium cursor-pointer"
                    >
                      Bank Payment
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {transactions && transactions.length > 0 ? transactions.map((transaction) => {
                    const isIncome = transaction.type === 'PAYMENT' || transaction.type === 'REVENUE'
                    const isCashPayment = transaction.payment_method === 'CASH'
                    const isBankPayment = transaction.payment_method === 'BANK_TRANSFER'
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
                                {transaction.description || transaction.category}
                              </h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                transaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                transaction.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {transaction.status}
                              </span>
                              {isCashPayment && (
                                <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                                  Cash Payment
                                </span>
                              )}
                              {isBankPayment && (
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  Bank Transfer
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-slate-600">
                              <span>Ref: {transaction.payment_reference}</span>
                              {transaction.platform && <span className="ml-3">Platform: {transaction.platform}</span>}
                              {transaction.payment_method && (
                                <span className="ml-3">Method: {transaction.payment_method}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-semibold ${
                              isIncome ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {isIncome ? '+' : '-'}{transaction.amount.toLocaleString()} {transaction.currency}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </div>
                            {transaction.net_amount && transaction.net_amount !== transaction.amount && (
                              <div className="text-xs text-gray-400">
                                Net: {transaction.net_amount.toLocaleString()} {transaction.currency}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  }) : (
                    <div className="text-center py-8 text-gray-500">
                      <DollarSign size={48} className="mx-auto mb-2 opacity-50" />
                      <p>No transactions recorded yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-slate-900">Documents</h2>
                  <button 
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium cursor-pointer"
                    data-testid="upload-document-btn"
                  >
                    Upload Document
                  </button>
                </div>
                <div className="space-y-3">
                  {documents && documents.length > 0 ? (
                    documents.map(doc => (
                    <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-slate-900">{doc.name}</h3>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <span>{doc.type}</span>
                            <span>{doc.size}</span>
                            <span>{formatDateTime(doc.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button 
                            onClick={async () => {
                              if (doc.s3_url) {
                                window.open(doc.s3_url, '_blank')
                              } else if (doc.s3_key) {
                                try {
                                  const token = getAuthToken()
                                  const response = await fetch(`http://localhost:3002/api/v2/files/signed-url?key=${encodeURIComponent(doc.s3_key)}`, {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                  })
                                  const result = await response.json()
                                  if (result.success) {
                                    window.open(result.url, '_blank')
                                  } else {
                                    alert('Failed to generate download URL')
                                  }
                                } catch (error) {
                                  console.error('Error getting download URL:', error)
                                  alert('Failed to get download URL')
                                }
                              } else {
                                alert('No file available for download')
                              }
                            }}
                            className="p-1 text-slate-600 hover:bg-gray-100 rounded cursor-pointer"
                            title="View document"
                          >
                            <Eye size={14} />
                          </button>
                          <button 
                            onClick={async () => {
                              if (doc.s3_url) {
                                const link = document.createElement('a')
                                link.href = doc.s3_url
                                link.download = doc.filename || doc.name
                                link.click()
                              } else if (doc.s3_key) {
                                try {
                                  const token = getAuthToken()
                                  const response = await fetch(`http://localhost:3002/api/v2/files/signed-url?key=${encodeURIComponent(doc.s3_key)}`, {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                  })
                                  const result = await response.json()
                                  if (result.success) {
                                    const link = document.createElement('a')
                                    link.href = result.url
                                    link.download = doc.filename || doc.name
                                    link.click()
                                  } else {
                                    alert('Failed to generate download URL')
                                  }
                                } catch (error) {
                                  console.error('Error getting download URL:', error)
                                  alert('Failed to get download URL')
                                }
                              } else {
                                alert('No file available for download')
                              }
                            }}
                            className="p-1 text-slate-600 hover:bg-gray-100 rounded cursor-pointer"
                            title="Download document"
                          >
                            <Download size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
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

              {/* Activity Log */}
              <div>
                <h2 className="text-lg font-medium text-slate-900 mb-4">Activity Log</h2>
                <div className="space-y-3">
                  {activityLog && activityLog.length > 0 ? (
                    activityLog.map(activity => {
                      const getActivityIcon = (type: string) => {
                        switch (type) {
                          case 'create': return '➕'
                          case 'update': return '✏️'
                          case 'delete': return '🗑️'
                          case 'payment': return '💰'
                          case 'document': return '📄'
                          case 'unit': return '🏠'
                          default: return '📝'
                        }
                      }
                      
                      return (
                    <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-start space-x-3">
                            <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900">{activity.action}</h3>
                        <p className="text-sm text-slate-600">{activity.description}</p>
                        <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                          <span>by {activity.performed_by || 'System'}</span>
                          <span>{formatDateTime(activity.created_at)}</span>
                        </div>
                      </div>
                    </div>
                </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock size={48} className="mx-auto mb-2 opacity-50" />
                      <p>No activity recorded yet</p>
                    </div>
                  )}
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
        onSave={handleCashPayment}
      />

      {/* Bank Payment Modal */}
      <BankPaymentModal
        isOpen={isBankPaymentModalOpen}
        onClose={() => setIsBankPaymentModalOpen(false)}
        onSave={handleBankPayment}
        bankAccounts={bankDetails.map(detail => ({
          id: detail.id,
          bankName: detail.bankName,
          accountNumber: detail.accountNumber,
          iban: detail.iban
        }))}
      />


      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadDocument}
      />

      {/* Link Property Modal */}
      {showLinkPropertyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            {console.log('🏠 Modal rendering with availableProperties:', availableProperties)}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-900">Link Property to Owner</h3>
              <button 
                onClick={() => setShowLinkPropertyModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <XCircle size={20} />
              </button>
    </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select a property to link to this owner. Only properties without an owner can be linked.
              </p>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Available Properties</label>
                <div className="text-xs text-gray-500 mb-2">
                  Debug: {availableProperties.length} properties loaded
                </div>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleLinkProperty(e.target.value)
                    }
                  }}
                >
                  <option value="">Select a property...</option>
                  {availableProperties.map((property) => {
                    console.log('🏠 Rendering property option:', property)
                    return (
                      <option key={property.id} value={property.id}>
                        {property.name} - {property.address}
                      </option>
                    )
                  })}
                </select>
              </div>
              
              {availableProperties.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <Building size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No available properties to link</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setShowLinkPropertyModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Bank Account Modal */}
      {isAddBankAccountModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-900">Add Bank Account</h3>
              <button 
                onClick={() => setIsAddBankAccountModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const bankAccountData = {
                bank_name: formData.get('bank_name') as string,
                account_holder: formData.get('account_holder') as string,
                account_number: formData.get('account_number') as string,
                iban: formData.get('iban') as string || undefined,
                swift_code: formData.get('swift_code') as string || undefined,
                routing_number: formData.get('routing_number') as string || undefined,
                account_type: formData.get('account_type') as string || 'CHECKING',
                currency: formData.get('currency') as string || 'USD',
                is_primary: formData.get('is_primary') === 'on'
              }
              handleAddBankAccount(bankAccountData)
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name *</label>
                  <input 
                    type="text" 
                    name="bank_name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., Emirates NBD"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder *</label>
                  <input 
                    type="text" 
                    name="account_holder"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Full name on account"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
                  <input 
                    type="text" 
                    name="account_number"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Account number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
                  <input 
                    type="text" 
                    name="iban"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="International Bank Account Number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SWIFT Code</label>
                  <input 
                    type="text" 
                    name="swift_code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Bank SWIFT code"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Routing Number</label>
                  <input 
                    type="text" 
                    name="routing_number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="US routing number"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                    <select 
                      name="account_type"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="CHECKING">Checking</option>
                      <option value="SAVINGS">Savings</option>
                      <option value="BUSINESS">Business</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select 
                      name="currency"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="USD">USD</option>
                      <option value="AED">AED</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    name="is_primary"
                    id="is_primary"
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_primary" className="ml-2 block text-sm text-gray-700">
                    Set as primary account
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsAddBankAccountModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                >
                  Add Bank Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}