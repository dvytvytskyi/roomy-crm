'use client'

import { useState } from 'react'
import { User, DollarSign, TrendingUp, TrendingDown, Calendar, FileText, Users } from 'lucide-react'

interface OwnersBlockProps {
  viewMode: 'chart' | 'table'
  selectedPeriod: string
}

export default function OwnersBlock({ viewMode, selectedPeriod }: OwnersBlockProps) {
  const [activeTab, setActiveTab] = useState<'profitability' | 'payouts' | 'activity'>('profitability')

  // Mock data for owners analytics
  const ownersData = {
    profitability: [
      {
        owner: 'Ahmed Al-Rashid',
        units: ['Apartment Burj Khalifa 2', 'Marina View Studio'],
        totalRevenue: 43400,
        totalExpenses: 6000,
        netProfit: 37400,
        profitMargin: 86.2,
        unitsCount: 2,
        avgRevenuePerUnit: 21700
      },
      {
        owner: 'Sarah Johnson',
        units: ['Downtown Loft 2BR', 'JBR Beach Apartment'],
        totalRevenue: 41900,
        totalExpenses: 6000,
        netProfit: 35900,
        profitMargin: 85.7,
        unitsCount: 2,
        avgRevenuePerUnit: 20950
      },
      {
        owner: 'Mohammed Hassan',
        units: ['Business Bay Office'],
        totalRevenue: 15600,
        totalExpenses: 2500,
        netProfit: 13100,
        profitMargin: 84.0,
        unitsCount: 1,
        avgRevenuePerUnit: 15600
      },
      {
        owner: 'Emma Davis',
        units: ['DIFC Penthouse'],
        totalRevenue: 24500,
        totalExpenses: 4200,
        netProfit: 20300,
        profitMargin: 82.9,
        unitsCount: 1,
        avgRevenuePerUnit: 24500
      }
    ],
    payouts: [
      {
        owner: 'Ahmed Al-Rashid',
        totalPayouts: 28000,
        lastPayout: '2024-01-15',
        payoutCount: 3,
        avgPayout: 9333,
        pendingAmount: 9400
      },
      {
        owner: 'Sarah Johnson',
        totalPayouts: 26000,
        lastPayout: '2024-01-12',
        payoutCount: 3,
        avgPayout: 8667,
        pendingAmount: 9900
      },
      {
        owner: 'Mohammed Hassan',
        totalPayouts: 9500,
        lastPayout: '2024-01-10',
        payoutCount: 2,
        avgPayout: 4750,
        pendingAmount: 3600
      },
      {
        owner: 'Emma Davis',
        totalPayouts: 15000,
        lastPayout: '2024-01-08',
        payoutCount: 2,
        avgPayout: 7500,
        pendingAmount: 5300
      }
    ],
    activity: {
      requests: [
        { owner: 'Ahmed Al-Rashid', type: 'Revenue Inquiry', date: '2024-01-16', status: 'Resolved' },
        { owner: 'Sarah Johnson', type: 'Payout Request', date: '2024-01-14', status: 'Pending' },
        { owner: 'Mohammed Hassan', type: 'Unit Performance', date: '2024-01-13', status: 'Resolved' },
        { owner: 'Emma Davis', type: 'Maintenance Update', date: '2024-01-11', status: 'In Progress' }
      ],
      payoutHistory: [
        { owner: 'Ahmed Al-Rashid', amount: 9500, date: '2024-01-15', type: 'Monthly Payout' },
        { owner: 'Sarah Johnson', amount: 9000, date: '2024-01-12', type: 'Monthly Payout' },
        { owner: 'Mohammed Hassan', amount: 3600, date: '2024-01-10', type: 'Monthly Payout' },
        { owner: 'Emma Davis', amount: 7500, date: '2024-01-08', type: 'Monthly Payout' }
      ]
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

  const tabs = [
    { id: 'profitability', label: 'Owner Profitability', icon: TrendingUp },
    { id: 'payouts', label: 'Payouts Overview', icon: DollarSign },
    { id: 'activity', label: 'Owner Activity', icon: Users }
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-medium text-slate-900">Owners Analytics</h2>
          <p className="text-sm text-slate-500">Owner performance, payouts, and activity analysis</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'profitability' && (
          <div className="space-y-6">
            {/* Owner Profitability Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Units
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Expenses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Net Profit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Margin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Avg/Unit
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ownersData.profitability.map((owner, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-slate-400 mr-2" />
                          <span className="text-sm font-medium text-slate-900">{owner.owner}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-900">{owner.unitsCount}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-900">{formatCurrency(owner.totalRevenue)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-900">{formatCurrency(owner.totalExpenses)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-green-600">{formatCurrency(owner.netProfit)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-900">{owner.profitMargin}%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-900">{formatCurrency(owner.avgRevenuePerUnit)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Owner Performance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Total Owner Revenue</p>
                    <p className="text-xl font-bold text-green-700">
                      {formatCurrency(ownersData.profitability.reduce((sum, owner) => sum + owner.totalRevenue, 0))}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Owner Profit</p>
                    <p className="text-xl font-bold text-blue-700">
                      {formatCurrency(ownersData.profitability.reduce((sum, owner) => sum + owner.netProfit, 0))}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Active Owners</p>
                    <p className="text-xl font-bold text-purple-700">{ownersData.profitability.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payouts' && (
          <div className="space-y-6">
            {/* Payouts Overview */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Total Payouts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Last Payout
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Payout Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Avg Payout
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Pending
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ownersData.payouts.map((owner, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-slate-400 mr-2" />
                          <span className="text-sm font-medium text-slate-900">{owner.owner}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-slate-900">{formatCurrency(owner.totalPayouts)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-900">{new Date(owner.lastPayout).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-900">{owner.payoutCount}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-900">{formatCurrency(owner.avgPayout)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-orange-600">{formatCurrency(owner.pendingAmount)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Payouts Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Total Payouts</p>
                    <p className="text-xl font-bold text-green-700">
                      {formatCurrency(ownersData.payouts.reduce((sum, owner) => sum + owner.totalPayouts, 0))}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Pending Payouts</p>
                    <p className="text-xl font-bold text-orange-700">
                      {formatCurrency(ownersData.payouts.reduce((sum, owner) => sum + owner.pendingAmount, 0))}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-500" />
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Avg Payout</p>
                    <p className="text-xl font-bold text-blue-700">
                      {formatCurrency(
                        ownersData.payouts.reduce((sum, owner) => sum + owner.avgPayout, 0) / ownersData.payouts.length
                      )}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Owner Requests */}
              <div>
                <h3 className="text-md font-medium text-slate-900 mb-4">Recent Owner Requests</h3>
                <div className="space-y-3">
                  {ownersData.activity.requests.map((request, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-900">{request.owner}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            request.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                            request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{request.type}</p>
                        <p className="text-xs text-slate-500">{new Date(request.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payout History */}
              <div>
                <h3 className="text-md font-medium text-slate-900 mb-4">Recent Payout History</h3>
                <div className="space-y-3">
                  {ownersData.activity.payoutHistory.map((payout, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-900">{payout.owner}</span>
                          <span className="text-sm font-medium text-green-600">{formatCurrency(payout.amount)}</span>
                        </div>
                        <p className="text-sm text-slate-600">{payout.type}</p>
                        <p className="text-xs text-slate-500">{new Date(payout.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
