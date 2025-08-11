import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminCustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  // Fetch all customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = () => {
    axios
      .get("http://localhost:5000/api/users?userType=customer") // assuming filter by userType customer
      .then((res) => setCustomers(res.data))
      .catch(() => setMessage("Failed to load customers"));
  };

  const startEditing = (customer) => {
    setEditingId(customer._id);
    setFormData({ name: customer.name, email: customer.email, password: "" });
    setMessage("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setMessage("");
  };

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onUpdate = (e) => {
    e.preventDefault();
    setMessage("");
    const updateData = { name: formData.name, email: formData.email };
    // Only include password if it is provided (not empty)
    if (formData.password.trim() !== "") {
      updateData.password = formData.password;
    }

    axios
      .put(`http://localhost:5000/api/users/${editingId}`, updateData)
      .then(() => {
        setMessage("Customer updated successfully");
        setEditingId(null);
        fetchCustomers();
      })
      .catch(() => setMessage("Update failed"));
  };

  const onDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      axios
        .delete(`http://localhost:5000/api/users/${id}`)
        .then(() => {
          setMessage("Customer deleted successfully");
          if (editingId === id) setEditingId(null);
          fetchCustomers();
        })
        .catch(() => setMessage("Delete failed"));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Customer Management</h2>
      {message && <p className="mb-4 text-center text-red-500">{message}</p>}

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-pink-100">
            <th className="border px-3 py-2 text-left">Name</th>
            <th className="border px-3 py-2 text-left">Email</th>
            <th className="border px-3 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) =>
            editingId === customer._id ? (
              <tr key={customer._id} className="bg-rose-50">
                <td className="border px-3 py-2">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={onChange}
                    className="w-full border rounded px-2 py-1"
                    required
                  />
                </td>
                <td className="border px-3 py-2">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={onChange}
                    className="w-full border rounded px-2 py-1"
                    required
                  />
                </td>
                <td className="border px-3 py-2 text-center">
                  <input
                    type="password"
                    name="password"
                    placeholder="New Password (optional)"
                    value={formData.password}
                    onChange={onChange}
                    className="border rounded px-2 py-1 mb-2"
                    minLength={6}
                  />
                  <div>
                    <button
                      onClick={onUpdate}
                      className="mr-2 px-3 py-1 bg-pink-500 text-white rounded hover:bg-pink-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr key={customer._id}>
                <td className="border px-3 py-2">{customer.name}</td>
                <td className="border px-3 py-2">{customer.email}</td>
                <td className="border px-3 py-2 text-center">
                  <button
                    onClick={() => startEditing(customer)}
                    className="mr-2 px-3 py-1 bg-pink-500 text-white rounded hover:bg-pink-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(customer._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminCustomerManagement;
