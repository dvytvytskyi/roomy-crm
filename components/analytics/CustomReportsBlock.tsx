'use client'

import { useState } from 'react'
import { FileText, Download, Calendar, Filter, BarChart3, PieChart, LineChart, Plus, Settings } from 'lucide-react'

interface CustomReportsBlockProps {
  viewMode: 'chart' | 'table'
  selectedPeriod: string
}

export default function CustomReportsBlock({ viewMode, selectedPeriod }: CustomReportsBlockProps) {
  const [activeTab, setActiveTab] = useState<'builder' | 'scheduled' | 'templates'>('builder')
  const [showReportBuilder, setShowReportBuilder] = useState(false)

  // Mock data for custom reports
  const reportsData = {
    templates: [
      {
        id: 1,
        name: 'Monthly Financial Summary',
        description: 'Complete financial overview with revenue, expenses, and profit analysis',
        type: 'Financial',
        lastGenerated: '2024-01-15',
        frequency: 'Monthly',
        recipients: ['admin@roomy.com', 'finance@roomy.com']
      },
      {
        id: 2,
        name: 'Unit Performance Report',
        description: 'Detailed analysis of unit occupancy, revenue, and maintenance costs',
        type: 'Units',
        lastGenerated: '2024-01-14',
        frequency: 'Weekly',
        recipients: ['operations@roomy.com']
      },
      {
        id: 3,
        name: 'Owner Payout Summary',
        description: 'Owner revenue, expenses, and payout calculations',
        type: 'Owners',
        lastGenerated: '2024-01-12',
        frequency: 'Monthly',
        recipients: ['owners@roomy.com']
      }
    ],
    scheduled: [
      {
        id: 1,
        name: 'Weekly Operations Report',
        nextRun: '2024-01-22',
        frequency: 'Weekly',
        status: 'Active',
        lastRun: '2024-01-15',
        recipients: 3
      },
      {
        id: 2,
        name: 'Monthly Financial Report',
        nextRun: '2024-02-01',
        frequency: 'Monthly',
        status: 'Active',
        lastRun: '2024-01-01',
        recipients: 5
      },
      {
        id: 3,
        name: 'Quarterly Performance Review',
        nextRun: '2024-04-01',
        frequency: 'Quarterly',
        status: 'Paused',
        lastRun: '2023-12-31',
        recipients: 2
      }
    ]
  }

  const reportTypes = [
    { value: 'financial', label: 'Financial Report' },
    { value: 'units', label: 'Unit Performance' },
    { value: 'owners', label: 'Owner Analysis' },
    { value: 'reservations', label: 'Reservation Trends' },
    { value: 'agents', label: 'Agent Performance' },
    { value: 'custom', label: 'Custom Report' }
  ]

  const chartTypes = [
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'pie', label: 'Pie Chart', icon: PieChart },
    { value: 'line', label: 'Line Chart', icon: LineChart }
  ]

  const tabs = [
    { id: 'builder', label: 'Report Builder', icon: Plus },
    { id: 'scheduled', label: 'Scheduled Reports', icon: Calendar },
    { id: 'templates', label: 'Report Templates', icon: FileText }
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-medium text-slate-900">Custom Reports</h2>
          <p className="text-sm text-slate-500">Create, schedule, and manage custom analytics reports</p>
        </div>
        <button
          onClick={() => setShowReportBuilder(true)}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center"
        >
          <Plus size={16} className="mr-2" />
          New Report
        </button>
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
        {activeTab === 'builder' && (
          <div className="space-y-6">
            {/* Report Builder Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-md font-medium text-slate-900">Report Configuration</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Report Name</label>
                  <input
                    type="text"
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter report name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Report Type</label>
                  <select className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    {reportTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      className="h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <input
                      type="date"
                      className="h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Chart Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {chartTypes.map(type => {
                      const Icon = type.icon
                      return (
                        <button
                          key={type.value}
                          className="flex flex-col items-center p-3 border border-gray-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <Icon size={20} className="text-slate-500 mb-1" />
                          <span className="text-xs text-slate-600">{type.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-slate-900">Data Filters</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Properties</label>
                  <select className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option value="">All Properties</option>
                    <option value="burj">Apartment Burj Khalifa 2</option>
                    <option value="marina">Marina View Studio</option>
                    <option value="downtown">Downtown Loft 2BR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Owners</label>
                  <select className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option value="">All Owners</option>
                    <option value="ahmed">Ahmed Al-Rashid</option>
                    <option value="sarah">Sarah Johnson</option>
                    <option value="mohammed">Mohammed Hassan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Platforms</label>
                  <select className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option value="">All Platforms</option>
                    <option value="airbnb">Airbnb</option>
                    <option value="booking">Booking.com</option>
                    <option value="direct">Direct</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Export Format</label>
                  <div className="flex space-x-2">
                    <button className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-sm">
                      PDF
                    </button>
                    <button className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-sm">
                      CSV
                    </button>
                    <button className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-sm">
                      Excel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors cursor-pointer">
                Preview
              </button>
              <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer">
                Save Template
              </button>
              <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer">
                Generate Report
              </button>
            </div>
          </div>
        )}

        {activeTab === 'scheduled' && (
          <div className="space-y-6">
            {/* Scheduled Reports Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Report Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Frequency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Next Run
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Last Run
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Recipients
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportsData.scheduled.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 text-slate-400 mr-2" />
                          <span className="text-sm font-medium text-slate-900">{report.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-900">{report.frequency}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-900">{new Date(report.nextRun).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-900">{new Date(report.lastRun).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-900">{report.recipients}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          report.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-slate-400 hover:text-orange-600 transition-colors cursor-pointer">
                            <Settings size={16} />
                          </button>
                          <button className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer">
                            <Download size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-6">
            {/* Report Templates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportsData.templates.map((template) => (
                <div key={template.id} className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-slate-400 mr-2" />
                      <span className="text-sm font-medium text-slate-900">{template.name}</span>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      template.type === 'Financial' ? 'bg-green-100 text-green-800' :
                      template.type === 'Units' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {template.type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{template.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Last Generated:</span>
                      <span>{new Date(template.lastGenerated).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Frequency:</span>
                      <span>{template.frequency}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Recipients:</span>
                      <span>{template.recipients.length}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
                    <button className="flex-1 px-3 py-1 text-xs bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors cursor-pointer">
                      Generate
                    </button>
                    <button className="flex-1 px-3 py-1 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 rounded transition-colors cursor-pointer">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
