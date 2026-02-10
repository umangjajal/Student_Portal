import User from "../models/User.js";
import University from "../models/University.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* =========================
   UNIVERSITY SIGNUP
========================= */
export const universitySignup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      place,
      city,
      state,
      country,
      postalCode
    } = req.body;

    // ✅ Validate
    if (
      !name ||
      !email ||
      !password ||
      !place ||
      !city ||
      !state ||
      !country ||
      !postalCode
    ) {
      return res.status(400).json({
        message: "All university fields are required"
      });
    }

    // ✅ Prevent duplicate signup
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "University already registered"
      });
    }

    // ✅ Create University
    const university = await University.create({
      name,
      email,
      place,
      city,
      state,
      country,
      postalCode,
      approved: false
    });

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create Auth User
    await User.create({
      role: "UNIVERSITY",
      email,
      password: hashedPassword,
      referenceId: university._id
    });

    return res.status(201).json({
      message:
        "University registered successfully. Await admin approval."
    });
  } catch (error) {
    console.error("University Signup Error:", error);
    return res.status(500).json({
      message: "University signup failed"
    });
  }
};

/* =========================
   LOGIN (ALL ROLES)
========================= */
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { loginId: identifier }]
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.role === "UNIVERSITY") {
      const uni = await University.findById(user.referenceId);
      if (!uni || !uni.approved) {
        return res.status(403).json({
          message: "University not approved yet"
        });
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, referenceId: user.referenceId },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, refreshToken, role: user.role });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
};