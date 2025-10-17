'use client'

import { useState } from 'react'
import { Plus, Check, X, Edit2, Trash2 } from 'lucide-react'

interface ChecklistItem {
  id: string
  name: string
  completed: boolean
  isStandard: boolean
}

interface CleaningChecklistProps {
  taskId?: string
  onChecklistChange?: (items: ChecklistItem[]) => void
}

export default function CleaningChecklist({ taskId, onChecklistChange }: CleaningChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: '1', name: 'Kitchen appliances cleaned', completed: false, isStandard: true },
    { id: '2', name: 'Bathroom sanitized', completed: false, isStandard: true },
    { id: '3', name: 'Bed linens changed', completed: false, isStandard: true },
    { id: '4', name: 'Air vents cleaned', completed: false, isStandard: false },
    { id: '5', name: 'Allergen removal treatment', completed: false, isStandard: false }
  ])
  
  const [newItemName, setNewItemName] = useState('')
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editItemName, setEditItemName] = useState('')

  const standardItems = items.filter(item => item.isStandard)
  const additionalItems = items.filter(item => !item.isStandard)

  const handleToggleComplete = (itemId: string) => {
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    )
    setItems(updatedItems)
    onChecklistChange?.(updatedItems)
  }

  const handleAddItem = () => {
    if (newItemName.trim()) {
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        name: newItemName.trim(),
        completed: false,
        isStandard: false
      }
      const updatedItems = [...items, newItem]
      setItems(updatedItems)
      setNewItemName('')
      setIsAddingItem(false)
      onChecklistChange?.(updatedItems)
    }
  }

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId)
    setItems(updatedItems)
    onChecklistChange?.(updatedItems)
  }

  const handleStartEdit = (item: ChecklistItem) => {
    setEditingItem(item.id)
    setEditItemName(item.name)
  }

  const handleSaveEdit = () => {
    if (editItemName.trim()) {
      const updatedItems = items.map(item =>
        item.id === editingItem ? { ...item, name: editItemName.trim() } : item
      )
      setItems(updatedItems)
      setEditingItem(null)
      setEditItemName('')
      onChecklistChange?.(updatedItems)
    }
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
    setEditItemName('')
  }

  const completedCount = items.filter(item => item.completed).length
  const totalCount = items.length

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Cleaning Checklist</h3>
          <p className="text-sm text-gray-600">
            {completedCount} of {totalCount} items completed
          </p>
        </div>
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
          <div className="text-2xl font-bold text-orange-600">
            {Math.round((completedCount / totalCount) * 100)}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Standard Items */}
      <div className="mb-8">
        <h4 className="text-md font-medium text-gray-900 mb-4">Standard Items</h4>
        <div className="space-y-3">
          {standardItems.map((item) => (
            <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <button
                onClick={() => handleToggleComplete(item.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  item.completed
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'border-gray-300 hover:border-orange-400'
                }`}
              >
                {item.completed && <Check size={14} />}
              </button>
              
              {editingItem === item.id ? (
                <div className="flex-1 flex items-center space-x-2">
                  <input
                    type="text"
                    value={editItemName}
                    onChange={(e) => setEditItemName(e.target.value)}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="p-1 text-green-600 hover:text-green-800"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <span className={`flex-1 text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {item.name}
                  </span>
                  <button
                    onClick={() => handleStartEdit(item)}
                    className="p-1 text-gray-400 hover:text-orange-600"
                  >
                    <Edit2 size={14} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Additional Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900">Additional Items</h4>
        </div>
        
        <div className="space-y-3">
          {additionalItems.map((item) => (
            <div key={item.id} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <button
                onClick={() => handleToggleComplete(item.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  item.completed
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'border-gray-300 hover:border-orange-400'
                }`}
              >
                {item.completed && <Check size={14} />}
              </button>
              
              {editingItem === item.id ? (
                <div className="flex-1 flex items-center space-x-2">
                  <input
                    type="text"
                    value={editItemName}
                    onChange={(e) => setEditItemName(e.target.value)}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="p-1 text-green-600 hover:text-green-800"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <span className={`flex-1 text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {item.name}
                  </span>
                  <button
                    onClick={() => handleStartEdit(item)}
                    className="p-1 text-gray-400 hover:text-orange-600"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Add New Item */}
        {isAddingItem ? (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Enter new checklist item..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
              />
              <button
                onClick={handleAddItem}
                className="px-3 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => {
                  setIsAddingItem(false)
                  setNewItemName('')
                }}
                className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingItem(true)}
            className="mt-4 w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-400 hover:text-orange-600 transition-colors"
          >
            <Plus size={16} />
            <span>Add Item</span>
          </button>
        )}
      </div>
    </div>
  )
}
