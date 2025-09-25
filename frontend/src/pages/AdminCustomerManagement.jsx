import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminCustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteCustomerId, setDeleteCustomerId] = useState(null);

  // Fetch all customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/users?userType=customer");
      setCustomers(res.data || []);
      setMessage("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (customer) => {
    setEditingId(customer._id);
    setFormData({ name: customer.name, email: customer.email, password: "" });
    setMessage("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setFormData({ name: "", email: "", password: "" });
    setMessage("");
  };

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onUpdate = async () => {
    try {
      const updateData = { name: formData.name, email: formData.email };
      if (formData.password.trim() !== "") {
        updateData.password = formData.password;
      }
      await axios.put(`http://localhost:5000/api/users/${editingId}`, updateData);
      setMessage("Customer updated successfully");
      setEditingId(null);
      fetchCustomers();
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
    }
  };

  const onDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${deleteCustomerId}`);
      setMessage("Customer deleted successfully");
      if (editingId === deleteCustomerId) setEditingId(null);
      setDeleteCustomerId(null);
      fetchCustomers();
    } catch (err) {
      setMessage(err.response?.data?.message || "Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-3 border-pink-300 border-t-pink-600 rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">Loading customers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Customer Management</h1>
          <p className="text-gray-600">Manage customer accounts, update details, and remove invalid records</p>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-pink-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-red-700 font-medium">{message}</span>
            </div>
          </div>
        )}

        {customers.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-pink-100 text-center">
            <p className="text-gray-600">No customers found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-pink-100 overflow-x-auto">
            <table className="min-w-full divide-y divide-pink-100">
              <thead className="bg-pink-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-pink-100">
                {customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-pink-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditing(customer)}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteCustomerId(customer._id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit Customer Modal */}
        {editingId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-pink-700">Edit Customer</h2>
                <button
                  onClick={cancelEditing}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={onChange}
                    className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={onChange}
                    className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password (optional)</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={onChange}
                    className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                    minLength={6}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={onUpdate}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  Save Changes
                </button>
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteCustomerId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h2 className="text-xl font-bold text-pink-700">Confirm Deletion</h2>
              </div>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this customer? This action cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  onClick={onDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteCustomerId(null)}
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
};

export default AdminCustomerManagement;