'use client';

import { useState, useEffect } from 'react';
import { X, FileText } from 'lucide-react';
import { PropertyDetailed } from '@/lib/api/adapters/propertyApiAdapter';

interface MarketingEditModalProps {
  isOpen: boolean;
  initialData: Partial<PropertyDetailed>;
  onSave: (data: Partial<PropertyDetailed>) => Promise<boolean>;
  onClose: () => void;
}

export default function MarketingEditModal({
  isOpen,
  initialData,
  onSave,
  onClose,
}: MarketingEditModalProps) {
  const [formData, setFormData] = useState({
    summary: '',
    theSpace: '',
    guestAccess: '',
    otherThings: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        summary: initialData.summary || '',
        theSpace: initialData.theSpace || '',
        guestAccess: initialData.guestAccess || '',
        otherThings: initialData.otherThings || '',
      });
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const success = await onSave(formData);
      
      if (success) {
        onClose();
      } else {
        setError('Failed to update marketing information');
      }
    } catch (err) {
      console.error('Error saving marketing info:', err);
      setError('Failed to update marketing information');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const totalChars = Object.values(formData).join('').length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Marketing Content</h2>
            <p className="text-sm text-gray-500 mt-1">Create compelling descriptions for your listing</p>
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
            {/* Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Summary</span>
                </div>
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) => handleChange('summary', e.target.value)}
                placeholder="Brief summary of your property (shown in search results)..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.summary.length} characters • Keep it concise and engaging
              </p>
            </div>

            {/* The Space */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>The Space</span>
                </div>
              </label>
              <textarea
                value={formData.theSpace}
                onChange={(e) => handleChange('theSpace', e.target.value)}
                placeholder="Describe the space, layout, rooms, and interior features..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.theSpace.length} characters
              </p>
            </div>

            {/* Guest Access */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Guest Access</span>
                </div>
              </label>
              <textarea
                value={formData.guestAccess}
                onChange={(e) => handleChange('guestAccess', e.target.value)}
                placeholder="What areas guests can access (pool, gym, parking, etc.)..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.guestAccess.length} characters
              </p>
            </div>

            {/* Other Things to Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Other Things to Note</span>
                </div>
              </label>
              <textarea
                value={formData.otherThings}
                onChange={(e) => handleChange('otherThings', e.target.value)}
                placeholder="Additional information, special notes, nearby attractions..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.otherThings.length} characters
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-orange-900">Total Content</p>
                <p className="text-sm text-orange-700">{totalChars} characters across all fields</p>
              </div>
              <div className="text-right">
                {totalChars < 500 && (
                  <span className="text-amber-600 text-sm">Add more details</span>
                )}
                {totalChars >= 500 && totalChars < 1000 && (
                  <span className="text-blue-600 text-sm">Good length</span>
                )}
                {totalChars >= 1000 && (
                  <span className="text-green-600 text-sm">Excellent!</span>
                )}
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Marketing Tips</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Use vivid, descriptive language to paint a picture</li>
              <li>• Highlight unique features and amenities</li>
              <li>• Mention nearby attractions and transport</li>
              <li>• Be honest and accurate in descriptions</li>
              <li>• Use proper grammar and formatting</li>
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
            disabled={isSaving}
            className="px-6 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Marketing Content</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

