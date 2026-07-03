import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ Correct import

const AdminCustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteCustomerId, setDeleteCustomerId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/users?userType=customer");
      setCustomers(res.data || []);
      setFilteredCustomers(res.data || []);
      setMessage("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  // Search/filter
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = customers.filter((customer) =>
      customer.name.toLowerCase().includes(term)
    );
    setFilteredCustomers(filtered);
  };

  // Edit customer
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

  // Delete customer
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

  // ✅ Generate PDF report
  const generatePDF = (data) => {
    if (data.length === 0) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Customer List Report", 14, 22);

    const tableData = data.map((cust) => [
      cust._id.slice(-8).toUpperCase(),
      cust.name,
      cust.email,
      new Date(cust.createdAt).toLocaleDateString(),
      "Active",
    ]);

    autoTable(doc, {
      startY: 30,
      head: [["Customer ID", "Name", "Email", "Registered On", "Status"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [255, 182, 193], textColor: 0 },
      styles: { fontSize: 11 },
    });

    doc.save("CustomerListReport.pdf");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customers...</p>
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
            <span className="text-3xl text-white">👥</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-4">
            Customer Management
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage customer accounts, update details, and maintain customer records
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-2xl border ${
            message.includes("successfully") 
              ? "bg-emerald-50 border-emerald-200" 
              : "bg-rose-50 border-rose-200"
          }`}>
            <div className="flex items-center">
              <svg className={`w-5 h-5 ${
                message.includes("successfully") ? "text-emerald-500" : "text-rose-500"
              } mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d={message.includes("successfully") 
                    ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  }>
                </path>
              </svg>
              <span className={`font-medium ${
                message.includes("successfully") ? "text-emerald-700" : "text-rose-700"
              }`}>
                {message}
              </span>
            </div>
          </div>
        )}

        {/* Search & Generate Report */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <input
            type="text"
            placeholder="🔍 Search by customer name..."
            value={searchTerm}
            onChange={handleSearch}
            className="border border-pink-300 rounded-lg px-4 py-2 w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
          {filteredCustomers.length > 0 && (
            <button
              onClick={() => generatePDF(filteredCustomers)}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              📄 Generate PDF
            </button>
          )}
        </div>

        {/* Customer List Table */}
        {filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-16 text-center">
            <div className="text-8xl mb-6">👥</div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">No customers found</h3>
            <p className="text-gray-600 text-lg">
              Customer accounts will appear here once they register on the platform.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-pink-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-pink-100">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="text-pink-600">📋</span>
                Customer List
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-pink-100">
                <thead className="bg-pink-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-pink-700 uppercase tracking-wider">Customer</th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-pink-700 uppercase tracking-wider">Contact</th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-pink-700 uppercase tracking-wider">Status</th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-pink-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-pink-100">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-pink-50 transition-colors duration-200">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-pink-100 rounded-xl p-3 mr-4">
                            <span className="text-lg">👤</span>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">ID: {customer._id.slice(-8).toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-lg text-gray-900">{customer.email}</div>
                        <div className="text-sm text-gray-500">Registered: {new Date(customer.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-200">
                          Active
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex gap-3">
                          <button
                            onClick={() => startEditing(customer)}
                            className="px-5 py-2.5 bg-pink-50 text-pink-600 rounded-xl border border-pink-200 hover:bg-pink-100 transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md flex items-center gap-2"
                          >
                            <span>✏️</span>
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteCustomerId(customer._id)}
                            className="px-5 py-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-200 hover:bg-rose-100 transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md flex items-center gap-2"
                          >
                            <span>🗑️</span>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl border border-pink-100 w-full max-w-lg">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="text-pink-600">✏️</span>
                    Edit Customer
                  </h2>
                  <button onClick={cancelEditing} className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={onChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-3 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={onChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-3 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">New Password (optional)</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter new password"
                      value={formData.password}
                      onChange={onChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-3 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
                      minLength={6}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button onClick={onUpdate} className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl">
                    Save Changes
                  </button>
                  <button onClick={cancelEditing} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl border border-gray-300 hover:bg-gray-200 transition-all duration-200 font-semibold shadow-sm">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteCustomerId && (
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
                  Are you sure you want to delete this customer? This action cannot be undone and all associated data will be permanently removed.
                </p>
                <div className="flex gap-3">
                  <button onClick={onDelete} className="flex-1 px-6 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl">
                    Delete Customer
                  </button>
                  <button onClick={() => setDeleteCustomerId(null)} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl border border-gray-300 hover:bg-gray-200 transition-all duration-200 font-semibold shadow-sm">
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
};

export default AdminCustomerManagement;
