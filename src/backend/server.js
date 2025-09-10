// server.js
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Database Connection ---
const MONGO_URI = `mongodb+srv://sathwik:sathwik@cluster0.iteyqyr.mongodb.net/myDB?retryWrites=true&w=majority`;

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- User Schema and Model ---
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

// --- JWT Secret ---
const SECRET = "secretkey";

console.log("idiot")

// --- Routes ---
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.json({ msg: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

app.get("/protected", (req, res) => {
  // Corrected protected route logic
  res.json({ msg: "Server error" })
  return
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);
    res.json({ msg: "Access granted", userId: decoded.id });
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
});

// --- Start Server ---
const PORT = 5001;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));