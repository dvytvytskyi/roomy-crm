'use client';

import React, { useState, useEffect } from 'react';
import { amenityApiAdapter, Amenity } from '@/lib/api/amenityApiAdapter';

interface SimpleAmenitiesEditorProps {
  propertyId: string;
  currentAmenities: Amenity[];
  onAmenitiesUpdate: (amenityIds: string[]) => Promise<boolean>;
  onClose: () => void;
}

export default function SimpleAmenitiesEditor({ 
  propertyId, 
  currentAmenities, 
  onAmenitiesUpdate,
  onClose
}: SimpleAmenitiesEditorProps) {
  const [allAmenities, setAllAmenities] = useState<Amenity[]>([]);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load amenities on component mount
  useEffect(() => {
    loadAmenities();
  }, []);

  // Update selected amenities when currentAmenities change
  useEffect(() => {
    setSelectedAmenityIds(currentAmenities.map(amenity => amenity.id));
  }, [currentAmenities]);

  const loadAmenities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await amenityApiAdapter.getAll();
      
      if (response.success && response.data) {
        setAllAmenities(response.data);
      } else {
        setError(response.message || 'Failed to load amenities');
      }
    } catch (err) {
      console.error('Error loading amenities:', err);
      setError('Failed to load amenities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenityIds(prev => 
      prev.includes(amenityId) 
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const success = await onAmenitiesUpdate(selectedAmenityIds);
      if (success) {
        onClose();
      }
    } catch (err) {
      console.error('Error saving amenities:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const activeAmenities = allAmenities.filter(amenity => amenity.is_active);
  const selectedCount = selectedAmenityIds.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Edit Amenities</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Select amenities for this property ({selectedCount} selected)
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={loadAmenities}
              className="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded"
            >
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading amenities...</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {activeAmenities.map((amenity) => (
              <div key={amenity.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                <input
                  type="checkbox"
                  id={`amenity-${amenity.id}`}
                  checked={selectedAmenityIds.includes(amenity.id)}
                  onChange={() => handleAmenityToggle(amenity.id)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label 
                  htmlFor={`amenity-${amenity.id}`}
                  className="flex items-center space-x-2 cursor-pointer flex-1"
                >
                  {amenity.icon && (
                    <span className="text-lg">{amenity.icon}</span>
                  )}
                  <span className="text-sm text-gray-700">{amenity.name}</span>
                  {amenity.description && (
                    <span className="text-xs text-gray-500">- {amenity.description}</span>
                  )}
                </label>
              </div>
            ))}
            
            {activeAmenities.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <p className="text-gray-500">No amenities available</p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
