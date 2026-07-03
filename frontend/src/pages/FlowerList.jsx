import React, { useEffect, useState } from "react";
import { getFlowers, deleteFlower } from "../services/flowerService";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const FlowerList = () => {
  const [flowers, setFlowers] = useState([]);
  const [filteredFlowers, setFilteredFlowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchFlowers();
  }, []);

  const fetchFlowers = async () => {
    try {
      const flowersData = await getFlowers();
      setFlowers(flowersData);
      setFilteredFlowers(flowersData);
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
        const updated = flowers.filter((flower) => flower._id !== id);
        setFlowers(updated);
        setFilteredFlowers(updated);
      } catch (error) {
        console.error("Failed to delete flower:", error);
        fetchFlowers();
      }
    }
  };

  const getSellingPrice = (buyPrice, bouquetSize) => {
    if (!buyPrice) return 0;
    const profitMultiplier = 1.1;
    return (buyPrice * bouquetSize * profitMultiplier).toFixed(2);
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = flowers.filter((flower) =>
      flower.name.toLowerCase().includes(term)
    );
    setFilteredFlowers(filtered);
  };

  // ✅ Clean, working version of report generator
 const generateReport = () => {
  const doc = new jsPDF();

  doc.text("Flower List Report", 14, 10);

  // ✅ Use filteredFlowers instead of all flowers
  autoTable(doc, {
    head: [["Name", "Stock Qty", "Buy Price (LKR)", "Selling Price (Small/Med/Large)"]],
    body: filteredFlowers.map((flower) => [
      flower.name,
      flower.flowerCount,
      parseFloat(flower.buyPrice).toFixed(2),
      `S: ${getSellingPrice(flower.buyPrice, 5)} | M: ${getSellingPrice(
        flower.buyPrice,
        15
      )} | L: ${getSellingPrice(flower.buyPrice, 25)}`,
    ]),
    startY: 20,
    theme: "grid",
    headStyles: { fillColor: [255, 182, 193] },
    styles: { fontSize: 11 },
  });

  // ✅ Dynamic file name showing if it’s a filtered report
  const fileName =
    searchTerm.trim() === ""
      ? "Flower_Report.pdf"
      : `Filtered_Report_${searchTerm}.pdf`;

  doc.save(fileName);
};


  return (
    <div className="max-w-6xl mx-auto p-10 min-h-screen bg-gray-50 rounded-xl shadow-md">
      <h1 className="text-4xl font-semibold text-pink-400 uppercase mb-6 text-center tracking-wider">
        Flower Management
      </h1>

      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <input
          type="text"
          placeholder="🔍 Search by flower name..."
          value={searchTerm}
          onChange={handleSearch}
          className="border border-pink-300 rounded-lg px-4 py-2 w-72 focus:outline-none focus:ring-2 focus:ring-pink-300"
        />

        <div className="flex gap-4">
          <Link
            to="/add"
            className="bg-pink-400 text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:bg-pink-300 transition"
          >
            ➕ Add New Flower
          </Link>

          <button
            onClick={generateReport}
            className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:bg-green-400 transition"
          >
            📄 Generate Report
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 bg-white">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading flowers...</div>
        ) : filteredFlowers.length === 0 ? (
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
                <th className="px-6 py-4">Buy Price</th>
                <th className="px-6 py-4">Selling Price (Bouquets)</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFlowers.map((flower) => (
                <tr key={flower._id} className="hover:bg-pink-50 transition-colors">
                  <td className="px-6 py-4">
                    <img
                      src={`http://localhost:5000/uploads/${flower.image}`}
                      alt={flower.name}
                      className="h-16 w-16 rounded object-cover border border-pink-300"
                    />
                  </td>
                  <td className="px-6 py-4 font-semibold text-pink-600">
                    {flower.name}
                  </td>
                  <td className="px-6 py-4">{flower.flowerCount}</td>
                  <td className="px-6 py-4 font-semibold text-pink-400">
                    LKR {parseFloat(flower.buyPrice).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-pink-700">
                    <div>Small (5): LKR {getSellingPrice(flower.buyPrice, 5)}</div>
                    <div>Medium (15): LKR {getSellingPrice(flower.buyPrice, 15)}</div>
                    <div>Large (25): LKR {getSellingPrice(flower.buyPrice, 25)}</div>
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
