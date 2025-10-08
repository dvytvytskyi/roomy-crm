'use client';

import { useState, useEffect } from 'react';
import { X, Search, Check } from 'lucide-react';
import { propertyApiAdapter } from '@/lib/api/adapters/propertyApiAdapter';

interface Amenity {
  id: string;
  name: string;
  category?: string;
  icon?: string;
}

interface AmenitiesEditModalProps {
  isOpen: boolean;
  selectedAmenityIds: string[];
  onSave: (amenityIds: string[]) => Promise<boolean>;
  onClose: () => void;
}

export default function AmenitiesEditModal({
  isOpen,
  selectedAmenityIds,
  onSave,
  onClose,
}: AmenitiesEditModalProps) {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [filteredAmenities, setFilteredAmenities] = useState<Amenity[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(selectedAmenityIds));
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load amenities on mount
  useEffect(() => {
    if (isOpen) {
      loadAmenities();
      setSelectedIds(new Set(selectedAmenityIds));
    }
  }, [isOpen, selectedAmenityIds]);

  // Filter amenities when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAmenities(amenities);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = amenities.filter((amenity) =>
        amenity.name.toLowerCase().includes(query) ||
        (amenity.category && amenity.category.toLowerCase().includes(query))
      );
      setFilteredAmenities(filtered);
    }
  }, [searchQuery, amenities]);

  const loadAmenities = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await propertyApiAdapter.getAmenities();

      if (response.success && response.data) {
        setAmenities(response.data);
        setFilteredAmenities(response.data);
      } else {
        setError(response.error || 'Failed to load amenities');
      }
    } catch (err) {
      console.error('Error loading amenities:', err);
      setError('Failed to load amenities');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAmenity = (amenityId: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(amenityId)) {
      newSelectedIds.delete(amenityId);
    } else {
      newSelectedIds.add(amenityId);
    }
    setSelectedIds(newSelectedIds);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const success = await onSave(Array.from(selectedIds));
      
      if (success) {
        onClose();
      } else {
        setError('Failed to update amenities');
      }
    } catch (err) {
      console.error('Error saving amenities:', err);
      setError('Failed to update amenities');
    } finally {
      setIsSaving(false);
    }
  };

  // Group amenities by category
  const groupedAmenities = filteredAmenities.reduce((acc, amenity) => {
    const category = amenity.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(amenity);
    return acc;
  }, {} as Record<string, Amenity[]>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Amenities</h2>
            <p className="text-sm text-gray-500 mt-1">
              {selectedIds.size} {selectedIds.size === 1 ? 'amenity' : 'amenities'} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSaving}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search amenities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span className="ml-3 text-gray-600">Loading amenities...</span>
            </div>
          ) : filteredAmenities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                {searchQuery ? 'No amenities found matching your search' : 'No amenities available'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedAmenities).map(([category, categoryAmenities]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categoryAmenities.map((amenity) => (
                      <label
                        key={amenity.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedIds.has(amenity.id)
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(amenity.id)}
                            onChange={() => toggleAmenity(amenity.id)}
                            className="sr-only"
                          />
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              selectedIds.has(amenity.id)
                                ? 'bg-orange-500 border-orange-500'
                                : 'bg-white border-gray-300'
                            }`}
                          >
                            {selectedIds.has(amenity.id) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                        <span className="flex-1 text-sm font-medium text-gray-900">
                          {amenity.icon && <span className="mr-2">{amenity.icon}</span>}
                          {amenity.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedIds.size} {selectedIds.size === 1 ? 'amenity' : 'amenities'} selected
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

