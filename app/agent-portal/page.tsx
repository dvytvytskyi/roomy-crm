'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { portalService, Property, Reservation, FinancialSummary } from '@/lib/api/services/portalService-v2'
import { LayoutDashboard, Home, Calendar, Wallet } from 'lucide-react'

export default function AgentPortalPage() {
  const router = useRouter()
  const { user, isAuthenticated, isInitialized } = useAuth()
  
  const [properties, setProperties] = useState<Property[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [finances, setFinances] = useState<FinancialSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'reservations' | 'payouts'>('overview')

  // Check authentication and role
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login')
    }
    
    if (isInitialized && isAuthenticated && user) {
      if (user.role !== 'AGENT' && user.role !== 'ADMIN') {
        router.push('/login')
      }
    }
  }, [isInitialized, isAuthenticated, user, router])

  const loadPortalData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [propertiesRes, reservationsRes, financesRes] = await Promise.all([
        portalService.agent.getProperties(),
        portalService.agent.getReservations(),
        portalService.agent.getFinances(),
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
  }, [])

  // Load portal data
  useEffect(() => {
    if (isInitialized && isAuthenticated && user) {
      loadPortalData()
    }
  }, [isInitialized, isAuthenticated, user, loadPortalData])

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAFAFA' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#F88559' }}></div>
          <p style={{ color: '#717171', fontFamily: 'Onest, sans-serif' }}>Loading Agent Portal...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAFAFA' }}>
        <div className="text-center">
          <p className="text-red-600 mb-4" style={{ fontFamily: 'Onest, sans-serif' }}>{error}</p>
          <button
            onClick={loadPortalData}
            className="px-6 py-3 text-white rounded-full font-medium transition-all hover:opacity-90"
            style={{ background: '#F88559', fontFamily: 'Onest, sans-serif' }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#FAFAFA', fontFamily: 'Onest, sans-serif' }}>
      {/* Header */}
      <header className="bg-white" style={{ borderBottom: '0.5px solid #E8E8E8' }}>
        <div className="max-w-7xl mx-auto px-16 py-6">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <svg xmlns="http://www.w3.org/2000/svg" width="140" height="31" viewBox="0 0 179 40" fill="none">
                <g clipPath="url(#clip0_972_3441)">
                  <path d="M105.096 4.35425C108.19 0.58998 112.051 -0.697008 116.8 0.359923C118.831 0.81337 120.46 1.84363 121.552 3.4807C122.14 4.36092 122.483 4.49762 123.349 3.61407C126.512 0.38993 130.57 -0.576978 135.103 0.316579C139.337 1.15012 141.981 4.38093 142.065 8.59198C142.131 11.9795 142.146 15.367 142.109 18.7545C142.095 20.1415 142.624 20.9017 144.231 20.7283C145.466 20.595 145.806 21.1084 145.758 22.1654C145.681 23.8291 145.678 25.4995 145.755 27.1633C145.802 28.2269 145.437 28.6737 144.22 28.647C141.485 28.587 138.741 28.6903 136.009 28.5836C133.047 28.4669 131.885 27.3067 131.863 24.5893C131.827 20.3149 131.849 16.0372 131.834 11.7594C131.83 10.5091 131.739 9.1988 130.209 8.70201C128.686 8.20855 127.308 8.77203 126.227 9.75894C124.598 11.2426 123.904 13.1598 123.831 15.1903C123.689 19.1279 123.663 23.0723 123.689 27.0133C123.696 28.2402 123.269 28.6937 121.91 28.6503C119.601 28.577 117.282 28.5703 114.973 28.6503C113.582 28.7003 113.227 28.2136 113.242 26.9999C113.3 21.9453 113.26 16.8941 113.249 11.8395C113.246 10.4658 113.198 9.00875 111.401 8.61199C109.735 8.24189 108.293 8.90873 107.248 10.119C105.801 11.7961 105.254 13.7866 105.217 15.8705C105.151 19.6447 105.144 23.4224 105.206 27.2C105.224 28.3036 104.808 28.6703 103.639 28.647C101.268 28.597 98.8905 28.577 96.5199 28.6537C95.1575 28.697 94.7301 28.2436 94.7411 27.0199C94.7959 21.6319 94.7155 16.2439 94.7886 10.8592C94.8105 9.22881 94.3904 8.25523 92.3705 8.44528C91.5925 8.51863 91.2893 8.13187 91.2966 7.44503C91.3112 5.55789 91.3185 3.66742 91.2893 1.78028C91.2783 0.993415 91.6509 0.703342 92.4947 0.713345C95.4753 0.740018 98.4595 0.680003 101.44 0.756689C103.434 0.803367 104.18 1.59023 105.096 4.35425Z" fill="#F88559"/>
                  <path d="M163.332 17.7609C164.778 12.9197 166.188 8.16848 167.616 3.42396C168.201 1.48347 169.249 0.723283 171.375 0.699944C173.384 0.679939 175.393 0.749957 177.398 0.689942C178.553 0.6566 179.068 0.956675 178.991 2.08696C178.9 3.41396 178.969 4.75096 178.973 6.08462C178.976 7.26159 179.349 8.55858 177.278 8.71528C176.485 8.7753 176.383 9.7022 176.127 10.3057C173.168 17.3408 170.232 24.3825 167.284 31.4243C165.275 36.2222 161.648 39.2629 155.946 39.9064C152.622 40.2832 149.579 39.4463 146.822 37.7192C146.193 37.3258 145.857 36.9157 146.263 36.2022C147.209 34.5251 148.137 32.8413 149.046 31.1476C149.609 30.1073 150.076 30.9075 150.555 31.1942C153.28 32.8246 156.611 32.2645 158.028 29.9306C158.499 29.1571 158.598 28.4335 158.16 27.57C155.157 21.6919 152.206 15.7937 149.232 9.90225C148.951 9.34544 148.663 8.64527 147.939 8.60526C146.318 8.51523 146.416 7.56833 146.449 6.5314C146.497 4.97768 146.5 3.42062 146.453 1.8669C146.427 1.01002 146.767 0.676605 147.72 0.693276C149.97 0.733286 152.224 0.693276 154.474 0.716615C156.384 0.73662 157.25 1.92358 157.783 3.36061C159.529 8.07512 161.904 12.5963 162.988 17.5142C163.007 17.5975 163.164 17.6475 163.332 17.7609Z" fill="#F88559"/>
                  <path d="M41.2503 0.0625843C50.6888 0.0359109 57.8189 6.34415 57.8518 14.7496C57.881 22.9683 50.6669 29.3666 41.3306 29.3933C31.6766 29.4233 24.5064 23.185 24.4844 14.7329C24.4589 6.26413 31.5159 0.0925918 41.2503 0.0625843ZM37.9702 18.3505C38.0615 21.4246 39.0915 24.542 41.3781 27.2894C42.3351 28.4397 43.1716 28.3363 44.1542 27.2927C48.4022 22.7849 48.4607 13.0858 44.2309 8.6514C43.0912 7.45443 42.3826 7.43443 41.3343 8.71475C39.0879 11.4621 37.9775 14.5695 37.9702 18.3505Z" fill="#F88559"/>
                  <path d="M58.0081 14.6201C57.7122 6.33803 65.5984 -0.376981 75.4058 0.0164509C84.249 0.373207 91.4082 6.78481 91.3096 14.7735C91.2037 23.2723 83.8581 29.5305 74.1493 29.3905C64.8532 29.2538 57.8875 22.8788 58.0081 14.6201ZM80.8008 17.8376C80.8885 14.6634 80.0045 11.546 77.7983 8.81865C76.6441 7.38829 75.8514 7.43831 74.6607 8.81198C70.3797 13.7499 70.3797 22.1053 74.6607 27.1266C75.8514 28.5236 76.5601 28.5536 77.7362 27.0699C79.8694 24.3825 80.8702 21.3518 80.8008 17.8376Z" fill="#F88559"/>
                  <path d="M13.5381 5.92509C15.4155 3.23442 17.5158 1.10055 20.8946 0.303688C21.2452 0.220334 21.5996 0.126977 21.9575 0.0936358C24.4012 -0.136422 24.5034 -0.0497332 24.5071 2.23417C24.5071 4.23134 24.4888 6.23184 24.5107 8.229C24.518 8.97586 24.3427 9.24592 23.3675 9.19925C17.3624 8.90584 14.0166 11.7966 13.9179 17.3279C13.8595 20.5454 13.8668 23.7662 13.9253 26.9837C13.9435 28.0473 13.6075 28.4674 12.3875 28.4307C10.0169 28.3607 7.64263 28.3507 5.27569 28.4374C3.94611 28.4874 3.63198 28.0106 3.64293 26.8937C3.69042 21.4556 3.62102 16.0143 3.69042 10.5763C3.70868 9.07255 3.34707 8.18232 1.48785 8.40238C0.395695 8.53241 -0.0316697 8.12898 0.00850987 7.09539C0.0815636 5.32161 0.10348 3.54116 0.00485718 1.77072C-0.0572385 0.613766 0.476054 0.360369 1.60473 0.387042C3.91323 0.443723 6.22539 0.390377 8.53754 0.407047C12.4021 0.433721 13.4979 1.44397 13.5381 4.98152C13.5417 5.29494 13.5381 5.60835 13.5381 5.92509Z" fill="#F88559"/>
                </g>
                <defs>
                  <clipPath id="clip0_972_3441">
                    <rect width="179" height="40" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
              
              <div style={{ height: '20px', width: '1px', background: '#E8E8E8' }}></div>
              
              <span style={{ color: '#0D0C22', fontSize: '16px', fontWeight: 500 }}>Agent Portal</span>
            </div>

            <div className="flex items-center gap-4">
              <span style={{ color: '#717171', fontSize: '14px' }}>
                {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem('token')
                  router.push('/login')
                }}
                className="px-6 py-2 rounded-full font-medium transition-all hover:opacity-90"
                style={{ 
                  background: 'white',
                  border: '1px solid #E8E8E8',
                  color: '#717171',
                  fontSize: '14px'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-16 py-12">
        {/* Financial Summary */}
        {finances && (
          <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-8" style={{ border: '1px solid #E8E8E8', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#717171', marginBottom: '12px', letterSpacing: '0.5px' }}>
                TOTAL REVENUE
              </h3>
              <p style={{ fontSize: '36px', fontWeight: 600, color: '#10B981', marginBottom: '8px' }}>
                AED {finances.revenue.total.toLocaleString()}
              </p>
              <p style={{ fontSize: '13px', color: '#717171' }}>
                Paid: AED {finances.revenue.paid.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl p-8" style={{ border: '1px solid #E8E8E8', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#717171', marginBottom: '12px', letterSpacing: '0.5px' }}>
                TOTAL EXPENSES
              </h3>
              <p style={{ fontSize: '36px', fontWeight: 600, color: '#EF4444' }}>
                AED {finances.expenses.total.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl p-8" style={{ border: '1px solid #E8E8E8', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#717171', marginBottom: '12px', letterSpacing: '0.5px' }}>
                NET INCOME
              </h3>
              <p style={{ fontSize: '36px', fontWeight: 600, color: '#F88559' }}>
                AED {finances.netIncome.toLocaleString()}
              </p>
              <p style={{ fontSize: '13px', color: '#717171' }}>
                {finances.reservationsCount} Reservations
              </p>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="bg-white rounded-xl" style={{ border: '1px solid #E8E8E8', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div className="flex" style={{ borderBottom: '1px solid #E8E8E8' }}>
              <button
                onClick={() => setActiveTab('overview')}
                className="px-8 py-4 font-medium transition-all flex items-center gap-2"
                style={{
                  fontSize: '14px',
                  color: activeTab === 'overview' ? '#F88559' : '#717171',
                  borderBottom: activeTab === 'overview' ? '2px solid #F88559' : '2px solid transparent',
                  fontWeight: activeTab === 'overview' ? 600 : 400
                }}
              >
                <LayoutDashboard size={18} />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('properties')}
                className="px-8 py-4 font-medium transition-all flex items-center gap-2"
                style={{
                  fontSize: '14px',
                  color: activeTab === 'properties' ? '#F88559' : '#717171',
                  borderBottom: activeTab === 'properties' ? '2px solid #F88559' : '2px solid transparent',
                  fontWeight: activeTab === 'properties' ? 600 : 400
                }}
              >
                <Home size={18} />
                Properties
              </button>
              <button
                onClick={() => setActiveTab('reservations')}
                className="px-8 py-4 font-medium transition-all flex items-center gap-2"
                style={{
                  fontSize: '14px',
                  color: activeTab === 'reservations' ? '#F88559' : '#717171',
                  borderBottom: activeTab === 'reservations' ? '2px solid #F88559' : '2px solid transparent',
                  fontWeight: activeTab === 'reservations' ? 600 : 400
                }}
              >
                <Calendar size={18} />
                Reservations
              </button>
              <button
                onClick={() => setActiveTab('payouts')}
                className="px-8 py-4 font-medium transition-all flex items-center gap-2"
                style={{
                  fontSize: '14px',
                  color: activeTab === 'payouts' ? '#F88559' : '#717171',
                  borderBottom: activeTab === 'payouts' ? '2px solid #F88559' : '2px solid transparent',
                  fontWeight: activeTab === 'payouts' ? 600 : 400
                }}
              >
                <Wallet size={18} />
                Payouts
              </button>
            </div>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-12">
            {/* Properties Preview */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0D0C22' }}>
                  Properties Overview
                </h3>
                <button
                  onClick={() => setActiveTab('properties')}
                  style={{ fontSize: '14px', color: '#F88559', fontWeight: 500 }}
                >
                  View All →
                </button>
              </div>
              <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #E8E8E8' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {properties.slice(0, 3).map((property) => (
                    <div key={property.id} className="p-4 rounded-lg" style={{ background: '#FAFAFA', border: '1px solid #E8E8E8' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#0D0C22', marginBottom: '8px' }}>
                        {property.name}
                      </h4>
                      <p style={{ fontSize: '13px', color: '#717171' }}>
                        {property.bedrooms} bed · {property.bathrooms} bath
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Recent Reservations Preview */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0D0C22' }}>
                  Recent Reservations
                </h3>
                <button
                  onClick={() => setActiveTab('reservations')}
                  style={{ fontSize: '14px', color: '#F88559', fontWeight: 500 }}
                >
                  View All →
                </button>
              </div>
              <div className="bg-white rounded-xl" style={{ border: '1px solid #E8E8E8' }}>
                <table className="min-w-full">
                  <thead style={{ background: '#FAFAFA' }}>
                    <tr>
                      <th className="px-6 py-3 text-left" style={{ fontSize: '12px', fontWeight: 600, color: '#717171' }}>GUEST</th>
                      <th className="px-6 py-3 text-left" style={{ fontSize: '12px', fontWeight: 600, color: '#717171' }}>DATES</th>
                      <th className="px-6 py-3 text-right" style={{ fontSize: '12px', fontWeight: 600, color: '#717171' }}>AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.slice(0, 5).map((res, idx) => (
                      <tr key={res.id} style={{ borderTop: idx === 0 ? 'none' : '1px solid #E8E8E8' }}>
                        <td className="px-6 py-3" style={{ fontSize: '14px', color: '#0D0C22' }}>{res.guest_name}</td>
                        <td className="px-6 py-3" style={{ fontSize: '14px', color: '#717171' }}>
                          {new Date(res.check_in).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3 text-right" style={{ fontSize: '14px', fontWeight: 600, color: '#0D0C22' }}>
                          AED {res.total_amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
        <section className="mb-12">
          <div className="bg-white rounded-xl" style={{ border: '1px solid #E8E8E8', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div className="px-8 py-6" style={{ borderBottom: '1px solid #E8E8E8' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#0D0C22' }}>
                My Properties ({properties.length})
              </h2>
            </div>
            <div className="p-8">
              {properties.length === 0 ? (
                <p style={{ color: '#717171', textAlign: 'center', padding: '48px 0', fontSize: '15px' }}>
                  No properties assigned
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      className="rounded-lg p-6 transition-all hover:shadow-md"
                      style={{ border: '1px solid #E8E8E8', background: '#FAFAFA' }}
                    >
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0D0C22', marginBottom: '8px' }}>
                        {property.name}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#717171', marginBottom: '12px' }}>
                        {property.address}
                      </p>
                      <div className="flex justify-between items-center" style={{ fontSize: '14px' }}>
                        <span style={{ color: '#717171' }}>
                          {property.bedrooms} bed · {property.bathrooms} bath
                        </span>
                        <span style={{ fontWeight: 600, color: '#F88559' }}>
                          AED {property.price_per_night}/night
                        </span>
                      </div>
                      {property.users_properties_owner_idTousers && (
                        <p style={{ fontSize: '12px', color: '#717171', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #E8E8E8' }}>
                          Owner: {property.users_properties_owner_idTousers.firstName}{' '}
                          {property.users_properties_owner_idTousers.lastName}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
        )}

        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
        <section>
          <div className="bg-white rounded-xl" style={{ border: '1px solid #E8E8E8', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div className="px-8 py-6" style={{ borderBottom: '1px solid #E8E8E8' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#0D0C22' }}>
                Recent Reservations ({reservations.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              {reservations.length === 0 ? (
                <p style={{ color: '#717171', textAlign: 'center', padding: '48px 0', fontSize: '15px' }}>
                  No reservations found
                </p>
              ) : (
                <table className="min-w-full">
                  <thead style={{ background: '#FAFAFA' }}>
                    <tr>
                      <th className="px-8 py-4 text-left" style={{ fontSize: '12px', fontWeight: 600, color: '#717171', letterSpacing: '0.5px' }}>
                        GUEST
                      </th>
                      <th className="px-8 py-4 text-left" style={{ fontSize: '12px', fontWeight: 600, color: '#717171', letterSpacing: '0.5px' }}>
                        PROPERTY
                      </th>
                      <th className="px-8 py-4 text-left" style={{ fontSize: '12px', fontWeight: 600, color: '#717171', letterSpacing: '0.5px' }}>
                        CHECK-IN
                      </th>
                      <th className="px-8 py-4 text-left" style={{ fontSize: '12px', fontWeight: 600, color: '#717171', letterSpacing: '0.5px' }}>
                        CHECK-OUT
                      </th>
                      <th className="px-8 py-4 text-left" style={{ fontSize: '12px', fontWeight: 600, color: '#717171', letterSpacing: '0.5px' }}>
                        AMOUNT
                      </th>
                      <th className="px-8 py-4 text-left" style={{ fontSize: '12px', fontWeight: 600, color: '#717171', letterSpacing: '0.5px' }}>
                        STATUS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {reservations.slice(0, 10).map((reservation, index) => (
                      <tr key={reservation.id} style={{ borderTop: index === 0 ? 'none' : '1px solid #E8E8E8' }}>
                        <td className="px-8 py-5 whitespace-nowrap" style={{ fontSize: '14px', fontWeight: 500, color: '#0D0C22' }}>
                          {reservation.guest_name}
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap" style={{ fontSize: '14px', color: '#0D0C22' }}>
                          {reservation.properties?.title || 'N/A'}
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap" style={{ fontSize: '14px', color: '#717171' }}>
                          {new Date(reservation.check_in).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap" style={{ fontSize: '14px', color: '#717171' }}>
                          {new Date(reservation.check_out).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap" style={{ fontSize: '14px', fontWeight: 600, color: '#0D0C22' }}>
                          AED {reservation.total_amount.toLocaleString()}
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <span
                            className="px-3 py-1 inline-flex rounded-full"
                            style={{
                              fontSize: '12px',
                              fontWeight: 500,
                              background: reservation.status === 'CONFIRMED' 
                                ? '#D1FAE5' 
                                : reservation.status === 'PENDING' 
                                ? '#FEF3C7' 
                                : '#F3F4F6',
                              color: reservation.status === 'CONFIRMED'
                                ? '#065F46'
                                : reservation.status === 'PENDING'
                                ? '#92400E'
                                : '#1F2937'
                            }}
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
        )}

        {/* Payouts Tab */}
        {activeTab === 'payouts' && (
        <section>
          <div className="bg-white rounded-xl" style={{ border: '1px solid #E8E8E8', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div className="px-8 py-6" style={{ borderBottom: '1px solid #E8E8E8' }}>
              <div className="flex items-center gap-2">
                <Wallet size={24} style={{ color: '#F88559' }} />
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#0D0C22' }}>
                  Payouts History
                </h2>
              </div>
              <p style={{ fontSize: '14px', color: '#717171', marginTop: '4px' }}>
                View all payouts made to you
              </p>
            </div>
            <div className="overflow-x-auto">
              {/* Payouts Table */}
              <table className="min-w-full">
                <thead style={{ background: '#FAFAFA' }}>
                  <tr>
                    <th className="px-8 py-4 text-left" style={{ fontSize: '12px', fontWeight: 600, color: '#717171', letterSpacing: '0.5px' }}>
                      DATE
                    </th>
                    <th className="px-8 py-4 text-left" style={{ fontSize: '12px', fontWeight: 600, color: '#717171', letterSpacing: '0.5px' }}>
                      DESCRIPTION
                    </th>
                    <th className="px-8 py-4 text-left" style={{ fontSize: '12px', fontWeight: 600, color: '#717171', letterSpacing: '0.5px' }}>
                      PROPERTY
                    </th>
                    <th className="px-8 py-4 text-right" style={{ fontSize: '12px', fontWeight: 600, color: '#717171', letterSpacing: '0.5px' }}>
                      AMOUNT
                    </th>
                    <th className="px-8 py-4 text-center" style={{ fontSize: '12px', fontWeight: 600, color: '#717171', letterSpacing: '0.5px' }}>
                      STATUS
                    </th>
                    <th className="px-8 py-4 text-left" style={{ fontSize: '12px', fontWeight: 600, color: '#717171', letterSpacing: '0.5px' }}>
                      METHOD
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {/* Mock Payouts Data - буде замінено на реальні дані з API */}
                  {[
                    {
                      id: '1',
                      date: new Date('2025-10-15'),
                      description: 'Monthly commission payout',
                      property: 'Luxury Villa Downtown',
                      amount: 4500,
                      status: 'COMPLETED',
                      method: 'Bank Transfer'
                    },
                    {
                      id: '2',
                      date: new Date('2025-10-01'),
                      description: 'Reservation commission',
                      property: 'Studio Marina',
                      amount: 1200,
                      status: 'COMPLETED',
                      method: 'Bank Transfer'
                    },
                    {
                      id: '3',
                      date: new Date('2025-09-25'),
                      description: 'Monthly commission payout',
                      property: 'Penthouse JBR',
                      amount: 3800,
                      status: 'PENDING',
                      method: 'PayPal'
                    }
                  ].map((payout, index) => (
                    <tr key={payout.id} style={{ borderTop: index === 0 ? 'none' : '1px solid #E8E8E8' }}>
                      <td className="px-8 py-5 whitespace-nowrap" style={{ fontSize: '14px', color: '#0D0C22' }}>
                        {payout.date.toLocaleDateString()}
                      </td>
                      <td className="px-8 py-5" style={{ fontSize: '14px', color: '#0D0C22' }}>
                        {payout.description}
                      </td>
                      <td className="px-8 py-5" style={{ fontSize: '14px', color: '#717171' }}>
                        {payout.property}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right" style={{ fontSize: '14px', fontWeight: 600, color: '#10B981' }}>
                        AED {payout.amount.toLocaleString()}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-center">
                        <span
                          className="px-3 py-1 inline-flex rounded-full"
                          style={{
                            fontSize: '12px',
                            fontWeight: 500,
                            background: payout.status === 'COMPLETED' 
                              ? '#D1FAE5' 
                              : payout.status === 'PENDING' 
                              ? '#FEF3C7' 
                              : '#F3F4F6',
                            color: payout.status === 'COMPLETED'
                              ? '#065F46'
                              : payout.status === 'PENDING'
                              ? '#92400E'
                              : '#1F2937'
                          }}
                        >
                          {payout.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap" style={{ fontSize: '14px', color: '#717171' }}>
                        {payout.method}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary Stats */}
              <div className="px-8 py-6" style={{ background: '#FAFAFA', borderTop: '1px solid #E8E8E8' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p style={{ fontSize: '12px', color: '#717171', marginBottom: '8px', letterSpacing: '0.5px' }}>
                      TOTAL PAYOUTS
                    </p>
                    <p style={{ fontSize: '24px', fontWeight: 600, color: '#0D0C22' }}>
                      AED 9,500
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#717171', marginBottom: '8px', letterSpacing: '0.5px' }}>
                      COMPLETED
                    </p>
                    <p style={{ fontSize: '24px', fontWeight: 600, color: '#10B981' }}>
                      AED 5,700
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#717171', marginBottom: '8px', letterSpacing: '0.5px' }}>
                      PENDING
                    </p>
                    <p style={{ fontSize: '24px', fontWeight: 600, color: '#F59E0B' }}>
                      AED 3,800
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        )}
      </main>
    </div>
  )
}

