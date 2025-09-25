// services/deliveryService.js
import axios from "axios";

const API_URL =
  (typeof process !== "undefined" && process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL
    : "http://localhost:5000") + "/api/deliveries";

// Create new delivery (if manual, but auto in backend)
export const createDelivery = async (payload) => {
  try {
    const response = await axios.post(API_URL, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating delivery:", error);
    throw error;
  }
};

// Get all deliveries (admin)
export const getAllDeliveries = async (query = {}) => {
  try {
    const response = await axios.get(`${API_URL}/all`, {
      params: query,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all deliveries:", error);
    throw error;
  }
};

// Get my deliveries (customer)
export const getMyDeliveries = async () => {
  try {
    const response = await axios.get(`${API_URL}/my`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching my deliveries:", error);
    throw error;
  }
};

// Update delivery (admin)
export const updateDelivery = async (id, payload) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating delivery:", error);
    throw error;
  }
};

// Delete delivery (admin)
export const deleteDelivery = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting delivery:", error);
    throw error;
  }
};