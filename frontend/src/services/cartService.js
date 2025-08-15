const API_BASE = "http://localhost:5000/api/cart";

// For auth, replace with your auth token retrieval logic if applicable
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
});

export async function getCart() {
  const res = await fetch(API_BASE, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch cart');
  return res.json();
}

export async function addToCart(flowerId, quantity = 1) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ flowerId, quantity })
  });
  if (!res.ok) throw new Error('Failed to add to cart');
  return res.json();
}

export async function updateCartItem(flowerId, quantity) {
  const res = await fetch(`${API_BASE}/${flowerId}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ quantity })
  });
  if (!res.ok) throw new Error('Failed to update cart item');
  return res.json();
}

export async function removeCartItem(flowerId) {
  const res = await fetch(`${API_BASE}/${flowerId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to remove cart item');
  return res.json();
}

export async function clearCart() {
  const res = await fetch(API_BASE, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to clear cart');
  return res.json();
}
