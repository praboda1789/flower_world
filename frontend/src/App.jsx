import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import FlowerList from "./pages/FlowerList.jsx";
import AddFlower from "./pages/AddFlower.jsx";
import EditFlower from "./pages/EditFlower.jsx";
import Register from "./components/Register";
import Login from "./components/Login";
import Navbar from "./components/NavBar.jsx";
import AdminCustomerManagement from "./pages/AdminCustomerManagement";
import HomePage from "./pages/HomePage.jsx";
import CartPage from "./pages/CartPage";
import AdminPanel from "./components/AdminPanel.jsx"; 
import Dashboard from "./pages/AdminDashboard.jsx";
import AdminDeliveryManagement from "./pages/AdminDeliveryManagement.jsx";
// import MyDeliveries from "./pages/MyDeliveries.jsx";
import AdminOrdersPage from "./pages/AdminOrdersPage.jsx";
import MyOrdersPage from "./pages/MyOrders.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import PaymentsPage from "./pages/PaymentsPage.jsx";

function App() {
  return (
    <Router>
      <ConditionalNavbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/flower" element={<FlowerList />} />
        <Route path="/cart" element={<CartPage />} />
        {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
        {/* <Route path="/admin/customers" element={<AdminCustomerManagement />} /> */}
        <Route path="/add" element={<AddFlower />} />
        <Route path="/edit/:id" element={<EditFlower />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/my-deliveries" element={<MyDeliveries />} /> */}
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders/:id" element={<MyOrdersPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        {/* Admin pages with AdminPanel layout */}
        <Route path="/admin" element={<AdminPanel />}>
          <Route path="dashboard" element={Dashboard}/>
          <Route path="add-flower" element={<AddFlower />} />
            <Route path="flowers" element={<FlowerList />} />
            <Route path="customers" element={<AdminCustomerManagement />} />
            <Route path="deliveries" element={<AdminDeliveryManagement />} />
            <Route path="orders" element={<AdminOrdersPage />} />

        </Route>
      </Routes>
    </Router>
  );
}
 

// This component controls when Navbar shows
function ConditionalNavbar() {
  const location = useLocation();
  // Hide Navbar on login and register pages
  const noNavbarPaths = ["/admin","/flower"];

  if (noNavbarPaths.includes(location.pathname)) {
    return null; // Don't render Navbar here
  }

  return <Navbar />;
}

export default App;
