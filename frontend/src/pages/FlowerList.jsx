import React, { useEffect, useState } from "react";
import { getFlowers, deleteFlower } from "../services/flowerService";
import { Link } from "react-router-dom";

const FlowerList = () => {
  const [flowers, setFlowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlowers();
  }, []);

  const fetchFlowers = async () => {
    try {
      const flowersData = await getFlowers();  // <-- fixed here
      setFlowers(flowersData);
    } catch (error) {
      console.error("Failed to fetch flowers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this flower?")) {
      try {
        await deleteFlower(id);
        setFlowers(flowers.filter((flower) => flower._id !== id));
      } catch (error) {
        console.error("Failed to delete flower:", error);
        fetchFlowers();
      }
    }
  };

  // Helper to calculate selling price for bouquet sizes
  const getSellingPrice = (buyPrice, bouquetSize) => {
    if (!buyPrice) return 0;
    const profitMultiplier = 1.1; // 10% profit
    return (buyPrice * bouquetSize * profitMultiplier).toFixed(2);
  };

  return (
    <div className="max-w-6xl mx-auto p-10 min-h-screen bg-gray-50 rounded-xl shadow-md">
      <h1 className="text-4xl font-semibold text-pink-400 uppercase mb-6 text-center tracking-wider">
        Flower Management
      </h1>

      <div className="text-center mb-10">
        <Link
          to="/add"
          className="inline-block bg-pink-400 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:bg-pink-300 hover:shadow-xl transition-transform transform hover:-translate-y-1"
        >
          ➕ Add New Flower
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 bg-white">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading flowers...</div>
        ) : flowers.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            No flowers found. Add one to get started!
          </div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-pink-100 text-pink-400 font-bold border-b-2 border-pink-400">
              <tr>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Stock Quantity</th>
                <th className="px-6 py-4">Buy Price (per flower)</th>
                <th className="px-6 py-4">Selling Price (Bouquets)</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {flowers.map((flower) => (
                <tr
                  key={flower._id}
                  className="hover:bg-pink-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <img
                      src={`http://localhost:5000/uploads/${flower.image}`}
                      alt={flower.name}
                      className="h-16 w-16 rounded object-cover border border-pink-300"
                    />
                  </td>
                  <td className="px-6 py-4 font-semibold text-pink-600">{flower.name}</td>
                  <td className="px-6 py-4">{flower.flowerCount}</td>
                  <td className="px-6 py-4 font-semibold text-pink-400">
                    ${parseFloat(flower.buyPrice).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-pink-700">
                    <div>Small (5 flowers): ${getSellingPrice(flower.buyPrice, 5)}</div>
                    <div>Medium (15 flowers): ${getSellingPrice(flower.buyPrice, 15)}</div>
                    <div>Large (25 flowers): ${getSellingPrice(flower.buyPrice, 25)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/edit/${flower._id}`}
                      className="inline-block border border-pink-400 text-pink-400 rounded-full px-4 py-1 font-medium hover:bg-pink-400 hover:text-white transition mr-3"
                    >
                      ✏ Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(flower._id)}
                      className="inline-block border border-red-600 text-red-600 rounded-full px-4 py-1 font-medium hover:bg-red-600 hover:text-white transition"
                    >
                      ❌ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default FlowerList;
