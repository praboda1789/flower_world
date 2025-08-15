import React, { useEffect, useState } from "react";
import { addToCart } from "../services/cartService";

function Toast({ message, onClose }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-pink-100 border border-pink-300 text-pink-800 px-6 py-3 rounded-lg shadow-md z-50 max-w-md w-full text-center font-semibold">
      {message}
    </div>
  );
}

export default function HomePage() {
  const [flowers, setFlowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/flowers")
      .then((res) => res.json())
      .then((data) => {
        setFlowers(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load flowers.");
        setLoading(false);
      });
  }, []);

  const handleAddToCart = async (flowerId, flowerName) => {
    try {
      await addToCart(flowerId, 1); // add quantity 1
      setToast(`Added 1 ${flowerName} to cart!`);
    } catch {
      setToast("Failed to add to cart. Please login or try again.");
    }
  };

  return (
    <>
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
      {loading && <p>Loading flowers...</p>}
      {error && <p>{error}</p>}
      <div
        style={{
          backgroundColor: "#ffe6f2",
          minHeight: "100vh",
          padding: 20,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: 20,
        }}
      >
        {flowers.map((flower) => (
          <div
            key={flower._id}
            style={{
              backgroundColor: "white",
              borderRadius: 10,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              padding: 12,
              cursor: "default",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              minHeight: 270,
              overflow: "hidden",
            }}
          >
            <img
              src={`http://localhost:5000/uploads/${flower.image}`}
              alt={flower.name}
              style={{
                width: "100%",
                height: 90,
                objectFit: "cover",
                borderRadius: 8,
              }}
            />

            <h3 style={{ margin: 0, color: "#ff3399", fontSize: 16 }}>
              {flower.name}
            </h3>

            <p style={{ margin: "2px 0", fontWeight: "bold", fontSize: 12 }}>
              Availability:{" "}
              {flower.flowerCount > 0 ? (
                <span style={{ color: "green" }}>Available</span>
              ) : (
                <span style={{ color: "red" }}>Not Available</span>
              )}
            </p>

            {/* Selling Prices */}
            <div style={{ width: "100%" }}>
              <p
                style={{
                  fontWeight: "bold",
                  marginBottom: 6,
                  fontSize: 12,
                  color: "#ff4da6",
                }}
              >
                💐 Selling Prices:
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    backgroundColor: "#ffe0eb",
                    color: "#ff4da6",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: "bold",
                  }}
                >
                  Small (5) — ${flower.sellingPriceSmall}
                </span>
                <span
                  style={{
                    backgroundColor: "#e6f7ff",
                    color: "#3399ff",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: "bold",
                  }}
                >
                  Medium (15) — ${flower.sellingPriceMedium}
                </span>
                <span
                  style={{
                    backgroundColor: "#eaffea",
                    color: "#33cc33",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: "bold",
                  }}
                >
                  Large (25) — ${flower.sellingPriceLarge}
                </span>
              </div>
            </div>

            <button
              disabled={flower.flowerCount <= 0}
              onClick={() => handleAddToCart(flower._id, flower.name)}
              style={{
                marginTop: 8,
                padding: "6px 12px",
                backgroundColor: "#ff66b2",
                border: "none",
                borderRadius: 6,
                color: "white",
                fontWeight: "600",
                cursor: flower.flowerCount > 0 ? "pointer" : "not-allowed",
                width: "100%",
                fontSize: 13,
              }}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
