import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Calendar, DollarSign, Settings, MessageSquare, BarChart3, FileText, Users, Wrench, Home } from 'lucide-react';
import TopNavigation from '@/components/TopNavigation';
import ProductionPropertyOverview from '@/components/properties/ProductionPropertyOverview';
import Toast from '@/components/Toast';

interface ProductionPropertyDetailsProps {
  params: { id: string };
}

export default function ProductionPropertyDetailsPage({ params }: ProductionPropertyDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleShowToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'reservations', label: 'Reservations', icon: Calendar },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'tasks', label: 'Tasks', icon: Wrench },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'team', label: 'Team', icon: Users },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ProductionPropertyOverview propertyId={params.id} />;
      case 'reservations':
        return (
          <div className="p-8 text-center">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Reservations</h3>
            <p className="text-gray-500">Reservation management coming soon...</p>
          </div>
        );
      case 'pricing':
        return (
          <div className="p-8 text-center">
            <DollarSign size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Pricing</h3>
            <p className="text-gray-500">Pricing management coming soon...</p>
          </div>
        );
      case 'tasks':
        return (
          <div className="p-8 text-center">
            <Wrench size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tasks</h3>
            <p className="text-gray-500">Task management coming soon...</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="p-8 text-center">
            <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-500">Analytics dashboard coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="p-8 text-center">
            <Settings size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Settings</h3>
            <p className="text-gray-500">Property settings coming soon...</p>
          </div>
        );
      case 'messages':
        return (
          <div className="p-8 text-center">
            <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Messages</h3>
            <p className="text-gray-500">Message center coming soon...</p>
          </div>
        );
      case 'documents':
        return (
          <div className="p-8 text-center">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Documents</h3>
            <p className="text-gray-500">Document management coming soon...</p>
          </div>
        );
      case 'team':
        return (
          <div className="p-8 text-center">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Team</h3>
            <p className="text-gray-500">Team management coming soon...</p>
          </div>
        );
      default:
        return <ProductionPropertyOverview propertyId={params.id} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <TopNavigation />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Property Details
                </h1>
                <p className="text-sm text-gray-500">ID: {params.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Production Mode
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {renderTabContent()}
        </div>
      </div>

      {/* Toast */}
      <Toast
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
