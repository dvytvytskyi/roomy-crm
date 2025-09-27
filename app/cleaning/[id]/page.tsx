'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import TopNavigation from '../../../components/TopNavigation'
import { ArrowLeft, Edit, Trash2, Clock, User, Building, Sparkles, FileText, MessageSquare, CheckCircle, XCircle, Calendar, Plus, X } from 'lucide-react'

export default function CleaningTaskDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [editingField, setEditingField] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [showAddChecklist, setShowAddChecklist] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [showAddNote, setShowAddNote] = useState(false)

  // Static checklist items (always shown, uncheckable)
  const staticChecklistItems = [
    'Kitchen appliances cleaned',
    'Bathroom sanitized',
    'Carpet cleaning',
    'Bed linens changed',
    'Towels replaced',
    'Windows cleaned'
  ]

  // Predefined checklist options for dropdown (excluding static ones)
  const checklistOptions = [
    'Floors mopped',
    'Trash emptied',
    'Dust all surfaces',
    'Vacuum carpets',
    'Clean mirrors',
    'Disinfect doorknobs',
    'Clean light switches',
    'Wipe baseboards',
    'Clean air vents',
    'Sanitize remote controls',
    'Clean refrigerator',
    'Wipe down cabinets',
    'Clean stove top',
    'Empty dishwasher'
  ]

  // Mock data for the cleaning task
  const mockTask = {
    id: 1,
    date: '2024-01-15',
    time: '10:00',
    unit: 'Apartment Burj Khalifa 2',
    unitId: 'burj-khalifa-2',
    type: 'Deep Clean',
    cleaner: 'Clean Pro Services',
    cleanerId: 'clean-pro-services',
    duration: '3 hours',
    status: 'Completed',
    priority: 'High',
    notes: 'Post-checkout cleaning after guest departure. Guest left the apartment in good condition but requires deep cleaning including kitchen appliances, bathroom sanitization, and carpet cleaning.\n\n[1/15/2024, 2:30:00 PM] Sarah Johnson: Kitchen appliances need extra attention due to guest cooking heavy meals.\n\n[1/15/2024, 3:15:00 PM] John Smith: Bathroom tiles have some stubborn stains that require special cleaning products.',
    includesLaundry: true,
    laundryCount: 12,
    linenComments: 'Bed sheets and towels need special care due to guest allergies',
    comments: [
      {
        id: 1,
        author: 'Sarah Johnson (Clean Pro Services)',
        date: '2024-01-15T10:15:00',
        text: 'Started deep cleaning. Kitchen appliances cleaned and sanitized.',
        type: 'cleaner'
      },
      {
        id: 2,
        author: 'Sarah Johnson (Clean Pro Services)',
        date: '2024-01-15T12:30:00',
        text: 'Bathroom cleaning completed. All surfaces sanitized and towels replaced.',
        type: 'cleaner'
      },
      {
        id: 3,
        author: 'Sarah Johnson (Clean Pro Services)',
        date: '2024-01-15T13:00:00',
        text: 'Deep cleaning completed. Carpet cleaned and apartment ready for next guest.',
        type: 'completion'
      },
      {
        id: 4,
        author: 'John Smith (Inspector)',
        date: '2024-01-15T13:30:00',
        text: 'Quality inspection passed. Apartment meets all cleanliness standards.',
        type: 'inspection'
      }
    ],
    checklist: [
      { id: 7, item: 'Floors mopped', completed: true },
      { id: 8, item: 'Trash emptied', completed: true }
    ]
  }

  const [task, setTask] = useState(mockTask)
  const [staticItemsCompleted, setStaticItemsCompleted] = useState<boolean[]>([
    false, false, false, false, false, false
  ])

  const handleEditField = (fieldName: string) => {
    setEditingField(fieldName)
  }

  const handleSaveField = (fieldName: string, value: any) => {
    setTask(prev => ({
      ...prev,
      [fieldName]: value
    }))
    setEditingField(null)
    // Here you would save the changes to the backend
    console.log('Saving field change:', fieldName, value)
  }

  const handleCancelEdit = () => {
    setEditingField(null)
  }

  const handleDelete = () => {
    console.log('Deleting task:', task.id)
    router.push('/cleaning')
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: task.comments.length + 1,
        author: 'Current User',
        date: new Date().toISOString(),
        text: newComment,
        type: 'user'
      }
      setTask(prev => ({
        ...prev,
        comments: [...prev.comments, comment]
      }))
      setNewComment('')
    }
  }

  const handleAddChecklistItem = (itemText?: string) => {
    const itemToAdd = itemText || newChecklistItem.trim()
    if (itemToAdd) {
      // Check if item already exists
      const exists = task.checklist.some(item => item.item.toLowerCase() === itemToAdd.toLowerCase())
      if (!exists) {
        const newItem = {
          id: Math.max(...task.checklist.map(item => item.id)) + 1,
          item: itemToAdd,
          completed: false
        }
        setTask(prev => ({
          ...prev,
          checklist: [...prev.checklist, newItem]
        }))
      }
      setNewChecklistItem('')
      setShowAddChecklist(false)
    }
  }

  const handleRemoveChecklistItem = (itemId: number) => {
    setTask(prev => ({
      ...prev,
      checklist: prev.checklist.filter(item => item.id !== itemId)
    }))
  }

  const handleToggleStaticItem = (index: number) => {
    setStaticItemsCompleted(prev => {
      const newState = [...prev]
      newState[index] = !newState[index]
      return newState
    })
  }

  const handleAddNote = () => {
    if (newNote.trim()) {
      const timestamp = new Date().toLocaleString()
      const author = 'Current User' // In real app, this would come from auth context
      const noteWithMeta = `[${timestamp}] ${author}: ${newNote.trim()}`
      const updatedNotes = task.notes + (task.notes ? '\n\n' : '') + noteWithMeta
      setTask(prev => ({
        ...prev,
        notes: updatedNotes
      }))
      setNewNote('')
      setShowAddNote(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'In Progress':
        return 'bg-blue-100 text-blue-800'
      case 'Scheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'Cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />
      case 'In Progress':
        return <Clock className="w-4 h-4" />
      case 'Scheduled':
        return <Calendar className="w-4 h-4" />
      case 'Cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-100 text-red-800'
      case 'High':
        return 'bg-orange-100 text-orange-800'
      case 'Normal':
        return 'bg-blue-100 text-blue-800'
      case 'Low':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCommentIcon = (type: string) => {
    switch (type) {
      case 'cleaner':
        return <User className="w-4 h-4 text-orange-500" />
      case 'completion':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'inspection':
        return <FileText className="w-4 h-4 text-blue-500" />
      default:
        return <MessageSquare className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <TopNavigation />
      
      {/* Sticky Header */}
      <div className="sticky top-[3.3rem] z-10 bg-white border border-gray-200 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/cleaning')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-xl font-medium text-slate-900">Cleaning Task #{task.id}</h1>
              <p className="text-sm text-slate-600">{task.type} - {task.unit}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(task.status)}`}>
              {getStatusIcon(task.status)}
              <span className="ml-2">{task.status}</span>
            </span>
            <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(task.priority)}`}>
              {task.priority} Priority
            </span>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-2 sm:px-3 lg:px-4 pt-[4rem]">
        {/* Two Column Layout */}
        <div className="flex gap-4">
          {/* Left Sidebar - Task Info & Checklist */}
          <div className="w-80 flex-shrink-0 space-y-4">
            {/* Cleaning Checklist */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Cleaning Checklist</h2>
                <button
                  onClick={() => setShowAddChecklist(!showAddChecklist)}
                  className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center"
                >
                  <Plus size={14} className="mr-2" />
                  Add Item
                </button>
              </div>
              <div className="space-y-4">
                {/* Static checklist items */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Standard Items</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {staticChecklistItems.map((item, index) => (
                      <div 
                        key={`static-${index}`}
                        className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                        onClick={() => handleToggleStaticItem(index)}
                      >
                        <div className="flex-shrink-0">
                          {staticItemsCompleted[index] ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <div className="w-4 h-4 border-2 border-gray-300 rounded-full hover:border-green-500 transition-colors"></div>
                          )}
                        </div>
                        <span className={`text-sm text-gray-700 flex-1 transition-all duration-200 ${
                          staticItemsCompleted[index] 
                            ? 'text-gray-500 line-through' 
                            : ''
                        }`}>
                          {item}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                          Static
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Dynamic checklist items */}
                {task.checklist.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Additional Items</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {task.checklist.map((item) => (
                        <div 
                          key={item.id} 
                          className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors group"
                          onClick={() => {
                            setTask(prev => ({
                              ...prev,
                              checklist: prev.checklist.map(checklistItem => 
                                checklistItem.id === item.id 
                                  ? { ...checklistItem, completed: !checklistItem.completed }
                                  : checklistItem
                              )
                            }))
                          }}
                        >
                          <div className="flex-shrink-0">
                            {item.completed ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <div className="w-4 h-4 border-2 border-gray-300 rounded-full hover:border-green-500 transition-colors"></div>
                            )}
                          </div>
                          <span 
                            className={`text-sm text-gray-700 flex-1 transition-all duration-200 ${
                              item.completed ? 'text-gray-500 line-through' : ''
                            }`}
                          >
                            {item.item}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveChecklistItem(item.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded cursor-pointer"
                            title="Remove item"
                          >
                            <X size={14} className="text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                  
                
                {/* Add new checklist item */}
                {showAddChecklist && (
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="mb-3">
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Select checklist item:</label>
                      <select
                        value={newChecklistItem}
                        onChange={(e) => setNewChecklistItem(e.target.value)}
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzY2NzM4MCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+')] bg-no-repeat bg-right-3 bg-center pr-8"
                      >
                        <option value="">Choose an item...</option>
                        {checklistOptions
                          .filter(option => !task.checklist.some(item => item.item.toLowerCase() === option.toLowerCase()))
                          .map((option, index) => (
                            <option key={index} value={option}>
                              {option}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setShowAddChecklist(false)
                          setNewChecklistItem('')
                        }}
                        className="px-4 py-2 text-sm bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors cursor-pointer font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAddChecklistItem()}
                        disabled={!newChecklistItem}
                        className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors cursor-pointer font-medium"
                      >
                        Add Item
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Task Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Task Summary</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Standard Items</h4>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-1">{staticChecklistItems.length}</div>
                      <div className="text-sm text-green-600 font-medium">
                        {staticItemsCompleted.filter(Boolean).length} completed
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Additional Items</h4>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-1">{task.checklist.length}</div>
                      <div className="text-sm text-blue-600 font-medium">
                        {task.checklist.filter(item => item.completed).length} completed
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Overall Progress</h4>
                  <div className="text-center mb-3">
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      {(() => {
                        const totalItems = staticChecklistItems.length + task.checklist.length
                        const completedItems = staticItemsCompleted.filter(Boolean).length + task.checklist.filter(item => item.completed).length
                        return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
                      })()}%
                    </div>
                    <div className="text-sm text-gray-600">Total Progress</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(() => {
                          const totalItems = staticChecklistItems.length + task.checklist.length
                          const completedItems = staticItemsCompleted.filter(Boolean).length + task.checklist.filter(item => item.completed).length
                          return totalItems > 0 ? (completedItems / totalItems) * 100 : 0
                        })()}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Details */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Task Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Date & Time:</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        {editingField === 'datetime' ? (
                          <div className="flex items-center space-x-2">
                      <input
                        type="date"
                        value={task.date}
                        onChange={(e) => setTask(prev => ({ ...prev, date: e.target.value }))}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm min-w-[140px]"
                      />
                      <input
                        type="time"
                        value={task.time}
                        onChange={(e) => setTask(prev => ({ ...prev, time: e.target.value }))}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm min-w-[120px]"
                            />
                            <button
                              onClick={() => handleSaveField('datetime', { date: task.date, time: task.time })}
                              className="text-green-600 hover:text-green-700 cursor-pointer"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-600 hover:text-gray-700 cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                    </div>
                  ) : (
                          <>
                            <span className="text-sm text-gray-900">
                      {new Date(task.date).toLocaleDateString()} at {task.time}
                            </span>
                            <button 
                              onClick={() => handleEditField('datetime')}
                              className="text-orange-600 hover:text-orange-700 cursor-pointer"
                            >
                              <Edit size={14} />
                            </button>
                          </>
                        )}
                      </div>
                </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Unit:</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        {editingField === 'unit' ? (
                          <div className="flex items-center space-x-2">
                    <select
                      value={task.unit}
                      onChange={(e) => setTask(prev => ({ ...prev, unit: e.target.value }))}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm min-w-[200px] appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzY2NzM4MCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+')] bg-no-repeat bg-right-3 bg-center pr-8"
                    >
                      <option value="Apartment Burj Khalifa 2">Apartment Burj Khalifa 2</option>
                      <option value="Marina View Studio">Marina View Studio</option>
                      <option value="Downtown Loft 2BR">Downtown Loft 2BR</option>
                      <option value="JBR Beach Apartment">JBR Beach Apartment</option>
                    </select>
                            <button
                              onClick={() => handleSaveField('unit', task.unit)}
                              className="text-green-600 hover:text-green-700 cursor-pointer"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-600 hover:text-gray-700 cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm text-gray-900">{task.unit}</span>
                            <div className="flex items-center space-x-2">
                      <button
                        onClick={() => router.push(`/properties/${task.unitId}`)}
                                className="text-orange-600 hover:text-orange-700 text-xs cursor-pointer"
                      >
                        View Unit
                      </button>
                              <button 
                                onClick={() => handleEditField('unit')}
                                className="text-orange-600 hover:text-orange-700 cursor-pointer"
                              >
                                <Edit size={14} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Cleaning Type:</span>
                </div>
                      <div className="flex items-center space-x-3">
                        {editingField === 'type' ? (
                          <div className="flex items-center space-x-2">
                    <select
                      value={task.type}
                      onChange={(e) => setTask(prev => ({ ...prev, type: e.target.value }))}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm min-w-[160px] appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzY2NzM4MCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+')] bg-no-repeat bg-right-3 bg-center pr-8"
                    >
                      <option value="Regular Clean">Regular Clean</option>
                      <option value="Deep Clean">Deep Clean</option>
                      <option value="Office Clean">Office Clean</option>
                      <option value="Post-Checkout">Post-Checkout</option>
                      <option value="Pre-Arrival">Pre-Arrival</option>
                      <option value="Mid-Stay">Mid-Stay</option>
                    </select>
                            <button
                              onClick={() => handleSaveField('type', task.type)}
                              className="text-green-600 hover:text-green-700 cursor-pointer"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-600 hover:text-gray-700 cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm text-gray-900">{task.type}</span>
                            <button 
                              onClick={() => handleEditField('type')}
                              className="text-orange-600 hover:text-orange-700 cursor-pointer"
                            >
                              <Edit size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Cleaner:</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        {editingField === 'cleaner' ? (
                          <div className="flex items-center space-x-2">
                    <select
                      value={task.cleaner}
                      onChange={(e) => setTask(prev => ({ ...prev, cleaner: e.target.value }))}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm min-w-[180px] appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzY2NzM4MCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+')] bg-no-repeat bg-right-3 bg-center pr-8"
                    >
                      <option value="Clean Pro Services">Clean Pro Services</option>
                      <option value="Sparkle Clean">Sparkle Clean</option>
                      <option value="Professional Cleaners">Professional Cleaners</option>
                      <option value="Quick Clean">Quick Clean</option>
                    </select>
                            <button
                              onClick={() => handleSaveField('cleaner', task.cleaner)}
                              className="text-green-600 hover:text-green-700 cursor-pointer"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-600 hover:text-gray-700 cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm text-gray-900">{task.cleaner}</span>
                            <div className="flex items-center space-x-2">
                      <button
                        onClick={() => console.log('View cleaner details')}
                                className="text-orange-600 hover:text-orange-700 text-xs cursor-pointer"
                      >
                        View Details
                      </button>
                              <button 
                                onClick={() => handleEditField('cleaner')}
                                className="text-orange-600 hover:text-orange-700 cursor-pointer"
                              >
                                <Edit size={14} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Duration:</span>
                </div>
                      <div className="flex items-center space-x-3">
                        {editingField === 'duration' ? (
                          <div className="flex items-center space-x-2">
                    <select
                      value={task.duration}
                      onChange={(e) => setTask(prev => ({ ...prev, duration: e.target.value }))}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm min-w-[140px] appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzY2NzM4MCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+')] bg-no-repeat bg-right-3 bg-center pr-8"
                    >
                      <option value="1 hour">1 hour</option>
                      <option value="1.5 hours">1.5 hours</option>
                      <option value="2 hours">2 hours</option>
                      <option value="2.5 hours">2.5 hours</option>
                      <option value="3 hours">3 hours</option>
                      <option value="4 hours">4 hours</option>
                      <option value="5 hours">5 hours</option>
                      <option value="6 hours">6 hours</option>
                    </select>
                            <button
                              onClick={() => handleSaveField('duration', task.duration)}
                              className="text-green-600 hover:text-green-700 cursor-pointer"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-600 hover:text-gray-700 cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm text-gray-900">{task.duration}</span>
                            <button 
                              onClick={() => handleEditField('duration')}
                              className="text-orange-600 hover:text-orange-700 cursor-pointer"
                            >
                              <Edit size={14} />
                            </button>
                          </>
                        )}
                      </div>
                </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600">Priority:</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        {editingField === 'priority' ? (
                          <div className="flex items-center space-x-2">
                    <select
                      value={task.priority}
                      onChange={(e) => setTask(prev => ({ ...prev, priority: e.target.value }))}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm min-w-[120px] appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzY2NzM4MCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+')] bg-no-repeat bg-right-3 bg-center pr-8"
                    >
                      <option value="Low">Low</option>
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                            <button
                              onClick={() => handleSaveField('priority', task.priority)}
                              className="text-green-600 hover:text-green-700 cursor-pointer"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-600 hover:text-gray-700 cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                            <button 
                              onClick={() => handleEditField('priority')}
                              className="text-orange-600 hover:text-orange-700 cursor-pointer"
                            >
                              <Edit size={14} />
                            </button>
                          </>
                        )}
                      </div>
                </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600">Linen Service:</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        {editingField === 'linen' ? (
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={task.includesLaundry}
                          onChange={(e) => setTask(prev => ({ ...prev, includesLaundry: e.target.checked }))}
                          className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                        />
                              <span className="text-sm text-gray-700">Includes linen</span>
                      </div>
                      {task.includesLaundry && (
                              <div className="flex items-center space-x-2">
                                <label className="text-sm text-gray-600">Items:</label>
                          <input
                            type="number"
                                  min="1"
                                  max="50"
                            value={task.laundryCount}
                                  onChange={(e) => setTask(prev => ({ ...prev, laundryCount: parseInt(e.target.value) || 0 }))}
                                  className="w-16 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-center"
                          />
                        </div>
                      )}
                            <button
                              onClick={() => handleSaveField('linen', { includesLaundry: task.includesLaundry, laundryCount: task.laundryCount })}
                              className="text-green-600 hover:text-green-700 cursor-pointer"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-600 hover:text-gray-700 cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                    </div>
                  ) : (
                          <>
                            <span className="text-sm text-gray-900">
                              {task.includesLaundry ? `Yes (${task.laundryCount} items)` : 'No'}
                            </span>
                            <button 
                              onClick={() => handleEditField('linen')}
                              className="text-orange-600 hover:text-orange-700 cursor-pointer"
                            >
                              <Edit size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
                {editingField !== 'notes' && (
                  <button
                    onClick={() => setShowAddNote(!showAddNote)}
                    className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Note
                  </button>
                )}
              </div>
              
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  {editingField === 'notes' ? (
                    <div className="space-y-3">
                <textarea
                  value={task.notes}
                  onChange={(e) => setTask(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleSaveField('notes', task.notes)}
                          className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors cursor-pointer flex items-center"
                        >
                          <CheckCircle size={14} className="mr-1" />
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors cursor-pointer flex items-center"
                        >
                          <X size={14} className="mr-1" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {task.notes ? (
                        <div className="space-y-3">
                          {task.notes.split('\n\n').map((note, index) => {
                            // Check if note has timestamp and author format
                            const timestampMatch = note.match(/^\[([^\]]+)\] ([^:]+): (.+)$/)
                            if (timestampMatch) {
                              const [, timestamp, author, content] = timestampMatch
                              return (
                                <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-900">{author}</span>
                                    <span className="text-xs text-gray-500">{timestamp}</span>
                                  </div>
                                  <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
                                </div>
                              )
                            } else {
                              // Legacy note without timestamp/author
                              return (
                                <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                  <p className="text-sm text-gray-700 leading-relaxed">{note}</p>
                                </div>
                              )
                            }
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No notes yet</p>
                      )}
                    </div>
                  )}
                </div>
                {editingField !== 'notes' && (
                  <button 
                    onClick={() => handleEditField('notes')}
                    className="text-orange-600 hover:text-orange-700 cursor-pointer"
                  >
                    <Edit size={16} />
                  </button>
                )}
              </div>

              {/* Add new note */}
              {showAddNote && editingField !== 'notes' && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="mb-3">
                      <label className="text-sm font-semibold text-orange-800 mb-2 block">Add new note:</label>
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Enter your note here..."
                        rows={3}
                        className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setShowAddNote(false)
                          setNewNote('')
                        }}
                        className="px-4 py-2 text-sm bg-white border border-orange-300 hover:bg-orange-50 text-orange-700 rounded-lg transition-colors cursor-pointer font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddNote}
                        disabled={!newNote.trim()}
                        className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors cursor-pointer font-medium"
                      >
                        Add Note
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Comments & Updates</h2>
              <div className="space-y-4">
                {task.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3 p-3 bg-slate-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {getCommentIcon(comment.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-gray-900">{comment.author}</p>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.date).toLocaleString()}
                        </span>
                        <span className="text-xs px-2 py-1 bg-slate-200 text-gray-600 rounded-full capitalize">
                          {comment.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                ))}
                
                {/* Add Comment */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex space-x-3">
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment or update..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={handleAddComment}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center"
                    >
                      <MessageSquare size={16} className="mr-2" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
            <div className="p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-red-100 rounded-xl">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Delete Task</h3>
                  <p className="text-sm text-slate-600 mt-1">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-slate-700 mb-8 leading-relaxed bg-slate-50 p-4 rounded-lg border border-gray-200">
                Are you sure you want to delete this cleaning task? All associated comments and checklist items will be permanently removed.
              </p>
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-3 text-sm font-semibold text-slate-700 bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-3 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all cursor-pointer shadow-lg hover:shadow-xl"
                >
                  Delete Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}