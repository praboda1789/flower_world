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
import MyDeliveriesPage from "./pages/MyDeliveries.jsx";
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
        
       
        <Route path="/add" element={<AddFlower />} />
        <Route path="/edit/:id" element={<EditFlower />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/deliveries" element={<MyDeliveriesPage />} />
        <Route path="/deliveries/:orderId" element={<MyDeliveriesPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders/:id" element={<MyOrdersPage />} />
        <Route path="/payments" element={<PaymentsPage />} />

        {/* Admin pages with AdminPanel layout */}
        <Route path="/admin" element={<AdminPanel />}>
        <Route path="dashboard" element={<Dashboard />} />
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
  // Hide Navbar on login, register, and all admin routes
  const noNavbarPaths = ["/login", "/register", "/admin"];

  if (noNavbarPaths.some(path => location.pathname === path || location.pathname.startsWith(path))) {
    return null; // Don't render Navbar on these paths
  }

  return <Navbar />;
}

export default App;
