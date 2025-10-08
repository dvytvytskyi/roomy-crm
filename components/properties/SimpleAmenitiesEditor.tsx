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

  // Static list of amenities to avoid API issues
  const staticAmenities: Amenity[] = [
    { id: 'wifi', name: 'WiFi', icon: '📶', category: 'Internet', description: 'Free WiFi', is_active: true, created_at: '', updated_at: '' },
    { id: 'parking', name: 'Parking', icon: '🚗', category: 'Parking', description: 'Free parking', is_active: true, created_at: '', updated_at: '' },
    { id: 'pool', name: 'Swimming Pool', icon: '🏊', category: 'Outdoor', description: 'Swimming pool', is_active: true, created_at: '', updated_at: '' },
    { id: 'gym', name: 'Gym', icon: '🏋️', category: 'Fitness', description: 'Fitness center', is_active: true, created_at: '', updated_at: '' },
    { id: 'kitchen', name: 'Kitchen', icon: '🍳', category: 'Kitchen', description: 'Fully equipped kitchen', is_active: true, created_at: '', updated_at: '' },
    { id: 'ac', name: 'Air Conditioning', icon: '❄️', category: 'Climate', description: 'Air conditioning', is_active: true, created_at: '', updated_at: '' },
    { id: 'tv', name: 'TV', icon: '📺', category: 'Entertainment', description: 'Smart TV', is_active: true, created_at: '', updated_at: '' },
    { id: 'washer', name: 'Washing Machine', icon: '🧺', category: 'Laundry', description: 'Washing machine', is_active: true, created_at: '', updated_at: '' },
    { id: 'balcony', name: 'Balcony', icon: '🏡', category: 'Outdoor', description: 'Private balcony', is_active: true, created_at: '', updated_at: '' },
    { id: 'elevator', name: 'Elevator', icon: '🛗', category: 'Accessibility', description: 'Elevator access', is_active: true, created_at: '', updated_at: '' },
    { id: 'security', name: 'Security', icon: '🔒', category: 'Security', description: '24/7 security', is_active: true, created_at: '', updated_at: '' },
    { id: 'pets', name: 'Pet Friendly', icon: '🐕', category: 'Pets', description: 'Pet friendly', is_active: true, created_at: '', updated_at: '' },
    { id: 'hot-tub', name: 'Hot Tub', icon: '🛁', category: 'Luxury', description: 'Hot tub/Jacuzzi', is_active: true, created_at: '', updated_at: '' },
    { id: 'concierge', name: 'Concierge', icon: '🏨', category: 'Luxury', description: 'Concierge service', is_active: true, created_at: '', updated_at: '' },
    { id: 'sauna', name: 'Sauna', icon: '🧖', category: 'Luxury', description: 'Sauna', is_active: true, created_at: '', updated_at: '' },
  ];

  const loadAmenities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Loading amenities...');
      
      // Try API first, fallback to static list
      try {
        const response = await amenityApiAdapter.getAll({ limit: 100 });
        console.log('Amenities API response:', response);
        
        if (response.success && response.data) {
          const amenities = response.data.data || [];
          console.log('Loaded amenities from API:', amenities);
          setAllAmenities(amenities);
        } else {
          console.log('API failed, using static amenities');
          setAllAmenities(staticAmenities);
        }
      } catch (apiError) {
        console.log('API error, using static amenities:', apiError);
        setAllAmenities(staticAmenities);
      }
    } catch (err) {
      console.error('Error loading amenities:', err);
      setAllAmenities(staticAmenities); // Fallback to static list
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
      console.log('[SimpleAmenitiesEditor] Starting save with amenity IDs:', selectedAmenityIds);
      console.log('[SimpleAmenitiesEditor] Property ID:', propertyId);
      
      const success = await onAmenitiesUpdate(selectedAmenityIds);
      console.log('[SimpleAmenitiesEditor] Save result:', success);
      
      if (success) {
        console.log('[SimpleAmenitiesEditor] Save successful, closing modal');
        onClose();
      } else {
        console.error('[SimpleAmenitiesEditor] Save failed');
      }
    } catch (err) {
      console.error('[SimpleAmenitiesEditor] Error saving amenities:', err);
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
