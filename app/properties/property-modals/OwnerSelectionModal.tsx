'use client';

import { useState, useEffect } from 'react';
import { X, Search, User } from 'lucide-react';
import { propertyApiAdapter } from '@/lib/api/adapters/propertyApiAdapter';

interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country?: string;
  flag?: string;
}

interface OwnerSelectionModalProps {
  isOpen: boolean;
  currentOwnerId?: string;
  onSave: (ownerIds: string[]) => Promise<boolean>;
  onClose: () => void;
}

export default function OwnerSelectionModal({
  isOpen,
  currentOwnerId,
  onSave,
  onClose,
}: OwnerSelectionModalProps) {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<Owner[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>(currentOwnerId || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load owners on mount
  useEffect(() => {
    if (isOpen) {
      loadOwners();
    }
  }, [isOpen]);

  // Filter owners when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOwners(owners);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = owners.filter(
        (owner) =>
          owner.firstName.toLowerCase().includes(query) ||
          owner.lastName.toLowerCase().includes(query) ||
          owner.email.toLowerCase().includes(query) ||
          (owner.phone && owner.phone.includes(query))
      );
      setFilteredOwners(filtered);
    }
  }, [searchQuery, owners]);

  const loadOwners = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await propertyApiAdapter.getOwners();

      if (response.success && response.data) {
        setOwners(response.data);
        setFilteredOwners(response.data);
      } else {
        setError(response.error || 'Failed to load owners');
      }
    } catch (err) {
      console.error('Error loading owners:', err);
      setError('Failed to load owners');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedOwnerId) {
      setError('Please select an owner');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const success = await onSave([selectedOwnerId]);
      
      if (success) {
        onClose();
      } else {
        setError('Failed to update owner');
      }
    } catch (err) {
      console.error('Error saving owner:', err);
      setError('Failed to update owner');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select Owner</h2>
            <p className="text-sm text-gray-500 mt-1">Choose a property owner from the list</p>
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
              placeholder="Search by name, email, or phone..."
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
              <span className="ml-3 text-gray-600">Loading owners...</span>
            </div>
          ) : filteredOwners.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                {searchQuery ? 'No owners found matching your search' : 'No owners available'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOwners.map((owner) => (
                <label
                  key={owner.id}
                  className={`flex items-center space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedOwnerId === owner.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="owner"
                    value={owner.id}
                    checked={selectedOwnerId === owner.id}
                    onChange={(e) => setSelectedOwnerId(e.target.value)}
                    className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {owner.firstName[0]}{owner.lastName[0]}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-gray-900">
                            {owner.firstName} {owner.lastName}
                          </p>
                          {owner.flag && (
                            <span className="text-lg" title={owner.country}>
                              {owner.flag}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-3 mt-1">
                          <p className="text-sm text-gray-600">{owner.email}</p>
                          {owner.phone && (
                            <>
                              <span className="text-gray-300">•</span>
                              <p className="text-sm text-gray-600">{owner.phone}</p>
                            </>
                          )}
                        </div>
                        {owner.country && (
                          <p className="text-xs text-gray-500 mt-1">{owner.country}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
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
            disabled={!selectedOwnerId || isSaving}
            className="px-6 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <span>Select Owner</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

