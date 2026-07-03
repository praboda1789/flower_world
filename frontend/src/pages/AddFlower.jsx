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
  const [imagePreview, setImagePreview] = useState(null);

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl shadow-lg mb-6">
            <span className="text-3xl text-white">🌸</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-4">
            Add New Flower
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create a new flower listing with details and pricing information
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-8">
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-emerald-700 font-medium">{successMessage}</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-rose-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-rose-700 font-medium">{errorMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data">
            {/* Flower Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3" htmlFor="name">
                Flower Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter flower name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-3 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
                required
              />
            </div>

            {/* Flower Count */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3" htmlFor="flowerCount">
                Flower Count
              </label>
              <input
                id="flowerCount"
                type="number"
                name="flowerCount"
                value={formData.flowerCount}
                onChange={handleChange}
                placeholder="Enter available flower count"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-3 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3" htmlFor="image">
                Flower Image
              </label>
              <div className="flex flex-col gap-4">
                <input
                  id="image"
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-3 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">Image Preview:</p>
                    <img
                      src={imagePreview}
                      alt="Selected flower"
                      className="max-h-64 rounded-2xl border-2 border-pink-100 object-cover shadow-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Buy Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3" htmlFor="buyPrice">
                Buy Price (per unit)
              </label>
              <input
                id="buyPrice"
                type="number"
                name="buyPrice"
                value={formData.buyPrice}
                onChange={handleChange}
                placeholder="Enter buy price"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-3 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
                step="0.01"
                required
              />
            </div>

            {/* Suggested Prices */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-pink-600">💰</span>
                Suggested Selling Prices
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 text-center border border-pink-200">
                  <div className="text-sm text-gray-600 font-medium mb-2">Small</div>
                  <div className="text-2xl font-bold text-pink-600">Rs. {prices.small}</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center border border-rose-200">
                  <div className="text-sm text-gray-600 font-medium mb-2">Medium</div>
                  <div className="text-2xl font-bold text-rose-600">Rs. {prices.medium}</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center border border-fuchsia-200">
                  <div className="text-sm text-gray-600 font-medium mb-2">Large</div>
                  <div className="text-2xl font-bold text-fuchsia-600">Rs. {prices.large}</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4 text-center">
                Prices calculated with 10% profit margin
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl border border-gray-300 hover:bg-gray-200 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    Save Flower
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFlower;