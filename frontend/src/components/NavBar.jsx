import React from "react";
import { Link } from "react-router-dom";
import flowerLogo from "../assets/flower.jpg"; // Adjust the path as necessary

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md py-4 px-8 flex justify-between items-center sticky top-0 z-50">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 no-underline">
        <img
          src={flowerLogo}
          alt="Flower Logo"
          className="h-10 w-10 rounded-full border-2 border-green-500"
        />
        <span className="text-green-700 font-extrabold text-2xl transition-colors duration-300 hover:text-green-900 cursor-pointer select-none">
          FlowerWorld
        </span>
      </Link>

      {/* Nav buttons */}
      <div className="flex gap-5">
        <Link
          to="/login"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md font-semibold transition-colors duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="bg-green-600 text-white px-5 py-2 rounded-lg shadow-md font-semibold transition-colors duration-300 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
        >
          Register
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
