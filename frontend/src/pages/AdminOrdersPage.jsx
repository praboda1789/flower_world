// pages/AdminOrdersPage.jsx
import React, { useEffect, useState } from 'react';
import { getAllOrdersAdmin, deleteOrderAdmin, updateOrderAdmin } from '../services/orderService';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllOrdersAdmin();
        setOrders(res.orders || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await deleteOrderAdmin(id);
      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      console.error(err);
      alert('Error deleting order');
    }
  };

  const generateOrdersReport = () => {
  const doc = new jsPDF();

  doc.text("Orders Report", 14, 10);

  autoTable(doc, {
    head: [["Order ID", "Customer", "City", "Status", "Total Amount", "Date"]],
    body: filteredOrders.map((o) => [
      o._id.slice(-8).toUpperCase(),
      o.customerName || "N/A",
      o.city,
      o.status.charAt(0).toUpperCase() + o.status.slice(1),
      `LKR ${o.items.reduce((total, item) => total + item.quantity * item.price, 0)}`,
      new Date(o.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    ]),
    startY: 20,
    theme: "grid",
    headStyles: { fillColor: [255, 182, 193] }, // light pink header
    styles: { fontSize: 11 },
  });

  const fileName =
    filterStatus || searchCity
      ? `Filtered_Orders_Report.pdf`
      : "Orders_Report.pdf";

  doc.save(fileName);
};

  const handleEditClick = (id, currentStatus) => {
    setEditingOrderId(id);
    setNewStatus(currentStatus);
  };

  const handleSaveStatus = async (id) => {
    try {
      const updated = await updateOrderAdmin(id, { status: newStatus });
      setOrders(prev => prev.map(o => (o._id === id ? updated.order : o)));
      setEditingOrderId(null);
      setNewStatus('');
    } catch (err) {
      console.error(err);
      alert('Error updating order');
    }
  };

  const handleUpdateOrder = async (id) => {
    try {
      const updated = await updateOrderAdmin(id);
      setOrders(prev => prev.map(o => (o._id === id ? updated.order : o)));
      alert('Order updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Error updating order');
    }
  };

  const statusColors = {
    pending: 'bg-pink-50 text-pink-700 border border-pink-200',
    confirmed: 'bg-rose-50 text-rose-700 border border-rose-200',
    processing: 'bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200',
    dispatched: 'bg-purple-50 text-purple-700 border border-purple-200',
    delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    cancelled: 'bg-rose-100 text-rose-800 border border-rose-300',
  };

  const statusIcons = {
    pending: '⏳',
    confirmed: '✅',
    processing: '⚙️',
    dispatched: '🚚',
    delivered: '📦',
    cancelled: '❌',
  };

  const filteredOrders = orders.filter((o) => {
    return (
      (!filterStatus || o.status === filterStatus) &&
      (!searchCity || o.city.toLowerCase().includes(searchCity.toLowerCase()))
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
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
            <span className="text-3xl text-white">📦</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-4">
            Order Management
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage and track all customer orders with real-time updates and advanced filtering
          </p>
        </div>

        <div className="flex justify-end mb-6">
  <button
    onClick={generateOrdersReport}
    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 font-semibold shadow-lg"
  >
    📝 Generate PDF Report
  </button>
</div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border-l-4 border-pink-500 p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-3xl font-bold text-gray-900 mb-2">{orders.length}</div>
            <div className="text-sm text-gray-600 font-medium">Total Orders</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border-l-4 border-emerald-500 p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {orders.filter(o => o.status === 'delivered').length}
            </div>
            <div className="text-sm text-gray-600 font-medium">Delivered</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border-l-4 border-amber-500 p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {orders.filter(o => o.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600 font-medium">Pending</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border-l-4 border-fuchsia-500 p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {orders.filter(o => o.status === 'processing').length}
            </div>
            <div className="text-sm text-gray-600 font-medium">Processing</div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="text-pink-600">🔍</span>
            Filter & Search
          </h2>
          <div className="flex flex-col lg:flex-row gap-6 items-end">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Filter by Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-3 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Search by City
                </label>
                <input
                  type="text"
                  placeholder="Enter city name..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-3 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
                />
              </div>
            </div>
            <button
              onClick={() => {
                setFilterStatus('');
                setSearchCity('');
              }}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl border border-gray-300 hover:bg-gray-200 transition-all duration-200 font-semibold shadow-sm"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.map((o) => (
            <div
              key={o._id}
              className="bg-white rounded-2xl shadow-lg border border-pink-100 overflow-hidden transition-all duration-300 hover:shadow-xl"
            >
              <div className="p-8">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-pink-50 rounded-xl p-3">
                        <span className="text-2xl">📋</span>
                      </div>
                      <div>
                        <span className="text-2xl font-bold text-gray-900 block">
                          Order #{o._id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-gray-600 text-sm mt-1">
                          {new Date(o.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">👤</span>
                        <span className="font-medium text-gray-900">{o.customerName || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">📍</span>
                        <span className="font-medium text-gray-900">{o.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">💰</span>
                        <span className="font-medium text-gray-900">
                          LKR {o.items.reduce((total, item) => total + (item.quantity * item.price), 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-end">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColors[o.status]}`}
                      >
                        <span className="mr-2 text-lg">{statusIcons[o.status]}</span>
                        {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                      </span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 justify-end">
                      <button
                        onClick={() =>
                          setExpanded((prev) => ({ ...prev, [o._id]: !prev[o._id] }))
                        }
                        className="px-5 py-2.5 bg-pink-50 text-pink-600 rounded-xl border border-pink-200 hover:bg-pink-100 transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md flex items-center gap-2"
                      >
                        <span>{expanded[o._id] ? '▲' : '▼'}</span>
                        {expanded[o._id] ? 'Hide Items' : 'View Items'}
                      </button>

                      <button
                        onClick={() => handleUpdateOrder(o._id)}
                        className="px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md flex items-center gap-2"
                      >
                        <span>🔄</span>
                        Update
                      </button>

                      {editingOrderId === o._id ? (
                        <div className="flex gap-2">
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="dispatched">Dispatched</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button
                            onClick={() => handleSaveStatus(o._id)}
                            className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl border border-emerald-600 hover:bg-emerald-600 transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingOrderId(null)}
                            className="px-4 py-2.5 bg-gray-500 text-white rounded-xl border border-gray-600 hover:bg-gray-600 transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditClick(o._id, o.status)}
                          className="px-5 py-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-200 hover:bg-amber-100 transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md flex items-center gap-2"
                        >
                          <span>✏️</span>
                          Edit Status
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(o._id)}
                        className="px-5 py-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-200 hover:bg-rose-100 transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md flex items-center gap-2"
                      >
                        <span>🗑️</span>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Items */}
                {expanded[o._id] && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-3 text-lg">
                      <span className="text-2xl">📦</span>
                      Order Items ({o.items.length})
                    </h3>
                    <div className="grid gap-4">
                      {o.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-6 p-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl border border-pink-100 shadow-sm"
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-xl border-2 border-white shadow-md"
                            />
                          )}
                          <div className="flex-1">
                            <div className="font-bold text-gray-900 text-lg mb-2">{item.name}</div>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <span className="bg-white px-3 py-1 rounded-lg border border-gray-200 text-gray-700 font-medium">
                                Size: {item.size}
                              </span>
                              <span className="bg-white px-3 py-1 rounded-lg border border-gray-200 text-gray-700 font-medium">
                                Quantity: {item.quantity}
                              </span>
                              <span className="bg-white px-3 py-1 rounded-lg border border-gray-200 text-gray-700 font-medium">
                                Price: LKR {item.price}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-pink-600">
                              LKR {item.quantity * item.price}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">Total</div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Order Total */}
                      <div className="flex justify-end mt-4">
                        <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-6 rounded-2xl shadow-lg">
                          <div className="text-2xl font-bold">
                            Grand Total: LKR {o.items.reduce((total, item) => total + (item.quantity * item.price), 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-16 text-center">
              <div className="text-8xl mb-6">📭</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">No orders found</h3>
              <p className="text-gray-600 text-lg mb-8">
                {orders.length === 0
                  ? 'No orders have been placed yet. They will appear here once customers start ordering.'
                  : 'No orders match your current filters. Try adjusting your search criteria.'}
              </p>
              {(filterStatus || searchCity) && (
                <button
                  onClick={() => {
                    setFilterStatus('');
                    setSearchCity('');
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}