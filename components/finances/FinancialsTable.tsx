'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Trash2, Eye, ChevronUp, ChevronDown, CreditCard, CheckCircle, XCircle, Clock, AlertCircle, FileText } from 'lucide-react'

interface FinancialsTableProps {
  searchTerm: string
  selectedTransactions: number[]
  onSelectionChange: (selected: number[]) => void
  dateRange: {
    from: string
    to: string
  }
}

// Mock data for financial transactions
const mockTransactions = [
  {
    id: 1,
    transactionId: 'TXN-2024-001',
    guestName: 'John Smith',
    property: 'Apartment Burj Khalifa 2',
    reservationId: 'RES-001',
    paymentStatus: 'Completed',
    paymentMethod: 'Credit Card',
    amount: 2450,
    currency: 'AED',
    date: '2024-01-15',
    type: 'Payment',
    platform: 'Airbnb',
    platformFee: 73.5,
    adminUser: 'Sarah Johnson',
    remarks: 'Full payment received on time',
    paymentCount: 1,
    paymentCategory: 'Reservation Payment'
  },
  {
    id: 2,
    transactionId: 'TXN-2024-002',
    guestName: 'Maria Garcia',
    property: 'Marina View Studio',
    reservationId: 'RES-002',
    paymentStatus: 'Pending',
    paymentMethod: 'Bank Transfer',
    amount: 1800,
    currency: 'AED',
    date: '2024-01-14',
    type: 'Payment',
    platform: 'Direct',
    platformFee: 0,
    adminUser: 'Mike Wilson',
    remarks: 'Awaiting bank confirmation',
    paymentCount: 1,
    paymentCategory: 'Deposit'
  },
  {
    id: 3,
    transactionId: 'TXN-2024-003',
    guestName: 'Ahmed Hassan',
    property: 'Downtown Loft 2BR',
    reservationId: 'RES-003',
    paymentStatus: 'Completed',
    paymentMethod: 'Credit Card',
    amount: 3200,
    currency: 'AED',
    date: '2024-01-13',
    type: 'Payment',
    platform: 'Booking.com',
    platformFee: 96,
    adminUser: 'Lisa Brown',
    remarks: 'Deposit payment - balance due on arrival',
    paymentCount: 1,
    paymentCategory: 'Deposit'
  },
  {
    id: 4,
    transactionId: 'TXN-2024-004',
    guestName: 'Emma Davis',
    property: 'JBR Beach Apartment',
    reservationId: 'RES-004',
    paymentStatus: 'Failed',
    paymentMethod: 'Credit Card',
    amount: 2100,
    currency: 'AED',
    date: '2024-01-12',
    type: 'Payment',
    platform: 'Airbnb',
    platformFee: 63,
    adminUser: 'David Lee',
    remarks: 'Card declined - insufficient funds',
    paymentCount: 1,
    paymentCategory: 'Reservation Payment'
  },
  {
    id: 5,
    transactionId: 'TXN-2024-005',
    guestName: 'Tom Anderson',
    property: 'Business Bay Office',
    reservationId: 'RES-005',
    paymentStatus: 'Completed',
    paymentMethod: 'PayPal',
    amount: 1500,
    currency: 'AED',
    date: '2024-01-11',
    type: 'Refund',
    platform: 'Direct',
    platformFee: 0,
    adminUser: 'Anna Taylor',
    remarks: 'Partial refund due to early checkout',
    paymentCount: 1,
    paymentCategory: 'Refund'
  },
  {
    id: 6,
    transactionId: 'TXN-2024-006',
    guestName: 'Clean Pro Services',
    property: 'Apartment Burj Khalifa 2',
    reservationId: 'RES-001',
    paymentStatus: 'Completed',
    paymentMethod: 'Bank Transfer',
    amount: -450,
    currency: 'AED',
    date: '2024-01-15',
    type: 'Expense',
    platform: 'Direct',
    platformFee: 0,
    adminUser: 'Sarah Johnson',
    remarks: 'Post-checkout cleaning service',
    paymentCount: 1,
    paymentCategory: 'Cleaning Fee'
  },
  {
    id: 7,
    transactionId: 'TXN-2024-007',
    guestName: 'Dubai Plumbing Co.',
    property: 'Marina View Studio',
    reservationId: 'N/A',
    paymentStatus: 'Completed',
    paymentMethod: 'Bank Transfer',
    amount: -320,
    currency: 'AED',
    date: '2024-01-14',
    type: 'Expense',
    platform: 'Direct',
    platformFee: 0,
    adminUser: 'Mike Wilson',
    remarks: 'Kitchen sink repair',
    paymentCount: 1,
    paymentCategory: 'Maintenance Fee'
  },
  {
    id: 8,
    transactionId: 'TXN-2024-008',
    guestName: 'Sophie Martin',
    property: 'DIFC Penthouse',
    reservationId: 'RES-006',
    paymentStatus: 'Completed',
    paymentMethod: 'Credit Card',
    amount: 5200,
    currency: 'AED',
    date: '2024-01-10',
    type: 'Payment',
    platform: 'Airbnb',
    platformFee: 156,
    adminUser: 'John Smith',
    remarks: 'Full payment - premium property',
    paymentCount: 1,
    paymentCategory: 'Reservation Payment'
  }
]

