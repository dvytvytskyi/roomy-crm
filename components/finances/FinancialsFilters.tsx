'use client'

import { useState } from 'react'
import { X, Calendar, Filter, DollarSign } from 'lucide-react'

import { FinancialFilters } from '../../lib/api/services/financeService'

interface FinancialsFiltersProps {
  onClose: () => void
  dateRange: {
    from: string
    to: string
  }
  onDateRangeChange: (range: { from: string; to: string }) => void
  filters: FinancialFilters
  onFiltersChange: (filters: FinancialFilters) => void
}

export default function FinancialsFilters({ onClose, dateRange, onDateRangeChange, filters, onFiltersChange }: FinancialsFiltersProps) {

  const paymentStatuses = ['All', 'Completed', 'Pending', 'Failed']
  const paymentMethods = ['All', 'Credit Card', 'Bank Transfer', 'PayPal', 'Cash/Other']
  const transactionTypes = ['All', 'Payment', 'Refund', 'Expense']
  const paymentCategories = [
    'All Categories',
    'Reservation Payment',
    'Deposit',
    'Balance Payment',
    'Cleaning Fee',
    'Security Deposit',
    'Service Fee',
    'Tax Payment',
    'Refund',
    'Maintenance Fee',
    'Utility Payment',
    'Insurance Payment',
    'Other'
  ]
  const platforms = ['All', 'Airbnb', 'Booking.com', 'Direct', 'Expedia']
  const properties = [
    'All Properties',
    'Apartment Burj Khalifa 2',
    'Marina View Studio',
    'Downtown Loft 2BR',
    'JBR Beach Apartment',
    'Business Bay Office',
    'DIFC Penthouse'
  ]

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value === 'All' || value === 'All Categories' || value === 'All Properties' || value === '' ? undefined : [value]
    }
    onFiltersChange(newFilters)
  }

  const handleAmountRangeChange = (key: 'amountMin' | 'amountMax', value: string) => {
    const newFilters = {
      ...filters,
      [key]: value ? parseFloat(value) : undefined
    }
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    onFiltersChange({})
    onDateRangeChange({ from: '', to: '' })
  }

  const applyFilters = () => {
    onClose()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-slate-900">Filters</h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Date Range
          </label>
          <div className="space-y-2">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="From date"
            />
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="To date"
            />
          </div>
        </div>

        {/* Payment Status */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Payment Status
          </label>
          <select
            value={filters.paymentStatus?.[0] || 'All'}
            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {paymentStatuses.map(status => (
              <option key={status} value={status === 'All' ? '' : status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Payment Method
          </label>
          <select
            value={filters.paymentMethod?.[0] || 'All'}
            onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {paymentMethods.map(method => (
              <option key={method} value={method === 'All' ? '' : method}>
                {method}
              </option>
            ))}
          </select>
        </div>

        {/* Transaction Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Transaction Type
          </label>
          <select
            value={filters.transactionType?.[0] || 'All'}
            onChange={(e) => handleFilterChange('transactionType', e.target.value)}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {transactionTypes.map(type => (
              <option key={type} value={type === 'All' ? '' : type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Category */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Payment Category
          </label>
          <select
            value={filters.paymentCategory?.[0] || 'All Categories'}
            onChange={(e) => handleFilterChange('paymentCategory', e.target.value)}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {paymentCategories.map(category => (
              <option key={category} value={category === 'All Categories' ? '' : category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Platform */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Platform
          </label>
          <select
            value={filters.platform?.[0] || 'All'}
            onChange={(e) => handleFilterChange('platform', e.target.value)}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {platforms.map(platform => (
              <option key={platform} value={platform === 'All' ? '' : platform}>
                {platform}
              </option>
            ))}
          </select>
        </div>

        {/* Property */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Property
          </label>
          <select
            value={filters.property?.[0] || 'All Properties'}
            onChange={(e) => handleFilterChange('property', e.target.value)}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {properties.map(property => (
              <option key={property} value={property === 'All Properties' ? '' : property}>
                {property}
              </option>
            ))}
          </select>
        </div>

        {/* Amount Range */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Amount Range (AED)
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={filters.amountMin || ''}
              onChange={(e) => handleAmountRangeChange('amountMin', e.target.value)}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Min"
            />
            <input
              type="number"
              value={filters.amountMax || ''}
              onChange={(e) => handleAmountRangeChange('amountMax', e.target.value)}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Max"
            />
          </div>
        </div>

        {/* Guest Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Guest Name
          </label>
          <input
            type="text"
            value={filters.guest || ''}
            onChange={(e) => handleFilterChange('guest', e.target.value)}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Search by guest name"
          />
        </div>
      </div>

      {/* Filter Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={clearFilters}
          className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
        >
          Clear All Filters
        </button>
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}
