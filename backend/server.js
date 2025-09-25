const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const fs = require('fs');

dotenv.config();
connectDB();

const app = express();

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use('/api/flowers', require('./routes/flowerRoutes'));
app.use("/api/users",  require("./routes/userRoutes"));
app.use("/api/cart",  require("./routes/cartRoutes"));
app.use("/api/deliveries",  require("./routes/deliveryRoutes"));
app.use("/api/orders",  require("./routes/orderRoutes"));
app.use('/api/payments', require('./routes/paymentRoutes'));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));