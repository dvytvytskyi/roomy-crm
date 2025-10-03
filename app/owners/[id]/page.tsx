'use client'

import { useState, useEffect } from 'react'
import { 
  User, Mail, Phone, Calendar, MapPin, Building, DollarSign, MessageSquare, 
  Edit, Trash2, Plus, Eye, Star, Crown, Download, Upload, FileText, 
  ArrowLeft, Settings, CreditCard, TrendingUp, Clock, AlertCircle, XCircle
} from 'lucide-react'
import TopNavigation from '@/components/TopNavigation'
import CashPaymentModal from '@/components/owners/CashPaymentModal'
import BankPaymentModal from '@/components/owners/BankPaymentModal'
import AddBankAccountModal from '@/components/owners/AddBankAccountModal'
import UploadDocumentModal from '@/components/owners/UploadDocumentModal'
import { ownerService, Owner } from '@/lib/api/services/ownerService'

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

  // Mock data for the specific owner (fallback)
  const mockOwner: ExtendedOwner = {
    id: params.id,
    firstName: 'Ahmed',
    lastName: 'Al-Rashid',
    name: 'Ahmed Al-Rashid',
    nationality: 'Emirati',
    dateOfBirth: '1975-03-15',
    email: 'ahmed.alrashid@example.com',
    phone: '+971 50 123 4567',
    whatsapp: '+971 50 123 4567',
    telegram: '@ahmedrashid',
    reservationCount: 45,
    properties: ['Burj Khalifa Studio', 'Marina View', 'Downtown Loft'],
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
    role: 'OWNER',
    isActive: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-07-20T14:20:00Z',
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
    bankDetails: [],
    transactions: [],
    activityLog: [],
    createdBy: 'Admin',
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

  // Load owner data
  useEffect(() => {
    const loadOwner = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log('🏠 Loading owner details from API...')
        
        const response = await ownerService.getOwner(params.id)
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
          
          // Load activity log if available
          if (response.data.activityLog && Array.isArray(response.data.activityLog)) {
            setActivityLog(response.data.activityLog)
          }
          
          // Load documents if available
          if (response.data.documents && Array.isArray(response.data.documents)) {
            setDocuments(response.data.documents)
          }
        } else {
          setError('Owner not found')
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

  const handleSaveEdit = async (newValue: string) => {
    if (!owner) return

    try {
      const updateData: any = {
        [editModal.field]: newValue
      }
      
      const response = await ownerService.updateOwner(owner.id, updateData)
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




  const handleRemoveBankDetail = async (bankDetailId: number) => {
    if (!confirm('Are you sure you want to delete this bank detail?')) return
    if (!owner) return

    const newBankDetails = bankDetails.filter(detail => detail.id !== bankDetailId)
    
    // Update local state first
    setBankDetails(newBankDetails)

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
        properties: owner.properties,
        totalUnits: owner.totalUnits,
        comments: owner.comments || '',
        bankDetails: newBankDetails
      }

      const response = await userService.updateOwner(owner.id, apiOwnerData)
      if (response.success) {
        console.log('Bank account deleted successfully')
      } else {
        console.error('Failed to delete bank account')
        alert('Failed to delete bank account. Please try again.')
        // Revert local state on error
        setBankDetails(bankDetails)
      }
    } catch (error) {
      console.error('Error deleting bank account:', error)
      alert('Failed to delete bank account. Please try again.')
      // Revert local state on error
      setBankDetails(bankDetails)
    }
  }

  const handleSetPrimaryBank = async (bankDetailId: number) => {
    if (!owner) return

    const newBankDetails = bankDetails.map(detail => ({
      ...detail,
      isPrimary: detail.id === bankDetailId
    }))

    // Update local state first
    setBankDetails(newBankDetails)

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
        properties: owner.properties,
        totalUnits: owner.totalUnits,
        comments: owner.comments || '',
        bankDetails: newBankDetails
      }

      const response = await userService.updateOwner(owner.id, apiOwnerData)
      if (response.success) {
        console.log('Primary bank account updated successfully')
      } else {
        console.error('Failed to update primary bank account')
        alert('Failed to update primary bank account. Please try again.')
        // Revert local state on error
        setBankDetails(bankDetails)
      }
    } catch (error) {
      console.error('Error updating primary bank account:', error)
      alert('Failed to update primary bank account. Please try again.')
      // Revert local state on error
      setBankDetails(bankDetails)
    }
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

      const uploadResponse = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': 'Bearer mock-token'
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
        uploadedAt: new Date().toISOString(),
        size: `${(documentData.file.size / 1024 / 1024).toFixed(1)} MB`,
        s3Key: uploadResult.key,
        s3Url: uploadResult.url,
        filename: uploadResult.filename
      }

      // Update local state first
      const newDocuments = [...documents, newDocument]
      setDocuments(newDocuments)
      setOwner(prev => prev ? {
        ...prev,
        documents: newDocuments
      } : null)

      // Save document metadata to backend
      const apiOwnerData = {
        firstName: owner.firstName || '',
        lastName: owner.lastName || '',
        email: owner.email || '',
        phone: owner.phone || '',
        nationality: owner.nationality || '',
        dateOfBirth: owner.dateOfBirth || '',
        role: (owner.role || 'OWNER') as "ADMIN" | "MANAGER" | "AGENT" | "OWNER" | "GUEST" | "CLEANER" | "MAINTENANCE",
        isActive: owner.isActive,
        properties: owner.properties,
        totalUnits: owner.totalUnits,
        comments: owner.comments || '',
        bankDetails: owner.bankDetails || [],
        transactions: owner.transactions || [],
        documents: newDocuments
      }

      const response = await userService.updateOwner(owner.id, apiOwnerData)
      if (response.success) {
        console.log('Document uploaded and saved successfully')
        // Add activity log entry - pass newDocuments to ensure consistency
        addActivityLogEntry('document', 'Document Uploaded', `Uploaded document: ${documentData.name} (${documentData.type})`, newDocuments)
      } else {
        console.error('Failed to save document metadata')
        alert('Failed to save document metadata. Please try again.')
        // Revert local state on error
        setDocuments(documents)
        setOwner(prev => prev ? {
          ...prev,
          documents: documents
        } : null)
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

    const newDocuments = documents.filter(doc => doc.id !== documentId)

    // Update local state first
    setDocuments(newDocuments)
    setOwner(prev => prev ? {
      ...prev,
      documents: newDocuments
    } : null)

    try {
      // Delete file from S3 if it has s3Key
      if (documentToDelete.s3Key) {
        const deleteResponse = await fetch(`http://localhost:3001/api/files/${encodeURIComponent(documentToDelete.s3Key)}`, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer mock-token'
          }
        })

        const deleteResult = await deleteResponse.json()
        if (!deleteResult.success) {
          console.warn('Failed to delete file from S3:', deleteResult.message)
        }
      }

      // Save to backend
      const apiOwnerData = {
        firstName: owner.firstName || '',
        lastName: owner.lastName || '',
        email: owner.email || '',
        phone: owner.phone || '',
        nationality: owner.nationality || '',
        dateOfBirth: owner.dateOfBirth || '',
        role: (owner.role || 'OWNER') as "ADMIN" | "MANAGER" | "AGENT" | "OWNER" | "GUEST" | "CLEANER" | "MAINTENANCE",
        isActive: owner.isActive,
        properties: owner.properties,
        totalUnits: owner.totalUnits,
        comments: owner.comments || '',
        bankDetails: owner.bankDetails || [],
        transactions: owner.transactions || [],
        documents: newDocuments
      }

      const response = await userService.updateOwner(owner.id, apiOwnerData)
      if (response.success) {
        console.log('Document deleted successfully')
        // Add activity log entry - pass newDocuments to ensure consistency
        addActivityLogEntry('document', 'Document Deleted', `Deleted document: ${documentToDelete.name}`, newDocuments)
      } else {
        console.error('Failed to delete document')
        alert('Failed to delete document. Please try again.')
        // Revert local state on error
        setDocuments(documents)
        setOwner(prev => prev ? {
          ...prev,
          documents: documents
        } : null)
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to delete document: ${errorMessage}`)
      // Revert local state on error
      setDocuments(documents)
      setOwner(prev => prev ? {
        ...prev,
        documents: documents
      } : null)
    }
  }

  // Function to add activity log entry
  const addActivityLogEntry = async (
    type: 'create' | 'update' | 'delete' | 'payment' | 'document' | 'unit',
    action: string,
    description: string,
    updatedDocuments?: Array<any>
  ) => {
    if (!owner) return

    const newActivity = {
      id: (activityLog.length || 0) + 1,
      action,
      description,
      user: 'Current User',
      timestamp: new Date().toISOString(),
      type
    }

    // Update local activity log
    const newActivityLog = [newActivity, ...activityLog]
    setActivityLog(newActivityLog)

    // Save to backend - use updatedDocuments if provided to ensure we have the latest
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
        properties: owner.properties,
        totalUnits: owner.totalUnits,
        comments: owner.comments || '',
        bankDetails: owner.bankDetails || [],
        transactions: owner.transactions || [],
        documents: updatedDocuments !== undefined ? updatedDocuments : documents,
        activityLog: newActivityLog
      }

      await userService.updateOwner(owner.id, apiOwnerData)
    } catch (error) {
      console.error('Error saving activity log:', error)
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

      const response = await userService.updateOwner(owner.id, apiOwnerData)
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

      const response = await userService.updateOwner(owner.id, apiOwnerData)
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

  const handleSaveCashPayment = async (paymentData: {
    amount: number
    date: string
    title: string
    responsible: string
    description: string
  }) => {
    if (!owner) return

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

    // Update local state first
    setTransactions(prev => [newTransaction, ...prev])

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
        properties: owner.properties,
        totalUnits: owner.totalUnits,
        comments: owner.comments || '',
        bankDetails: owner.bankDetails || [],
        transactions: [newTransaction, ...transactions]
      }

      const response = await userService.updateOwner(owner.id, apiOwnerData)
      if (response.success) {
        console.log('Cash payment saved successfully')
      } else {
        console.error('Failed to save cash payment')
        alert('Failed to save cash payment. Please try again.')
        // Revert local state on error
        setTransactions(transactions)
      }
    } catch (error) {
      console.error('Error saving cash payment:', error)
      alert('Failed to save cash payment. Please try again.')
      // Revert local state on error
      setTransactions(transactions)
    }
  }

  const handleSaveBankPayment = async (paymentData: {
    amount: number
    date: string
    description: string
    bankAccountId: number
  }) => {
    if (!owner) return

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

    // Update local state first
    setTransactions(prev => [newTransaction, ...prev])

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
        properties: owner.properties,
        totalUnits: owner.totalUnits,
        comments: owner.comments || '',
        bankDetails: owner.bankDetails || [],
        transactions: [newTransaction, ...transactions]
      }

      const response = await userService.updateOwner(owner.id, apiOwnerData)
      if (response.success) {
        console.log('Bank payment saved successfully')
      } else {
        console.error('Failed to save bank payment')
        alert('Failed to save bank payment. Please try again.')
        // Revert local state on error
        setTransactions(transactions)
      }
    } catch (error) {
      console.error('Error saving bank payment:', error)
      alert('Failed to save bank payment. Please try again.')
      // Revert local state on error
      setTransactions(transactions)
    }
  }

  const handleSaveBankAccount = async (bankData: {
    bankName: string
    accountHolderName: string
    accountNumber: string
    iban: string
    swiftCode: string
    bankAddress: string
  }) => {
    if (!owner) return

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

    // Update local state first
    setBankDetails(prev => [...prev, newBankAccount])

    // Save to backend
    try {
      const updatedOwner = {
        ...owner,
        bankDetails: [...bankDetails, newBankAccount]
      }

      // Convert ExtendedOwner back to API format for update
      const apiOwnerData = {
        firstName: owner.firstName || '',
        lastName: owner.lastName || '',
        email: owner.email || '',
        phone: owner.phone || '',
        nationality: owner.nationality || '',
        dateOfBirth: owner.dateOfBirth || '',
        role: (owner.role || 'OWNER') as "ADMIN" | "MANAGER" | "AGENT" | "OWNER" | "GUEST" | "CLEANER" | "MAINTENANCE",
        isActive: owner.isActive,
        properties: owner.properties,
        totalUnits: owner.totalUnits,
        comments: owner.comments || '',
        bankDetails: [...bankDetails, newBankAccount]
      }

      const response = await userService.updateOwner(owner.id, apiOwnerData)
      if (response.success) {
        console.log('Bank account saved successfully')
      } else {
        console.error('Failed to save bank account')
        alert('Failed to save bank account. Please try again.')
        // Revert local state on error
        setBankDetails(bankDetails)
      }
    } catch (error) {
      console.error('Error saving bank account:', error)
      alert('Failed to save bank account. Please try again.')
      // Revert local state on error
      setBankDetails(bankDetails)
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
                    onClick={() => handleEditField('comments', currentOwner.comments, 'Description', 'textarea')}
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
                <h2 className="text-lg font-medium text-slate-900 mb-4">Properties</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(currentOwner.properties || []).map((property, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-slate-900">{property}</h3>
                          <p className="text-sm text-slate-600">Property</p>
                          <p className="text-xs text-gray-500">n/a</p>
                        </div>
                        <button className="p-1 text-orange-600 hover:bg-orange-100 rounded cursor-pointer">
                          <Edit size={14} />
                        </button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Status:</span>
                          <span className="text-slate-900">n/a</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Revenue:</span>
                          <span className="font-medium text-green-600">n/a</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!currentOwner.properties || currentOwner.properties.length === 0) && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      <Building size={48} className="mx-auto mb-2 opacity-50" />
                      <p>No properties linked yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bank Details */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-slate-900">Bank Details</h2>
                  <button 
                    onClick={handleAddBankAccount}
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
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <CreditCard size={48} className="mx-auto mb-2 opacity-50" />
                      <p>No bank accounts added yet</p>
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
                  {transactions && transactions.length > 0 ? transactions.map((transaction) => {
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
                            <span>{formatDateTime(doc.uploadedAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button 
                            onClick={async () => {
                              if (doc.s3Key) {
                                try {
                                  const response = await fetch(`http://localhost:3001/api/files/signed-url?key=${encodeURIComponent(doc.s3Key)}`, {
                                    headers: { 'Authorization': 'Bearer mock-token' }
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
                              if (doc.s3Key) {
                                try {
                                  const response = await fetch(`http://localhost:3001/api/files/signed-url?key=${encodeURIComponent(doc.s3Key)}`, {
                                    headers: { 'Authorization': 'Bearer mock-token' }
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
                          <span>by {activity.user}</span>
                          <span>{formatDateTime(activity.timestamp)}</span>
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

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadDocument}
      />
    </div>
  )
}