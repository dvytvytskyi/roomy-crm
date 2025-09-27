export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Roomy CRM - Property Management
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Comprehensive property management system
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Properties</h3>
              <p className="text-gray-600">Manage your property portfolio</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Reservations</h3>
              <p className="text-gray-600">Handle bookings and reservations</p>
            </div>
            
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Owners</h3>
              <p className="text-gray-600">Property owner management</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Agents</h3>
              <p className="text-gray-600">Agent and staff management</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Analytics</h3>
              <p className="text-gray-600">Performance insights</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
