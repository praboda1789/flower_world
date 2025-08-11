//flowerRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const {
  createFlower,
  getFlowers,
  getFlowerById,
  updateFlower,
  deleteFlower,
} = require('../controllers/flowerController');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Upload folder
  },
  filename: function (req, file, cb) {
    // Use timestamp + original name to avoid conflicts
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.post('/', upload.single('image'), createFlower);
router.get('/', getFlowers);
router.get('/:id', getFlowerById);
router.put('/:id', upload.single('image'), updateFlower);
router.delete('/:id', deleteFlower);

module.exports = router;
