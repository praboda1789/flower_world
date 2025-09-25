import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import flowerLogo from "../assets/flower.jpg";
import { FaShoppingCart } from "react-icons/fa";
import { FaBoxOpen } from "react-icons/fa";
const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Run once on mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []); // <-- Empty array ensures this runs only once on mount

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md py-4 px-8 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-3 no-underline">
        <img
          src={flowerLogo}
          alt="Flower Logo"
          className="h-10 w-10 rounded-full border-2 border-green-500"
        />
        <span className="text-green-700 font-extrabold text-2xl hover:text-green-900 cursor-pointer select-none">
          FlowerWorld
        </span>
      </Link>

      {/* Center Nav (Links for all users) */}
      <div className="hidden md:flex gap-8 text-gray-700 font-medium">
        <Link to="/" className="hover:text-green-700 transition">Home</Link>
        <Link to="/shop" className="hover:text-green-700 transition">Shop</Link>
        <Link to="/about" className="hover:text-green-700 transition">About</Link>
        <Link to="/contact" className="hover:text-green-700 transition">Contact</Link>
      </div>

      {/* Right Side Actions */}
      <div className="flex gap-5 items-center text-gray-600">
        {user && (
          <>
            {/* 🛒 Cart */}
            <Link
              to="/cart"
              className="hover:text-green-700 transition"
              aria-label="View Cart"
              style={{ fontSize: "1.4rem" }}
            >
              <FaShoppingCart />
            </Link>

            {/* 📦 Orders */}
            <Link
              to="/orders/:id"
              className="hover:text-green-700 transition"
              aria-label="My Orders"
              style={{ fontSize: "1.4rem" }}
            >
              <FaBoxOpen />
            </Link>
          </>
        )}

        {user ? (
          <>
            <span className="font-semibold text-gray-700">Hello, {user.name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-5 py-2 rounded-lg shadow-md font-semibold hover:bg-red-700"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md font-semibold hover:bg-blue-700"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
