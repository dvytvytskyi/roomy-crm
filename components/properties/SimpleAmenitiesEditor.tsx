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
    console.log('[SimpleAmenitiesEditor] currentAmenities received:', currentAmenities);
    console.log('[SimpleAmenitiesEditor] currentAmenities type:', typeof currentAmenities);
    console.log('[SimpleAmenitiesEditor] currentAmenities length:', currentAmenities?.length);
    
    if (currentAmenities && Array.isArray(currentAmenities)) {
      const ids = currentAmenities.map(amenity => {
        console.log('[SimpleAmenitiesEditor] Processing amenity:', amenity, 'type:', typeof amenity);
        return amenity.id;
      }).filter(Boolean); // Filter out any undefined/null IDs
      
      console.log('[SimpleAmenitiesEditor] Setting selected amenity IDs:', ids);
      setSelectedAmenityIds(ids);
    } else {
      console.log('[SimpleAmenitiesEditor] No current amenities or not an array');
      setSelectedAmenityIds([]);
    }
  }, [currentAmenities]);

  // Static list of amenities to avoid API issues
  // Real amenities from database with correct CUIDs
  const staticAmenities: Amenity[] = [
    { id: 'cmgijzt3i000b9e5ixur6r5qa', name: 'Air Conditioning', icon: '❄️', category: 'Climate', description: 'Air conditioning', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i000i9e5ijdhdj5b1', name: 'Balcony', icon: '🌅', category: 'Outdoor', description: 'Balcony or terrace', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i00099e5ip5ez6baf', name: 'Bathtub', icon: '🛁', category: 'Bathroom', description: 'Bathtub available', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i000o9e5iox1emza5', name: 'Carbon Monoxide Alarm', icon: '⚠️', category: 'Safety', description: 'Carbon monoxide alarm', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i00049e5imvlk96cy', name: 'Coffee Maker', icon: '☕', category: 'Kitchen', description: 'Coffee maker', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i000y9e5iwig1dehx', name: 'Concierge', icon: '🎩', category: 'Luxury', description: 'Concierge service', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i00059e5iwqzqvpz6', name: 'Dining Table', icon: '🪑', category: 'Kitchen', description: 'Dining table', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i00039e5i649y5oex', name: 'Dishwasher', icon: '🍽️', category: 'Kitchen', description: 'Dishwasher available', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i000h9e5i8mi105uc', name: 'Dryer', icon: '🌪️', category: 'Laundry', description: 'Clothes dryer', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i000t9e5igf4o7n8l', name: 'Elevator', icon: '🛗', category: 'Accessibility', description: 'Elevator access', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i000q9e5io5zvjjxa', name: 'Fire Extinguisher', icon: '🧯', category: 'Safety', description: 'Fire extinguisher', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i000p9e5iqypmg6w9', name: 'First Aid Kit', icon: '🏥', category: 'Safety', description: 'First aid kit', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i000j9e5iu3asc8az', name: 'Garden', icon: '🌿', category: 'Outdoor', description: 'Garden access', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i000m9e5immdo3iu5', name: 'Gym', icon: '💪', category: 'Fitness', description: 'Gym or fitness center', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i000a9e5ifmaws1ws', name: 'Hair Dryer', icon: '💨', category: 'Bathroom', description: 'Hair dryer', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i000c9e5izqpdn71f', name: 'Heating', icon: '🔥', category: 'Climate', description: 'Heating system', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i00079e5izmdpng7k', name: 'Hot Water', icon: '♨️', category: 'Bathroom', description: 'Hot water available', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i000w9e5ippvw2ore', name: 'Jacuzzi', icon: '🛁', category: 'Luxury', description: 'Jacuzzi or hot tub', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3h00009e5iafn33js0', name: 'Kitchen', icon: '🍳', category: 'Kitchen', description: 'Fully equipped kitchen', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i00029e5ihkndpyjs', name: 'Microwave', icon: '📡', category: 'Kitchen', description: 'Microwave oven', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i000l9e5i1g4r7uha', name: 'Parking', icon: '🅿️', category: 'Parking', description: 'Free parking', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i000v9e5ikl2xvx9k', name: 'Pet Bowls', icon: '🥣', category: 'Pets', description: 'Pet bowls provided', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i000u9e5ibpuvg2u7', name: 'Pet Friendly', icon: '🐕', category: 'Pets', description: 'Pet friendly', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i000k9e5ic4ij01la', name: 'Pool', icon: '🏊', category: 'Outdoor', description: 'Swimming pool', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i00069e5iu46xi28t', name: 'Private Bathroom', icon: '🚿', category: 'Bathroom', description: 'Private bathroom', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i00019e5ikbjn406m', name: 'Refrigerator', icon: '🧊', category: 'Kitchen', description: 'Refrigerator available', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i000z9e5iuoqm2ifz', name: 'Room Service', icon: '🍽️', category: 'Luxury', description: 'Room service', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i000x9e5i3su05963', name: 'Sauna', icon: '🧖', category: 'Luxury', description: 'Sauna available', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i000r9e5ispcg7jjy', name: 'Security Cameras', icon: '📹', category: 'Security', description: 'Security cameras', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i00089e5i6mpfc3zj', name: 'Shower', icon: '🚿', category: 'Bathroom', description: 'Shower available', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i000n9e5iku8gtxga', name: 'Smoke Alarm', icon: '🚨', category: 'Safety', description: 'Smoke alarm', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i000d9e5ikzktibo8', name: 'TV', icon: '📺', category: 'Entertainment', description: 'Television', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i000g9e5iczg7c5w3', name: 'Washing Machine', icon: '🧺', category: 'Laundry', description: 'Washing machine', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i000s9e5ihp5vbxl7', name: 'Wheelchair Accessible', icon: '♿', category: 'Accessibility', description: 'Wheelchair accessible', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i000e9e5ik4foddcq', name: 'WiFi', icon: '📶', category: 'Internet', description: 'Free WiFi', is_active: true, created_at: '', updated_at: '' },
    { id: 'cmgijzt3i000f9e5ieuh6qgk6', name: 'Workspace', icon: '💻', category: 'Work', description: 'Dedicated workspace', is_active: true, created_at: '', updated_at: '' },
  ];

  const loadAmenities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('[SimpleAmenitiesEditor] Loading amenities from static list (36 amenities)');
      
      // Use static amenities directly - reliable and fast
      setAllAmenities(staticAmenities);
      
      console.log('[SimpleAmenitiesEditor] Loaded amenities successfully:', staticAmenities.length);
    } catch (err) {
      console.error('[SimpleAmenitiesEditor] Error loading amenities:', err);
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
