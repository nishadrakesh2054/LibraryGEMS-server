const Auth = require("../Models/authModel");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, roles } = req.body;
    // Only admin can gives roles
    if (!req.user || req.user.roles !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if user already exists
    const userExists = await Auth.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Prevent creating another admin
    if (roles === "admin") {
      return res
        .status(403)
        .json({ message: "Admin role cannot be assigned manually" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await Auth.create({
      name,
      email,
      password: hashedPassword,
      roles,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      newUser: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        roles: newUser.roles,
      },
    });
  } catch (error) {
    console.error("Error in registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await Auth.findOne({ where: { email } });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Generate token with user details
  const token = jwt.sign(
    { userId: user.id, roles: user.roles },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.status(200).json({
    success: true,
    message: "Login successful",
    token: `Bearer ${token}`,
    name: user.name,
    roles: user.roles,
  });
});

// Get All Users (Admin Only)
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await Auth.findAll({
      attributes: { exclude: ["password"] },
    });
    res.json({ success: true, users });
  } catch (error) {
    console.error("Error in getting users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//--------------------logout user-------------
const logout = asyncHandler(async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logout successfully",
  });
});

module.exports = {
  register,
  login,
  getAllUsers,
  logout,
};
