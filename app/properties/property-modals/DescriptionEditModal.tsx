'use client';

import { useState, useEffect } from 'react';
import { X, FileText } from 'lucide-react';

interface DescriptionEditModalProps {
  isOpen: boolean;
  initialDescription: string;
  onSave: (description: string) => Promise<boolean>;
  onClose: () => void;
}

export default function DescriptionEditModal({
  isOpen,
  initialDescription,
  onSave,
  onClose,
}: DescriptionEditModalProps) {
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDescription(initialDescription || '');
      setError(null);
    }
  }, [isOpen, initialDescription]);

  const handleSave = async () => {
    if (!description.trim()) {
      setError('Description cannot be empty');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const success = await onSave(description.trim());
      
      if (success) {
        onClose();
      } else {
        setError('Failed to update description');
      }
    } catch (err) {
      console.error('Error saving description:', err);
      setError('Failed to update description');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const wordCount = description.trim().split(/\s+/).filter(Boolean).length;
  const charCount = description.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Property Description</h2>
            <p className="text-sm text-gray-500 mt-1">Provide detailed information about your property</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSaving}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="relative">
            <div className="absolute top-3 left-3 text-gray-400">
              <FileText className="w-5 h-5" />
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your property in detail. Include highlights, unique features, nearby attractions, and what makes it special..."
              className="w-full h-96 pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{charCount} characters</span>
            </div>
            <div>
              {charCount < 100 && (
                <span className="text-amber-600">Add more details (min 100 characters recommended)</span>
              )}
              {charCount >= 100 && charCount < 300 && (
                <span className="text-blue-600">Good length</span>
              )}
              {charCount >= 300 && (
                <span className="text-green-600">Excellent description</span>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Tips for a great description:</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Highlight unique features and amenities</li>
              <li>• Mention nearby attractions and points of interest</li>
              <li>• Describe the neighborhood and local area</li>
              <li>• Include details about the space and layout</li>
              <li>• Be honest and accurate in your description</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !description.trim()}
            className="px-6 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Description</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

