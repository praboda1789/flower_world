const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/authController");

// Register (only for resident/family customer)
router.post("/register", register);

// Login (admin or resident/family)
router.post("/login", login);

module.exports = router;
