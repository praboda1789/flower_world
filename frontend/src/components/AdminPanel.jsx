import React, { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";

const AdminPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openFlowers, setOpenFlowers] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: "📊",
      main: true
    },
    {
      path: "/admin/flowers",
      label: "Flower List",
      icon: "🌺",
      parent: "flowers"
    },
    {
      path: "/admin/add-flower",
      label: "Add Flower",
      icon: "➕",
      parent: "flowers"
    },
    {
      path: "/admin/customers",
      label: "Customers",
      icon: "👥",
      main: true
    },
    {
      path: "/admin/orders",
      label: "Orders",
      icon: "📦",
      main: true
    },
    {
      path: "/admin/deliveries",
      label: "Deliveries",
      icon: "🚚",
      main: true
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-80 bg-white/90 backdrop-blur-xl shadow-2xl border-r border-gray-200/60
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="p-8 border-b border-gray-200/60">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl text-white">🏵️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Flowe world
              </h1>
              <p className="text-sm text-gray-500 font-medium">Management Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2">
          {/* Dashboard */}
          <Link
            to="/admin/dashboard"
            className={`
              flex items-center gap-4 px-4 py-3 rounded-2xl font-semibold transition-all duration-200 group
              ${isActive("/admin/dashboard") 
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25' 
                : 'text-gray-600 hover:bg-white hover:shadow-lg hover:border hover:border-gray-200/60'
              }
            `}
          >
            <span className="text-xl">📊</span>
            <span>Dashboard</span>
          </Link>

          {/* Flowers Management */}
          <div className="space-y-2">
            <button
              onClick={() => setOpenFlowers(!openFlowers)}
              className={`
                w-full flex items-center justify-between gap-4 px-4 py-3 rounded-2xl font-semibold transition-all duration-200 group
                ${openFlowers 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25' 
                  : 'text-gray-600 hover:bg-white hover:shadow-lg hover:border hover:border-gray-200/60'
                }
              `}
            >
              <div className="flex items-center gap-4">
                <span className="text-xl">🌺</span>
                <span>Flowers</span>
              </div>
              <span className={`transform transition-transform duration-200 ${openFlowers ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            
            {openFlowers && (
              <div className="ml-4 space-y-2 animate-fadeIn">
                <Link
                  to="/admin/flowers"
                  className={`
                    flex items-center gap-4 px-4 py-2.5 rounded-xl font-medium transition-all duration-200
                    ${isActive("/admin/flowers") 
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    }
                  `}
                >
                  <span className="text-lg">📋</span>
                  <span>Flower List</span>
                </Link>
                <Link
                  to="/admin/add-flower"
                  className={`
                    flex items-center gap-4 px-4 py-2.5 rounded-xl font-medium transition-all duration-200
                    ${isActive("/admin/add-flower") 
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    }
                  `}
                >
                  <span className="text-lg">➕</span>
                  <span>Add Flower</span>
                </Link>
              </div>
            )}
          </div>

          {/* Customers */}
          <Link
            to="/admin/customers"
            className={`
              flex items-center gap-4 px-4 py-3 rounded-2xl font-semibold transition-all duration-200 group
              ${isActive("/admin/customers") 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25' 
                : 'text-gray-600 hover:bg-white hover:shadow-lg hover:border hover:border-gray-200/60'
              }
            `}
          >
            <span className="text-xl">👥</span>
            <span>Customers</span>
          </Link>

          {/* Orders */}
          <Link
            to="/admin/orders"
            className={`
              flex items-center gap-4 px-4 py-3 rounded-2xl font-semibold transition-all duration-200 group
              ${isActive("/admin/orders") 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25' 
                : 'text-gray-600 hover:bg-white hover:shadow-lg hover:border hover:border-gray-200/60'
              }
            `}
          >
            <span className="text-xl">📦</span>
            <span>Orders</span>
          </Link>

          {/* Deliveries */}
          <Link
            to="/admin/deliveries"
            className={`
              flex items-center gap-4 px-4 py-3 rounded-2xl font-semibold transition-all duration-200 group
              ${isActive("/admin/deliveries") 
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25' 
                : 'text-gray-600 hover:bg-white hover:shadow-lg hover:border hover:border-gray-200/60'
              }
            `}
          >
            <span className="text-xl">🚚</span>
            <span>Deliveries</span>
          </Link>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200/60">
          <div className="bg-gradient-to-r from-slate-100 to-gray-100 rounded-2xl p-4 text-center">
            <p className="text-sm font-semibold text-gray-700 mb-2">Admin User</p>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-10">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-xl bg-white shadow-lg border border-gray-200/60 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <span className="text-xl">☰</span>
              </button>
              <h2 className="text-2xl font-bold text-gray-800">
                {menuItems.find(item => item.path === location.pathname)?.label || 'Admin Panel'}
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 bg-white/80 rounded-2xl px-4 py-2 shadow-lg border border-gray-200/60">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  A
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Admin User</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2.5 rounded-xl bg-white shadow-lg border border-gray-200/60 text-gray-600 hover:text-gray-800 transition-colors">
                  <span className="text-xl">🔔</span>
                </button>
                <button className="p-2.5 rounded-xl bg-white shadow-lg border border-gray-200/60 text-gray-600 hover:text-gray-800 transition-colors">
                  <span className="text-xl">⚙️</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;