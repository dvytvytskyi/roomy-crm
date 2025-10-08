'use client'

import { useState } from 'react';
import { Edit, Mail, Phone, User, DollarSign } from 'lucide-react';
import { usePropertyDetails } from '../../hooks/usePropertyDetails';
import Toast from '../Toast';

interface PropertyOverviewProps {
  propertyId: string;
  propertyData: any;
  owner?: any;
  onPropertyUpdate: (updates: any) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  onEditAmenities?: () => void; // Callback for amenities edit
}

interface OwnerSelectionModalProps {
  isOpen: boolean;
  owners: any[];
  loading: boolean;
  onSelect: (ownerId: string) => void;
  onClose: () => void;
}

function OwnerSelectionModal({ isOpen, owners, loading, onSelect, onClose }: OwnerSelectionModalProps) {
  const [selectedOwnerId, setSelectedOwnerId] = useState('');

  if (!isOpen) return null;

  const handleSelect = () => {
    if (selectedOwnerId) {
      onSelect(selectedOwnerId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Select Owner</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading owners...</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {owners.map((owner) => (
              <label
                key={owner.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedOwnerId === owner.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="owner"
                  value={owner.id}
                  checked={selectedOwnerId === owner.id}
                  onChange={(e) => setSelectedOwnerId(e.target.value)}
                  className="text-orange-500 focus:ring-orange-500"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{owner.flag || '🏠'}</span>
                    <span className="font-medium text-gray-900">
                      {owner.firstName && owner.lastName 
                        ? `${owner.firstName} ${owner.lastName}` 
                        : owner.name || 'Unknown Owner'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {owner.email || 'No email'} • {owner.phone || 'No phone'}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedOwnerId}
            className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
          >
            Select Owner
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PropertyOverview({ 
  propertyId, 
  propertyData, 
  owner,
  onPropertyUpdate, 
  isLoading, 
  error,
  onEditAmenities
}: PropertyOverviewProps) {
  // Use centralized data from parent component
  const property = propertyData;
  const propertyLoading = isLoading;
  const propertyError = error;
  // Use owner from props (updated via fetchOwnerData) or fallback to propertyData.owner
  const currentOwner = owner || propertyData?.owner;
  const financialData = propertyData?.financialData;
  const incomeDistribution = propertyData?.incomeDistribution;
  const currentPrice = propertyData?.currentPrice;
  const priceLoading = propertyData?.priceLoading;
  
  // Load owners separately (this can be moved to parent later)
  const [owners, setOwners] = useState<any[]>([]);
  const [ownersLoading, setOwnersLoading] = useState(false);

  // Load owners when modal opens
  const loadOwners = async () => {
    setOwnersLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_V2_URL || 'http://localhost:3002/api/v2';
      const authToken = localStorage.getItem('token');
      
      console.log('🔄 PropertyOverview: Loading owners from:', `${apiUrl}/users?role=OWNER`);
      console.log('🔑 PropertyOverview: Using token:', authToken ? 'Present' : 'Missing');
      
      const response = await fetch(`${apiUrl}/users?role=OWNER`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      console.log('📡 PropertyOverview: Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('📋 PropertyOverview: Full owners response:', JSON.stringify(result, null, 2));
        if (result.success && result.data) {
          const ownersData = Array.isArray(result.data) ? result.data : result.data.data || [];
          console.log('👥 PropertyOverview: Processed owners count:', ownersData.length);
          console.log('👥 PropertyOverview: First owner (if exists):', ownersData[0]);
          setOwners(ownersData);
        } else {
          console.error('❌ PropertyOverview: Response not successful or no data:', result);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ PropertyOverview: Failed to fetch owners, status:', response.status);
        console.error('❌ PropertyOverview: Error response:', errorText);
      }
    } catch (error) {
      console.error('❌ PropertyOverview: Error loading owners:', error);
    } finally {
      setOwnersLoading(false);
    }
  };

  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Edit modals state
  const [showGeneralInfoModal, setShowGeneralInfoModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showPhotosModal, setShowPhotosModal] = useState(false);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [showUtilitiesModal, setShowUtilitiesModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Form states
  const [generalInfoForm, setGeneralInfoForm] = useState({
    name: '',
    nickname: '',
    status: '',
    type: '',
    city: '',
    address: '',
    capacity: '',
    bedrooms: '',
    bathrooms: '',
    pricePerNight: '',
    typeOfUnit: '',
    country: ''
  });

  const [descriptionForm, setDescriptionForm] = useState('');

  const handleEditOwner = () => {
    loadOwners(); // Load owners when opening modal
    setShowOwnerModal(true);
  };

  const handleSelectOwner = async (ownerId: string) => {
    try {
      console.log('🔄 PropertyOverview: Attempting to assign owner ID:', ownerId);
      const success = await onPropertyUpdate({ ownerId });
      
      if (success) {
        console.log('✅ PropertyOverview: Owner assigned successfully');
        setToastMessage('Owner assigned successfully');
        setShowToast(true);
      } else {
        console.log('❌ PropertyOverview: Failed to assign owner');
        setToastMessage('Failed to assign owner');
        setShowToast(true);
      }
    } catch (error) {
      setToastMessage('Error assigning owner');
      setShowToast(true);
    }
  };

  // General Information form handlers
  const handleOpenGeneralInfoModal = () => {
    if (property) {
      setGeneralInfoForm({
        name: property.name || '',
        nickname: property.nickname || '',
        status: property.isActive ? 'Active' : 'Inactive',
        type: property.type || '',
        city: property.city || '',
        address: property.address || '',
        capacity: property.capacity?.toString() || '',
        bedrooms: property.bedrooms?.toString() || '',
        bathrooms: property.bathrooms?.toString() || '',
        pricePerNight: property.pricePerNight?.toString() || '',
        typeOfUnit: property.typeOfUnit || '',
        country: property.country || ''
      });
    }
    setShowGeneralInfoModal(true);
  };

  const handleGeneralInfoChange = (field: string, value: string) => {
    setGeneralInfoForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveGeneralInfo = async () => {
    try {
      const updateData = {
        name: generalInfoForm.name,
        nickname: generalInfoForm.nickname,
        isActive: generalInfoForm.status === 'Active',
        type: generalInfoForm.type as any,
        city: generalInfoForm.city,
        address: generalInfoForm.address,
        capacity: parseInt(generalInfoForm.capacity) || 0,
        bedrooms: parseInt(generalInfoForm.bedrooms) || 0,
        bathrooms: parseInt(generalInfoForm.bathrooms) || 0,
        pricePerNight: parseFloat(generalInfoForm.pricePerNight) || 0,
        typeOfUnit: generalInfoForm.typeOfUnit as any,
        country: generalInfoForm.country
      };

      const success = await onPropertyUpdate(updateData);
      
      if (success) {
        setShowGeneralInfoModal(false);
        setToastMessage('General information updated successfully');
        setShowToast(true);
      } else {
        setToastMessage('Failed to update general information');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error updating general information:', error);
      setToastMessage('Error updating general information');
      setShowToast(true);
    }
  };

  // Photo upload handler
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setToastMessage('Authentication required');
      setShowToast(true);
      return;
    }

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('photo', file);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_V2_URL}/properties/${propertyId}/photos`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload photo: ${response.status}`);
        }
      }

      setToastMessage('Photos uploaded successfully!');
      setShowToast(true);
      
      // Refresh property data to show new photos
      window.location.reload(); // Simple refresh for now
      
    } catch (error) {
      console.error('Error uploading photos:', error);
      setToastMessage('Failed to upload photos');
      setShowToast(true);
    }
  };

  // Photo delete handler
  const handleDeletePhoto = async (photoId: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setToastMessage('Authentication required');
      setShowToast(true);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_V2_URL}/properties/${propertyId}/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete photo: ${response.status}`);
      }

      setToastMessage('Photo deleted successfully!');
      setShowToast(true);
      
      // Refresh property data to remove deleted photo
      window.location.reload(); // Simple refresh for now
      
    } catch (error) {
      console.error('Error deleting photo:', error);
      setToastMessage('Failed to delete photo');
      setShowToast(true);
    }
  };

  // Description form handlers
  const handleOpenDescriptionModal = () => {
    setDescriptionForm(property?.description || '');
    setShowDescriptionModal(true);
  };

  const handleSaveDescription = async () => {
    try {
      const success = await onPropertyUpdate({ description: descriptionForm });
      
      if (success) {
        setShowDescriptionModal(false);
        setToastMessage('Description updated successfully');
        setShowToast(true);
      } else {
        setToastMessage('Failed to update description');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error updating description:', error);
      setToastMessage('Error updating description');
      setShowToast(true);
    }
  };

  const calculateFinancialSummary = () => {
    if (!financialData) return null;

    const { totalRevenue, totalExpenses, ownerPayout, companyRevenue } = financialData;
    
    // Ensure all values are numbers and provide defaults
    const safeTotalRevenue = Number(totalRevenue) || 0;
    const safeTotalExpenses = Number(totalExpenses) || 0;
    const safeOwnerPayout = Number(ownerPayout) || 0;
    const safeCompanyRevenue = Number(companyRevenue) || 0;
    const safeRoomyAgencyFee = Number(incomeDistribution.roomyAgencyFee) || 0;
    
    return {
      totalRevenue: safeTotalRevenue,
      totalExpenses: safeTotalExpenses,
      totalProfit: safeTotalRevenue - safeTotalExpenses,
      ownerPayout: safeOwnerPayout,
      companyRevenue: safeCompanyRevenue,
      agentProfit: safeCompanyRevenue - (safeTotalRevenue * safeRoomyAgencyFee / 100),
      roomyAgencyFee: safeTotalRevenue * safeRoomyAgencyFee / 100
    };
  };

  if (propertyLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  // Use property data from API
  const displayProperty = property;

  const financialSummary = calculateFinancialSummary();

  return (
    <div className="space-y-6">
      {/* Owner Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Owner</h2>
          <button 
            onClick={handleEditOwner}
            className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center space-x-2"
          >
            <Edit size={14} />
            <span>{currentOwner ? 'Change Owner' : 'Select Owner'}</span>
          </button>
        </div>
        
        {currentOwner ? (
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-orange-600">
                {currentOwner.firstName && currentOwner.lastName 
                  ? `${currentOwner.firstName.charAt(0)}${currentOwner.lastName.charAt(0)}` 
                  : currentOwner.name?.charAt(0) || '?'}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {currentOwner.firstName && currentOwner.lastName 
                  ? `${currentOwner.firstName} ${currentOwner.lastName}` 
                  : currentOwner.name || 'Unknown Owner'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{currentOwner.flag || '🏠'}</span>
                      <span className="text-sm font-medium text-gray-900">{currentOwner.country || 'Unknown Country'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{currentOwner.email || 'No email'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{currentOwner.phone || 'No phone'}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      currentOwner.status === 'active' ? 'bg-green-500' : 
                      currentOwner.status === 'vip' ? 'bg-purple-500' : 'bg-gray-400'
                    }`}></div>
                    <span className={`text-sm font-medium capitalize ${
                      currentOwner.status === 'active' ? 'text-green-600' : 
                      currentOwner.status === 'vip' ? 'text-purple-600' : 'text-gray-600'
                    }`}>
                      {currentOwner.status === 'vip' ? 'VIP Owner' : (currentOwner.status || 'Unknown')}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <User size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">Property Owner</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <User size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Owner Assigned</h3>
              <p className="text-gray-500 mb-4">This property doesn&apos;t have an owner assigned yet.</p>
              <button 
                onClick={handleEditOwner}
                className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center space-x-2 mx-auto"
              >
                <User size={14} />
                <span>Assign Owner</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Income Distribution */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Income Distribution</h2>
          <div className="text-sm text-gray-500">
            {financialSummary ? 'Calculated from financial data' : 'No financial data available'}
          </div>
        </div>

        {financialSummary ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {[
                  { label: 'Owner income', value: `${incomeDistribution.ownerIncome}%`, key: 'ownerIncome' },
                  { label: 'Roomy Agency Fee', value: `${incomeDistribution.roomyAgencyFee}%`, key: 'roomyAgencyFee' },
                  { label: 'Referring agent', value: `${incomeDistribution.referringAgent}%`, key: 'referringAgent' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600">{item.label}:</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-900">{String(item.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Total Profit</h4>
                  <p className="text-lg font-medium text-gray-900">AED {financialSummary?.totalProfit?.toLocaleString() || '0'}</p>
                  <p className="text-xs text-gray-500 mt-1">Total Revenue - Expenses</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Owner Payout</h4>
                  <p className="text-lg font-medium text-green-600">AED {financialSummary?.ownerPayout?.toLocaleString() || '0'}</p>
                  <p className="text-xs text-gray-500 mt-1">Revenue - Expenses - Agent Profit - Roomy Fee</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Company Revenue</h4>
                  <p className="text-lg font-medium text-orange-600">AED {financialSummary?.companyRevenue?.toLocaleString() || '0'}</p>
                  <p className="text-xs text-gray-500 mt-1">Agent Profit + Roomy Agency Fee</p>
                </div>
              </div>
            </div>
            
            {/* Calculation Breakdown */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Calculation Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Revenue:</span>
                  <p className="font-medium">AED {financialData!.totalRevenue.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-600">Total Expenses:</span>
                  <p className="font-medium">AED {financialSummary?.totalExpenses?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Agent Profit ({incomeDistribution.referringAgent}%):</span>
                  <p className="font-medium">AED {financialSummary?.agentProfit?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Roomy Fee ({incomeDistribution.roomyAgencyFee}%):</span>
                  <p className="font-medium">AED {financialSummary?.roomyAgencyFee?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Income distribution will be calculated automatically when financial data is available.</p>
            <p className="text-sm mt-2">Add reservations and expenses to see the breakdown.</p>
          </div>
        )}
      </div>

      {/* General Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">General Information</h2>
          <button 
            onClick={handleOpenGeneralInfoModal}
            className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center space-x-2"
          >
            <Edit size={14} />
            <span>Edit</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {[
              { label: 'Name', value: displayProperty?.name || 'Not set', key: 'name' },
              { label: 'Nickname', value: displayProperty?.nickname || 'Not set', key: 'nickname' },
              { label: 'Status', value: displayProperty?.isActive ? 'Active' : 'Inactive', key: 'status' },
              { label: 'Type', value: displayProperty?.type || 'Not set', key: 'type' },
              { label: 'City', value: displayProperty?.city || 'Not set', key: 'city' },
              { label: 'Address', value: displayProperty?.address || 'Not set', key: 'address' },
              { label: 'Capacity', value: displayProperty?.capacity || 0, key: 'capacity' },
              { label: 'Bedrooms', value: displayProperty?.bedrooms || 0, key: 'bedrooms' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">{item.label}:</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-900">{String(item.value)}</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Right Column */}
          <div className="space-y-4">
            {[
              { label: 'Bathrooms', value: displayProperty?.bathrooms || 0, key: 'bathrooms' },
              { label: 'Price per Night', value: `AED ${displayProperty?.pricePerNight || 0}`, key: 'pricePerNight' },
              { label: 'Current Price', value: (
                <div className="flex items-center space-x-2">
                  {priceLoading ? (
                    <span className="text-sm text-gray-500">Loading...</span>
                  ) : currentPrice ? (
                    <span className="text-sm font-medium text-green-600">AED {currentPrice}</span>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">No data</span>
                      <button 
                        onClick={() => {
                          // Refresh price functionality will be implemented
                          console.log('Refresh price clicked');
                        }}
                        className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 px-2 py-1 rounded"
                      >
                        Refresh
                      </button>
                    </div>
                  )}
                </div>
              ), key: 'currentPrice' },
              { label: 'Type of Unit', value: displayProperty?.typeOfUnit || 'Not specified', key: 'typeOfUnit' },
              { label: 'Country', value: displayProperty?.country || 'Not set', key: 'country' },
              { label: 'Created', value: displayProperty ? new Date(displayProperty.createdAt).toLocaleDateString() : 'Not set', key: 'createdAt' },
              { label: 'Last Modified', value: displayProperty ? new Date(displayProperty.updatedAt).toLocaleDateString() : 'Not set', key: 'lastModifiedAt' },
              { label: 'Agent', value: displayProperty?.agent ? `${displayProperty.agent.firstName} ${displayProperty.agent.lastName}` : 'Not assigned', key: 'agentName' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">{item.label}:</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-900">{typeof item.value === 'string' ? item.value : item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Description</h2>
          <button 
            onClick={handleOpenDescriptionModal}
            className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center space-x-2"
          >
            <Edit size={14} />
            <span>Edit</span>
          </button>
        </div>
        <p className="text-gray-700 leading-relaxed">{displayProperty?.description || 'No description available'}</p>
      </div>

      {/* Photos */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Photos</h2>
          <button 
            onClick={() => setShowPhotosModal(true)}
            className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center space-x-2"
          >
            <Edit size={14} />
            <span>Edit</span>
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayProperty?.photos?.map((photo: any, index: number) => (
            <div key={index} className="aspect-square rounded-lg overflow-hidden">
              <img 
                src={photo.url} 
                alt={photo.alt || `Property photo ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
              />
            </div>
          )) || (
            <div className="col-span-4 text-center py-8 text-gray-500">
              No photos available
            </div>
          )}
        </div>
      </div>

      {/* Amenities */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Amenities</h2>
          <button 
            onClick={onEditAmenities || (() => setShowAmenitiesModal(true))}
            className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center space-x-2"
          >
            <Edit size={14} />
            <span>Edit</span>
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {(() => {
            console.log('[PropertyOverview] displayProperty?.amenities:', displayProperty?.amenities);
            console.log('[PropertyOverview] amenities type:', typeof displayProperty?.amenities);
            console.log('[PropertyOverview] amenities is array:', Array.isArray(displayProperty?.amenities));
            
            return displayProperty?.amenities?.map((amenity: any, index: number) => {
              console.log('[PropertyOverview] Processing amenity:', amenity, 'type:', typeof amenity);
              
              // Handle both string and object amenity formats
              const amenityName = typeof amenity === 'string' ? amenity : (amenity?.name || 'Unknown');
              const amenityIcon = typeof amenity === 'object' ? amenity?.icon || '' : '';
              
              console.log('[PropertyOverview] Rendered amenity name:', amenityName);
              
              return (
                <div key={index} className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  {amenityIcon && <span className="text-sm">{amenityIcon}</span>}
                  <span className="text-sm text-gray-700">{amenityName}</span>
                </div>
              );
            });
          })() || (
            <div className="col-span-full text-center py-4 text-gray-500">
              No amenities listed
            </div>
          )}
        </div>
      </div>

      {/* Utilities */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Utilities</h2>
          <button 
            onClick={() => setShowUtilitiesModal(true)}
            className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center space-x-2"
          >
            <Edit size={14} />
            <span>Edit</span>
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {displayProperty?.utilities?.map((utility: any, index: number) => (
            <div key={index} className="flex items-center space-x-2 bg-blue-50 rounded-lg px-3 py-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">{utility}</span>
            </div>
          )) || (
            <div className="col-span-full text-center py-4 text-gray-500">
              No utilities listed
            </div>
          )}
        </div>
      </div>

      {/* Rules */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Rules & Policies</h2>
          <button 
            onClick={() => setShowRulesModal(true)}
            className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center space-x-2"
          >
            <Edit size={14} />
            <span>Edit</span>
          </button>
        </div>
        <div className="space-y-3">
          {displayProperty?.houseRules?.map((rule: any, index: number) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-sm text-gray-700">{rule}</span>
            </div>
          )) || (
            <div className="text-center py-4 text-gray-500">
              No rules specified
            </div>
          )}
        </div>
      </div>

      {/* General Information Edit Modal */}
      {showGeneralInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Edit General Information</h3>
              <button 
                onClick={() => setShowGeneralInfoModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={generalInfoForm.name}
                    onChange={(e) => handleGeneralInfoChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nickname</label>
                  <input
                    type="text"
                    value={generalInfoForm.nickname}
                    onChange={(e) => handleGeneralInfoChange('nickname', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={generalInfoForm.status}
                    onChange={(e) => handleGeneralInfoChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={generalInfoForm.type}
                    onChange={(e) => handleGeneralInfoChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select type...</option>
                    <option value="APARTMENT">Apartment</option>
                    <option value="VILLA">Villa</option>
                    <option value="STUDIO">Studio</option>
                    <option value="PENTHOUSE">Penthouse</option>
                    <option value="HOUSE">House</option>
                    <option value="CONDO">Condo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={generalInfoForm.city}
                    onChange={(e) => handleGeneralInfoChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={generalInfoForm.address}
                    onChange={(e) => handleGeneralInfoChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                  <input
                    type="number"
                    value={generalInfoForm.capacity}
                    onChange={(e) => handleGeneralInfoChange('capacity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                  <input
                    type="number"
                    value={generalInfoForm.bedrooms}
                    onChange={(e) => handleGeneralInfoChange('bedrooms', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                  <input
                    type="number"
                    value={generalInfoForm.bathrooms}
                    onChange={(e) => handleGeneralInfoChange('bathrooms', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price per Night (AED)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={generalInfoForm.pricePerNight}
                    onChange={(e) => handleGeneralInfoChange('pricePerNight', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type of Unit</label>
                  <select
                    value={generalInfoForm.typeOfUnit}
                    onChange={(e) => handleGeneralInfoChange('typeOfUnit', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select unit type...</option>
                    <option value="SINGLE">Single</option>
                    <option value="DOUBLE">Double</option>
                    <option value="FAMILY">Family</option>
                    <option value="SHARED">Shared</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    value={generalInfoForm.country}
                    onChange={(e) => handleGeneralInfoChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
                  <input
                    type="text"
                    value={property ? new Date(property.createdAt).toLocaleDateString() : ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Modified</label>
                  <input
                    type="text"
                    value={property ? new Date(property.updatedAt).toLocaleDateString() : ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Agent</label>
                  <input
                    type="text"
                    value={property?.agent ? `${property.agent.firstName} ${property.agent.lastName}` : 'Not assigned'}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={() => setShowGeneralInfoModal(false)}
                className="px-4 py-2 text-sm bg-white border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGeneralInfo}
                className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Description Edit Modal */}
      {showDescriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Edit Description</h3>
              <button 
                onClick={() => setShowDescriptionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={descriptionForm}
                onChange={(e) => setDescriptionForm(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical"
                placeholder="Enter property description..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDescriptionModal(false)}
                className="px-4 py-2 text-sm bg-white border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDescription}
                className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Owner Selection Modal */}
      <OwnerSelectionModal
        isOpen={showOwnerModal}
        owners={owners}
        loading={ownersLoading}
        onSelect={handleSelectOwner}
        onClose={() => setShowOwnerModal(false)}
      />

      {/* Photos Edit Modal */}
      {showPhotosModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Edit Photos</h3>
              <button 
                onClick={() => setShowPhotosModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Upload Photos</h4>
                    <p className="text-gray-500">Drag and drop images here, or click to select</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    id="photo-upload"
                    onChange={handlePhotoUpload}
                  />
                  <label
                    htmlFor="photo-upload"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 cursor-pointer"
                  >
                    Select Photos
                  </label>
                </div>
              </div>

              {/* Current Photos */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Current Photos</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {displayProperty?.photos?.map((photo: any, index: number) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img 
                          src={photo.url || '/placeholder-image.jpg'} 
                          alt={`Property photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  )) || (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No photos uploaded yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Amenities Edit Modal */}
      {showAmenitiesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Edit Amenities</h3>
              <button 
                onClick={() => setShowAmenitiesModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Amenities editing functionality coming soon!</p>
              <p className="text-sm text-gray-400">This will connect to API v2</p>
            </div>
          </div>
        </div>
      )}

      {/* Utilities Edit Modal */}
      {showUtilitiesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Edit Utilities</h3>
              <button 
                onClick={() => setShowUtilitiesModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Utilities editing functionality coming soon!</p>
              <p className="text-sm text-gray-400">This will connect to Property API v2</p>
            </div>
          </div>
        </div>
      )}

      {/* Rules Edit Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Edit Rules & Policies</h3>
              <button 
                onClick={() => setShowRulesModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Rules editing functionality coming soon!</p>
              <p className="text-sm text-gray-400">This will connect to Property API v2</p>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
