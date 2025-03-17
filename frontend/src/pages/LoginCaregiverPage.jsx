import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import axios from 'axios';

const LoginCaregiverPage = () => {
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      if (response.data.user.userType !== 'caregiver') {
        alert('Access denied. You are not a caregiver.');
        return;
      }

      localStorage.setItem("token", response.data.token);
      navigate('/caregiverDashboard'); // Redirect caregiver to their dashboard
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  return (
    <div>
      <h1>Caregiver Login</h1>
      <LoginForm handleLogin={handleLogin} buttonText="Login as Caregiver" />
    </div>
  );
};

export default LoginCaregiverPage;
