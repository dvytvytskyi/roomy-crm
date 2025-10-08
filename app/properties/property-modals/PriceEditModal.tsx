'use client';

import { useState, useEffect } from 'react';
import { X, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

interface PriceEditModalProps {
  isOpen: boolean;
  initialPrice: number;
  onSave: (price: number) => Promise<boolean>;
  onClose: () => void;
}

export default function PriceEditModal({
  isOpen,
  initialPrice,
  onSave,
  onClose,
}: PriceEditModalProps) {
  const [price, setPrice] = useState('0');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPrice(initialPrice.toString());
      setError(null);
    }
  }, [isOpen, initialPrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const priceValue = parseFloat(price);
    
    if (isNaN(priceValue) || priceValue <= 0) {
      setError('Please enter a valid price');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const success = await onSave(priceValue);
      
      if (success) {
        onClose();
      } else {
        setError('Failed to update price');
      }
    } catch (err) {
      console.error('Error saving price:', err);
      setError('Failed to update price');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const priceValue = parseFloat(price) || 0;
  const monthlyRevenue = priceValue * 30;
  const yearlyRevenue = priceValue * 365;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Base Price</h2>
            <p className="text-sm text-gray-500 mt-1">Set the base price per night</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSaving}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Price Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price per Night (AED) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-3xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Revenue Projections */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-orange-900">Revenue Projections</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Monthly (30 nights)</p>
                <p className="text-2xl font-bold text-gray-900">
                  AED {monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Yearly (365 nights)</p>
                <p className="text-2xl font-bold text-gray-900">
                  AED {yearlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <p className="text-xs text-orange-700 mt-3">
              * Estimates based on full occupancy. Actual revenue may vary.
            </p>
          </div>

          {/* Quick Price Options */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Quick Set Prices</h4>
            <div className="grid grid-cols-3 gap-2">
              {[300, 500, 750, 1000, 1500, 2000].map((quickPrice) => (
                <button
                  key={quickPrice}
                  type="button"
                  onClick={() => setPrice(quickPrice.toString())}
                  className={`px-4 py-3 rounded-lg border-2 transition-all text-center ${
                    price === quickPrice.toString()
                      ? 'border-orange-500 bg-orange-50 text-orange-700 font-semibold'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  AED {quickPrice}
                </button>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Pricing Tips</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Research competitor pricing in your area</li>
              <li>• Consider seasonal adjustments</li>
              <li>• Factor in your property's unique features</li>
              <li>• Use dynamic pricing for optimal revenue</li>
            </ul>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving || !price || parseFloat(price) <= 0}
            className="px-6 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Price</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

