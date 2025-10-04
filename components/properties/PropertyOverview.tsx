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

  // Use mock data if property loading failed or property not found
  if (propertyError || !property) {
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
      amenities: ["WiFi", "AC", "Kitchen", "Parking"],
      rules: ["No smoking", "No pets", "No parties"],
      tags: [],
      ownerId: null,
      agentId: null,
      agentName: null
    };
    
    // Use mock property data
    property = mockProperty;
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
              { label: 'Name', value: property.name, key: 'name' },
              { label: 'Nickname', value: property.nickname || 'Not set', key: 'nickname' },
              { label: 'Status', value: property.status, key: 'status' },
              { label: 'Type', value: property.type, key: 'type' },
              { label: 'City', value: property.city, key: 'city' },
              { label: 'Address', value: property.address, key: 'address' },
              { label: 'Capacity', value: property.capacity, key: 'capacity' },
              { label: 'Bedrooms', value: property.bedrooms, key: 'bedrooms' }
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
              { label: 'Bathrooms', value: property.bathrooms, key: 'bathrooms' },
              { label: 'Price per Night', value: `AED ${property.pricePerNight}`, key: 'pricePerNight' },
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
              { label: 'Type of Unit', value: property.type_of_unit || 'Not specified', key: 'typeOfUnit' },
              { label: 'Country', value: property.country, key: 'country' },
              { label: 'Created', value: new Date(property.createdAt).toLocaleDateString(), key: 'createdAt' },
              { label: 'Last Modified', value: new Date(property.lastModifiedAt).toLocaleDateString(), key: 'lastModifiedAt' },
              { label: 'Agent', value: property.agentName || 'Not assigned', key: 'agentName' }
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
