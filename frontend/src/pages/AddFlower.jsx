import React, { useState, useEffect } from "react";
import { createFlower } from "../services/flowerService";
import { useNavigate } from "react-router-dom";

const AddFlower = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    flowerCount: "",
    image: null,
    buyPrice: "",
  });

  const [prices, setPrices] = useState({
    small: 0,
    medium: 0,
    large: 0,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null); // preview for user

  useEffect(() => {
    const buyPriceNum = parseFloat(formData.buyPrice);
    if (!isNaN(buyPriceNum)) {
      const profitMultiplier = 1.1;
      setPrices({
        small: (5 * buyPriceNum * profitMultiplier).toFixed(2),
        medium: (15 * buyPriceNum * profitMultiplier).toFixed(2),
        large: (25 * buyPriceNum * profitMultiplier).toFixed(2),
      });
    } else {
      setPrices({ small: 0, medium: 0, large: 0 });
    }
  }, [formData.buyPrice]);

  const handleChange = (e) => {
    if (e.target.name === "image") {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file });
      if (file) {
        setImagePreview(URL.createObjectURL(file));
      } else {
        setImagePreview(null);
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "image") {
        if (formData.image) {
          dataToSend.append("image", formData.image);
        }
      } else {
        dataToSend.append(key, formData[key]);
      }
    });

    try {
      setLoading(true);
      await createFlower(dataToSend);
      setSuccessMessage("Flower added successfully!");

      

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to add flower. Please try again.");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center p-10 bg-gray-50">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8 border border-pink-200">
        <h1 className="text-4xl font-extrabold text-pink-400 mb-6 text-center tracking-wide uppercase">
          🌸 Add Flower
        </h1>

        {successMessage && (
          <div className="bg-green-200 text-green-700 p-3 rounded mb-4">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-200 text-red-700 p-3 rounded mb-4">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" encType="multipart/form-data">
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
              className="w-full border border-pink-300 rounded-lg px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-pink-400 mb-1" htmlFor="flowerCount">
              Flower Count
            </label>
            <input
              id="flowerCount"
              type="number"
              name="flowerCount"
              value={formData.flowerCount}
              onChange={handleChange}
              placeholder="Enter available flower count"
              className="w-full border border-pink-300 rounded-lg px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-pink-400 mb-1" htmlFor="image">
              Flower Image
            </label>
            <input
              id="image"
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full border border-pink-300 rounded-lg px-4 py-2"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Selected flower"
                className="mt-3 max-h-48 rounded-md object-cover"
              />
            )}
          </div>

          <div>
            <label className="block font-semibold text-pink-400 mb-1" htmlFor="buyPrice">
              Buy Price (per unit)
            </label>
            <input
              id="buyPrice"
              type="number"
              name="buyPrice"
              value={formData.buyPrice}
              onChange={handleChange}
              placeholder="Enter buy price"
              className="w-full border border-pink-300 rounded-lg px-4 py-2"
              step="0.01"
              required
            />
          </div>

          <div className="bg-pink-50 p-4 rounded-lg">
            <p className="text-sm text-pink-500 font-semibold">Suggested Selling Prices:</p>
            <p>Small: Rs. {prices.small}</p>
            <p>Medium: Rs. {prices.medium}</p>
            <p>Large: Rs. {prices.large}</p>
          </div>


          <div className="flex justify-center gap-4 mt-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-32 bg-gray-300 text-gray-700 rounded-lg py-2 hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`w-32 bg-pink-400 text-white rounded-lg py-2 hover:bg-pink-500 transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFlower;
