import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import axios from 'axios';

const LoginFamilyPage = () => {
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      if (response.data.user.userType !== 'resident/family') {
        alert('Access denied. You are not a family member.');
        return;
      }

      localStorage.setItem("token", response.data.token);
      navigate('/familyDashboard'); // Redirect family to their dashboard
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  return (
    <div>
      <h1>Family Member Login</h1>
      <LoginForm handleLogin={handleLogin} buttonText="Login as Family Member" />
    </div>
  );
};

export default LoginFamilyPage;
