// src/services/userService.js
import api from "./api";

// Admin-only: get all users
export const getUsers = () => api.get("/users").then(r => r.data);

// Optional: get current user info
export const getUserInfo = () => api.get("/users/me").then(r => r.data);
