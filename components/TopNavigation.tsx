'use client'

import { Home, DollarSign, Sparkles, Wrench, User, Users, MessageSquare, BarChart3, BookOpen, TrendingUp, Settings, UserCheck, Calendar } from 'lucide-react'
import { usePathname } from 'next/navigation'

const navItems = [
  { icon: BarChart3, label: 'Dashboard', href: '/dashboard' },
  { icon: Home, label: 'Properties', href: '/properties' },
  { icon: BookOpen, label: 'Reservations', href: '/reservations' },
  { icon: Calendar, label: 'Scheduler', href: '/scheduler' },
  { icon: DollarSign, label: 'Finances', href: '/finances' },
  { icon: TrendingUp, label: 'Analytics', href: '/analytics' },
  { icon: Sparkles, label: 'Cleaning', href: '/cleaning' },
  { icon: Wrench, label: 'Maintenance', href: '/maintenance' },
  { icon: User, label: 'Owners', href: '/owners' },
  { icon: Users, label: 'Guests', href: '/guests' },
  { icon: UserCheck, label: 'Agents', href: '/agents' },
  { icon: MessageSquare, label: 'Chat', href: '/chat' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export default function TopNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between px-6 py-2">
        <div className="flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  isActive 
                    ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 hover:text-orange-800' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </a>
            )
          })}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">R</span>
            </div>
            <span className="text-sm font-medium text-gray-700">Roomy CRM</span>
          </div>
        </div>
      </div>
    </nav>
  )
}
