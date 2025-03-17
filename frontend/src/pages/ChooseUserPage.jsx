//ChooseUserPage.jsx//
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ChooseUser.css';

const ChooseUserPage = () => {
  const navigate = useNavigate();

  const handleUserTypeSelect = (userType) => {
    navigate(`/${userType}Login`); // Redirect to the appropriate login page
  };

 return (
    <div className="choose-user-container">
      <h1 className="choose-user-title">Select Your Role</h1>
      <div className="button-group">
        <button onClick={() => handleUserTypeSelect('family')} className="role-btn">Login as Family</button>
        <button onClick={() => handleUserTypeSelect('caregiver')} className="role-btn">Login as Caregiver</button>
        <button onClick={() => handleUserTypeSelect('owner')} className="role-btn">Login as Owner</button>
      </div>
    </div>
  );
};

export default ChooseUserPage;
