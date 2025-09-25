import React, { useEffect, useState } from "react";
import { getCart, updateCartItem, removeCartItem, clearCart } from "../services/cartService";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await getCart();
      setCart(data.items || []);
      setLoading(false);
    } catch {
      setError("Failed to fetch cart.");
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    await updateCartItem(item.flowerId, { quantity: newQuantity, size: item.size });
    fetchCart();
  };

  const handleSizeChange = async (item, newSize) => {
    await updateCartItem(item.flowerId, { quantity: item.quantity, size: newSize });
    fetchCart();
  };

  const handleRemoveItem = async (item) => {
    if (!window.confirm(`Remove "${item.name}" from cart?`)) return;
    await removeCartItem(item.flowerId);
    fetchCart();
  };

  const handleClearCart = async () => {
    if (!window.confirm("Clear the entire cart?")) return;
    await clearCart();
    fetchCart();
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-lg font-medium text-gray-700 animate-pulse">Loading cart...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <p className="text-lg font-medium text-rose-600">{error}</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition duration-300 shadow-md"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );

  if (!cart.length) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <p className="text-lg font-medium text-gray-700">Your cart is empty.</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition duration-300 shadow-md"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition duration-300 shadow-md"
          >
            Continue Shopping
          </button>
        </div>

        {/* Cart Items */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {cart.map((item) => (
            <div key={item.flowerId} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-6 border-b border-gray-200 last:border-b-0">
              {/* Item Details */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-600">
                  Unit Price: <span className="font-medium">LKR {item.price}</span>
                </p>
                <select
                  value={item.size || "small"}
                  onChange={(e) => handleSizeChange(item, e.target.value)}
                  className="border rounded px-2 py-1 mt-2"
                >
                  <option value="small">Small — LKR {item.prices?.small}</option>
                  <option value="medium">Medium — LKR {item.prices?.medium}</option>
                  <option value="large">Large — LKR {item.prices?.large}</option>
                </select>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(item, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className={`w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 ${item.quantity <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"} transition duration-300`}
                >-</button>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item, parseInt(e.target.value) || 1)}
                  className="w-16 text-center border border-gray-300 rounded-lg py-1 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={() => handleQuantityChange(item, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition duration-300"
                >+</button>
              </div>

              {/* Item Total */}
              <div className="w-24 text-right font-semibold text-gray-900">
                LKR {item.price * item.quantity}
              </div>

              {/* Remove Button */}
              <button
                onClick={() => handleRemoveItem(item)}
                className="px-3 py-1 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 hover:text-rose-700 transition duration-300"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Summary & Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Total: <span className="text-emerald-600">LKR {total}</span>
            </h2>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleClearCart}
              className="px-6 py-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition duration-300 shadow-md"
            >
              Clear Cart
            </button>
            <button
              onClick={() => navigate("/checkout")}
              className="px-6 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition duration-300 shadow-md"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
