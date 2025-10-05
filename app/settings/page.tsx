'use client';

import React, { useState, useEffect } from 'react';
import { settingsServiceAdapted } from '@/lib/api/adapters/apiAdapter';
import { SettingDto } from '@/types/dto';

interface SettingsPageProps {}

const SettingsPage: React.FC<SettingsPageProps> = () => {
  const [settings, setSettings] = useState<SettingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await settingsServiceAdapted.getAll();
      
      if (response.success && response.data) {
        setSettings(response.data.settings);
      } else {
        setError(response.message || 'Failed to load settings');
      }
    } catch (err) {
      setError('An error occurred while loading settings');
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (setting: SettingDto) => {
    setEditingKey(setting.key);
    setEditValue(setting.value);
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValue('');
  };

  const handleSave = async (key: string) => {
    try {
      setSaving(true);
      
      const response = await settingsServiceAdapted.update(key, { value: editValue });
      
      if (response.success && response.data) {
        // Update the setting in the list
        setSettings(prev => prev.map(s => 
          s.key === key ? response.data! : s
        ));
        setEditingKey(null);
        setEditValue('');
      } else {
        setError(response.message || 'Failed to update setting');
      }
    } catch (err) {
      setError('An error occurred while updating setting');
      console.error('Error updating setting:', err);
    } finally {
      setSaving(false);
    }
  };

  const groupSettingsByCategory = (settings: SettingDto[]) => {
    const grouped: { [key: string]: SettingDto[] } = {};
    
    settings.forEach(setting => {
      if (!grouped[setting.category]) {
        grouped[setting.category] = [];
      }
      grouped[setting.category].push(setting);
    });
    
    return grouped;
  };

  const getInputType = (type: string) => {
    switch (type) {
      case 'number':
        return 'number';
      case 'boolean':
        return 'checkbox';
      default:
        return 'text';
    }
  };

  const renderSettingInput = (setting: SettingDto) => {
    if (editingKey !== setting.key) {
      return (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {setting.type === 'boolean' ? (setting.value === 'true' ? 'Yes' : 'No') : setting.value}
          </span>
          {setting.isEditable && (
            <button
              onClick={() => handleEdit(setting)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Edit
            </button>
          )}
        </div>
      );
    }

    if (setting.type === 'boolean') {
      return (
        <div className="flex items-center space-x-2">
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            disabled={saving}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <button
            onClick={() => handleSave(setting.key)}
            disabled={saving}
            className="bg-green-600 text-white px-2 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="bg-gray-600 text-white px-2 py-1 rounded text-sm hover:bg-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <input
          type={getInputType(setting.type)}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-sm w-32"
          disabled={saving}
        />
        <button
          onClick={() => handleSave(setting.key)}
          disabled={saving}
          className="bg-green-600 text-white px-2 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={handleCancel}
          disabled={saving}
          className="bg-gray-600 text-white px-2 py-1 rounded text-sm hover:bg-gray-700 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    );
  };

  const groupedSettings = groupSettingsByCategory(settings);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600 mt-1">
              Configure system-wide settings and business rules
            </p>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 text-sm mt-2"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="p-6">
            {Object.entries(groupedSettings).map(([category, categorySettings]) => (
              <div key={category} className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                  {category.replace('_', ' ')}
                </h2>
                <div className="space-y-4">
                  {categorySettings.map((setting) => (
                    <div
                      key={setting.key}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">
                            {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </h3>
                          {!setting.isEditable && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              Read Only
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {setting.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Type: {setting.type}
                        </p>
                      </div>
                      <div className="ml-4">
                        {renderSettingInput(setting)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;