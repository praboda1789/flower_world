// services/deliveryService.js
const API_BASE = "http://localhost:5000/api/deliveries";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  "Content-Type": "application/json",
});

// Create a new delivery
export async function createDelivery(payload) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create delivery");
  return res.json();
}

// Get delivery by orderId
export async function getDeliveryByOrder(orderId) {
  const res = await fetch(`${API_BASE}/order/${orderId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch delivery by order");
  return res.json();
}

// Update delivery by deliveryId
export async function updateDelivery(deliveryId, payload) {
  const res = await fetch(`${API_BASE}/${deliveryId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update delivery");
  return res.json();
}

// Delete delivery by deliveryId
export async function deleteDelivery(deliveryId) {
  const res = await fetch(`${API_BASE}/${deliveryId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete delivery");
  return res.json();
}

// Admin: Get all deliveries
export async function getAllDeliveriesAdmin() {
  const res = await fetch(`${API_BASE}/admin/all`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch deliveries (admin)");
  return res.json();
}
