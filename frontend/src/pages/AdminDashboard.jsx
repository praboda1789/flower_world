// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { getUsers } from "../services/userService";
import { getFlowers } from "../services/flowerService";
import { getAllOrdersAdmin } from "../services/orderService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [flowers, setFlowers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersData, flowersData, ordersData] = await Promise.all([
          getUsers(),
          getFlowers(),
          getAllOrdersAdmin(),
        ]);

        setUsers(Array.isArray(usersData) ? usersData : []);
        setFlowers(Array.isArray(flowersData) ? flowersData : []);

        if (Array.isArray(ordersData)) {
          setOrders(ordersData);
        } else if (ordersData.orders && Array.isArray(ordersData.orders)) {
          setOrders(ordersData.orders);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const orderCounts = {};
  orders.forEach((order) => {
    (order.items || []).forEach((item) => {
      orderCounts[item.name] = (orderCounts[item.name] || 0) + (item.quantity || 0);
    });
  });

  // Chart data
  const barData = {
    labels: Object.keys(orderCounts),
    datasets: [
      {
        label: "Quantity Sold",
        data: Object.values(orderCounts),
        backgroundColor: [
          "#FFB6C1",
          "#FF69B4",
          "#DB7093",
          "#FF1493",
          "#C71585",
          "#FF91A4",
        ],
        borderColor: "#EC4899",
        borderWidth: 1,
        borderRadius: 8,
        barPercentage: 0.7,
      },
    ],
  };

  const pieData = {
    labels: Object.keys(orderCounts),
    datasets: [
      {
        label: "Orders Distribution",
        data: Object.values(orderCounts),
        backgroundColor: [
          "#FFB6C1",
          "#FF69B4",
          "#DB7093",
          "#FF1493",
          "#C71585",
          "#FF91A4",
        ],
        borderColor: "#FFFFFF",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#9CA3AF",
          font: { size: 12, family: "'Inter', sans-serif" },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "#1F2937",
        titleColor: "#F9FAFB",
        bodyColor: "#F9FAFB",
        borderColor: "#EC4899",
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { color: "#6B7280" },
      },
      y: {
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { color: "#6B7280" },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#9CA3AF",
          font: { size: 12, family: "'Inter', sans-serif" },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "#1F2937",
        titleColor: "#F9FAFB",
        bodyColor: "#F9FAFB",
        borderColor: "#EC4899",
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
  };

  // PDF Report generation
  const generateReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Admin Dashboard Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    // Totals
    doc.setFontSize(12);
    doc.text(`Total Users: ${users.length}`, 14, 38);
    doc.text(`Total Flowers: ${flowers.length}`, 14, 44);
    doc.text(`Total Orders: ${orders.length}`, 14, 50);

    let currentY = 60;

    // Users Table
    autoTable(doc, {
      startY: currentY,
      head: [["User ID", "Name", "Email", "Phone"]],
      body: users.map((u) => [
        u._id.slice(-8).toUpperCase(),
        u.name,
        u.email,
        u.phone || "",
      ]),
      headStyles: { fillColor: [244, 63, 94] },
      styles: { fontSize: 10 },
      theme: "striped",
    });
    currentY = doc.lastAutoTable.finalY + 10;

    // Flowers Table
    autoTable(doc, {
      startY: currentY,
      head: [["Flower ID", "Name", "Price", "Stock"]],
      body: flowers.map((f) => [
        f._id.slice(-8).toUpperCase(),
        f.name,
        f.price,
        f.stock || 0,
      ]),
      headStyles: { fillColor: [255, 105, 180] },
      styles: { fontSize: 10 },
      theme: "striped",
    });
    currentY = doc.lastAutoTable.finalY + 10;

    // Orders Table
    autoTable(doc, {
      startY: currentY,
      head: [["Order ID", "Customer", "Total Items", "Status"]],
      body: orders.map((o) => [
        o._id.slice(-8).toUpperCase(),
        o.userId?.name || "",
        o.items?.reduce((sum, i) => sum + (i.quantity || 0), 0),
        o.status,
      ]),
      headStyles: { fillColor: [199, 21, 133] },
      styles: { fontSize: 10 },
      theme: "striped",
    });

    doc.save(`admin_dashboard_report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Welcome to your floral management dashboard</p>
      </div>

      {/* Report Button */}
      <div className="mb-6">
        <button
          onClick={generateReport}
          className="px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600"
        >
          📄 Generate Report
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Users Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-pink-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{users.length}</p>
            </div>
            <div className="p-3 bg-pink-100 rounded-full">
              <svg
                className="w-6 h-6 text-pink-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Flowers Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-rose-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Flowers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{flowers.length}</p>
            </div>
            <div className="p-3 bg-rose-100 rounded-full">
              <svg
                className="w-6 h-6 text-rose-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-fuchsia-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{orders.length}</p>
            </div>
            <div className="p-3 bg-fuchsia-100 rounded-full">
              <svg
                className="w-6 h-6 text-fuchsia-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Flower Sales Performance</h2>
            <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium">
              Quantity Sold
            </span>
          </div>
          <div className="h-80">
            {Object.keys(orderCounts).length > 0 ? (
              <Bar data={barData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 text-gray-300 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <p className="text-gray-500">No order data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Sales Distribution</h2>
            <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-sm font-medium">
              Market Share
            </span>
          </div>
          <div className="h-80">
            {Object.keys(orderCounts).length > 0 ? (
              <Pie data={pieData} options={pieOptions} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 text-gray-300 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                    />
                  </svg>
                  <p className="text-gray-500">No order data available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
