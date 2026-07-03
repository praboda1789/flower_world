//flowerService.jsx
import axios from "axios";


// Base API URL (change to match your backend)
const API_URL = "http://localhost:5000/api/flowers";

// Create new flower with image upload
export const createFlower = async (flowerData) => {
  try {
    const response = await axios.post(API_URL, flowerData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating flower:", error);
    throw error;
  }
};

// Get all flowers
export const getFlowers = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching flowers:", error);
    throw error;
  }
};

// Get a single flower by ID
export const getFlowerById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching flower:", error);
    throw error;
  }
};

// Update a flower (supports image upload too)
export const updateFlower = async (id, flowerData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, flowerData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating flower:", error);
    throw error;
  }
};

// Delete a flower
export const deleteFlower = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting flower:", error);
    throw error;
  }
};
