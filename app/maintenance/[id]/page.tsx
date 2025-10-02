'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import TopNavigation from '../../../components/TopNavigation'
import { ArrowLeft, Edit, Trash2, Download, Upload, Eye, CheckCircle, XCircle, Clock, User, Building, DollarSign, FileText, Camera, MessageSquare, Wrench } from 'lucide-react'
import { maintenanceService, MaintenanceTask, MaintenanceComment, MaintenanceAttachment, MaintenancePhoto } from '../../../lib/api/services/maintenanceService'

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
  const [uploadingPhoto, setUploadingPhoto] = useState(false)


  const [loading, setLoading] = useState(true)
  const [task, setTask] = useState<MaintenanceTask | null>(null)
  const [comments, setComments] = useState<MaintenanceComment[]>([])
  const [attachments, setAttachments] = useState<MaintenanceAttachment[]>([])
  const [beforePhotos, setBeforePhotos] = useState<MaintenancePhoto[]>([])
  const [afterPhotos, setAfterPhotos] = useState<MaintenancePhoto[]>([])

  // Load task data
  useEffect(() => {
    const loadTaskData = async () => {
      try {
        setLoading(true)
        const taskId = parseInt(params.id as string)
        
        // Load task details
        const taskResponse = await maintenanceService.getMaintenanceTask(taskId)
        if (taskResponse.success) {
          setTask(taskResponse.data)
        }
        
        // Load comments
        const commentsResponse = await maintenanceService.getMaintenanceComments(taskId)
        if (commentsResponse.success) {
          setComments(commentsResponse.data)
        }
        
        // Load attachments
        const attachmentsResponse = await maintenanceService.getMaintenanceAttachments(taskId)
        if (attachmentsResponse.success) {
          setAttachments(attachmentsResponse.data)
        }
        
        // Load before photos
        const beforePhotosResponse = await maintenanceService.getMaintenancePhotos(taskId, 'before')
        if (beforePhotosResponse.success) {
          console.log('Before photos loaded:', beforePhotosResponse.data)
          setBeforePhotos(beforePhotosResponse.data)
        }
        
        // Load after photos
        const afterPhotosResponse = await maintenanceService.getMaintenancePhotos(taskId, 'after')
        if (afterPhotosResponse.success) {
          console.log('After photos loaded:', afterPhotosResponse.data)
          setAfterPhotos(afterPhotosResponse.data)
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
      
      const response = await maintenanceService.updateMaintenanceTask(task.id, updateData)
      if (response.success) {
        setTask(response.data)
      }
    } catch (error) {
      console.error('Error updating task:', error)
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
      await maintenanceService.deleteMaintenanceTask(task.id)
      router.push('/maintenance')
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleAddComment = async () => {
    if (!task || !newComment.trim()) return
    
    try {
      const response = await maintenanceService.addMaintenanceComment(task.id, {
        text: newComment,
        type: 'user'
      })
      if (response.success) {
        setComments(prev => [...prev, response.data])
        setNewComment('')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!task || !event.target.files) return
    
    const file = event.target.files[0]
    if (!file) return
    
    setUploadingFile(true)
    try {
      // Upload to S3
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', `maintenance/${task.id}`)
      
      const uploadResponse = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json()
        
        // Add to maintenance task
        const response = await maintenanceService.addMaintenanceAttachment(task.id, {
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: file.type,
          s3Key: uploadData.s3Key,
          s3Url: uploadData.s3Url
        })
        
        if (response.success) {
          setAttachments(prev => [...prev, response.data])
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setUploadingFile(false)
    }
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    if (!task || !event.target.files) return
    
    const file = event.target.files[0]
    if (!file) return
    
    setUploadingPhoto(true)
    try {
      // Upload to S3
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', `maintenance/${task.id}/${type}`)
      
      const uploadResponse = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json()
        
        // Add to maintenance task
        const response = await maintenanceService.addMaintenancePhoto(task.id, {
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type,
          s3Key: uploadData.s3Key,
          s3Url: uploadData.s3Url
        })
        
        if (response.success) {
          if (type === 'before') {
            setBeforePhotos(prev => [...prev, response.data])
          } else {
            setAfterPhotos(prev => [...prev, response.data])
          }
        }
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
    } finally {
      setUploadingPhoto(false)
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
                  <h3 className="text-lg font-medium text-slate-900">{task.type}</h3>
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

            {/* Before Photos */}
            <div>
              <h2 className="text-lg font-medium text-slate-900 mb-4">Before Photos</h2>
              <div className="grid grid-cols-4 gap-3">
                {beforePhotos.map((photo) => {
                  console.log('Rendering before photo:', photo)
                  return (
                    <div key={photo.id} className="relative group">
                      <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
                        {photo.s3Url ? (
                          <img 
                            src={photo.s3Url} 
                            alt={photo.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.log('Image failed to load:', photo.s3Url)
                              // Fallback to camera icon if image fails to load
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              const parent = target.parentElement
                              if (parent) {
                                parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div>'
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Camera className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => {
                            if (photo.s3Url) {
                              window.open(photo.s3Url, '_blank')
                            } else {
                              console.log('View photo:', photo.name)
                            }
                          }}
                          className="text-white hover:text-orange-300 cursor-pointer"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 truncate">{photo.name}</p>
                    </div>
                  )
                })}
                <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  {uploadingPhoto ? (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mx-auto mb-1"></div>
                      <p className="text-xs text-gray-600">Uploading...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Add Photo</p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="before-photo-upload"
                        onChange={(e) => handlePhotoUpload(e, 'before')}
                      />
                      <label
                        htmlFor="before-photo-upload"
                        className="text-orange-500 hover:text-orange-600 text-xs cursor-pointer"
                      >
                        Choose
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

                {/* After Photos */}
                <div>
                  <h2 className="text-lg font-medium text-slate-900 mb-4">After Photos</h2>
                  <div className="grid grid-cols-4 gap-3">
                {afterPhotos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
                      {photo.s3Url ? (
                        <img 
                          src={photo.s3Url} 
                          alt={photo.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to camera icon if image fails to load
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent) {
                              parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div>'
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera className="w-6 h-6 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => {
                          if (photo.s3Url) {
                            window.open(photo.s3Url, '_blank')
                          } else {
                            console.log('View photo:', photo.name)
                          }
                        }}
                        className="text-white hover:text-orange-300 cursor-pointer"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 truncate">{photo.name}</p>
                  </div>
                ))}
                <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  {uploadingPhoto ? (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mx-auto mb-1"></div>
                      <p className="text-xs text-gray-600">Uploading...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Add Photo</p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="after-photo-upload"
                        onChange={(e) => handlePhotoUpload(e, 'after')}
                      />
                      <label
                        htmlFor="after-photo-upload"
                        className="text-orange-500 hover:text-orange-600 text-xs cursor-pointer"
                      >
                        Choose
                      </label>
                    </div>
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
                  <select
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
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
