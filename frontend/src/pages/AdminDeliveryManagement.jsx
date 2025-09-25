import React, { useEffect, useState } from "react";
import { getAllDeliveriesAdmin, updateDelivery, deleteDelivery } from "../services/deliveryService";

const AdminDeliveryManagement = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "All", date: "" });

  // Fetch deliveries
  const fetchDeliveries = async () => {
    const data = await getAllDeliveriesAdmin();
    setDeliveries(data);
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  // Handle filter changes
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Update status
  const handleStatusUpdate = async (id, newStatus) => {
    await updateDelivery(id, { status: newStatus });
    fetchDeliveries();
  };

  // Delete delivery
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this delivery?")) {
      await deleteDelivery(id);
      fetchDeliveries();
    }
  };

  // Apply filters
  const filteredDeliveries = deliveries.filter((d) => {
    const matchesSearch = d.recipientName.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === "All" || d.status === filters.status;
    const matchesDate = !filters.date || (d.deliveryDate && d.deliveryDate.startsWith(filters.date));
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="container" style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px", textAlign: "center" }}>📦 Delivery Management</h2>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          justifyContent: "center",
        }}
      >
        <input
          type="text"
          name="search"
          placeholder="🔍 Search by recipient"
          value={filters.search}
          onChange={handleFilterChange}
          style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Completed">Completed</option>
        </select>
        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={handleFilterChange}
          style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
      </div>

      {/* Delivery Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <thead style={{ background: "#f4f6f8", textAlign: "left" }}>
          <tr>
            <th style={{ padding: "12px" }}>Recipient</th>
            <th style={{ padding: "12px" }}>Address</th>
            <th style={{ padding: "12px" }}>Phone</th>
            <th style={{ padding: "12px" }}>Date</th>
            <th style={{ padding: "12px" }}>Status</th>
            <th style={{ padding: "12px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDeliveries.map((d) => (
            <tr key={d._id} style={{ borderTop: "1px solid #eee" }}>
              <td style={{ padding: "12px" }}>{d.recipientName}</td>
              <td style={{ padding: "12px" }}>{d.address}</td>
              <td style={{ padding: "12px" }}>{d.phone}</td>
              <td style={{ padding: "12px" }}>
                {d.deliveryDate ? new Date(d.deliveryDate).toLocaleDateString() : "N/A"}
              </td>
              <td style={{ padding: "12px" }}>
                <span
                  style={{
                    padding: "5px 10px",
                    borderRadius: "20px",
                    fontSize: "0.9em",
                    background:
                      d.status === "Pending"
                        ? "#ffeeba"
                        : d.status === "Out for Delivery"
                        ? "#bee5eb"
                        : "#c3e6cb",
                    color:
                      d.status === "Pending"
                        ? "#856404"
                        : d.status === "Out for Delivery"
                        ? "#0c5460"
                        : "#155724",
                  }}
                >
                  {d.status}
                </span>
              </td>
              <td style={{ padding: "12px", display: "flex", gap: "8px" }}>
                {/* Update status */}
                <select
                  value={d.status}
                  onChange={(e) => handleStatusUpdate(d._id, e.target.value)}
                  style={{
                    padding: "6px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                  }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Completed">Completed</option>
                </select>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(d._id)}
                  style={{
                    padding: "6px 12px",
                    background: "#dc3545",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredDeliveries.length === 0 && (
        <p style={{ marginTop: "20px", textAlign: "center" }}>No deliveries found.</p>
      )}
    </div>
  );
};

export default AdminDeliveryManagement;
