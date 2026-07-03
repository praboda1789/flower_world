import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api", // your backend URL
});

// Add the token dynamically before each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // store token after login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
