//LoginOwnerPage.jsx//
import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import axios from 'axios';

const LoginOwnerPage = () => {
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      if (response.data.user.userType !== 'admin') {
        alert('Access denied. You are not an admin.');
        return;
      }

      localStorage.setItem("token", response.data.token);
      navigate('/next'); // Redirecting to AddResident after admin login
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  return (
    <div>
      <h1>Owner (Admin) Login</h1>
      <LoginForm handleLogin={handleLogin} buttonText="Login as Owner" />
    </div>
  );
};

export default LoginOwnerPage;
