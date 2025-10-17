'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import TopNavigation from '../../../components/TopNavigation'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Building, 
  DollarSign, 
  FileText, 
  Camera, 
  MessageSquare, 
  Wrench, 
  Image as ImageIcon, 
  X,
  ChevronDown
} from 'lucide-react'
import { taskServiceV2, TaskWithDetailsV2, TaskCommentV2, TaskAttachmentV2 } from '../../../lib/api/services/taskService-v2'
import { taskPhotoService, TaskPhoto } from '../../../lib/api/services/taskPhotoService'
import { showToast } from '../../../lib/utils/toast'

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
  const [editValue, setEditValue] = useState('')
  const [uploadingFile, setUploadingFile] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const [loading, setLoading] = useState(true)
  const [task, setTask] = useState<TaskWithDetailsV2 | null>(null)
  const [comments, setComments] = useState<TaskCommentV2[]>([])
  const [attachments, setAttachments] = useState<TaskAttachmentV2[]>([])
  const [photos, setPhotos] = useState<TaskPhoto[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  // Load task data
  useEffect(() => {
    const loadTaskData = async () => {
      try {
        setLoading(true)
        const taskId = params.id as string
        
        // Load task details
        const taskResponse = await taskServiceV2.getById(taskId)
        if (taskResponse.success && taskResponse.data) {
          setTask(taskResponse.data)
          setComments(taskResponse.data.comments || [])
          setAttachments(taskResponse.data.attachments || [])
        }

        // Load photos
        const photosResponse = await taskPhotoService.getTaskPhotos(taskId)
        if (photosResponse.success && photosResponse.data) {
          setPhotos(photosResponse.data)
        }
        
      } catch (error) {
        console.error('Error loading task data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTaskData()
  }, [params.id])

  const handleEditField = (type: string, field: string, currentValue: string, title: string, inputType: string = 'text') => {
    setEditModal({
      isOpen: true,
      type,
      field,
      currentValue,
      title,
      inputType
    })
    setEditValue(currentValue)
  }

  const handleSaveEdit = async () => {
    if (!task || !editValue.trim()) return
    
    try {
      const updateData: any = {}
      updateData[editModal.field] = editModal.inputType === 'number' ? parseInt(editValue) : editValue
      
      const response = await taskServiceV2.update(task.id, updateData)
      if (response.success) {
        setTask(response.data)
        showToast.success('Task updated successfully')
      }
    } catch (error) {
      console.error('Error updating task:', error)
      showToast.error('Error updating task')
    }
    
    setEditModal({ ...editModal, isOpen: false })
    setEditValue('')
  }

  const handleCloseEdit = () => {
    setEditModal({ ...editModal, isOpen: false })
    setEditValue('')
  }

  const handleDelete = async () => {
    if (!task) return
    
    try {
      const response = await taskServiceV2.delete(task.id)
      if (response.success) {
        showToast.success('Task deleted successfully')
        router.push('/maintenance')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      showToast.error('Error deleting task')
    }
  }

  const handleAddComment = async () => {
    if (!task || !newComment.trim()) return
    
    try {
      const response = await taskServiceV2.addComment(task.id, {
        text: newComment,
        type: 'user'
      })
      if (response.success) {
        setComments(prev => [...prev, response.data])
        setNewComment('')
        showToast.success('Comment added successfully')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      showToast.error('Error adding comment')
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!task || !event.target.files) return
    
    const file = event.target.files[0]
    if (!file) return
    
    setUploadingFile(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', `maintenance/${task.id}`)
      
      const uploadResponse = await fetch('http://localhost:3002/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json()
        
        const response = await taskServiceV2.addAttachment(task.id, {
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: file.type,
          s3Key: uploadData.s3Key,
          s3Url: uploadData.s3Url
        })
        
        if (response.success) {
          setAttachments(prev => [...prev, response.data])
          showToast.success('File uploaded successfully')
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      showToast.error('Error uploading file')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!task) return
    
    setUpdatingStatus(true)
    try {
      const response = await taskServiceV2.updateStatus(task.id, {
        status: newStatus as 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD',
        notes: `Status changed to ${newStatus}`
      })
      
      if (response.success && response.data) {
        setTask(response.data)
        showToast.success(`Status updated to ${newStatus}`)
      } else {
        showToast.error(response.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      showToast.error('Error updating status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!task || !event.target.files || event.target.files.length === 0) return
    
    const file = event.target.files[0]
    
    const validation = taskPhotoService.validateImageFile(file)
    if (!validation.isValid) {
      showToast.error(validation.error || 'Invalid file')
      return
    }
    
    setUploadingPhoto(true)
    try {
      const response = await taskPhotoService.uploadPhoto(task.id, file)
      
      if (response.success && response.data) {
        const photosResponse = await taskPhotoService.getTaskPhotos(task.id)
        if (photosResponse.success && photosResponse.data) {
          setPhotos(photosResponse.data)
        }
        showToast.success('Photo uploaded successfully')
      } else {
        showToast.error(response.message || 'Failed to upload photo')
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      showToast.error('Error uploading photo')
    } finally {
      setUploadingPhoto(false)
      event.target.value = ''
    }
  }

  const handlePhotoDelete = async (photoId: string) => {
    if (!task) return
    
    try {
      const response = await taskPhotoService.deletePhoto(task.id, photoId)
      
      if (response.success) {
        setPhotos(prev => prev.filter(photo => photo.id !== photoId))
        showToast.success('Photo deleted successfully')
      } else {
        showToast.error(response.message || 'Failed to delete photo')
      }
    } catch (error) {
      console.error('Error deleting photo:', error)
      showToast.error('Error deleting photo')
    }
  }

  const handlePhotoDownload = async (photo: TaskPhoto) => {
    try {
      const response = await taskPhotoService.getDownloadUrl(task!.id, photo.id)
      
      if (response.success && response.data) {
        const link = document.createElement('a')
        link.href = response.data.downloadUrl
        link.download = photo.originalName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        showToast.error(response.message || 'Failed to get download URL')
      }
    } catch (error) {
      console.error('Error downloading photo:', error)
      showToast.error('Error downloading photo')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'SCHEDULED':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'ON_HOLD':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4" />
      case 'SCHEDULED':
        return <Clock className="w-4 h-4" />
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />
      case 'ON_HOLD':
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading maintenance task...</p>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Maintenance task not found</p>
        </div>
      </div>
    )
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
              <p className="text-sm text-slate-600">{task.type} - {task.unit}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
                className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border-0 appearance-none cursor-pointer focus:ring-2 focus:ring-orange-500 ${getStatusColor(task.status)} ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''} pr-8`}
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown className="w-4 h-4 text-current" />
              </div>
              {updatingStatus && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                </div>
              )}
            </div>
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
        <div className="flex gap-4">
          {/* Left Sidebar - Task Info */}
          <div className="w-80 flex-shrink-0">
            {/* Task Photo/Icon */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <div className="aspect-video rounded-lg mb-3 relative overflow-hidden">
                {photos.length > 0 ? (
                  <img
                    src={photos[0].s3Url}
                    alt="Maintenance task photo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                    <Wrench className="w-12 h-12 text-white" />
                  </div>
                )}
                <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                  Maintenance
                </span>
                {photos.length > 0 && (
                  <span className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {photos.length} photo{photos.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-slate-900">{task.type}</h3>
                  <p className="text-sm text-slate-500">{task.unit}</p>
                </div>
                <div className="relative">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={updatingStatus}
                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border-0 appearance-none cursor-pointer focus:ring-2 focus:ring-orange-500 ${getStatusColor(task.status)} ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''} pr-6`}
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="ON_HOLD">On Hold</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
                    <ChevronDown className="w-3 h-3 text-current" />
                  </div>
                  {updatingStatus && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Task Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <h3 className="text-sm font-medium text-slate-700 mb-3">Task Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Date:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-slate-900">{new Date(task.scheduledDate).toLocaleDateString()}</span>
                    <button 
                      onClick={() => handleEditField('date', 'scheduledDate', task.scheduledDate, 'Task Date', 'date')}
                      className="text-orange-600 hover:text-orange-700 cursor-pointer"
                    >
                      <Edit size={12} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Contractor:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-slate-900">{task.technician}</span>
                    <button 
                      onClick={() => handleEditField('contractor', 'technician', task.technician, 'Contractor', 'select')}
                      className="text-orange-600 hover:text-orange-700 cursor-pointer"
                    >
                      <Edit size={12} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Inspector:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-slate-900">{task.createdBy}</span>
                    <button 
                      onClick={() => handleEditField('inspector', 'createdBy', task.createdBy, 'Inspector', 'text')}
                      className="text-orange-600 hover:text-orange-700 cursor-pointer"
                    >
                      <Edit size={12} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Price:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-slate-900">AED {task.cost || 0}</span>
                    <button 
                      onClick={() => handleEditField('price', 'cost', (task.cost || 0).toString(), 'Price (AED)', 'number')}
                      className="text-orange-600 hover:text-orange-700 cursor-pointer"
                    >
                      <Edit size={12} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Priority:</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium px-2 py-1 rounded-full text-xs ${
                      task.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                      task.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                      task.priority === 'NORMAL' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.priority}
                    </span>
                    <button 
                      onClick={() => handleEditField('priority', 'priority', task.priority, 'Priority', 'select')}
                      className="text-orange-600 hover:text-orange-700 cursor-pointer"
                    >
                      <Edit size={12} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Property:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-slate-900">{task.property?.name || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Address:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-slate-900">{task.property?.address || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Assigned To:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-slate-900">{task.assignedUser?.firstName} {task.assignedUser?.lastName || 'Unassigned'}</span>
                    <button 
                      onClick={() => handleEditField('assigned', 'assignedTo', task.assignedTo || '', 'Assigned To', 'text')}
                      className="text-orange-600 hover:text-orange-700 cursor-pointer"
                    >
                      <Edit size={12} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Est. Duration:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-slate-900">{task.estimatedDuration || 'Not set'}</span>
                    <button 
                      onClick={() => handleEditField('duration', 'estimatedDuration', task.estimatedDuration || '', 'Estimated Duration', 'text')}
                      className="text-orange-600 hover:text-orange-700 cursor-pointer"
                    >
                      <Edit size={12} />
                    </button>
                  </div>
                </div>
                {task.actualDuration && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Actual Duration:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-slate-900">{task.actualDuration}</span>
                      <button 
                        onClick={() => handleEditField('actualDuration', 'actualDuration', task.actualDuration || '', 'Actual Duration', 'text')}
                        className="text-orange-600 hover:text-orange-700 cursor-pointer"
                      >
                        <Edit size={12} />
                      </button>
                    </div>
                  </div>
                )}
                {task.completedDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Completed:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-slate-900">{new Date(task.completedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Created:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-slate-900">{new Date(task.createdAt).toLocaleDateString()}</span>
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

                  {/* Notes */}
                  {task.notes && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-slate-900">Notes</h2>
                        <button 
                          onClick={() => handleEditField('notes', 'notes', task.notes || '', 'Task Notes', 'textarea')}
                          className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 text-sm cursor-pointer"
                        >
                          <Edit size={14} />
                          <span>Edit</span>
                        </button>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-slate-900 leading-relaxed">{task.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Comments */}
                  <div>
                    <h2 className="text-lg font-medium text-slate-900 mb-4">Comments & Updates</h2>
                    <div className="space-y-4">
                      {comments.map((comment) => (
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

                  {/* Photos */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
                    <h2 className="text-lg font-medium text-slate-900 mb-4 flex items-center space-x-2">
                      <ImageIcon className="w-5 h-5 text-blue-600" />
                      <span>Photos</span>
                    </h2>
                    
                    {/* Upload Photo */}
                    <div className="mb-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={uploadingPhoto}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label
                        htmlFor="photo-upload"
                        className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors ${uploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                      </label>
                    </div>

                    {/* Photos Grid */}
                    {photos.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {photos.map((photo) => (
                          <div key={photo.id} className="relative group">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={photo.s3Url}
                                alt={photo.originalName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            {/* Overlay with actions */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handlePhotoDownload(photo)}
                                  className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                                  title="Download"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handlePhotoDelete(photo.id)}
                                  className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors"
                                  title="Delete"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            {/* Photo info */}
                            <div className="mt-2">
                              <p className="text-xs text-gray-600 truncate" title={photo.originalName}>
                                {photo.originalName}
                              </p>
                              <p className="text-xs text-gray-400">
                                {taskPhotoService.formatFileSize(photo.fileSize)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No photos uploaded yet</p>
                        <p className="text-sm text-gray-400">Upload photos to document the maintenance task</p>
                      </div>
                    )}
                  </div>

                  {/* File Attachments */}
                  <div>
                    <h2 className="text-lg font-medium text-slate-900 mb-4">File Attachments</h2>
                    <div className="space-y-3">
                      {attachments.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-slate-400" />
                            <div>
                              <p className="text-sm font-medium text-slate-900">{file.name}</p>
                              <p className="text-xs text-slate-500">{file.size}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (file.s3Url) {
                                window.open(file.s3Url, '_blank')
                              } else {
                                console.log('Download file:', file.name)
                              }
                            }}
                            className="text-orange-500 hover:text-orange-600 cursor-pointer"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      ))}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        {uploadingFile ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mr-2"></div>
                            <p className="text-sm text-gray-600">Uploading...</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Click to upload files</p>
                            <input
                              type="file"
                              multiple
                              className="hidden"
                              id="file-upload"
                              onChange={handleFileUpload}
                            />
                            <label
                              htmlFor="file-upload"
                              className="text-orange-500 hover:text-orange-600 text-sm cursor-pointer"
                            >
                              Choose Files
                            </label>
                          </>
                        )}
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
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder={`Enter ${editModal.title.toLowerCase()}`}
                  />
                ) : editModal.inputType === 'select' ? (
                  <div className="relative">
                    <select
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none pr-8"
                    >
                      <option value="Dubai Plumbing Co.">Dubai Plumbing Co.</option>
                      <option value="Electric Solutions">Electric Solutions</option>
                      <option value="Cool Air Services">Cool Air Services</option>
                      <option value="Handyman Pro">Handyman Pro</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ) : (
                  <input
                    type={editModal.inputType}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
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
                  onClick={handleSaveEdit}
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
