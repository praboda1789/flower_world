import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [openFlowers, setOpenFlowers] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg rounded-r-2xl p-6 flex flex-col">
        <h2 className="text-3xl font-extrabold text-pink-600 mb-10 text-center">
          Admin Panel
        </h2>
        <nav className="flex flex-col gap-3 flex-1">
          
            {/* Admin Dashboard */}
            <Link
                to="/admin/dashboard"
                className="px-4 py-2 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-colors"
            >
                Admin Dashboard
            </Link>
            
          {/* Manage Flowers */}
          <div>
            <button
              onClick={() => setOpenFlowers(!openFlowers)}
              className="w-full text-left px-4 py-2 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-colors"
            >
              Manage Flowers
            </button>
            {openFlowers && (
              <div className="ml-4 mt-3 flex flex-col gap-2">
                <Link
                  to="/admin/add-flower"
                  className="px-3 py-1 bg-pink-200 text-pink-800 font-semibold rounded hover:bg-pink-300 transition-colors"
                >
                  Add Flower
                </Link>
                <Link
                  to="/admin/flowers"
                  className="px-3 py-1 bg-pink-200 text-pink-800 font-semibold rounded hover:bg-pink-300 transition-colors"
                >
                  Flower List
                </Link>
              </div>
            )}
          </div>

          {/* Manage Customers */}
          <Link
            to="/admin/customers"
            className="px-4 py-2 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-colors"
          >
            Manage Customers
          </Link>

          {/* Manage Orders */}
          <Link
            to="/admin/orders"
            className="px-4 py-2 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-colors"
          >
            Manage Orders
          </Link>

          {/* Manage Deliveries */}
          <Link
            to="/admin/deliveries"
            className="px-4 py-2 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-colors"
          >
            Manage Delivery
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="mt-auto px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminPanel;