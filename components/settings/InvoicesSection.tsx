'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Eye, Download, FileText, CreditCard, DollarSign, Calendar, Settings } from 'lucide-react'
import CreateInvoiceTemplateModal from './CreateInvoiceTemplateModal'

interface InvoicesSectionProps {
  onSettingsChange: () => void
}

export default function InvoicesSection({ onSettingsChange }: InvoicesSectionProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'templates' | 'automation' | 'tax' | 'payment' | 'history'>('templates')

  // Mock data for invoices
  const invoicesData = {
    templates: [
      {
        id: 1,
        name: 'Guest Invoice Template',
        type: 'Guest Invoice',
        description: 'Standard invoice for guest payments',
        isDefault: true,
        lastModified: '2024-01-15',
        usage: 47
      },
      {
        id: 2,
        name: 'Owner Payout Template',
        type: 'Owner Payout',
        description: 'Invoice for owner payouts and commissions',
        isDefault: true,
        lastModified: '2024-01-14',
        usage: 23
      },
      {
        id: 3,
        name: 'Contractor Payment Template',
        type: 'Contractor Payment',
        description: 'Invoice for contractor and service payments',
        isDefault: false,
        lastModified: '2024-01-12',
        usage: 8
      },
      {
        id: 4,
        name: 'Monthly Rent Template',
        type: 'Monthly Rent',
        description: 'Recurring monthly rent invoice',
        isDefault: false,
        lastModified: '2024-01-10',
        usage: 12
      }
    ],
    automation: {
      autoInvoicingEnabled: true,
      triggerEvents: [
        { event: 'Reservation Confirmed', enabled: true },
        { event: 'Payment Received', enabled: false },
        { event: 'Check-out Completed', enabled: true },
        { event: 'Monthly Rent Due', enabled: true }
      ],
      scheduling: {
        monthlyRentDay: 1,
        reminderDays: [7, 3, 1],
        autoSend: true
      }
    },
    tax: {
      defaultTaxRate: 5.0,
      defaultTaxType: 'percentage', // 'percentage' or 'fixed'
      taxTypes: [
        { name: 'VAT', rate: 5.0, type: 'percentage', description: 'Value Added Tax', isDefault: true },
        { name: 'Tourism Tax', rate: 2.0, type: 'percentage', description: 'Dubai Tourism Tax', isDefault: false },
        { name: 'Service Fee', rate: 3.0, type: 'percentage', description: 'Service Charge', isDefault: false },
        { name: 'City Tax', rate: 15.0, type: 'fixed', description: 'Fixed city tax per booking', isDefault: false }
      ],
      taxInclusive: false
    },
    payment: {
      gateways: [
        { name: 'Stripe', status: 'Connected', fees: '2.9% + AED 1.00' },
        { name: 'PayPal', status: 'Connected', fees: '3.4% + AED 0.50' },
        { name: 'Bank Transfer', status: 'Available', fees: 'No fees' }
      ],
      defaultGateway: 'Stripe',
      autoPaymentReminders: false,
      reminderFrequency: 'Every 3 days'
    },
    history: [
      {
        id: 1,
        invoiceNumber: 'INV-2024-001',
        recipient: 'John Smith',
        amount: 2450,
        status: 'Paid',
        date: '2024-01-15',
        type: 'Guest Invoice'
      },
      {
        id: 2,
        invoiceNumber: 'INV-2024-002',
        recipient: 'Ahmed Al-Rashid',
        amount: 8500,
        status: 'Pending',
        date: '2024-01-14',
        type: 'Owner Payout'
      },
      {
        id: 3,
        invoiceNumber: 'INV-2024-003',
        recipient: 'Clean Pro Services',
        amount: 450,
        status: 'Paid',
        date: '2024-01-13',
        type: 'Contractor Payment'
      }
    ]
  }

  const tabs = [
    { id: 'templates', label: 'Invoice Templates', icon: FileText },
    { id: 'automation', label: 'Automated Invoicing', icon: Calendar },
    { id: 'tax', label: 'Tax Management', icon: DollarSign },
    { id: 'payment', label: 'Payment Integration', icon: CreditCard },
    { id: 'history', label: 'Invoice History', icon: Eye }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
      case 'Connected':
        return 'bg-green-100 text-green-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Overdue':
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
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-medium text-slate-900">Invoices</h2>
          <p className="text-sm text-slate-500">Manage invoice templates, automation, and payment settings</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center"
        >
          <Plus size={16} className="mr-2" />
          Create Template
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
        {activeTab === 'templates' && (
          <div className="space-y-4">
            {invoicesData.templates.map((template) => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-md font-medium text-slate-900">{template.name}</h3>
                      {template.isDefault && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{template.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                      <span>Type: {template.type}</span>
                      <span>Used {template.usage} times</span>
                      <span>Modified: {new Date(template.lastModified).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-orange-600 transition-colors cursor-pointer">
                      <Edit size={16} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-600 transition-colors cursor-pointer">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'automation' && (
          <div className="space-y-6">
            {/* Auto-Invoicing Settings */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Automated Invoicing</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    id="autoInvoicing" 
                    defaultChecked={invoicesData.automation.autoInvoicingEnabled}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" 
                  />
                  <label htmlFor="autoInvoicing" className="text-sm text-slate-700">Enable automated invoicing</label>
                </div>
              </div>
            </div>

            {/* Trigger Events */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Trigger Events</h3>
              <div className="space-y-3">
                {invoicesData.automation.triggerEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-900">{event.event}</span>
                    <input 
                      type="checkbox" 
                      defaultChecked={event.enabled}
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" 
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Scheduling */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Scheduling</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Rent Day</label>
                  <select className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Reminder Days Before Due</label>
                  <input 
                    type="text" 
                    defaultValue="7, 3, 1"
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="7, 3, 1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tax' && (
          <div className="space-y-6">
            {/* Tax Settings */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Tax Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Default Tax Type</label>
                  <select 
                    defaultValue={invoicesData.tax.defaultTaxType}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (AED)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Default Tax Rate {invoicesData.tax.defaultTaxType === 'percentage' ? '(%)' : '(AED)'}
                  </label>
                  <input 
                    type="number" 
                    step={invoicesData.tax.defaultTaxType === 'percentage' ? '0.1' : '0.01'}
                    defaultValue={invoicesData.tax.defaultTaxRate}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    id="taxInclusive" 
                    defaultChecked={invoicesData.tax.taxInclusive}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" 
                  />
                  <label htmlFor="taxInclusive" className="text-sm text-slate-700">Tax inclusive pricing</label>
                </div>
              </div>
            </div>

            {/* Tax Types */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-medium text-slate-900">Tax Types</h3>
                <button className="px-3 py-1 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center">
                  <Plus size={14} className="mr-1" />
                  Add Tax Type
                </button>
              </div>
              <div className="space-y-3">
                {invoicesData.tax.taxTypes.map((tax, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-sm font-medium text-slate-900">{tax.name}</h4>
                        {tax.isDefault && (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            Default
                          </span>
                        )}
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          tax.type === 'percentage' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {tax.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{tax.description}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-slate-900">
                        {tax.rate}{tax.type === 'percentage' ? '%' : ' AED'}
                      </span>
                      <button className="p-2 text-slate-400 hover:text-orange-600 transition-colors cursor-pointer">
                        <Edit size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="space-y-6">
            {/* Payment Gateways */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Payment Gateways</h3>
              <div className="space-y-3">
                {invoicesData.payment.gateways.map((gateway, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-sm font-medium text-slate-900">{gateway.name}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(gateway.status)}`}>
                          {gateway.status}
                        </span>
                        {gateway.name === invoicesData.payment.defaultGateway && (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">Fees: {gateway.fees}</p>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-orange-600 transition-colors cursor-pointer">
                      <Settings size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Settings */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Payment Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    id="autoReminders" 
                    defaultChecked={invoicesData.payment.autoPaymentReminders}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" 
                  />
                  <label htmlFor="autoReminders" className="text-sm text-slate-700">Enable automatic payment reminders</label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Reminder Frequency</label>
                  <select className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option value="daily">Daily</option>
                    <option value="3days" selected>Every 3 days</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {invoicesData.history.map((invoice) => (
              <div key={invoice.id} className="border border-gray-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-md font-medium text-slate-900">{invoice.invoiceNumber}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">To: {invoice.recipient}</p>
                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                      <span>Type: {invoice.type}</span>
                      <span>Date: {new Date(invoice.date).toLocaleDateString()}</span>
                      <span>Amount: {formatCurrency(invoice.amount)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-green-600 transition-colors cursor-pointer">
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Invoice Template Modal */}
      <CreateInvoiceTemplateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={(template) => {
          console.log('Creating invoice template:', template)
          onSettingsChange()
        }}
      />
    </div>
  )
}
