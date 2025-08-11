import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // import useNavigate
import { UserIcon, EnvelopeIcon, LockClosedIcon, PhoneIcon } from "@heroicons/react/24/outline";
import authService from "../services/authService";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // initialize navigate

  const { name, email, phone, password, confirmPassword } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const dataToSend = { name, email, phone, password };
      const data = await authService.register(dataToSend);

      setMessage(`Registration successful! Welcome, ${data.user.name}`);

      // Redirect to customer dashboard
      navigate("/");

      setFormData({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
    } catch (error) {
      setMessage(error.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200 px-4">
      <form
        onSubmit={onSubmit}
        className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-gray-900">Register</h2>

        <div className="relative">
          <UserIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={name}
            onChange={onChange}
            required
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-150"
          />
        </div>

        <div className="relative">
          <EnvelopeIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={onChange}
            required
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-150"
          />
        </div>

        <div className="relative">
          <PhoneIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={phone}
            onChange={onChange}
            pattern="^\+?[0-9\s\-]{7,15}$"
            title="Enter a valid phone number"
            required
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-150"
          />
        </div>

        <div className="relative">
          <LockClosedIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={onChange}
            required
            minLength={6}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-150"
          />
        </div>

        <div className="relative">
          <LockClosedIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={onChange}
            required
            minLength={6}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-150"
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-md hover:from-pink-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition duration-150"
        >
          Register
        </button>

        {message && <p className="text-center text-sm text-red-500">{message}</p>}

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-pink-500 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
