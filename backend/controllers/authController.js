const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Register customer (resident/family) only
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    // Create new user with userType fixed as resident/family
    user = new User({
      name,
      email,
      password,          // store password as plain text (not recommended but per your request)
      userType: "customer",
    });

    await user.save();

    // Create JWT payload
    const payload = {
      id: user._id,
      userType: user.userType,
      name: user.name,
      email: user.email,
    };

    // Sign JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({ token, user: payload });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

// Login for admin and customer (resident/family)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    // Compare password directly (no hashing)
    if (password !== user.password) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Create JWT payload
    const payload = {
      id: user._id,
      userType: user.userType,
      name: user.name,
      email: user.email,
    };

    // Sign JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ token, user: payload });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};
