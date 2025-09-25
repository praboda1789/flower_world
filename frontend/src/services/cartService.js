//cartService.js
const API_BASE = "http://localhost:5000/api/cart";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  "Content-Type": "application/json",
});

export async function getCart() {
  const res = await fetch(API_BASE, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch cart");
  return res.json();
}

export async function addToCart(item) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error("Failed to add to cart");
  return res.json();
}

export async function updateCartItem(flowerId, { quantity, size }) {
  const res = await fetch(`${API_BASE}/${flowerId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ quantity, size }),
  });
  if (!res.ok) throw new Error("Failed to update cart item");
  return res.json();
}

export async function removeCartItem(flowerId) {
  const res = await fetch(`${API_BASE}/${flowerId}`, { method: "DELETE", headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to remove cart item");
  return res.json();
}

export async function clearCart() {
  const res = await fetch(API_BASE, { method: "DELETE", headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to clear cart");
  return res.json();
}
