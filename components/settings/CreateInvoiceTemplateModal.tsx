'use client'

import { useState } from 'react'
import { X, FileText, CreditCard, User, Building, DollarSign } from 'lucide-react'

interface CreateInvoiceTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (template: any) => void
}

export default function CreateInvoiceTemplateModal({ isOpen, onClose, onSave }: CreateInvoiceTemplateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Guest Invoice',
    description: '',
    isDefault: false,
    templateContent: '',
    includeTax: true,
    includeFees: true,
    includeDiscounts: true,
    paymentTerms: '30',
    currency: 'AED',
    language: 'English'
  })

  const templateTypes = [
    { value: 'Guest Invoice', label: 'Guest Invoice', icon: User, description: 'Invoice for guest payments' },
    { value: 'Owner Payout', label: 'Owner Payout', icon: Building, description: 'Invoice for owner payouts' },
    { value: 'Contractor Payment', label: 'Contractor Payment', icon: DollarSign, description: 'Invoice for contractor payments' },
    { value: 'Monthly Rent', label: 'Monthly Rent', icon: CreditCard, description: 'Recurring monthly rent invoice' }
  ]

  const currencies = ['AED', 'USD', 'EUR', 'GBP', 'SAR']
  const languages = ['English', 'Arabic', 'French', 'Spanish']

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const template = {
      id: Date.now(),
      name: formData.name,
      type: formData.type,
      description: formData.description,
      isDefault: formData.isDefault,
      lastModified: new Date().toISOString().split('T')[0],
      usage: 0,
      templateContent: formData.templateContent,
      settings: {
        includeTax: formData.includeTax,
        includeFees: formData.includeFees,
        includeDiscounts: formData.includeDiscounts,
        paymentTerms: formData.paymentTerms,
        currency: formData.currency,
        language: formData.language
      }
    }

    onSave(template)
    onClose()
    
    // Reset form
    setFormData({
      name: '',
      type: 'Guest Invoice',
      description: '',
      isDefault: false,
      templateContent: '',
      includeTax: true,
      includeFees: true,
      includeDiscounts: true,
      paymentTerms: '30',
      currency: 'AED',
      language: 'English'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-slate-900">Create Invoice Template</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Template Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Template Type</label>
            <div className="grid grid-cols-2 gap-3">
              {templateTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleInputChange('type', type.value)}
                    className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors cursor-pointer ${
                      formData.type === type.value
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Icon size={18} />
                    <div className="text-left">
                      <div className="text-sm font-medium">{type.label}</div>
                      <div className="text-xs text-slate-500">{type.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Template Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter template name"
                required
              />
            </div>
            <div className="flex items-center space-x-3">
              <input 
                type="checkbox" 
                id="isDefault" 
                checked={formData.isDefault}
                onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" 
              />
              <label htmlFor="isDefault" className="text-sm text-slate-700">Set as default template</label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter template description"
            />
          </div>

          {/* Template Settings */}
          <div>
            <h3 className="text-md font-medium text-slate-900 mb-4">Template Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {currencies.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {languages.map(language => (
                    <option key={language} value={language}>{language}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Payment Terms (days)</label>
                <input
                  type="number"
                  value={formData.paymentTerms}
                  onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="30"
                />
              </div>
            </div>
          </div>

          {/* Include Options */}
          <div>
            <h3 className="text-md font-medium text-slate-900 mb-3">Include in Invoice</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  id="includeTax" 
                  checked={formData.includeTax}
                  onChange={(e) => handleInputChange('includeTax', e.target.checked)}
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" 
                />
                <label htmlFor="includeTax" className="text-sm text-slate-700">Tax Information</label>
              </div>
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  id="includeFees" 
                  checked={formData.includeFees}
                  onChange={(e) => handleInputChange('includeFees', e.target.checked)}
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" 
                />
                <label htmlFor="includeFees" className="text-sm text-slate-700">Service Fees</label>
              </div>
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  id="includeDiscounts" 
                  checked={formData.includeDiscounts}
                  onChange={(e) => handleInputChange('includeDiscounts', e.target.checked)}
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" 
                />
                <label htmlFor="includeDiscounts" className="text-sm text-slate-700">Discounts</label>
              </div>
            </div>
          </div>

          {/* Template Content */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Template Content</label>
            <textarea
              value={formData.templateContent}
              onChange={(e) => handleInputChange('templateContent', e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter template content with placeholders like {guest_name}, {amount}, {date}, etc."
            />
            <p className="text-xs text-slate-500 mt-1">
              Use placeholders: {`{{guest_name}}, {{amount}}, {{date}}, {{property_name}}, {{invoice_number}}`}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer"
            >
              Create Template
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
