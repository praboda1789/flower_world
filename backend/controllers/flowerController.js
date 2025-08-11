const Flower = require('../models/flower');

exports.createFlower = async (req, res) => {
  try {
    const flowerData = req.body;

    if (req.file) {
      flowerData.image = req.file.filename;
    } else {
      return res.status(400).json({ message: "Flower image is required" });
    }

    if (flowerData.flowerCount) flowerData.flowerCount = Number(flowerData.flowerCount);
    if (flowerData.buyPrice) flowerData.buyPrice = Number(flowerData.buyPrice);

    const flower = new Flower(flowerData);
    await flower.save();
    res.status(201).json(flower);
  } catch (error) {
    console.error("Error in createFlower:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateFlower = async (req, res) => {
  try {
    const flowerData = req.body;

    if (req.file) {
      flowerData.image = req.file.filename;
    }

    if (flowerData.flowerCount) flowerData.flowerCount = Number(flowerData.flowerCount);
    if (flowerData.buyPrice) flowerData.buyPrice = Number(flowerData.buyPrice);

    const flower = await Flower.findByIdAndUpdate(req.params.id, flowerData, {
      new: true,
      runValidators: true,
    });

    if (!flower) return res.status(404).json({ message: 'Flower not found' });

    res.json(flower);
  } catch (error) {
    console.error("Error in updateFlower:", error);
    res.status(400).json({ message: error.message });
  }
};

// READ ALL
exports.getFlowers = async (req, res) => {
  try {
    const flowers = await Flower.find();
    res.json(flowers);
  } catch (error) {
    console.error("Error in getFlowers:", error);
    res.status(500).json({ message: error.message });
  }
};

// READ ONE
exports.getFlowerById = async (req, res) => {
  try {
    const flower = await Flower.findById(req.params.id);
    if (!flower) return res.status(404).json({ message: 'Flower not found' });
    res.json(flower);
  } catch (error) {
    console.error("Error in getFlowerById:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE
exports.deleteFlower = async (req, res) => {
  try {
    const flower = await Flower.findByIdAndDelete(req.params.id);
    if (!flower) return res.status(404).json({ message: 'Flower not found' });
    res.json({ message: 'Flower deleted successfully' });
  } catch (error) {
    console.error("Error in deleteFlower:", error);
    res.status(500).json({ message: error.message });
  }
};