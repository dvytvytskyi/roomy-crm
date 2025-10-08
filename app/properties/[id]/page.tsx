'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { propertyApiAdapter, PropertyDetailed } from '@/lib/api/adapters/propertyApiAdapter';
import Toast from '@/components/Toast';

// Import modals
import OwnerSelectionModal from '../property-modals/OwnerSelectionModal';
import GeneralInfoEditModal from '../property-modals/GeneralInfoEditModal';
import AmenitiesEditModal from '../property-modals/AmenitiesEditModal';

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  // Centralized state for all property data
  const [propertyData, setPropertyData] = useState<PropertyDetailed | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Toast state
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ show: false, message: '', type: 'info' });

  // Modal states
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [isGeneralInfoModalOpen, setIsGeneralInfoModalOpen] = useState(false);
  const [isAmenitiesModalOpen, setIsAmenitiesModalOpen] = useState(false);

  /**
   * Show toast notification
   */
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000);
  }, []);

  /**
   * Universal function to handle all property updates
   */
  const handlePropertyUpdate = useCallback(async (updates: Partial<PropertyDetailed>): Promise<boolean> => {
    if (!propertyId) return false;

    try {
      console.log('Updating property with:', updates);

      let response;
      
      // Handle special cases that need specific endpoints
      if ('amenityIds' in updates) {
        response = await propertyApiAdapter.updateAmenities(propertyId, updates.amenityIds as string[]);
      } else if ('ownerIds' in updates) {
        response = await propertyApiAdapter.updateOwner(propertyId, updates.ownerIds as string[]);
    } else {
        // General update
        response = await propertyApiAdapter.update(propertyId, updates);
      }

      if (response.success && response.data) {
        setPropertyData(response.data);
        showToast('Property updated successfully', 'success');
        return true;
    } else {
        showToast(response.error || 'Failed to update property', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error updating property:', error);
      showToast('Failed to update property', 'error');
      return false;
    }
  }, [propertyId, showToast]);

  /**
   * Load property data from super endpoint
   */
  const loadPropertyData = useCallback(async () => {
    if (!propertyId) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('Loading property data for ID:', propertyId);
      const response = await propertyApiAdapter.getById(propertyId);

      if (response.success && response.data) {
        setPropertyData(response.data);
        console.log('Property data loaded:', response.data);
        } else {
        setError(response.error || 'Failed to load property data');
        showToast(response.error || 'Failed to load property data', 'error');
        }
      } catch (error) {
      console.error('Error loading property data:', error);
      setError('Failed to load property data');
      showToast('Failed to load property data', 'error');
      } finally {
      setIsLoading(false);
    }
  }, [propertyId, showToast]);

  /**
   * Handle property deletion
   */
  const handleDelete = useCallback(async () => {
    if (!propertyId) return;

    const confirmed = window.confirm('Are you sure you want to delete this property? This action cannot be undone.');
    if (!confirmed) return;

    try {
      const response = await propertyApiAdapter.delete(propertyId);
      
      if (response.success) {
        showToast('Property deleted successfully', 'success');
        router.push('/properties');
      } else {
        showToast(response.error || 'Failed to delete property', 'error');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      showToast('Failed to delete property', 'error');
    }
  }, [propertyId, router, showToast]);

  /**
   * Load data on component mount
   */
  useEffect(() => {
    loadPropertyData();
  }, [loadPropertyData]);

  // Loading state
  if (isLoading) {
                  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property data...</p>
                        </div>
                        </div>
    );
  }

  // Error state
  if (error || !propertyData) {
  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Property</h2>
          <p className="text-gray-600 mb-4">{error || 'Property not found'}</p>
        <button
            onClick={() => router.push('/properties')}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Properties
        </button>
      </div>
    </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Property Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between">
    <div>
              <h1 className="text-3xl font-bold text-gray-900">{propertyData.name}</h1>
              <p className="text-gray-600 mt-1">
                {propertyData.nickname && `"${propertyData.nickname}"`}
                {propertyData.nickname && propertyData.address && ' • '}
                {propertyData.address}
              </p>
          </div>
          <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                propertyData.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {propertyData.isActive ? 'Active' : 'Inactive'}
                </span>
                <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete Property
                </button>
              </div>
            </div>
          </div>

        {/* Property Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
              <div className="space-y-6">
                {/* Owner Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Owner Information</h2>
              {propertyData.owner ? (
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {propertyData.owner.firstName[0]}{propertyData.owner.lastName[0]}
                            </span>
                          </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {propertyData.owner.firstName} {propertyData.owner.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{propertyData.owner.email}</p>
                    {propertyData.owner.phone && (
                      <p className="text-sm text-gray-600">{propertyData.owner.phone}</p>
                    )}
                    </div>
                  </div>
                  ) : (
                <p className="text-gray-500">No owner assigned</p>
              )}
                        <button 
                onClick={() => setIsOwnerModalOpen(true)}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                Change Owner
                        </button>
                </div>

            {/* General Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">General Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">{propertyData.type}</p>
                        </div>
                <div>
                  <p className="text-sm text-gray-500">City</p>
                  <p className="font-medium">{propertyData.city}</p>
                        </div>
                          <div>
                  <p className="text-sm text-gray-500">Capacity</p>
                  <p className="font-medium">{propertyData.capacity} guests</p>
                          </div>
                          <div>
                  <p className="text-sm text-gray-500">Bedrooms</p>
                  <p className="font-medium">{propertyData.bedrooms}</p>
                          </div>
                          <div>
                  <p className="text-sm text-gray-500">Bathrooms</p>
                  <p className="font-medium">{propertyData.bathrooms}</p>
                          </div>
                          <div>
                  <p className="text-sm text-gray-500">Price per Night</p>
                  <p className="font-medium">AED {propertyData.pricePerNight}</p>
                          </div>
                        </div>
                              <button 
                onClick={() => setIsGeneralInfoModalOpen(true)}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Edit Information
                              </button>
                    </div>

            {/* Photos Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Photos</h2>
              {propertyData.photos && propertyData.photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {propertyData.photos.slice(0, 4).map((photo) => (
                    <div key={photo.id} className="relative">
                      <Image
                          src={photo.url}
                        alt={photo.alt || 'Property photo'}
                        width={200}
                        height={128}
                        className="w-full h-32 object-cover rounded-lg"
                        />
                        {photo.isCover && (
                          <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                              Cover
                            </span>
                          )}
                        </div>
                      ))}
                </div>
                  ) : (
                <p className="text-gray-500">No photos uploaded</p>
              )}
              <button className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                Manage Photos
                    </button>
                    </div>
                  </div>

          {/* Right Column */}
              <div className="space-y-6">
            {/* Financial Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Overview</h2>
              <div className="grid grid-cols-2 gap-4">
                    <div>
                  <p className="text-sm text-gray-500">Total Reservations</p>
                  <p className="font-medium text-2xl">{propertyData._count?.reservations || 0}</p>
                        </div>
                      <div>
                  <p className="text-sm text-gray-500">Total Transactions</p>
                  <p className="font-medium text-2xl">{propertyData._count?.transactions || 0}</p>
                      </div>
                      <div>
                  <p className="text-sm text-gray-500">Total Expenses</p>
                  <p className="font-medium text-2xl">{propertyData._count?.expenses || 0}</p>
                      </div>
                <div>
                  <p className="text-sm text-gray-500">Photos</p>
                  <p className="font-medium text-2xl">{propertyData._count?.photos || 0}</p>
                </div>
                        </div>
                        </div>
                    
            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h2>
              {propertyData.transactions && propertyData.transactions.length > 0 ? (
                <div className="space-y-3">
                  {propertyData.transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                        <p className="font-medium">{transaction.category}</p>
                        <p className="text-sm text-gray-500">{transaction.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">AED {transaction.amount}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                          ))}
                </div>
                      ) : (
                <p className="text-gray-500">No transactions yet</p>
              )}
              <button className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                Add Payment
                      </button>
                    </div>

            {/* Recent Expenses */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Expenses</h2>
              {propertyData.expenses && propertyData.expenses.length > 0 ? (
                  <div className="space-y-3">
                  {propertyData.expenses.slice(0, 5).map((expense) => (
                    <div key={expense.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <div>
                        <p className="font-medium">{expense.category}</p>
                        <p className="text-sm text-gray-500">{expense.description}</p>
                            </div>
                      <div className="text-right">
                        <p className="font-medium text-red-600">AED {expense.amount}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(expense.date).toLocaleDateString()}
                        </p>
                        </div>
                      </div>
                    ))}
                  </div>
              ) : (
                <p className="text-gray-500">No expenses yet</p>
              )}
              <button className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                Add Expense
                            </button>
                        </div>

            {/* Amenities */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
              {propertyData.amenities && propertyData.amenities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {propertyData.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                    >
                      {amenity}
                    </span>
                  ))}
                    </div>
                  ) : (
                <p className="text-gray-500">No amenities added</p>
              )}
                  <button
                onClick={() => setIsAmenitiesModalOpen(true)}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Manage Amenities
                  </button>
                </div>
          </div>
        </div>

        {/* Full Width Sections */}
        <div className="mt-6 space-y-6">
          {/* Description */}
          {propertyData.description && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700">{propertyData.description}</p>
            </div>
              <button className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                Edit Description
              </button>
        </div>
      )}

          {/* House Rules */}
          {propertyData.houseRules && propertyData.houseRules.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">House Rules</h2>
              <ul className="space-y-2">
                {propertyData.houseRules.map((rule, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="text-orange-500">•</span>
                    <span className="text-gray-700">{rule}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                Edit Rules
              </button>
        </div>
      )}
            </div>
              </div>
              
      {/* Modals */}
      <OwnerSelectionModal
        isOpen={isOwnerModalOpen}
        currentOwnerId={propertyData.ownerId}
        onSave={async (ownerIds) => {
          const success = await handlePropertyUpdate({ ownerIds } as any);
          if (success) {
            await loadPropertyData(); // Reload to get updated owner data
          }
          return success;
        }}
        onClose={() => setIsOwnerModalOpen(false)}
      />

      <GeneralInfoEditModal
        isOpen={isGeneralInfoModalOpen}
        initialData={propertyData}
        onSave={handlePropertyUpdate}
        onClose={() => setIsGeneralInfoModalOpen(false)}
      />

      <AmenitiesEditModal
        isOpen={isAmenitiesModalOpen}
        selectedAmenityIds={propertyData.amenities || []}
        onSave={async (amenityIds) => {
          return await handlePropertyUpdate({ amenityIds } as any);
        }}
        onClose={() => setIsAmenitiesModalOpen(false)}
                />
              </div>
  );
}
