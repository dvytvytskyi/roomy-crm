import React, { useState } from 'react';
import { Edit, Calendar, DollarSign, CreditCard, Info, Flag, Mail, Phone, Plus, X, Download, Check, Building, User, ArrowLeft } from 'lucide-react';
import { useProperty, useUpdateProperty, useUser, useUpdateUser, useFinancialSummary, useIncomeDistribution } from '@/hooks/useProductionApi';
import Toast from '../Toast';
import { debugLog } from '@/lib/api/production-utils';

interface ProductionPropertyOverviewProps {
  propertyId: string;
}

const ProductionPropertyOverview: React.FC<ProductionPropertyOverviewProps> = ({ propertyId }) => {
  // API hooks
  const { data: property, isLoading: propertyLoading, error: propertyError, refetch: refetchProperty } = useProperty(propertyId);
  const { updateProperty, isLoading: updateLoading } = useUpdateProperty();
  const { data: financialData, isLoading: financialLoading } = useFinancialSummary({ propertyId });
  const { data: incomeSettings, isLoading: incomeLoading } = useIncomeDistribution();
  
  // Owner data (if property has owner)
  const { data: owner, isLoading: ownerLoading } = useUser(property?.ownerId || '');
  const { updateUser, isLoading: ownerUpdateLoading } = useUpdateUser();

  // Local state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [editModal, setEditModal] = useState<{ 
    isOpen: boolean; 
    field: string; 
    type: 'property' | 'owner'; 
    value: any; 
    label: string 
  } | null>(null);
  const [modalValue, setModalValue] = useState('');

  // Loading states
  const isLoading = propertyLoading || ownerLoading || financialLoading || incomeLoading;
  const error = propertyError;

  const handleShowToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleEditClick = (field: string, type: 'property' | 'owner', value: any, label: string) => {
    setEditModal({ isOpen: true, field, type, value, label });
    setModalValue(value || '');
  };

  const handleSaveEdit = async () => {
    if (!editModal) return;

    try {
      if (editModal.type === 'property' && property) {
        await updateProperty(property.id, { [editModal.field]: modalValue });
        handleShowToast(`${editModal.label} updated successfully!`);
        refetchProperty();
      } else if (editModal.type === 'owner' && owner) {
        await updateUser(owner.id, { [editModal.field]: modalValue });
        handleShowToast(`${editModal.label} updated successfully!`);
      }
    } catch (err: any) {
      handleShowToast(`Error updating ${editModal.label}: ${err.message}`);
      debugLog('Update error:', err);
    } finally {
      setEditModal(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="ml-4 text-lg text-gray-600">Loading property details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-600 bg-red-50 rounded-lg">
        <p className="font-semibold">Error loading property: {error}</p>
        <p className="text-sm">Please try refreshing the page or contact support.</p>
        <button
          onClick={() => refetchProperty()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-8 text-gray-600 bg-gray-50 rounded-lg">
        <p className="font-semibold">No property data available.</p>
        <p className="text-sm">Could not load details for this property.</p>
      </div>
    );
  }

  // Calculate income distribution
  const calculateIncomeDistribution = () => {
    if (!financialData || !incomeSettings) {
      return null;
    }

    const totalRevenue = financialData.totalRevenue || 0;
    const totalExpenses = financialData.totalExpenses || 0;

    const ownerIncomePercentage = incomeSettings.ownerIncome || 70;
    const roomyAgencyFeePercentage = incomeSettings.roomyAgencyFee || 25;
    const referringAgentPercentage = incomeSettings.referringAgent || 5;

    const agentProfit = totalRevenue * (referringAgentPercentage / 100);
    const roomyAgencyFeeAmount = totalRevenue * (roomyAgencyFeePercentage / 100);
    const ownerPayout = totalRevenue - totalExpenses - agentProfit - roomyAgencyFeeAmount;
    const totalProfit = totalRevenue - totalExpenses;
    const companyRevenue = agentProfit + roomyAgencyFeeAmount;

    return {
      ownerIncome: ownerIncomePercentage,
      roomyAgencyFee: roomyAgencyFeePercentage,
      referringAgent: referringAgentPercentage,
      totalRevenue,
      totalExpenses,
      agentProfit,
      roomyAgencyFeeAmount,
      ownerPayout,
      totalProfit,
      companyRevenue,
    };
  };

  const incomeDistribution = calculateIncomeDistribution();

  return (
    <div className="space-y-6">
      {/* Property Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{property.name}</h1>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              property.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
              property.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
              property.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {property.status}
            </span>
          </div>
        </div>
        
        {property.nickname && (
          <p className="text-gray-600 mb-2">Nickname: {property.nickname}</p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Building size={16} className="text-gray-400" />
            <span>{property.type}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-gray-400" />
            <span>{property.capacity} guests</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign size={16} className="text-gray-400" />
            <span>AED {property.pricePerNight}/night</span>
          </div>
        </div>
      </div>

      {/* Owner Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Owner</h2>
          <button
            onClick={() => handleEditClick('ownerId', 'property', property.ownerId, 'Owner')}
            className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center space-x-2"
            data-testid="edit-owner-btn"
          >
            <Edit size={14} />
            <span>{owner ? 'Change Owner' : 'Assign Owner'}</span>
          </button>
        </div>

        {owner ? (
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-orange-600">
                {owner.firstName?.charAt(0) || 'U'}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {owner.firstName} {owner.lastName}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    {owner.country && (
                      <>
                        <span className="text-xl">🏳️</span>
                        <span className="text-sm font-medium text-gray-900">{owner.country}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{owner.email}</span>
                  </div>

                  {owner.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{owner.phone}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      owner.status === 'ACTIVE' ? 'bg-green-500' :
                      owner.status === 'VIP' ? 'bg-purple-500' : 'bg-gray-400'
                    }`}></div>
                    <span className={`text-sm font-medium capitalize ${
                      owner.status === 'ACTIVE' ? 'text-green-600' :
                      owner.status === 'VIP' ? 'text-purple-600' : 'text-gray-600'
                    }`}>
                      {owner.status === 'VIP' ? 'VIP Owner' : owner.status}
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
                onClick={() => handleEditClick('ownerId', 'property', property.ownerId, 'Owner')}
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
      {incomeDistribution ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Income Distribution</h2>
            <div className="text-sm text-gray-500">Calculated from financial data</div>
          </div>
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
                <p className="text-lg font-medium text-gray-900">AED {incomeDistribution.totalProfit.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Total Revenue - Expenses</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Owner Payout</h4>
                <p className="text-lg font-medium text-green-600">AED {incomeDistribution.ownerPayout.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Revenue - Expenses - Agent Profit - Roomy Fee</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Company Revenue</h4>
                <p className="text-lg font-medium text-orange-600">AED {incomeDistribution.companyRevenue.toLocaleString()}</p>
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
                <p className="font-medium">AED {incomeDistribution.totalRevenue.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-600">Total Expenses:</span>
                <p className="font-medium">AED {incomeDistribution.totalExpenses.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-600">Agent Profit ({incomeDistribution.referringAgent}%):</span>
                <p className="font-medium">AED {incomeDistribution.agentProfit.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-600">Roomy Fee ({incomeDistribution.roomyAgencyFee}%):</span>
                <p className="font-medium">AED {incomeDistribution.roomyAgencyFeeAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Income Distribution</h2>
            <div className="text-sm text-gray-500">No financial data available</div>
          </div>
          <div className="text-center py-8 text-gray-500">
            <p>Income distribution will be calculated automatically when financial data is available.</p>
            <p className="text-sm mt-2">Add reservations and expenses to see the breakdown.</p>
          </div>
        </div>
      )}

      {/* Property Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Property Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {[
              { label: 'Name', value: property.name, key: 'name' },
              { label: 'Nickname', value: property.nickname, key: 'nickname' },
              { label: 'Status', value: property.status, key: 'status' },
              { label: 'Type', value: property.type, key: 'type' },
              { label: 'Location', value: property.location?.name || property.location?.city, key: 'location' },
              { label: 'Address', value: property.address, key: 'address' },
              { label: 'Capacity', value: property.capacity, key: 'capacity' },
              { label: 'Bedrooms', value: property.bedrooms, key: 'bedrooms' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">{item.label}:</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-900">{String(item.value || 'N/A')}</span>
                  <button
                    onClick={() => handleEditClick(item.key, 'property', item.value, item.label)}
                    className="text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    <Edit size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {[
              { label: 'Bathrooms', value: property.bathrooms, key: 'bathrooms' },
              { label: 'Price per Night', value: `AED ${property.pricePerNight}`, key: 'pricePerNight' },
              { label: 'Description', value: property.description, key: 'description' },
              { label: 'Amenities', value: property.amenities?.join(', ') || 'N/A', key: 'amenities' },
              { label: 'House Rules', value: property.houseRules?.join(', ') || 'N/A', key: 'houseRules' },
              { label: 'Tags', value: property.tags?.join(', ') || 'N/A', key: 'tags' },
              { label: 'Created', value: new Date(property.createdAt).toLocaleDateString(), key: 'createdAt' },
              { label: 'Updated', value: new Date(property.updatedAt).toLocaleDateString(), key: 'updatedAt' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">{item.label}:</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-900">{String(item.value || 'N/A')}</span>
                  <button
                    onClick={() => handleEditClick(item.key, 'property', item.value, item.label)}
                    className="text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    <Edit size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal?.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit {editModal.label}</h3>
            <input
              type="text"
              value={modalValue}
              onChange={(e) => setModalValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEditModal(null)}
                className="px-4 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
                disabled={updateLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                disabled={updateLoading}
              >
                {updateLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default ProductionPropertyOverview;
