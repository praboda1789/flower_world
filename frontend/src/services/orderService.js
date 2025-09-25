import api from "./axiosInstance";

export const createOrder = (orderData) =>
  api.post("/orders", orderData).then((r) => r.data);

export const getMyOrders = () =>
  api.get("/orders/me").then((r) => r.data);

export const getOrder = (id) =>
  api.get(`/orders/${id}`).then((r) => r.data);

export const updateOrder = (id, body) =>
  api.put(`/orders/${id}`, body).then((r) => r.data);

export const cancelOrder = (id) =>
  api.post(`/orders/${id}/cancel`).then((r) => r.data);

export const getAllOrdersAdmin = () =>
  api.get("/orders").then((r) => r.data);

export const deleteOrderAdmin = (id) =>
  api.delete(`/orders/${id}`).then((r) => r.data);
