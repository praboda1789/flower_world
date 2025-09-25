import React, { useEffect, useState } from 'react';
import { getMyOrders, cancelOrder, updateOrder } from '../services/orderService';
import { useNavigate } from 'react-router-dom';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await getMyOrders();
        setOrders(res.orders || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
    })();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await cancelOrder(id);
      const res = await getMyOrders();
      setOrders(res.orders || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setForm({
      fromName: order.fromName,
      toName: order.toName,
      phone: order.phone,
      addressLine: order.addressLine,
      city: order.city,
      district: order.district || '',
      postalCode: order.postalCode || '',
      country: order.country,
      message: order.message || '',
      deliveryDate: order.deliveryDate ? order.deliveryDate.slice(0, 10) : '',
      paymentMethod: order.paymentMethod
    });
  };

  const saveEdit = async () => {
    try {
      await updateOrder(editingOrder._id, form);
      const res = await getMyOrders();
      setOrders(res.orders || []);
      setEditingOrder(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order.');
    }
  };

  const statusColors = {
    pending: "bg-pink-100 text-pink-800 border-pink-200",
    confirmed: "bg-blue-100 text-blue-800 border-blue-200",
    shipped: "bg-purple-100 text-purple-800 border-purple-200",
    delivered: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-pink-700">My Orders</h1>
              <p className="text-pink-500 mt-1">Track and manage your orders</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-pink-100 text-pink-700 px-4 py-2 rounded-lg font-semibold">
                {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
              </div>
              <button
                onClick={() => navigate('/payments')}
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm rounded-lg transition-colors duration-200 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Manage Saved Cards
              </button>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block bg-pink-100 p-4 rounded-full mb-4">
                <svg className="w-12 h-12 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-pink-700">No orders found</h3>
              <p className="text-pink-500 mt-1">Start by creating your first order</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order._id} className="border border-pink-100 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="font-bold text-lg text-pink-800">Order #{order._id.slice(-6)}</h2>
                      <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                    <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusColors[order.status] || statusColors.pending}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-pink-50 p-3 rounded-lg">
                      <h3 className="font-semibold text-pink-700 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        Sender
                      </h3>
                      <p className="text-sm">{order.fromName}</p>
                    </div>
                    <div className="bg-pink-50 p-3 rounded-lg">
                      <h3 className="font-semibold text-pink-700 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        Recipient
                      </h3>
                      <p className="text-sm">{order.toName}</p>
                      <p className="text-sm">{order.phone}</p>
                    </div>
                  </div>

                  <div className="bg-pink-50 p-3 rounded-lg mb-4">
                    <h3 className="font-semibold text-pink-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      Delivery Address
                    </h3>
                    <p className="text-sm">{order.addressLine}, {order.city}, {order.district}, {order.postalCode}, {order.country}</p>
                    {order.deliveryDate && (
                      <p className="text-sm mt-1">
                        <span className="font-medium">Delivery Date:</span> {new Date(order.deliveryDate).toLocaleDateString()}
                      </p>
                    )}
                    {order.message && (
                      <p className="text-sm mt-1">
                        <span className="font-medium">Message:</span> {order.message}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold text-pink-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                      </svg>
                      Order Items
                    </h3>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-pink-100 last:border-b-0">
                          <div>
                            <p className="font-medium">{item.name} ({item.size})</p>
                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          </div>
                          <div className="font-semibold text-pink-700">LKR {item.price * item.quantity}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-pink-100 pt-4">
                    <div className="font-bold text-lg text-pink-700">Total: LKR {order.total}</div>
                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleEdit(order)}
                            className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm rounded-lg transition-colors duration-200 flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleCancel(order._id)}
                            className="px-4 py-2 bg-white border border-red-500 hover:bg-red-50 text-red-500 text-sm rounded-lg transition-colors duration-200 flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Cancel
                          </button>
                        </>
                      )}
                      {['confirmed', 'processing', 'dispatched', 'delivered'].includes(order.status) && (
                        <button
                          onClick={() => navigate(`/deliveries/${order._id}`)}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors duration-200 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                          </svg>
                          Track Delivery
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {editingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-pink-700">Edit Order</h2>
                <button
                  onClick={() => setEditingOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From name</label>
                  <input
                    className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                    placeholder="From name"
                    value={form.fromName}
                    onChange={e => setForm({ ...form, fromName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To name</label>
                  <input
                    className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                    placeholder="To name"
                    value={form.toName}
                    onChange={e => setForm({ ...form, toName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Phone"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Address"
                    value={form.addressLine}
                    onChange={e => setForm({ ...form, addressLine: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                    placeholder="City"
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <input
                    className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                    placeholder="District"
                    value={form.district}
                    onChange={e => setForm({ ...form, district: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input
                    className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Postal Code"
                    value={form.postalCode}
                    onChange={e => setForm({ ...form, postalCode: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Country"
                    value={form.country}
                    onChange={e => setForm({ ...form, country: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
                  <input
                    className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                    type="date"
                    value={form.deliveryDate}
                    onChange={e => setForm({ ...form, deliveryDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Message"
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    rows="3"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={saveEdit}
                  className="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors duration-200"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingOrder(null)}
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