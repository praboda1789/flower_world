//flower.js
const mongoose = require('mongoose');

const flowerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  flowerCount: { type: Number, required: true },  // stock count
  image: { type: String, required: false },
  buyPrice: { type: Number, required: true }, // price per flower from supplier

  // Selling prices for bouquets (calculated)
  sellingPriceSmall: { type: Number },   // 5 flowers
  sellingPriceMedium: { type: Number },  // 15 flowers
  sellingPriceLarge: { type: Number },   // 25 flowers
}, { timestamps: true });

// Calculate selling prices before saving
flowerSchema.pre('save', function(next) {
  const profitMultiplier = 1.1; // 10% profit

  this.sellingPriceSmall = parseFloat((5 * this.buyPrice * profitMultiplier).toFixed(2));
  this.sellingPriceMedium = parseFloat((15 * this.buyPrice * profitMultiplier).toFixed(2));
  this.sellingPriceLarge = parseFloat((25 * this.buyPrice * profitMultiplier).toFixed(2));

  next();
});

module.exports = mongoose.model('Flower', flowerSchema);
