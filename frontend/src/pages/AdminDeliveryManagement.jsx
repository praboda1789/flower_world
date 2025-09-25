import React, { useEffect, useState } from 'react';
import { getAllDeliveries, updateDelivery, deleteDelivery } from '../services/deliveryService';
import { useNavigate } from 'react-router-dom';

export default function AdminDeliveryManagement() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isForbidden, setIsForbidden] = useState(false);
  const [filters, setFilters] = useState({ status: '', date: '' });
  const [updateDeliveryId, setUpdateDeliveryId] = useState(null);
  const [viewDelivery, setViewDelivery] = useState(null);
  const [deleteDeliveryId, setDeleteDeliveryId] = useState(null);
  const [form, setForm] = useState({
    status: '',
    deliveryPerson: '',
    estimatedDeliveryDate: '',
    actualDeliveryDate: '',
    address: { addressLine: '', city: '', district: '', postalCode: '', country: 'Sri Lanka' }
  });
  const navigate = useNavigate();

  // Fetch deliveries with filters
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setIsForbidden(false);
        const { deliveries } = await getAllDeliveries(filters);
        setDeliveries(deliveries || []);
      } catch (err) {
        if (err.response?.status === 403) {
          setIsForbidden(true);
          setError('You do not have permission to access this page. Admin access required.');
        } else {
          setError(err.response?.data?.message || 'Failed to load deliveries.');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Start updating a delivery
  const startUpdate = (delivery) => {
    setUpdateDeliveryId(delivery._id);
    setForm({
      status: delivery.status,
      deliveryPerson: delivery.deliveryPerson || '',
      estimatedDeliveryDate: delivery.estimatedDeliveryDate ? delivery.estimatedDeliveryDate.slice(0, 10) : '',
      actualDeliveryDate: delivery.actualDeliveryDate ? delivery.actualDeliveryDate.slice(0, 10) : '',
      address: { ...delivery.address }
    });
  };

  // Handle quick status update
  const handleStatusChange = async (id, status) => {
    try {
      await updateDelivery(id, { status });
      setDeliveries(deliveries.map(delivery =>
        delivery._id === id ? { ...delivery, status } : delivery
      ));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  // Handle full update submission
  const handleUpdateDelivery = async () => {
    try {
      await updateDelivery(updateDeliveryId, form);
      setDeliveries(deliveries.map(delivery =>
        delivery._id === updateDeliveryId ? { ...delivery, ...form } : delivery
      ));
      setUpdateDeliveryId(null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update delivery.');
    }
  };

  // Handle delete delivery
  const handleDeleteDelivery = async () => {
    try {
      await deleteDelivery(deleteDeliveryId);
      setDeliveries(deliveries.filter(delivery => delivery._id !== deleteDeliveryId));
      setDeleteDeliveryId(null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete delivery.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-3 border-pink-300 border-t-pink-600 rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">Loading deliveries...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isForbidden) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/orders')}
            className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors duration-200"
          >
            Go to My Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Delivery Management</h1>
          <p className="text-gray-600">Manage all deliveries, update details, and remove invalid records</p>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-pink-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded-xl shadow-md border border-pink-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In-Progress</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Date</label>
              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>
        </div>

        {/* Deliveries Table */}
        {deliveries.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-pink-100 text-center">
            <p className="text-gray-600">No deliveries found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-pink-100 overflow-x-auto">
            <table className="min-w-full divide-y divide-pink-100">
              <thead className="bg-pink-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Customer</th>
                  <th className="w-40 px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Delivery Person</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Est. Delivery</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Actual Delivery</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-pink-100">
                {deliveries.map(delivery => (
                  <tr key={delivery._id} className="hover:bg-pink-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{delivery.orderId?._id.slice(-6)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {delivery.userId?.name || 'Unknown'} ({delivery.userId?.email || 'N/A'})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={delivery.status}
                        onChange={(e) => handleStatusChange(delivery._id, e.target.value)}
                        className={`w-full px-2 py-1 text-xs font-medium rounded-lg border focus:ring-2 focus:ring-pink-500 ${
                          delivery.status === 'pending' ? 'bg-pink-100 text-pink-800 border-pink-200' :
                          delivery.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          delivery.status === 'delivered' ? 'bg-green-100 text-green-800 border-green-200' :
                          'bg-red-100 text-red-800 border-red-200'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In-Progress</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {delivery.address.addressLine}, {delivery.address.city}, {delivery.address.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{delivery.deliveryPerson || 'Unassigned'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {delivery.estimatedDeliveryDate ? new Date(delivery.estimatedDeliveryDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {delivery.actualDeliveryDate ? new Date(delivery.actualDeliveryDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewDelivery(delivery)}
                          className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                        >
                          View
                        </button>
                        <button
                          onClick={() => startUpdate(delivery)}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                        >
                          Update
                        </button>
                        {['cancelled', 'invalid'].includes(delivery.status) && (
                          <button
                            onClick={() => setDeleteDeliveryId(delivery._id)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* View Delivery Modal */}
        {viewDelivery && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-pink-700">Delivery Details</h2>
                <button
                  onClick={() => setViewDelivery(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3">
                <p><strong>Order ID:</strong> {viewDelivery.orderId?._id.slice(-6)}</p>
                <p><strong>Customer:</strong> {viewDelivery.userId?.name || 'Unknown'} ({viewDelivery.userId?.email || 'N/A'})</p>
                <p><strong>Status:</strong> {viewDelivery.status.charAt(0).toUpperCase() + viewDelivery.status.slice(1)}</p>
                <p><strong>Address:</strong> {viewDelivery.address.addressLine}, {viewDelivery.address.city}, {viewDelivery.address.district || ''}, {viewDelivery.address.postalCode || ''}, {viewDelivery.address.country}</p>
                <p><strong>Delivery Person:</strong> {viewDelivery.deliveryPerson || 'Unassigned'}</p>
                <p><strong>Estimated Delivery:</strong> {viewDelivery.estimatedDeliveryDate ? new Date(viewDelivery.estimatedDeliveryDate).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Actual Delivery:</strong> {viewDelivery.actualDeliveryDate ? new Date(viewDelivery.actualDeliveryDate).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Created At:</strong> {new Date(viewDelivery.createdAt).toLocaleString()}</p>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => setViewDelivery(null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Update Delivery Modal */}
        {updateDeliveryId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-pink-700">Update Delivery</h2>
                <button
                  onClick={() => setUpdateDeliveryId(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Person</label>
                  <input
                    className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Delivery Person Name"
                    value={form.deliveryPerson}
                    onChange={e => setForm({ ...form, deliveryPerson: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                    value={form.estimatedDeliveryDate}
                    onChange={e => setForm({ ...form, estimatedDeliveryDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Actual Delivery Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                    value={form.actualDeliveryDate}
                    onChange={e => setForm({ ...form, actualDeliveryDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Line</label>
                  <input
                    className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Address Line"
                    value={form.address.addressLine}
                    onChange={e => setForm({ ...form, address: { ...form.address, addressLine: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                    placeholder="City"
                    value={form.address.city}
                    onChange={e => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <input
                    className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                    placeholder="District"
                    value={form.address.district}
                    onChange={e => setForm({ ...form, address: { ...form.address, district: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input
                    className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Postal Code"
                    value={form.address.postalCode}
                    onChange={e => setForm({ ...form, address: { ...form.address, postalCode: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Country"
                    value={form.address.country}
                    onChange={e => setForm({ ...form, address: { ...form.address, country: e.target.value } })}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleUpdateDelivery}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setUpdateDeliveryId(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteDeliveryId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h2 className="text-xl font-bold text-pink-700">Confirm Deletion</h2>
              </div>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this delivery? This action cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteDelivery}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteDeliveryId(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}