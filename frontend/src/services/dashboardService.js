import api from "./api";
import { getUserInfo } from "./userService";

// Orders
export const getAllOrdersAdmin = () => api.get("/orders/admin/orders").then(r => r.data);
export const getUserOrders = () => api.get("/orders/me").then(r => r.data);

// Deliveries
export const getAllDeliveries = () => api.get("/deliveries/all").then(r => r.data);
export const getMyDeliveries = () => api.get("/deliveries/my").then(r => r.data);

// Payments
export const getUserPayments = () => api.get("/payments").then(r => r.data);

// Flowers
export const getFlowers = () => api.get("/flowers").then(r => r.data);

// Users (admin only)
export const getUsers = () => api.get("/users").then(r => r.data);
