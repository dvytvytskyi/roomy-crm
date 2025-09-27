'use client'

import { useState } from 'react'
import { MessageSquare, Clock, Check, CheckCheck, Star, MoreVertical, Reply, Archive, Trash2 } from 'lucide-react'

interface Conversation {
  id: number
  guestName: string
  guestEmail: string
  platform: 'airbnb' | 'booking' | 'vrbo' | 'direct' | 'internal'
  platformIcon: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  status: 'unread' | 'read' | 'replied'
  reservationId?: string
  propertyName: string
  checkIn?: string
  checkOut?: string
  priority: 'low' | 'medium' | 'high'
  assignedTo?: string
}

interface ChatInboxProps {
  onConversationSelect: (conversationId: number) => void
  selectedConversation: number | null
  searchTerm: string
  filters: {
    platform: string
    status: string
    unread: boolean
  }
}

export default function ChatInbox({ onConversationSelect, selectedConversation, searchTerm, filters }: ChatInboxProps) {
  const [conversations] = useState<Conversation[]>([
    {
      id: 1,
      guestName: 'Sarah Johnson',
      guestEmail: 'sarah.johnson@email.com',
      platform: 'airbnb',
      platformIcon: '🏠',
      lastMessage: 'Hi! I\'m checking in tomorrow. What time is check-in?',
      lastMessageTime: '2 min ago',
      unreadCount: 2,
      status: 'unread',
      reservationId: 'AIR-2024-001',
      propertyName: 'Apartment Burj Khalifa 2',
      checkIn: '2024-01-20',
      checkOut: '2024-01-25',
      priority: 'high',
      assignedTo: 'Admin'
    },
    {
      id: 2,
      guestName: 'Ahmed Al-Rashid',
      guestEmail: 'ahmed.rashid@email.com',
      platform: 'booking',
      platformIcon: '📅',
      lastMessage: 'Thank you for the welcome message! Looking forward to my stay.',
      lastMessageTime: '15 min ago',
      unreadCount: 0,
      status: 'replied',
      reservationId: 'BK-2024-002',
      propertyName: 'Marina View Studio',
      checkIn: '2024-01-22',
      checkOut: '2024-01-28',
      priority: 'medium',
      assignedTo: 'Admin'
    },
    {
      id: 3,
      guestName: 'Maria Garcia',
      guestEmail: 'maria.garcia@email.com',
      platform: 'vrbo',
      platformIcon: '🏖️',
      lastMessage: 'Is there parking available at the property?',
      lastMessageTime: '1 hour ago',
      unreadCount: 1,
      status: 'unread',
      reservationId: 'VR-2024-003',
      propertyName: 'Downtown Loft 2BR',
      checkIn: '2024-01-25',
      checkOut: '2024-01-30',
      priority: 'medium',
      assignedTo: 'Admin'
    },
    {
      id: 4,
      guestName: 'Tom Anderson',
      guestEmail: 'tom.anderson@email.com',
      platform: 'direct',
      platformIcon: '💬',
      lastMessage: 'I need to cancel my reservation for next week.',
      lastMessageTime: '2 hours ago',
      unreadCount: 0,
      status: 'read',
      reservationId: 'DIR-2024-004',
      propertyName: 'JBR Beach Apartment',
      checkIn: '2024-01-28',
      checkOut: '2024-02-02',
      priority: 'high',
      assignedTo: 'Admin'
    },
    {
      id: 5,
      guestName: 'Emma Davis',
      guestEmail: 'emma.davis@email.com',
      platform: 'airbnb',
      platformIcon: '🏠',
      lastMessage: 'The apartment was perfect! Thank you for everything.',
      lastMessageTime: '3 hours ago',
      unreadCount: 0,
      status: 'replied',
      reservationId: 'AIR-2024-005',
      propertyName: 'Business Bay Office',
      checkIn: '2024-01-15',
      checkOut: '2024-01-18',
      priority: 'low',
      assignedTo: 'Admin'
    },
    {
      id: 6,
      guestName: 'David Wilson',
      guestEmail: 'david.wilson@email.com',
      platform: 'internal',
      platformIcon: '🏢',
      lastMessage: 'Can you please update the cleaning schedule for next week?',
      lastMessageTime: '4 hours ago',
      unreadCount: 0,
      status: 'read',
      propertyName: 'All Properties',
      priority: 'medium',
      assignedTo: 'Admin'
    }
  ])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread':
        return <div className="w-2 h-2 bg-orange-500 rounded-full" />
      case 'read':
        return <Check size={14} className="text-slate-400" />
      case 'replied':
        return <CheckCheck size={14} className="text-green-500" />
      default:
        return null
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500'
      case 'medium':
        return 'border-l-yellow-500'
      case 'low':
        return 'border-l-green-500'
      default:
        return 'border-l-slate-300'
    }
  }

  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = conversation.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conversation.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conversation.propertyName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPlatform = filters.platform === 'all' || conversation.platform === filters.platform
    const matchesStatus = filters.status === 'all' || conversation.status === filters.status
    const matchesUnread = !filters.unread || conversation.unreadCount > 0

    return matchesSearch && matchesPlatform && matchesStatus && matchesUnread
  })

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-slate-900">Conversations</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-500">{filteredConversations.length} conversations</span>
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            <span className="text-sm text-slate-500">
              {conversations.filter(c => c.unreadCount > 0).length} unread
            </span>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => onConversationSelect(conversation.id)}
            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-slate-50 transition-colors border-l-4 ${getPriorityColor(conversation.priority)} ${
              selectedConversation === conversation.id ? 'bg-orange-50 border-l-orange-500' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {/* Guest Info */}
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-lg">{conversation.platformIcon}</span>
                  <h3 className="text-sm font-medium text-slate-900 truncate">
                    {conversation.guestName}
                  </h3>
                </div>

                {/* Property Info */}
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs text-slate-500">{conversation.propertyName}</span>
                  {conversation.reservationId && (
                    <span className="text-xs text-slate-400">• {conversation.reservationId}</span>
                  )}
                </div>

                {/* Last Message */}
                <p className="text-sm text-slate-600 truncate mb-2">
                  {conversation.lastMessage}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(conversation.status)}
                    <span className="text-xs text-slate-500">{conversation.lastMessageTime}</span>
                    {conversation.assignedTo && (
                      <span className="text-xs text-slate-400">• {conversation.assignedTo}</span>
                    )}
                  </div>
                  {conversation.unreadCount > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 text-slate-400 hover:text-orange-600 transition-colors">
                  <Reply size={14} />
                </button>
                <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                  <Archive size={14} />
                </button>
                <button className="p-1 text-slate-400 hover:text-red-600 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