export default function FinancialsTable({ searchTerm, selectedTransactions, onSelectionChange, dateRange }: FinancialsTableProps) {
  const router = useRouter()
  const [sortField, setSortField] = useState<string>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = transaction.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reservationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const sortedTransactions = filteredTransactions.sort((a, b) => {
    const aValue = a[sortField as keyof typeof a]
    const bValue = b[sortField as keyof typeof b]
    
    if (sortField === 'date') {
      return sortDirection === 'asc' 
        ? new Date(aValue as string).getTime() - new Date(bValue as string).getTime()
        : new Date(bValue as string).getTime() - new Date(aValue as string).getTime()
    }
    
    if (sortField === 'amount') {
      return sortDirection === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number)
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    
    return 0
  })

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(sortedTransactions.map(transaction => transaction.id))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectTransaction = (transactionId: number, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedTransactions, transactionId])
    } else {
      onSelectionChange(selectedTransactions.filter(id => id !== transactionId))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />
      case 'Pending':
        return <Clock className="w-4 h-4" />
      case 'Failed':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Payment':
        return 'bg-blue-100 text-blue-800'
      case 'Refund':
        return 'bg-purple-100 text-purple-800'
      case 'Expense':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-slate-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedTransactions.length === sortedTransactions.length && sortedTransactions.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('transactionId')}
              >
                <div className="flex items-center space-x-1">
                  <span>Transaction ID</span>
                  {getSortIcon('transactionId')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('guestName')}
              >
                <div className="flex items-center space-x-1">
                  <span>Guest Name</span>
                  {getSortIcon('guestName')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('property')}
              >
                <div className="flex items-center space-x-1">
                  <span>Property</span>
                  {getSortIcon('property')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Type
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('paymentCategory')}
              >
                <div className="flex items-center space-x-1">
                  <span>Category</span>
                  {getSortIcon('paymentCategory')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('paymentStatus')}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  {getSortIcon('paymentStatus')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Payment Method
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center space-x-1">
                  <span>Amount</span>
                  {getSortIcon('amount')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  {getSortIcon('date')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTransactions.map((transaction) => (
              <tr 
                key={transaction.id}
                className={`hover:bg-slate-50 transition-colors ${
                  selectedTransactions.includes(transaction.id) ? 'bg-orange-50' : ''
                }`}
                onMouseEnter={() => setHoveredRow(transaction.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedTransactions.includes(transaction.id)}
                    onChange={(e) => handleSelectTransaction(transaction.id, e.target.checked)}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-slate-900 font-mono">{transaction.transactionId}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-slate-900">{transaction.guestName}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-slate-900">{transaction.property}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(transaction.type)}`}>
                    {transaction.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-slate-900">{transaction.paymentCategory}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.paymentStatus)}`}>
                    {getStatusIcon(transaction.paymentStatus)}
                    <span className="ml-1">{transaction.paymentStatus}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <CreditCard className="w-4 h-4 text-slate-400 mr-2" />
                    <span className="text-sm text-slate-900">{transaction.paymentMethod}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${transaction.amount < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                    {formatCurrency(transaction.amount)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-slate-900">
                    {new Date(transaction.date).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className={`flex items-center space-x-2 transition-opacity ${hoveredRow === transaction.id ? 'opacity-100' : 'opacity-70'}`}>
                    <button
                      onClick={() => router.push(`/finances/${transaction.id}`)}
                      className="text-slate-400 hover:text-orange-600 transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="text-slate-400 hover:text-orange-600 transition-colors cursor-pointer"
                      title="Edit Transaction"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                      title="Generate Invoice"
                    >
                      <FileText size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
