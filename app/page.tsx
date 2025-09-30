'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Roomy CRM</h1>
        <p className="text-xl text-gray-600 mb-8">Property Management System</p>
        
        <div className="space-y-4">
          <Link 
            href="/reservations"
            className="block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go to Reservations
          </Link>
          
          <Link 
            href="/properties"
            className="block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Properties
          </Link>
          
          <Link 
            href="/owners"
            className="block px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Go to Owners
          </Link>
        </div>
      </div>
    </div>
  )
}