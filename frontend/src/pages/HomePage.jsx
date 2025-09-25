import React, { useEffect, useState } from "react";
import { addToCart } from "../services/cartService";

// ✅ Toast Component
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
  const [selectedSizes, setSelectedSizes] = useState({});

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

  const handleAddToCart = async (flower) => {
    const size = selectedSizes[flower._id] || "small";

    try {
      await addToCart({
        flowerId: flower._id,
        name: flower.name,
        size,
        quantity: 1,
        image: flower.image,
        prices: {
          small: flower.sellingPriceSmall,
          medium: flower.sellingPriceMedium,
          large: flower.sellingPriceLarge,
        },
      });
      setToast(`Added 1 ${size} ${flower.name} bouquet to cart!`);
    } catch {
      setToast("Failed to add to cart. Please login or try again.");
    }
  };

  return (
    <div className="font-sans" style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      {/* ===== HERO SECTION ===== */}
      <div
        className="relative flex flex-col justify-center items-center text-center text-white"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1950&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: 500,
        }}
      >
        <div
          className="absolute inset-0 bg-black opacity-15"
          style={{ borderRadius: "0 0 50% 50% / 0 0 20% 20%" }}
        ></div>
        <h1 className="relative text-5xl md:text-6xl font-bold drop-shadow-lg">Blossom Boutique</h1>
        <p className="relative mt-4 text-lg md:text-2xl drop-shadow-md">Fresh flowers delivered with love 🌸</p>
        <button
          onClick={() => window.scrollTo({ top: 650, behavior: "smooth" })}
          className="relative mt-6 px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-lg text-white font-semibold transition duration-300"
        >
          Shop Now
        </button>
      </div>

      {/* ===== INFO BANNERS ===== */}
      <div className="flex flex-wrap justify-center gap-6 py-12 px-6 max-w-6xl mx-auto">
        {[
          { title: "💐 Fresh Bouquets", text: "Hand-picked daily to ensure premium quality." },
          { title: "🚚 Fast Delivery", text: "Get your flowers delivered within 24 hours." },
          { title: "🎁 Gift Wrapping", text: "Beautiful gift packaging for any occasion." },
          { title: "🌱 Eco-Friendly", text: "Sustainable and environmentally friendly flowers." },
        ].map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md p-6 flex-1 min-w-[220px] transition-transform transform hover:-translate-y-2 hover:shadow-xl"
          >
            <h3 className="text-pink-600 font-bold text-lg">{item.title}</h3>
            <p className="mt-2 text-gray-600 text-sm">{item.text}</p>
          </div>
        ))}
      </div>

      {/* ===== FLOWER CATALOG ===== */}
      <div className="px-6 md:px-12 py-12 max-w-7xl mx-auto">
        {loading && <p className="text-center">Loading flowers...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <h2 className="text-center text-4xl font-bold text-pink-600 mb-10">Flower Catalog</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {flowers.map((flower) => (
            <div
              key={flower._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-transform transform hover:-translate-y-2 hover:shadow-2xl"
            >
              <img
                src={`http://localhost:5000/uploads/${flower.image}`}
                alt={flower.name}
                className="w-full h-64 object-contain bg-gray-100"
              />
              <div className="p-4 flex flex-col flex-1">
                <h2 className="text-pink-600 font-bold text-lg">{flower.name}</h2>
                <p className="text-sm mt-1">
                  Availability:{" "}
                  {flower.flowerCount > 0 ? (
                    <span className="text-green-700 font-semibold">Available</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Not Available</span>
                  )}
                </p>

                <div className="mt-2">
                  <p className="text-pink-600 font-semibold text-sm mb-1">💐 Selling Prices</p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Small — LKR {flower.sellingPriceSmall}</span>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Medium — LKR {flower.sellingPriceMedium}</span>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Large — LKR {flower.sellingPriceLarge}</span>
                  </div>
                </div>

                <select
                  value={selectedSizes[flower._id] || "small"}
                  onChange={(e) => setSelectedSizes((prev) => ({ ...prev, [flower._id]: e.target.value }))}
                  className="mt-3 p-2 border border-gray-300 rounded-md"
                >
                  <option value="small">Small — LKR {flower.sellingPriceSmall}</option>
                  <option value="medium">Medium — LKR {flower.sellingPriceMedium}</option>
                  <option value="large">Large — LKR {flower.sellingPriceLarge}</option>
                </select>

                <button
                  disabled={flower.flowerCount <= 0}
                  onClick={() => handleAddToCart(flower)}
                  className={`mt-auto w-full py-2 px-4 rounded-lg text-white font-semibold transition-colors ${
                    flower.flowerCount > 0 ? "bg-pink-600 hover:bg-pink-700 cursor-pointer" : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== TESTIMONIALS ===== */}
      <div className="bg-pink-50 py-16 px-6 text-center">
        <h2 className="text-4xl font-bold text-pink-600 mb-10">What Our Customers Say</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {[
            { text: "Beautiful flowers, arrived fresh and on time! Highly recommend 🌸", name: "Amanda" },
            { text: "Love the gift wrapping! My mom adored it 🎁", name: "Nimal" },
            { text: "Excellent service and quality. Will order again!", name: "Samantha" },
          ].map((item, idx) => (
            <div key={idx} className="max-w-sm bg-white p-6 rounded-xl shadow-md">
              <p>"{item.text}"</p>
              <p className="font-semibold mt-4">– {item.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== NEWSLETTER ===== */}
      <div className="py-16 px-6 text-center bg-white">
        <h2 className="text-4xl font-bold text-pink-600 mb-4">Subscribe to Our Newsletter</h2>
        <p className="mb-6">Get updates on new arrivals and special offers.</p>
        <div className="flex justify-center flex-wrap gap-4">
          <input
            type="email"
            placeholder="Your email"
            className="p-3 border border-gray-300 rounded-lg w-64 md:w-80"
          />
          <button className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
            Subscribe
          </button>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="bg-pink-600 text-white text-center py-8">
        <p>© 2025 Blossom Boutique. All Rights Reserved.</p>
        <p>Follow us on Instagram, Facebook & Twitter</p>
      </footer>
    </div>
  );
}
