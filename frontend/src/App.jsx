import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import FlowerList from "./pages/FlowerList.jsx";
import AddFlower from "./pages/AddFlower.jsx";
import EditFlower from "./pages/EditFlower.jsx";
import Register from "./components/Register";
import Login from "./components/Login";
import Navbar from "./components/NavBar.jsx";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCustomerManagement from "./pages/AdminCustomerManagement";
import HomePage from "./pages/HomePage.jsx";
import CartPage from "./pages/CartPage";

function App() {
  return (
    <Router>
      <ConditionalNavbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/flower" element={<FlowerList />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/customers" element={<AdminCustomerManagement />} />
        <Route path="/add" element={<AddFlower />} />
        <Route path="/edit/:id" element={<EditFlower />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

// This component controls when Navbar shows
function ConditionalNavbar() {
  const location = useLocation();
  // Hide Navbar on login and register pages
  const noNavbarPaths = ["/admin/dashboard", "/admin/customers","/flower"];

  if (noNavbarPaths.includes(location.pathname)) {
    return null; // Don't render Navbar here
  }

  return <Navbar />;
}

export default App;
