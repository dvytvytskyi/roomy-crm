export default function FinanceDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Financial Record - #{params.id}</h1>
          <p className="mt-2 text-gray-600">Detailed financial transaction information</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transaction Type</label>
                  <p className="mt-1 text-gray-900">Revenue - Booking Payment</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Property</label>
                  <p className="mt-1 text-gray-900">Luxury Villa in Palm Jumeirah</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Guest</label>
                  <p className="mt-1 text-gray-900">John Smith</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <p className="mt-1 text-gray-900">December 15, 2024</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <p className="mt-1 text-gray-900">Credit Card</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h3>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900">Amount</h4>
                  <p className="text-2xl font-bold text-green-600">$5,950</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Commission</h4>
                  <p className="text-2xl font-bold text-blue-600">$595</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900">Net Revenue</h4>
                  <p className="text-2xl font-bold text-purple-600">$5,355</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
