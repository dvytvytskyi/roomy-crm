'use client'

import { useState } from 'react';
import { Edit, Mail, Phone, User, DollarSign } from 'lucide-react';
import { usePropertyDetails } from '../../hooks/usePropertyDetails';
import Toast from '../Toast';

interface PropertyOverviewProps {
  propertyId: string;
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
                    <span className="font-medium text-gray-900">{owner.name}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {owner.email} • {owner.phone}
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

export default function PropertyOverview({ propertyId }: PropertyOverviewProps) {
  const {
    property,
    loading: propertyLoading,
    error: propertyError,
    owner,
    owners,
    ownersLoading,
    financialData,
    incomeDistribution,
    currentPrice,
    priceLoading,
    assignOwner,
    refreshPrice
  } = usePropertyDetails(propertyId);

  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleEditOwner = () => {
    setShowOwnerModal(true);
  };

  const handleSelectOwner = async (ownerId: string) => {
    try {
      const success = await assignOwner(ownerId);
      
      if (success) {
        setToastMessage('Owner assigned successfully');
        setShowToast(true);
      } else {
        setToastMessage('Failed to assign owner');
        setShowToast(true);
      }
    } catch (error) {
      setToastMessage('Error assigning owner');
      setShowToast(true);
    }
  };

  const calculateFinancialSummary = () => {
    if (!financialData) return null;

    const { totalRevenue, totalExpenses, ownerPayout, companyRevenue } = financialData;
    
    return {
      totalRevenue,
      totalExpenses,
      totalProfit: totalRevenue - totalExpenses,
      ownerPayout,
      companyRevenue,
      agentProfit: companyRevenue - (totalRevenue * incomeDistribution.roomyAgencyFee / 100),
      roomyAgencyFee: totalRevenue * incomeDistribution.roomyAgencyFee / 100
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

  // Create mock property data for fallback
  const mockProperty = {
    id: propertyId,
    name: "A I Westwood | 616",
    nickname: "A I Westwood | 616",
    title: "Westwood | Next to Metro | Great Amenities",
    type: "APARTMENT",
    type_of_unit: "SINGLE",
    address: "24QQ+RRF - Jebel Ali Village - Dubai - United Arab Emirates",
    city: "Dubai",
    country: "United Arab Emirates",
    capacity: 2,
    bedrooms: 0,
    bathrooms: 1,
    pricePerNight: 170,
    pricelabId: "67a392b7b8fa25002a065c6c",
    primaryImage: "",
    status: "Active",
    createdAt: "2024-12-27T06:07:33.322Z",
    lastModifiedAt: "2025-10-04T00:43:08.930Z",
      description: "Beautiful modern apartment in the heart of Dubai with stunning city views. Perfect for business travelers and tourists. Located next to metro station with easy access to all major attractions.",
      amenities: ["WiFi", "AC", "Kitchen", "Parking", "Gym", "Pool", "Concierge", "Laundry", "Balcony", "City View"],
      rules: ["No smoking", "No pets", "No parties", "Check-in after 3 PM", "Check-out before 11 AM", "Max 4 guests"],
      utilities: ["Electricity", "Water", "Internet", "Cable TV", "Heating", "Cooling"],
      photos: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"
      ],
      tags: ["Modern", "Downtown", "Metro Access", "City View"],
      ownerId: null,
      agentId: null,
      agentName: null
  };

  // Use mock property data if property loading failed or property not found
  const displayProperty = property || mockProperty;
  const isUsingMockData = propertyError || !property;
  
  if (isUsingMockData) {
    console.log('Using mock property data due to error:', propertyError || 'Property not found');
  }

  // Mock owner data if no owner
  const mockOwner = {
    id: 'mock_owner_1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+971 50 123 4567',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    status: 'active'
  };

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
            <span>{owner ? 'Change Owner' : 'Select Owner'}</span>
          </button>
        </div>
        
        {(owner || mockOwner) ? (
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-orange-600">{(owner || mockOwner).name.charAt(0)}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{(owner || mockOwner).name}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{(owner || mockOwner).flag}</span>
                      <span className="text-sm font-medium text-gray-900">{(owner || mockOwner).country}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{(owner || mockOwner).email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{(owner || mockOwner).phone}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      (owner || mockOwner).status === 'active' ? 'bg-green-500' : 
                      (owner || mockOwner).status === 'vip' ? 'bg-purple-500' : 'bg-gray-400'
                    }`}></div>
                    <span className={`text-sm font-medium capitalize ${
                      (owner || mockOwner).status === 'active' ? 'text-green-600' : 
                      (owner || mockOwner).status === 'vip' ? 'text-purple-600' : 'text-gray-600'
                    }`}>
                      {(owner || mockOwner).status === 'vip' ? 'VIP Owner' : (owner || mockOwner).status}
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
              <p className="text-gray-500 mb-4">This property doesn't have an owner assigned yet.</p>
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
                  <p className="text-lg font-medium text-gray-900">AED {financialSummary.totalProfit.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Total Revenue - Expenses</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Owner Payout</h4>
                  <p className="text-lg font-medium text-green-600">AED {financialSummary.ownerPayout.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Revenue - Expenses - Agent Profit - Roomy Fee</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Company Revenue</h4>
                  <p className="text-lg font-medium text-orange-600">AED {financialSummary.companyRevenue.toLocaleString()}</p>
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
                  <p className="font-medium">AED {financialSummary.totalExpenses.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-600">Agent Profit ({incomeDistribution.referringAgent}%):</span>
                  <p className="font-medium">AED {financialSummary.agentProfit.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-600">Roomy Fee ({incomeDistribution.roomyAgencyFee}%):</span>
                  <p className="font-medium">AED {financialSummary.roomyAgencyFee.toLocaleString()}</p>
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
        <h2 className="text-lg font-semibold text-gray-900 mb-6">General Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {[
              { label: 'Name', value: displayProperty.name, key: 'name' },
              { label: 'Nickname', value: displayProperty.nickname || 'Not set', key: 'nickname' },
              { label: 'Status', value: displayProperty.status, key: 'status' },
              { label: 'Type', value: displayProperty.type, key: 'type' },
              { label: 'City', value: displayProperty.city, key: 'city' },
              { label: 'Address', value: displayProperty.address, key: 'address' },
              { label: 'Capacity', value: displayProperty.capacity, key: 'capacity' },
              { label: 'Bedrooms', value: displayProperty.bedrooms, key: 'bedrooms' }
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
              { label: 'Bathrooms', value: displayProperty.bathrooms, key: 'bathrooms' },
              { label: 'Price per Night', value: `AED ${displayProperty.pricePerNight}`, key: 'pricePerNight' },
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
                        onClick={refreshPrice}
                        className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 px-2 py-1 rounded"
                      >
                        Refresh
                      </button>
                    </div>
                  )}
                </div>
              ), key: 'currentPrice' },
              { label: 'Type of Unit', value: displayProperty.type_of_unit || 'Not specified', key: 'typeOfUnit' },
              { label: 'Country', value: displayProperty.country, key: 'country' },
              { label: 'Created', value: new Date(displayProperty.createdAt).toLocaleDateString(), key: 'createdAt' },
              { label: 'Last Modified', value: new Date(displayProperty.lastModifiedAt).toLocaleDateString(), key: 'lastModifiedAt' },
              { label: 'Agent', value: displayProperty.agentName || 'Not assigned', key: 'agentName' }
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
        <p className="text-gray-700 leading-relaxed">{displayProperty.description}</p>
      </div>

      {/* Photos */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Photos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayProperty.photos?.map((photo, index) => (
            <div key={index} className="aspect-square rounded-lg overflow-hidden">
              <img 
                src={photo} 
                alt={`Property photo ${index + 1}`}
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {displayProperty.amenities?.map((amenity, index) => (
            <div key={index} className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-700">{amenity}</span>
            </div>
          )) || (
            <div className="col-span-full text-center py-4 text-gray-500">
              No amenities listed
            </div>
          )}
        </div>
      </div>

      {/* Utilities */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Utilities</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {displayProperty.utilities?.map((utility, index) => (
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Rules & Policies</h2>
        <div className="space-y-3">
          {displayProperty.rules?.map((rule, index) => (
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

      {/* Owner Selection Modal */}
      <OwnerSelectionModal
        isOpen={showOwnerModal}
        owners={owners}
        loading={ownersLoading}
        onSelect={handleSelectOwner}
        onClose={() => setShowOwnerModal(false)}
      />

      {/* Toast */}
      <Toast
        show={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
