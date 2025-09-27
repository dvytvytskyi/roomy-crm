'use client'

import { useState } from 'react'
import { User, TrendingUp, DollarSign, Home, BarChart3, Users } from 'lucide-react'

interface AgentsBlockProps {
  viewMode: 'chart' | 'table'
  selectedPeriod: string
}

export default function AgentsBlock({ viewMode, selectedPeriod }: AgentsBlockProps) {
  const [activeTab, setActiveTab] = useState<'performance' | 'payouts' | 'impact'>('performance')

  // Mock data for agents analytics
  const agentsData = {
    performance: [
      {
        agent: 'Sarah Wilson',
        unitsReferred: 3,
        totalRevenue: 45600,
        totalPayouts: 13680,
        commissionRate: 30,
        avgRevenuePerUnit: 15200,
        lastReferral: '2024-01-10',
        status: 'Active'
      },
      {
        agent: 'Mike Johnson',
        unitsReferred: 2,
        totalRevenue: 32100,
        totalPayouts: 9630,
        commissionRate: 30,
        avgRevenuePerUnit: 16050,
        lastReferral: '2024-01-05',
        status: 'Active'
      },
      {
        agent: 'Lisa Brown',
        unitsReferred: 2,
        totalRevenue: 28900,
        totalPayouts: 8670,
        commissionRate: 30,
        avgRevenuePerUnit: 14450,
        lastReferral: '2023-12-28',
        status: 'Active'
      },
      {
        agent: 'David Lee',
        unitsReferred: 1,
        totalRevenue: 18800,
        totalPayouts: 5640,
        commissionRate: 30,
        avgRevenuePerUnit: 18800,
        lastReferral: '2023-12-15',
        status: 'Inactive'
      }
    ],
    payouts: [
      {
        agent: 'Sarah Wilson',
        totalPayouts: 13680,
        lastPayout: '2024-01-15',
        payoutCount: 4,
        avgPayout: 3420,
        pendingAmount: 0
      },
      {
        agent: 'Mike Johnson',
        totalPayouts: 9630,
        lastPayout: '2024-01-12',
        payoutCount: 3,
        avgPayout: 3210,
        pendingAmount: 0
      },
      {
        agent: 'Lisa Brown',
        totalPayouts: 8670,
        lastPayout: '2024-01-08',
        payoutCount: 3,
        avgPayout: 2890,
        pendingAmount: 0
      },
      {
        agent: 'David Lee',
        totalPayouts: 5640,
        lastPayout: '2023-12-20',
        payoutCount: 2,
        avgPayout: 2820,
        pendingAmount: 0
      }
    ],
    impact: {
      totalUnits: 8,
      totalRevenue: 125400,
      totalPayouts: 37620,
      avgCommissionRate: 30,
      topPerformer: 'Sarah Wilson',
      revenueGrowth: 15.8
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
    { id: 'performance', label: 'Agent Performance', icon: TrendingUp },
    { id: 'payouts', label: 'Payouts Overview', icon: DollarSign },
    { id: 'impact', label: 'Unit Impact', icon: Home }
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-medium text-slate-900">Agents Analytics</h2>
          <p className="text-sm text-slate-500">Agent performance, payouts, and unit acquisition impact</p>
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
        {activeTab === 'performance' && (
          <div className="space-y-6">
            {/* Agent Performance Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Agent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Units Referred
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Total Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Total Payouts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Commission Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Avg Revenue/Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {agentsData.performance.map((agent, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-slate-400 mr-2" />
                          <span className="text-sm font-medium text-slate-900">{agent.agent}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-900">{agent.unitsReferred}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-slate-900">{formatCurrency(agent.totalRevenue)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-green-600">{formatCurrency(agent.totalPayouts)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-900">{agent.commissionRate}%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-900">{formatCurrency(agent.avgRevenuePerUnit)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          agent.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {agent.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Performance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Total Agent Revenue</p>
                    <p className="text-xl font-bold text-green-700">
                      {formatCurrency(agentsData.performance.reduce((sum, agent) => sum + agent.totalRevenue, 0))}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Payouts</p>
                    <p className="text-xl font-bold text-blue-700">
                      {formatCurrency(agentsData.performance.reduce((sum, agent) => sum + agent.totalPayouts, 0))}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Active Agents</p>
                    <p className="text-xl font-bold text-purple-700">
                      {agentsData.performance.filter(agent => agent.status === 'Active').length}
                    </p>
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
                      Agent
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
                  {agentsData.payouts.map((agent, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-slate-400 mr-2" />
                          <span className="text-sm font-medium text-slate-900">{agent.agent}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-slate-900">{formatCurrency(agent.totalPayouts)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-900">{new Date(agent.lastPayout).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-900">{agent.payoutCount}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-900">{formatCurrency(agent.avgPayout)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-orange-600">{formatCurrency(agent.pendingAmount)}</span>
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
                      {formatCurrency(agentsData.payouts.reduce((sum, agent) => sum + agent.totalPayouts, 0))}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Avg Payout</p>
                    <p className="text-xl font-bold text-blue-700">
                      {formatCurrency(
                        agentsData.payouts.reduce((sum, agent) => sum + agent.avgPayout, 0) / agentsData.payouts.length
                      )}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Pending Payouts</p>
                    <p className="text-xl font-bold text-orange-700">
                      {formatCurrency(agentsData.payouts.reduce((sum, agent) => sum + agent.pendingAmount, 0))}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'impact' && (
          <div className="space-y-6">
            {/* Impact Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Total Units</p>
                    <p className="text-2xl font-bold text-green-700">{agentsData.impact.totalUnits}</p>
                  </div>
                  <Home className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Revenue</p>
                    <p className="text-2xl font-bold text-blue-700">{formatCurrency(agentsData.impact.totalRevenue)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Total Payouts</p>
                    <p className="text-2xl font-bold text-purple-700">{formatCurrency(agentsData.impact.totalPayouts)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Avg Commission</p>
                    <p className="text-2xl font-bold text-orange-700">{agentsData.impact.avgCommissionRate}%</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Top Performer */}
            <div className="bg-slate-50 rounded-lg p-6">
              <h3 className="text-md font-medium text-slate-900 mb-4">Top Performing Agent</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-slate-900">{agentsData.impact.topPerformer}</p>
                  <p className="text-sm text-slate-600">Highest revenue contribution</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Revenue Growth</p>
                  <p className="text-lg font-bold text-green-600">+{agentsData.impact.revenueGrowth}%</p>
                </div>
              </div>
            </div>

            {/* Revenue vs Commission Analysis */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Revenue vs Commission Analysis</h3>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-slate-600">Revenue vs Commission Ratio</span>
                  <span className="text-sm font-medium text-slate-900">
                    {((agentsData.impact.totalPayouts / agentsData.impact.totalRevenue) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-orange-500 h-4 rounded-full" 
                    style={{ width: `${(agentsData.impact.totalPayouts / agentsData.impact.totalRevenue) * 100}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-500">Commission</span>
                  <span className="text-xs text-slate-500">Revenue</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
