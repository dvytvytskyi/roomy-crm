'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { PropertyDetailed } from '@/lib/api/adapters/propertyApiAdapter';

interface AvailabilityEditModalProps {
  isOpen: boolean;
  initialSettings: Partial<PropertyDetailed>;
  onSave: (settings: Partial<PropertyDetailed>) => Promise<boolean>;
  onClose: () => void;
}

const BOOKING_WINDOW_OPTIONS = [
  { value: 'same-day', label: 'Same day' },
  { value: '1-day', label: '1 day in advance' },
  { value: '2-days', label: '2 days in advance' },
  { value: '3-days', label: '3 days in advance' },
  { value: '7-days', label: '1 week in advance' },
  { value: '14-days', label: '2 weeks in advance' },
  { value: '30-days', label: '1 month in advance' },
  { value: 'all-days', label: 'All future dates' },
];

const ADVANCE_NOTICE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'same-day', label: 'Same day' },
  { value: '1-day', label: '1 day' },
  { value: '2-days', label: '2 days' },
  { value: '3-days', label: '3 days' },
  { value: '7-days', label: '1 week' },
];

export default function AvailabilityEditModal({
  isOpen,
  initialSettings,
  onSave,
  onClose,
}: AvailabilityEditModalProps) {
  const [formData, setFormData] = useState({
    bookingWindow: 'all-days',
    advanceNotice: 'none',
    minStay: 1,
    maxStay: 365,
    checkInTime: '15:00',
    checkOutTime: '12:00',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        bookingWindow: initialSettings.bookingWindow || 'all-days',
        advanceNotice: initialSettings.advanceNotice || 'none',
        minStay: initialSettings.minStay || 1,
        maxStay: initialSettings.maxStay || 365,
        checkInTime: initialSettings.checkInTime || '15:00',
        checkOutTime: initialSettings.checkOutTime || '12:00',
      });
      setError(null);
    }
  }, [isOpen, initialSettings]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    // Validation
    if (formData.minStay < 1) {
      setError('Minimum stay must be at least 1 night');
      setIsSaving(false);
      return;
    }

    if (formData.maxStay < formData.minStay) {
      setError('Maximum stay must be greater than minimum stay');
      setIsSaving(false);
      return;
    }

    try {
      const success = await onSave(formData);
      
      if (success) {
        onClose();
      } else {
        setError('Failed to update availability settings');
      }
    } catch (err) {
      console.error('Error saving availability settings:', err);
      setError('Failed to update availability settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Availability Settings</h2>
            <p className="text-sm text-gray-500 mt-1">Configure booking rules and availability</p>
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
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Booking Window */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Booking Window</span>
                </div>
              </label>
              <select
                value={formData.bookingWindow}
                onChange={(e) => handleChange('bookingWindow', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {BOOKING_WINDOW_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                How far in advance can guests book?
              </p>
            </div>

            {/* Advance Notice */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Advance Notice</span>
                </div>
              </label>
              <select
                value={formData.advanceNotice}
                onChange={(e) => handleChange('advanceNotice', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {ADVANCE_NOTICE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Minimum notice required before check-in
              </p>
            </div>

            {/* Min/Max Stay */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Stay (nights)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.minStay}
                  onChange={(e) => handleChange('minStay', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Stay (nights)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxStay}
                  onChange={(e) => handleChange('maxStay', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Check-in/Check-out Times */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Time
                </label>
                <input
                  type="time"
                  value={formData.checkInTime}
                  onChange={(e) => handleChange('checkInTime', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Time
                </label>
                <input
                  type="time"
                  value={formData.checkOutTime}
                  onChange={(e) => handleChange('checkOutTime', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Tips</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Longer minimum stays often attract more serious guests</li>
                <li>• Flexible check-in times can increase bookings</li>
                <li>• Consider your cleaning schedule when setting times</li>
              </ul>
            </div>
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
            disabled={isSaving}
            className="px-6 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Settings</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

