'use client'

import { useState } from 'react'
import TopNavigation from '../../components/TopNavigation'
import ChatInbox from '../../components/chat/ChatInbox'
import ChatConversation from '../../components/chat/ChatConversation'
import { MessageSquare, Plus, Search } from 'lucide-react'

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    platform: 'all',
    status: 'all',
    unread: false
  })

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  const handleConversationSelect = (conversationId: number) => {
    setSelectedConversation(conversationId)
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <TopNavigation />
      
      {/* Header */}
      <div className="flex-1 flex flex-col min-h-0" style={{ marginTop: '64px' }}>
        <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Chat</h1>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-80"
                  />
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors cursor-pointer">
                  <Plus size={16} />
                  <span>New Message</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-slate-700">Platform:</label>
                <select
                  value={filters.platform}
                  onChange={(e) => handleFilterChange({ ...filters, platform: e.target.value })}
                  className="px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white min-w-[140px] appearance-none bg-no-repeat bg-right bg-[length:16px] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')]"
                >
                  <option value="all">All Platforms</option>
                  <option value="airbnb">🏠 Airbnb</option>
                  <option value="booking">📅 Booking.com</option>
                  <option value="vrbo">🏖️ Vrbo</option>
                  <option value="direct">💬 Direct</option>
                  <option value="internal">🏢 Internal</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-slate-700">Status:</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange({ ...filters, status: e.target.value })}
                  className="px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white min-w-[120px] appearance-none bg-no-repeat bg-right bg-[length:16px] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgNkw4IDEwTDEyIDYiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')]"
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.unread}
                    onChange={(e) => handleFilterChange({ ...filters, unread: e.target.checked })}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-slate-700">Unread Only</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-6 px-2 sm:px-3 lg:px-4 py-1.5 min-h-0 overflow-hidden">
          {/* Left - Inbox */}
          <div className="w-96 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 h-full overflow-hidden">
              <ChatInbox
                onConversationSelect={handleConversationSelect}
                selectedConversation={selectedConversation}
                searchTerm={searchTerm}
                filters={filters}
              />
            </div>
          </div>

          {/* Right - Conversation */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-gray-200 h-full overflow-hidden">
              {selectedConversation ? (
                <ChatConversation
                  conversationId={selectedConversation}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  <div className="text-center">
                    <MessageSquare size={48} className="mx-auto mb-4 text-slate-300" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Select a conversation</h3>
                    <p className="text-sm text-slate-500">Choose a conversation from the inbox to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
