import axios from "axios";

// Base API URL (change if backend is hosted elsewhere)
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
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
};

// Get all payments for logged-in user
export const getUserPayments = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user payments:", error);
    throw error;
  }
};

// Get saved card details
export const getSavedCard = async () => {
  try {
    const response = await axios.get(`${API_URL}/saved`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching saved card:", error);
    throw error;
  }
};

// Update saved card details
export const updateSavedCard = async (id, cardDetails) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, { cardDetails }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating saved card:", error);
    throw error;
  }
};

// Delete saved card
export const deleteSavedCard = async () => {
  try {
    const response = await axios.delete(`${API_URL}/saved`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting saved card:", error);
    throw error;
  }
};