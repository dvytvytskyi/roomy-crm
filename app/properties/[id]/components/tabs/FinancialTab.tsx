'use client'

import { useState } from 'react'
import { DollarSign, TrendingUp, Plus } from 'lucide-react'

interface FinancialTabProps {
  propertyData: any
  onUpdate: (updates: any) => Promise<boolean>
}

export default function FinancialTab({ propertyData, onUpdate }: FinancialTabProps) {
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false)

  const financialSummary = {
    totalRevenue: propertyData?.financialData?.totalRevenue || 0,
    totalExpenses: propertyData?.financialData?.totalExpenses || 0,
    totalProfit: (propertyData?.financialData?.totalRevenue || 0) - (propertyData?.financialData?.totalExpenses || 0),
    ownerPayout: propertyData?.financialData?.ownerPayout || 0,
    companyRevenue: propertyData?.financialData?.companyRevenue || 0,
  }

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            AED {financialSummary.totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
            <TrendingUp className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            AED {financialSummary.totalExpenses.toLocaleString()}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Profit</h3>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            AED {financialSummary.totalProfit.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Income Distribution */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Income Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Owner Payout</span>
            <span className="text-lg font-bold text-blue-600">
              AED {financialSummary.ownerPayout.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Company Revenue</span>
            <span className="text-lg font-bold text-orange-600">
              AED {financialSummary.companyRevenue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            <Plus size={16} />
            <span>Add Expense</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Description</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              {propertyData?.expenses && propertyData.expenses.length > 0 ? (
                propertyData.expenses.map((expense: any, index: number) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{expense.category}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{expense.description}</td>
                    <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
                      AED {expense.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    No expenses recorded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Add Expense</h3>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center py-8">
              <p className="text-gray-500">Expense form coming soon...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

