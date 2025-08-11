const User = require("../models/User");

// Get all customers
exports.getUsers = async (req, res) => {
  try {
    // If you want only customers, filter by userType:
    const filter = req.query.userType ? { userType: req.query.userType } : {};
    const users = await User.find(filter).select("-password"); // exclude password
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

// Update user by ID
exports.updateUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const updateFields = { name, email };
    // Update password only if provided
    if (password && password.trim() !== "") {
      updateFields.password = password;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ msg: "User not found" });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

// Delete user by ID
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ msg: "User not found" });
    res.json({ msg: "User deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};
