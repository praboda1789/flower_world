import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [flowers, setFlowers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Dummy data for users
    const dummyUsers = [
      { _id: "1", name: "John Doe", email: "john@example.com" },
      { _id: "2", name: "Jane Smith", email: "jane@example.com" },
      { _id: "3", name: "Alice Johnson", email: "alice@example.com" },
    ];
    setUsers(dummyUsers);

    // Dummy data for flowers
    const dummyFlowers = [
      { _id: "1", name: "Rose", price: 10 },
      { _id: "2", name: "Tulip", price: 15 },
      { _id: "3", name: "Sunflower", price: 8 },
    ];
    setFlowers(dummyFlowers);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <button
        onClick={() => navigate("/admin/customers")}
        className="mb-4 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
      >
        Manage Customers
      </button>

      <div className="grid grid-cols-2 gap-6">
        {/* Users */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Users</h2>
          <ul>
            {users.map((u) => (
              <li key={u._id} className="border-b py-1">
                {u.name} ({u.email})
              </li>
            ))}
          </ul>
        </div>

        {/* Flowers */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Flowers</h2>
          <ul>
            {flowers.map((f) => (
              <li key={f._id} className="border-b py-1">
                {f.name} - ${f.price}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
