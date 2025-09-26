import React, { useEffect, useState } from 'react';
import { getMyDeliveries } from '../services/deliveryService';
import { useNavigate, useParams } from 'react-router-dom';

export default function MyDeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewDelivery, setViewDelivery] = useState(null);
  const navigate = useNavigate();
  const { orderId } = useParams();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getMyDeliveries();
        const fetchedDeliveries = res.deliveries || [];
        setDeliveries(
          orderId
            ? fetchedDeliveries.filter(delivery => delivery.orderId._id === orderId)
            : fetchedDeliveries
        );
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load deliveries.');
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  const statusColors = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
    delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cancelled: 'bg-rose-100 text-rose-800 border-rose-200'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-3 border-gray-300 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">Loading your deliveries...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-pink-700">My Deliveries</h1>
            <p className="text-gray-600 mt-1">Track and view your delivery details</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold">
              {deliveries.length} {deliveries.length === 1 ? 'Delivery' : 'Deliveries'}
            </div>
            <button
              onClick={() => navigate('/orders/:id')}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition duration-300 shadow-md flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              View Orders
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-rose-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-rose-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        {deliveries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="inline-block bg-gray-100 p-4 rounded-full mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700">No deliveries found</h3>
            <p className="text-gray-600 mt-1">Your orders may not have deliveries yet.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition duration-300 shadow-md"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {deliveries.map(delivery => (
              <div key={delivery._id} className="border border-gray-200 rounded-lg p-6 bg-white shadow-md hover:shadow-lg transition duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="font-bold text-lg text-gray-900">Order #{delivery.orderId._id.slice(-6)}</h2>
                    <p className="text-sm text-gray-600">Created on {new Date(delivery.createdAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                  <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusColors[delivery.status] || statusColors.pending}`}>
                    {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      Delivery Address
                    </h3>
                    <p className="text-sm text-gray-600">{delivery.address.addressLine}, {delivery.address.city}, {delivery.address.district || ''}, {delivery.address.postalCode || ''}, {delivery.address.country}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Delivery Person
                    </h3>
                    <p className="text-sm text-gray-600">{delivery.deliveryPerson || 'Unassigned'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      Estimated Delivery
                    </h3>
                    <p className="text-sm text-gray-600">{delivery.estimatedDeliveryDate ? new Date(delivery.estimatedDeliveryDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      Actual Delivery
                    </h3>
                    <p className="text-sm text-gray-600">{delivery.actualDeliveryDate ? new Date(delivery.actualDeliveryDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                  <div className="font-bold text-lg text-gray-900">Order Total: LKR {delivery.orderId.total}</div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setViewDelivery(delivery)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition duration-300 shadow-md flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Details
                    </button>
                    <button
                      onClick={() => navigate(`/orders/${delivery.orderId._id}`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 shadow-md flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      View Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Delivery Modal */}
        {viewDelivery && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Delivery Details</h2>
                <button
                  onClick={() => setViewDelivery(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3 text-gray-600">
                <p><strong className="text-gray-900">Order ID:</strong> {viewDelivery.orderId._id.slice(-6)}</p>
                <p><strong className="text-gray-900">Customer:</strong> {viewDelivery.userId?.name || 'Unknown'} ({viewDelivery.userId?.email || 'N/A'})</p>
                <p><strong className="text-gray-900">Status:</strong> {viewDelivery.status.charAt(0).toUpperCase() + viewDelivery.status.slice(1)}</p>
                <p><strong className="text-gray-900">Address:</strong> {viewDelivery.address.addressLine}, {viewDelivery.address.city}, {viewDelivery.address.district || ''}, {viewDelivery.address.postalCode || ''}, {viewDelivery.address.country}</p>
                <p><strong className="text-gray-900">Delivery Person:</strong> {viewDelivery.deliveryPerson || 'Unassigned'}</p>
                <p><strong className="text-gray-900">Estimated Delivery:</strong> {viewDelivery.estimatedDeliveryDate ? new Date(viewDelivery.estimatedDeliveryDate).toLocaleDateString() : 'N/A'}</p>
                <p><strong className="text-gray-900">Actual Delivery:</strong> {viewDelivery.actualDeliveryDate ? new Date(viewDelivery.actualDeliveryDate).toLocaleDateString() : 'N/A'}</p>
                <p><strong className="text-gray-900">Created At:</strong> {new Date(viewDelivery.createdAt).toLocaleString()}</p>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => setViewDelivery(null)}
                  className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition duration-300 shadow-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}