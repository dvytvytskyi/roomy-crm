'use client';

import React, { useState, useEffect } from 'react';
import { amenityApiAdapter, Amenity } from '@/lib/api/amenityApiAdapter';

interface AmenitiesManagerProps {
  propertyId: string;
  currentAmenities: Amenity[];
  onAmenitiesUpdate: (amenityIds: string[]) => Promise<boolean>;
  isLoading?: boolean;
}

export default function AmenitiesManager({ 
  propertyId, 
  currentAmenities, 
  onAmenitiesUpdate, 
  isLoading = false 
}: AmenitiesManagerProps) {
  const [allAmenities, setAllAmenities] = useState<Amenity[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>([]);
  const [isLoadingAmenities, setIsLoadingAmenities] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load amenities and categories on component mount
  useEffect(() => {
    loadAmenities();
    loadCategories();
  }, []);

  // Update selected amenities when currentAmenities change
  useEffect(() => {
    setSelectedAmenityIds(currentAmenities.map(amenity => amenity.id));
  }, [currentAmenities]);

  const loadAmenities = async () => {
    try {
      setIsLoadingAmenities(true);
      setError(null);
      
      const response = await amenityApiAdapter.getAll({
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
        limit: 100 // Load all amenities
      });
      
      setAllAmenities(response.data);
    } catch (error) {
      console.error('Error loading amenities:', error);
      setError('Failed to load amenities');
    } finally {
      setIsLoadingAmenities(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categories = await amenityApiAdapter.getCategories();
      setCategories(categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Reload amenities when category or search changes
  useEffect(() => {
    loadAmenities();
  }, [selectedCategory, searchQuery]);

  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenityIds(prev => {
      if (prev.includes(amenityId)) {
        return prev.filter(id => id !== amenityId);
      } else {
        return [...prev, amenityId];
      }
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      const success = await onAmenitiesUpdate(selectedAmenityIds);
      
      if (success) {
        console.log('✅ Amenities updated successfully');
      } else {
        setError('Failed to update amenities');
      }
    } catch (error) {
      console.error('Error saving amenities:', error);
      setError('Failed to save amenities');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedAmenityIds(currentAmenities.map(amenity => amenity.id));
  };

  const hasChanges = () => {
    const currentIds = currentAmenities.map(amenity => amenity.id).sort();
    const selectedIds = [...selectedAmenityIds].sort();
    return JSON.stringify(currentIds) !== JSON.stringify(selectedIds);
  };

  // Group amenities by category
  const groupedAmenities = allAmenities.reduce((groups, amenity) => {
    const category = amenity.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(amenity);
    return groups;
  }, {} as Record<string, Amenity[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Manage Amenities</h3>
        <div className="text-sm text-gray-500">
          {selectedAmenityIds.length} selected
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Category Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search amenities..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Amenities List */}
      <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
        {isLoadingAmenities ? (
          <div className="p-4 text-center text-gray-500">
            Loading amenities...
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {Object.entries(groupedAmenities).map(([category, amenities]) => (
              <div key={category} className="space-y-2">
                <h4 className="font-medium text-gray-900 text-sm">{category}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {amenities.map(amenity => (
                    <label
                      key={amenity.id}
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAmenityIds.includes(amenity.id)}
                        onChange={() => handleAmenityToggle(amenity.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex items-center space-x-2">
                        {amenity.icon && (
                          <span className="text-lg">{amenity.icon}</span>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {amenity.name}
                          </div>
                          {amenity.description && (
                            <div className="text-xs text-gray-500">
                              {amenity.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={handleCancel}
          disabled={isSaving || isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || isLoading || !hasChanges()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
