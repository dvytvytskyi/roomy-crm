'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { portalService, Property, Reservation, OwnerFinancialSummary } from '@/lib/api/services/portalService-v2'

export default function OwnerPortalPage() {
  const router = useRouter()
  const { user, isAuthenticated, isInitialized } = useAuth()
  
  const [properties, setProperties] = useState<Property[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [finances, setFinances] = useState<OwnerFinancialSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check authentication and role
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login')
    }
    
    if (isInitialized && isAuthenticated && user) {
      if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
        router.push('/login')
      }
    }
  }, [isInitialized, isAuthenticated, user, router])

  // Load portal data
  useEffect(() => {
    if (isInitialized && isAuthenticated && user) {
      loadPortalData()
    }
  }, [isInitialized, isAuthenticated, user])

  const loadPortalData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [propertiesRes, reservationsRes, financesRes] = await Promise.all([
        portalService.owner.getProperties(),
        portalService.owner.getReservations(),
        portalService.owner.getFinances(),
      ])

      if (propertiesRes.success && propertiesRes.data) {
        setProperties(propertiesRes.data)
      }

      if (reservationsRes.success && reservationsRes.data) {
        setReservations(reservationsRes.data)
      }

      if (financesRes.success && financesRes.data) {
        setFinances(financesRes.data)
      }
    } catch (err) {
      console.error('Error loading portal data:', err)
      setError('Failed to load portal data')
    } finally {
      setLoading(false)
    }
  }

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Owner Portal...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadPortalData}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Owner Portal</h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome, {user?.firstName} {user?.lastName}
              </p>
            </div>
            <button
              onClick={() => router.push('/logout')}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Financial Overview */}
        {finances && (
          <>
            <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Total Revenue</h3>
                <p className="text-3xl font-bold text-green-600">
                  AED {finances.summary.totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Paid: AED {finances.summary.totalPaid.toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Total Expenses</h3>
                <p className="text-3xl font-bold text-red-600">
                  AED {finances.summary.totalExpenses.toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Net Income</h3>
                <p className="text-3xl font-bold text-blue-600">
                  AED {finances.summary.netIncome.toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Properties</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {finances.propertiesCount}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {finances.reservationsCount} Reservations
                </p>
              </div>
            </div>

            {/* Property Breakdown */}
            <section className="mb-8">
              <div className="bg-white rounded-lg shadow border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Property Financial Breakdown
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  {finances.propertyBreakdown.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No financial data available</p>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Property
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Revenue
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Paid
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Expenses
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Net Income
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {finances.propertyBreakdown.map((breakdown) => (
                          <tr key={breakdown.propertyId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {breakdown.propertyTitle}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">
                              AED {breakdown.revenue.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600">
                              AED {breakdown.paid.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                              AED {breakdown.expenses.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                              AED {breakdown.netIncome.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Properties Section */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                My Properties ({properties.length})
              </h2>
            </div>
            <div className="p-6">
              {properties.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No properties found</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {property.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{property.address}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">
                          {property.bedrooms} bed · {property.bathrooms} bath
                        </span>
                        <span className="font-semibold text-orange-600">
                          AED {property.price_per_night}/night
                        </span>
                      </div>
                      {property.users_properties_agent_idTousers && (
                        <p className="text-xs text-gray-500 mt-2">
                          Agent: {property.users_properties_agent_idTousers.firstName}{' '}
                          {property.users_properties_agent_idTousers.lastName}
                        </p>
                      )}
                      <div className="mt-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            property.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {property.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Recent Reservations */}
        <section>
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Reservations ({reservations.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              {reservations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No reservations found</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guest
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paid
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reservations.slice(0, 10).map((reservation) => (
                      <tr key={reservation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {reservation.guest_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {reservation.guest_email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reservation.properties?.title || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(reservation.check_in).toLocaleDateString()} -{' '}
                          {new Date(reservation.check_out).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                          AED {reservation.total_amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">
                          AED {reservation.paid_amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              reservation.status === 'CONFIRMED'
                                ? 'bg-green-100 text-green-800'
                                : reservation.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {reservation.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

