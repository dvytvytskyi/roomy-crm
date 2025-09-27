'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import TopNavigation from '../../../components/TopNavigation'
import { ArrowLeft, Edit, Trash2, Download, Upload, Eye, CheckCircle, XCircle, Clock, User, Building, DollarSign, FileText, Camera, MessageSquare, Wrench } from 'lucide-react'

export default function MaintenanceTaskDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [editModal, setEditModal] = useState({
    isOpen: false,
    type: '',
    field: '',
    currentValue: '',
    title: '',
    inputType: 'text'
  })

  // Mock data for the maintenance task
  const mockTask = {
    id: 1,
    date: '2024-01-15',
    unit: 'Apartment Burj Khalifa 2',
    unitId: 'burj-khalifa-2',
    category: 'Plumbing',
    description: 'Kitchen sink leak repair - The kitchen sink has been leaking for the past week. Water is dripping from the base of the faucet and pooling under the sink. This needs immediate attention to prevent water damage to the cabinet and floor.',
    contractor: 'Dubai Plumbing Co.',
    contractorId: 'dubai-plumbing',
    price: 450,
    inspector: 'John Smith',
    status: 'Completed',
    comments: [
      {
        id: 1,
        author: 'John Smith',
        date: '2024-01-15T10:30:00',
        text: 'Initial inspection completed. Confirmed leak from faucet base. Parts ordered.',
        type: 'inspection'
      },
      {
        id: 2,
        author: 'Ahmed Hassan (Dubai Plumbing Co.)',
        date: '2024-01-15T14:20:00',
        text: 'Repair completed. Replaced O-ring and tightened connections. Tested - no leaks.',
        type: 'contractor'
      },
      {
        id: 3,
        author: 'John Smith',
        date: '2024-01-15T16:45:00',
        text: 'Final inspection passed. Work completed to satisfaction.',
        type: 'approval'
      }
    ],
    attachments: [
      { id: 1, name: 'Quote_Plumbing_Repair.pdf', size: '245 KB', type: 'pdf' },
      { id: 2, name: 'Invoice_450_AED.pdf', size: '180 KB', type: 'pdf' },
      { id: 3, name: 'Warranty_Certificate.pdf', size: '320 KB', type: 'pdf' }
    ],
    beforePhotos: [
      { id: 1, name: 'leak_under_sink.jpg', size: '2.1 MB', url: '/images/maintenance/leak_under_sink.jpg' },
      { id: 2, name: 'faucet_base_damage.jpg', size: '1.8 MB', url: '/images/maintenance/faucet_base_damage.jpg' }
    ],
    afterPhotos: [
      { id: 1, name: 'repaired_faucet.jpg', size: '2.3 MB', url: '/images/maintenance/repaired_faucet.jpg' },
      { id: 2, name: 'clean_under_sink.jpg', size: '1.9 MB', url: '/images/maintenance/clean_under_sink.jpg' }
    ]
  }

  const [task, setTask] = useState(mockTask)

  const handleEditField = (type: string, field: string, currentValue: string, title: string, inputType: string = 'text') => {
    setEditModal({
      isOpen: true,
      type,
      field,
      currentValue,
      title,
      inputType
    })
  }

  const handleSaveEdit = (newValue: string) => {
    console.log(`Saving ${editModal.field}: ${newValue}`)
    
    // Update the task data
    setTask(prev => ({
      ...prev,
      [editModal.field]: newValue
    }))
    
    setEditModal({ ...editModal, isOpen: false })
  }

  const handleCloseEdit = () => {
    setEditModal({ ...editModal, isOpen: false })
  }

  const handleDelete = () => {
    console.log('Deleting task:', task.id)
    router.push('/maintenance')
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'In Progress':
        return 'bg-blue-100 text-blue-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Awaiting Approval':
        return 'bg-purple-100 text-purple-800'
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
      case 'Pending':
        return <Clock className="w-4 h-4" />
      case 'Awaiting Approval':
        return <User className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getCommentIcon = (type: string) => {
    switch (type) {
      case 'inspection':
        return <Eye className="w-4 h-4 text-blue-500" />
      case 'contractor':
        return <User className="w-4 h-4 text-orange-500" />
      case 'approval':
        return <CheckCircle className="w-4 h-4 text-green-500" />
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
              onClick={() => router.push('/maintenance')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-xl font-medium text-slate-900">Maintenance Task #{task.id}</h1>
              <p className="text-sm text-slate-600">{task.category} - {task.unit}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(task.status)}`}>
              {getStatusIcon(task.status)}
              <span className="ml-2">{task.status}</span>
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
          {/* Left Sidebar - Task Info & Tabs */}
          <div className="w-80 flex-shrink-0">
            {/* Task Photo/Icon */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <div className="aspect-video bg-gradient-to-br from-orange-400 to-red-500 rounded-lg mb-3 relative flex items-center justify-center">
                <Wrench className="w-12 h-12 text-white" />
                <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                  Maintenance
                </span>
              </div>
              
              {/* Task Title */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-slate-900">{task.category}</h3>
                  <p className="text-sm text-slate-500">{task.unit}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                  {getStatusIcon(task.status)}
                  <span className="ml-1">{task.status}</span>
                </span>
              </div>
                </div>

            {/* Task Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <h3 className="text-sm font-medium text-slate-700 mb-3">Task Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Date:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-slate-900">{new Date(task.date).toLocaleDateString()}</span>
                    <button 
                      onClick={() => handleEditField('date', 'date', task.date, 'Task Date', 'date')}
                      className="text-orange-600 hover:text-orange-700 cursor-pointer"
                    >
                      <Edit size={12} />
                      </button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Contractor:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-slate-900">{task.contractor}</span>
                    <button 
                      onClick={() => handleEditField('contractor', 'contractor', task.contractor, 'Contractor', 'select')}
                      className="text-orange-600 hover:text-orange-700 cursor-pointer"
                    >
                      <Edit size={12} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Inspector:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-slate-900">{task.inspector}</span>
                    <button 
                      onClick={() => handleEditField('inspector', 'inspector', task.inspector, 'Inspector', 'text')}
                      className="text-orange-600 hover:text-orange-700 cursor-pointer"
                    >
                      <Edit size={12} />
                      </button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Price:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-slate-900">AED {task.price}</span>
                    <button 
                      onClick={() => handleEditField('price', 'price', task.price.toString(), 'Price (AED)', 'number')}
                      className="text-orange-600 hover:text-orange-700 cursor-pointer"
                    >
                      <Edit size={12} />
                    </button>
                </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-4">
                <div className="space-y-6">
                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-slate-900">Description</h2>
                    <button 
                      onClick={() => handleEditField('description', 'description', task.description, 'Task Description', 'textarea')}
                      className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 text-sm cursor-pointer"
                    >
                      <Edit size={14} />
                      <span>Edit</span>
                    </button>
                  </div>
                  <p className="text-sm text-slate-900 leading-relaxed">{task.description}</p>
            </div>

            {/* Comments */}
                <div>
              <h2 className="text-lg font-medium text-slate-900 mb-4">Comments & Updates</h2>
              <div className="space-y-4">
                {task.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3 p-3 bg-slate-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {getCommentIcon(comment.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-slate-900">{comment.author}</p>
                        <span className="text-xs text-slate-500">
                          {new Date(comment.date).toLocaleString()}
                        </span>
                        <span className="text-xs px-2 py-1 bg-slate-200 text-slate-600 rounded-full capitalize">
                          {comment.type}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{comment.text}</p>
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

            {/* File Attachments */}
                <div>
              <h2 className="text-lg font-medium text-slate-900 mb-4">File Attachments</h2>
              <div className="space-y-3">
                {task.attachments.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{file.name}</p>
                        <p className="text-xs text-slate-500">{file.size}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => console.log('Download file:', file.name)}
                      className="text-orange-500 hover:text-orange-600 cursor-pointer"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                ))}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload files</p>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="text-orange-500 hover:text-orange-600 text-sm cursor-pointer"
                    >
                      Choose Files
                    </label>
                  </div>
              </div>
            </div>

                {/* Before Photos */}
                <div>
                  <h2 className="text-lg font-medium text-slate-900 mb-4">Before Photos</h2>
                  <div className="grid grid-cols-4 gap-3">
                {task.beforePhotos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center">
                      <Camera className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => console.log('View photo:', photo.name)}
                        className="text-white hover:text-orange-300 cursor-pointer"
                      >
                            <Eye size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 truncate">{photo.name}</p>
                  </div>
                ))}
                <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Add Photo</p>
                  </div>
                </div>
              </div>
            </div>

                {/* After Photos */}
                <div>
                  <h2 className="text-lg font-medium text-slate-900 mb-4">After Photos</h2>
                  <div className="grid grid-cols-4 gap-3">
                {task.afterPhotos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center">
                      <Camera className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => console.log('View photo:', photo.name)}
                        className="text-white hover:text-orange-300 cursor-pointer"
                      >
                            <Eye size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 truncate">{photo.name}</p>
                  </div>
                ))}
                <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Add Photo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Field Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Edit {editModal.title}</h3>
                <button
                  onClick={handleCloseEdit}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <XCircle size={16} />
                </button>
              </div>
              
              <div className="mb-6">
                {editModal.inputType === 'textarea' ? (
                  <textarea
                    defaultValue={editModal.currentValue}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder={`Enter ${editModal.title.toLowerCase()}`}
                  />
                ) : editModal.inputType === 'select' ? (
                  <select
                    defaultValue={editModal.currentValue}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="Dubai Plumbing Co.">Dubai Plumbing Co.</option>
                    <option value="Electric Solutions">Electric Solutions</option>
                    <option value="Cool Air Services">Cool Air Services</option>
                    <option value="Handyman Pro">Handyman Pro</option>
                  </select>
                ) : (
                  <input
                    type={editModal.inputType}
                    defaultValue={editModal.currentValue}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder={`Enter ${editModal.title.toLowerCase()}`}
                  />
                )}
      </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={handleCloseEdit}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const input = document.querySelector('input, textarea, select') as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
                    if (input && input.value.trim()) {
                      handleSaveEdit(input.value.trim())
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-900">Delete Task</h3>
                  <p className="text-sm text-slate-600">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-slate-700 mb-6">
                Are you sure you want to delete this maintenance task? All associated files and comments will be permanently removed.
              </p>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors cursor-pointer"
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
