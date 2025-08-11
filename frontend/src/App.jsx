import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FlowerList from "./pages/FlowerList.jsx";
import AddFlower from "./pages/AddFlower.jsx";
import EditFlower from "./pages/EditFlower.jsx";
import Register from "./components/Register";
import Login from "./components/Login";
import Navbar from "./components/NavBar.jsx";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCustomerManagement from "./pages/AdminCustomerManagement";
import HomePage from"./pages/HomePage.jsx";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<FlowerList />} />
        <Route path="/home" element={<HomePage />} />
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

export default App;