import React, { useEffect, useState } from 'react';
import { getAllDeliveries, updateDelivery, deleteDelivery } from '../services/deliveryService';
import { useNavigate } from 'react-router-dom';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  const generateReport = () => {
  if (!deliveries || deliveries.length === 0) {
    alert('No deliveries to generate report.');
    return;
  }

  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text('Deliveries Report', 14, 22);

  // Add date
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);

  // Prepare table columns
  const columns = [
    { header: 'Delivery ID', dataKey: 'deliveryId' },
    { header: 'Order ID', dataKey: 'orderId' },
    { header: 'Customer', dataKey: 'customer' },
    { header: 'Delivery Person', dataKey: 'deliveryPerson' },
    { header: 'Status', dataKey: 'status' },
    { header: 'Estimated Date', dataKey: 'estimated' },
    { header: 'Actual Date', dataKey: 'actual' },
    { header: 'City', dataKey: 'city' },
    { header: 'District', dataKey: 'district' },
    { header: 'Postal Code', dataKey: 'postal' },
    { header: 'Country', dataKey: 'country' },
  ];

  // Map deliveries to table rows
  const rows = deliveries.map(d => ({
    deliveryId: d._id.slice(-8).toUpperCase(),
    orderId: d.orderId?._id.slice(-8).toUpperCase() || '',
    customer: d.userId?.name || '',
    deliveryPerson: d.deliveryPerson || '',
    status: d.status,
    estimated: d.estimatedDeliveryDate ? d.estimatedDeliveryDate.slice(0, 10) : '',
    actual: d.actualDeliveryDate ? d.actualDeliveryDate.slice(0, 10) : '',
    city: d.address.city || '',
    district: d.address.district || '',
    postal: d.address.postalCode || '',
    country: d.address.country || '',
  }));

  // Generate table in PDF
  autoTable(doc, {
    startY: 40,
    head: [columns.map(col => col.header)],
    body: rows.map(row => columns.map(col => row[col.dataKey])),
    theme: 'striped',
    headStyles: { fillColor: [244, 63, 94] }, // pink-ish header
    styles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
  });

  // Save PDF
  doc.save(`deliveries_report_${new Date().toISOString().slice(0,10)}.pdf`);
};


  const statusColors = {
    pending: 'bg-pink-50 text-pink-700 border border-pink-200',
    'in-progress': 'bg-blue-50 text-blue-700 border border-blue-200',
    delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    cancelled: 'bg-rose-50 text-rose-700 border border-rose-200',
  };

  const statusIcons = {
    pending: '⏳',
    'in-progress': '🚚',
    delivered: '✅',
    cancelled: '❌',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading deliveries...</p>
        </div>
      </div>
    );
  }

  if (isForbidden) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-16 text-center">
          <div className="text-8xl mb-6">🚫</div>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h3>
          <p className="text-gray-600 text-lg mb-8">{error}</p>
          <button
            onClick={() => navigate('/orders')}
            className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            Go to My Orders
          </button>
        </div>
      </div>
    );
  }

 


  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl shadow-lg mb-6">
            <span className="text-3xl text-white">🚚</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-4">
            Delivery Management
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage all deliveries, update tracking information, and monitor delivery status
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border-l-4 border-pink-500 p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-3xl font-bold text-gray-900 mb-2">{deliveries.length}</div>
            <div className="text-sm text-gray-600 font-medium">Total Deliveries</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border-l-4 border-rose-500 p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {deliveries.filter(d => d.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600 font-medium">Pending</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border-l-4 border-blue-500 p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {deliveries.filter(d => d.status === 'in-progress').length}
            </div>
            <div className="text-sm text-gray-600 font-medium">In Progress</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border-l-4 border-emerald-500 p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {deliveries.filter(d => d.status === 'delivered').length}
            </div>
            <div className="text-sm text-gray-600 font-medium">Delivered</div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-rose-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-rose-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Filters Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="text-pink-600">🔍</span>
            Filter & Search
          </h2>
          <div className="flex flex-col lg:flex-row gap-6 items-end">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Filter by Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-3 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In-Progress</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Filter by Date</label>
                <input
                  type="date"
                  name="date"
                  value={filters.date}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-3 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
                />
              </div>
            </div>
            <button
              onClick={() => setFilters({ status: '', date: '' })}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl border border-gray-300 hover:bg-gray-200 transition-all duration-200 font-semibold shadow-sm"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="flex justify-end mb-6">
  <button
    onClick={generateReport}
    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 font-semibold shadow-lg flex items-center gap-2"
  >
    📄 Generate Report
  </button>
</div>

        {/* Deliveries List */}
        <div className="space-y-6">
          {deliveries.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-16 text-center">
              <div className="text-8xl mb-6">📭</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">No deliveries found</h3>
              <p className="text-gray-600 text-lg">
                {filters.status || filters.date 
                  ? 'No deliveries match your current filters. Try adjusting your search criteria.'
                  : 'No deliveries have been scheduled yet. They will appear here once orders are placed.'}
              </p>
            </div>
          ) : (
            deliveries.map(delivery => (
              <div
                key={delivery._id}
                className="bg-white rounded-2xl shadow-lg border border-pink-100 overflow-hidden transition-all duration-300 hover:shadow-xl"
              >
                <div className="p-8">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    {/* Delivery Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-pink-50 rounded-xl p-3">
                          <span className="text-2xl">📦</span>
                        </div>
                        <div>
                          <span className="text-2xl font-bold text-gray-900 block">
                            Delivery #{delivery._id.slice(-8).toUpperCase()}
                          </span>
                          <span className="text-gray-600 text-sm mt-1">
                            Order: {delivery.orderId?._id.slice(-8).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">👤</span>
                          <span className="font-medium text-gray-900">{delivery.userId?.name || 'Unknown Customer'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">📍</span>
                          <span className="font-medium text-gray-900">{delivery.address.city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">🚚</span>
                          <span className="font-medium text-gray-900">{delivery.deliveryPerson || 'Unassigned'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-end">
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColors[delivery.status]}`}>
                          <span className="mr-2 text-lg">{statusIcons[delivery.status]}</span>
                          {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
                        </span>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 justify-end">
                        <button
                          onClick={() => setViewDelivery(delivery)}
                          className="px-5 py-2.5 bg-pink-50 text-pink-600 rounded-xl border border-pink-200 hover:bg-pink-100 transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md flex items-center gap-2"
                        >
                          <span>👁️</span>
                          View Details
                        </button>

                        <button
                          onClick={() => startUpdate(delivery)}
                          className="px-5 py-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-200 hover:bg-amber-100 transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md flex items-center gap-2"
                        >
                          <span>✏️</span>
                          Edit
                        </button>

                        {['cancelled', 'invalid'].includes(delivery.status) && (
                          <button
                            onClick={() => setDeleteDeliveryId(delivery._id)}
                            className="px-5 py-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-200 hover:bg-rose-100 transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md flex items-center gap-2"
                          >
                            <span>🗑️</span>
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Status Update */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Quick Status Update:</span>
                      <select
                        value={delivery.status}
                        onChange={(e) => handleStatusChange(delivery._id, e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm font-medium"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In-Progress</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* View Delivery Modal */}
        {viewDelivery && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl border border-pink-100 w-full max-w-2xl">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="text-pink-600">📦</span>
                    Delivery Details
                  </h2>
                  <button
                    onClick={() => setViewDelivery(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Order ID</label>
                      <p className="text-lg text-gray-900">{viewDelivery.orderId?._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Customer</label>
                      <p className="text-lg text-gray-900">{viewDelivery.userId?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">{viewDelivery.userId?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Status</label>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[viewDelivery.status]}`}>
                        {viewDelivery.status.charAt(0).toUpperCase() + viewDelivery.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Delivery Person</label>
                      <p className="text-lg text-gray-900">{viewDelivery.deliveryPerson || 'Unassigned'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Estimated Delivery</label>
                      <p className="text-lg text-gray-900">
                        {viewDelivery.estimatedDeliveryDate ? new Date(viewDelivery.estimatedDeliveryDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Actual Delivery</label>
                      <p className="text-lg text-gray-900">
                        {viewDelivery.actualDeliveryDate ? new Date(viewDelivery.actualDeliveryDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">Delivery Address</label>
                  <p className="text-gray-900">
                    {viewDelivery.address.addressLine}, {viewDelivery.address.city}, 
                    {viewDelivery.address.district && ` ${viewDelivery.address.district},`}
                    {viewDelivery.address.postalCode && ` ${viewDelivery.address.postalCode},`}
                    {viewDelivery.address.country}
                  </p>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => setViewDelivery(null)}
                    className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl border border-gray-300 hover:bg-gray-200 transition-all duration-200 font-semibold shadow-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update Delivery Modal */}
        {updateDeliveryId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl border border-pink-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="text-pink-600">✏️</span>
                    Update Delivery
                  </h2>
                  <button
                    onClick={() => setUpdateDeliveryId(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Delivery Person</label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-3 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
                      placeholder="Delivery Person Name"
                      value={form.deliveryPerson}
                      onChange={e => setForm({ ...form, deliveryPerson: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Status</label>
                    <select
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-3 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In-Progress</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Estimated Delivery Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-3 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
                      value={form.estimatedDeliveryDate}
                      onChange={e => setForm({ ...form, estimatedDeliveryDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Actual Delivery Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-3 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
                      value={form.actualDeliveryDate}
                      onChange={e => setForm({ ...form, actualDeliveryDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Address Line</label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-3 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
                        placeholder="Address Line"
                        value={form.address.addressLine}
                        onChange={e => setForm({ ...form, address: { ...form.address, addressLine: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">City</label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-3 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
                        placeholder="City"
                        value={form.address.city}
                        onChange={e => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">District</label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-3 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
                        placeholder="District"
                        value={form.address.district}
                        onChange={e => setForm({ ...form, address: { ...form.address, district: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Postal Code</label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-3 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
                        placeholder="Postal Code"
                        value={form.address.postalCode}
                        onChange={e => setForm({ ...form, address: { ...form.address, postalCode: e.target.value } })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Country</label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-3 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
                        placeholder="Country"
                        value={form.address.country}
                        onChange={e => setForm({ ...form, address: { ...form.address, country: e.target.value } })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={handleUpdateDelivery}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setUpdateDeliveryId(null)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl border border-gray-300 hover:bg-gray-200 transition-all duration-200 font-semibold shadow-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteDeliveryId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl border border-pink-100 w-full max-w-md">
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-rose-100 rounded-xl p-3 mr-4">
                    <span className="text-2xl text-rose-600">⚠️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Confirm Deletion</h2>
                </div>
                <p className="text-gray-600 mb-8 text-lg">
                  Are you sure you want to delete this delivery? This action cannot be undone and all associated data will be permanently removed.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteDelivery}
                    className="flex-1 px-6 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    Delete Delivery
                  </button>
                  <button
                    onClick={() => setDeleteDeliveryId(null)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl border border-gray-300 hover:bg-gray-200 transition-all duration-200 font-semibold shadow-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}