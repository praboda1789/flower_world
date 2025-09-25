import React, { useState, useEffect } from "react";
import { getFlowerById, updateFlower } from "../services/flowerService";
import { useParams, useNavigate } from "react-router-dom";

const EditFlower = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    flowerCount: "",
    image: "",
    buyPrice: "",
  });

  const [imageFile, setImageFile] = useState(null); // for file upload
  const [prices, setPrices] = useState({ small: 0, medium: 0, large: 0 });

  useEffect(() => {
    fetchFlower();
  }, []);

  const fetchFlower = async () => {
    try {
      const flower = await getFlowerById(id); // ✅ fixed here
      setFormData({
        name: flower.name || "",
        flowerCount: flower.flowerCount || "",
        image: flower.image || "",
        buyPrice: flower.buyPrice || "",
      });
      updatePrices(flower.buyPrice);
    } catch (error) {
      console.error("Failed to fetch flower:", error);
    }
  };

  const updatePrices = (buyPrice) => {
    const profitMultiplier = 1.1;
    if (!isNaN(buyPrice)) {
      setPrices({
        small: (5 * buyPrice * profitMultiplier).toFixed(2),
        medium: (15 * buyPrice * profitMultiplier).toFixed(2),
        large: (25 * buyPrice * profitMultiplier).toFixed(2),
      });
    } else {
      setPrices({ small: 0, medium: 0, large: 0 });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "buyPrice") {
      updatePrices(parseFloat(value));
    }
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("flowerCount", parseInt(formData.flowerCount));
      data.append("buyPrice", parseFloat(formData.buyPrice));

      if (imageFile) {
        data.append("image", imageFile); // upload new image
      } else {
        data.append("image", formData.image); // keep old one
      }

      await updateFlower(id, data);
      navigate("/");
    } catch (error) {
      alert("Failed to update flower. Please check your inputs.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center p-10 bg-gray-50">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8 border border-pink-200">
        <h1 className="text-4xl font-extrabold text-pink-400 mb-6 text-center tracking-wide uppercase">
          🌸 Edit Flower
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Name */}
          <div>
            <label className="block font-semibold text-pink-400 mb-1" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter flower name"
              className="w-full border border-pink-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              required
            />
          </div>

          {/* Flower Count */}
          <div>
            <label className="block font-semibold text-pink-400 mb-1" htmlFor="flowerCount">
              Flower Count (stock)
            </label>
            <input
              id="flowerCount"
              type="number"
              name="flowerCount"
              value={formData.flowerCount}
              onChange={handleChange}
              placeholder="Enter available flower count"
              className="w-full border border-pink-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              required
              min={0}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block font-semibold text-pink-400 mb-1" htmlFor="image">
              Flower Image
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border border-pink-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
            />
            {formData.image && !imageFile && (
              <img
                src={'http://localhost:5000/uploads/${formData.image}'}
                alt={formData.name}
                className="mt-2 h-20 w-20 rounded object-cover border border-pink-300"
              />
            )}
          </div>

          {/* Buy Price */}
          <div>
            <label className="block font-semibold text-pink-400 mb-1" htmlFor="buyPrice">
              Buy Price (per flower)
            </label>
            <input
              id="buyPrice"
              type="number"
              step="0.01"
              name="buyPrice"
              value={formData.buyPrice}
              onChange={handleChange}
              placeholder="Enter buy price"
              className="w-full border border-pink-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              required
              min={0}
            />
          </div>

          {/* Selling Price Preview */}
          <div className="bg-pink-50 p-4 rounded-lg text-pink-600">
            <h3 className="font-semibold mb-2">Selling Price Preview (including 10% profit):</h3>
            <ul className="list-disc list-inside">
              <li>Small Bouquet (5 flowers): ${prices.small}</li>
              <li>Medium Bouquet (15 flowers): ${prices.medium}</li>
              <li>Large Bouquet (25 flowers): ${prices.large}</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="bg-gray-300 text-gray-800 px-6 py-2 rounded-full shadow hover:bg-gray-400 transition"
            >
              ⬅ Cancel
            </button>
            <button
              type="submit"
              className="bg-pink-400 text-white px-6 py-2 rounded-full shadow hover:bg-pink-500 transition"
            >
              💾 Update Flower
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFlower;