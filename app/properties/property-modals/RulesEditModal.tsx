'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertCircle } from 'lucide-react';

interface RulesEditModalProps {
  isOpen: boolean;
  currentRules: string[];
  onSave: (rules: string[]) => Promise<boolean>;
  onClose: () => void;
}

const COMMON_RULES = [
  'No smoking',
  'No pets',
  'No parties or events',
  'Quiet hours: 10 PM - 8 AM',
  'Check-in after 3 PM',
  'Check-out before 12 PM',
  'Maximum occupancy as listed',
  'No unregistered guests',
  'Respect neighbors and property',
  'Take care of the space',
];

export default function RulesEditModal({
  isOpen,
  currentRules,
  onSave,
  onClose,
}: RulesEditModalProps) {
  const [rules, setRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRules(currentRules.length > 0 ? [...currentRules] : []);
      setNewRule('');
      setError(null);
    }
  }, [isOpen, currentRules]);

  const addRule = (rule: string) => {
    const trimmedRule = rule.trim();
    if (trimmedRule && !rules.includes(trimmedRule)) {
      setRules([...rules, trimmedRule]);
      setNewRule('');
    }
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleAddCustomRule = () => {
    if (newRule.trim()) {
      addRule(newRule);
    }
  };

  const handleSave = async () => {
    if (rules.length === 0) {
      setError('Please add at least one house rule');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const success = await onSave(rules);
      
      if (success) {
        onClose();
      } else {
        setError('Failed to update house rules');
      }
    } catch (err) {
      console.error('Error saving house rules:', err);
      setError('Failed to update house rules');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit House Rules</h2>
            <p className="text-sm text-gray-500 mt-1">Set clear expectations for your guests</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSaving}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Current Rules */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Rules ({rules.length})</h3>
            {rules.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No rules added yet. Add some rules below.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {rules.map((rule, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-orange-500 font-bold">{index + 1}.</span>
                      <span className="text-gray-900">{rule}</span>
                    </div>
                    <button
                      onClick={() => removeRule(index)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                      title="Remove rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Custom Rule */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Add Custom Rule</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCustomRule();
                  }
                }}
                placeholder="Enter a custom house rule..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button
                onClick={handleAddCustomRule}
                disabled={!newRule.trim()}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Common Rules */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Add Common Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {COMMON_RULES.map((rule, index) => {
                const isAdded = rules.includes(rule);
                return (
                  <button
                    key={index}
                    onClick={() => !isAdded && addRule(rule)}
                    disabled={isAdded}
                    className={`text-left px-4 py-3 rounded-lg border-2 transition-all ${
                      isAdded
                        ? 'border-green-200 bg-green-50 text-green-700 cursor-not-allowed'
                        : 'border-gray-200 hover:border-orange-500 hover:bg-orange-50 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{rule}</span>
                      {isAdded && (
                        <span className="text-green-500">✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {rules.length} {rules.length === 1 ? 'rule' : 'rules'} added
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
              disabled={isSaving || rules.length === 0}
              className="px-6 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Rules</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

