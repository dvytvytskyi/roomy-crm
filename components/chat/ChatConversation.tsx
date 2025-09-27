'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Smile, MoreVertical, Star, Archive, Trash2, Phone, Video, Info } from 'lucide-react'

interface Message {
  id: number
  content: string
  timestamp: string
  sender: 'guest' | 'admin'
  senderName: string
  senderAvatar?: string
  platform: 'airbnb' | 'booking' | 'vrbo' | 'direct' | 'internal'
  platformIcon: string
  isRead: boolean
  attachments?: {
    type: 'image' | 'document'
    name: string
    url: string
  }[]
  messageType: 'text' | 'template' | 'automated'
}

interface ChatConversationProps {
  conversationId: number
}

export default function ChatConversation({ conversationId }: ChatConversationProps) {
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: 'Hi! I\'m checking in tomorrow. What time is check-in?',
      timestamp: '2024-01-19 14:30',
      sender: 'guest',
      senderName: 'Sarah Johnson',
      platform: 'airbnb',
      platformIcon: '🏠',
      isRead: true,
      messageType: 'text'
    },
    {
      id: 2,
      content: 'Hello Sarah! Welcome to our property. Check-in time is from 3:00 PM onwards. You can collect your keys from the front desk or use the self-check-in option. I\'ll send you the detailed instructions shortly.',
      timestamp: '2024-01-19 14:35',
      sender: 'admin',
      senderName: 'Admin',
      platform: 'airbnb',
      platformIcon: '🏠',
      isRead: true,
      messageType: 'text'
    },
    {
      id: 3,
      content: 'Thank you! That sounds perfect. I\'ll be arriving around 4 PM. Is there parking available?',
      timestamp: '2024-01-19 14:40',
      sender: 'guest',
      senderName: 'Sarah Johnson',
      platform: 'airbnb',
      platformIcon: '🏠',
      isRead: true,
      messageType: 'text'
    },
    {
      id: 4,
      content: 'Yes, we have complimentary parking available for guests. The parking area is located on the ground floor. I\'ll send you the parking instructions along with the check-in details.',
      timestamp: '2024-01-19 14:42',
      sender: 'admin',
      senderName: 'Admin',
      platform: 'airbnb',
      platformIcon: '🏠',
      isRead: true,
      messageType: 'text'
    },
    {
      id: 5,
      content: 'Perfect! Looking forward to my stay. Thank you for the quick response.',
      timestamp: '2024-01-19 14:45',
      sender: 'guest',
      senderName: 'Sarah Johnson',
      platform: 'airbnb',
      platformIcon: '🏠',
      isRead: true,
      messageType: 'text'
    },
    {
      id: 6,
      content: 'You\'re very welcome, Sarah! If you need anything during your stay, don\'t hesitate to reach out. Have a wonderful time!',
      timestamp: '2024-01-19 14:47',
      sender: 'admin',
      senderName: 'Admin',
      platform: 'airbnb',
      platformIcon: '🏠',
      isRead: true,
      messageType: 'text'
    }
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: messages.length + 1,
        content: newMessage,
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        sender: 'admin',
        senderName: 'Admin',
        platform: 'airbnb',
        platformIcon: '🏠',
        isRead: false,
        messageType: 'text'
      }
      setMessages([...messages, message])
      setNewMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-orange-600">SJ</span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900">Sarah Johnson</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-500">sarah.johnson@email.com</span>
                <span className="text-lg">🏠</span>
                <span className="text-sm text-slate-500">Airbnb</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Phone size={18} />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Video size={18} />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Info size={18} />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>
        
        {/* Reservation Info */}
        <div className="mt-3 p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <span className="text-xs text-slate-500">Reservation</span>
                <p className="text-sm font-medium text-slate-900">AIR-2024-001</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Property</span>
                <p className="text-sm font-medium text-slate-900">Apartment Burj Khalifa 2</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Check-in</span>
                <p className="text-sm font-medium text-slate-900">Jan 20, 2024</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Check-out</span>
                <p className="text-sm font-medium text-slate-900">Jan 25, 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const showDate = index === 0 || 
            formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp)
          
          return (
            <div key={message.id}>
              {showDate && (
                <div className="flex justify-center mb-4">
                  <span className="px-3 py-1 text-xs font-medium text-slate-500 bg-slate-100 rounded-full">
                    {formatDate(message.timestamp)}
                  </span>
                </div>
              )}
              
              <div className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-xs lg:max-w-md ${message.sender === 'admin' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 ${message.sender === 'admin' ? 'ml-3' : 'mr-3'}`}>
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-slate-600">
                        {message.sender === 'admin' ? 'A' : 'S'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Message */}
                  <div className={`flex flex-col ${message.sender === 'admin' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2 rounded-lg ${
                      message.sender === 'admin' 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-white border border-gray-200 text-slate-900'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    
                    {/* Message Info */}
                    <div className={`flex items-center space-x-1 mt-1 ${message.sender === 'admin' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-xs text-slate-500">{formatTime(message.timestamp)}</span>
                      {message.sender === 'admin' && (
                        <span className="text-xs text-slate-500">{message.senderName}</span>
                      )}
                      {message.sender === 'guest' && (
                        <span className="text-xs text-slate-500">{message.senderName}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end space-x-3">
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Paperclip size={18} />
          </button>
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows={1}
            />
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Smile size={18} />
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center space-x-4 mt-3">
          <button className="text-xs text-slate-500 hover:text-orange-600 transition-colors">
            📋 Use Template
          </button>
          <button className="text-xs text-slate-500 hover:text-orange-600 transition-colors">
            🤖 Auto Reply
          </button>
          <button className="text-xs text-slate-500 hover:text-orange-600 transition-colors">
            📎 Attach File
          </button>
        </div>
      </div>
    </div>
  )
}
