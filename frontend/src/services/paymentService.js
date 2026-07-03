//paymentService.js
import axios from "axios";

// Base API URL
const API_URL =
  (typeof process !== "undefined" && process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL
    : "http://localhost:5000") + "/api/payments";

// Create new payment
export const createPayment = async (payload) => {
  try {
    const response = await axios.post(API_URL, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': 'application/json'
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error.response?.data || { message: "Failed to create payment" };
  }
};

// Get all payments for logged-in user
export const getUserPayments = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': 'application/json'
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user payments:", error);
    throw error.response?.data || { message: "Failed to fetch payments" };
  }
};

// Get saved card details
export const getSavedCard = async () => {
  try {
    const response = await axios.get(`${API_URL}/saved`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': 'application/json'
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching saved card:", error);
    throw error.response?.data || { message: "Failed to fetch saved cards" };
  }
};

// Update saved card details
export const updateSavedCard = async (id, cardDetails) => {
  try {
    console.log('Sending update request with payload:', cardDetails);
    const response = await axios.put(`${API_URL}/${id}`, cardDetails, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': 'application/json'
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating saved card:", error.response?.data || error);
    throw error.response?.data || { message: "Failed to update card" };
  }
};

// Delete saved card
export const deleteSavedCard = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/saved/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': 'application/json'
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting saved card:", error);
    throw error.response?.data || { message: "Failed to delete card" };
  }
};