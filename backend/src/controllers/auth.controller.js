import User from "../models/User.js";
import University from "../models/University.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* =========================================
   LOGIN (ALL ROLES)
========================================= */
export const login = async (req, res) => {
  try {
    const { identifier, loginId, password } = req.body;

    const userIdentifier = identifier || loginId;

    if (!userIdentifier || !password) {
      return res.status(400).json({
        message: "Login ID/Email and password required"
      });
    }

    const user = await User.findOne({
      $or: [
        { email: userIdentifier },
        { loginId: userIdentifier }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        referenceId: user.referenceId
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      role: user.role
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};


/* =========================================
   UNIVERSITY SIGNUP
========================================= */
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

    /* =========================
       1️⃣ VALIDATION
    ========================= */
    if (!name || !email || !password || !place || !city || !state || !country || !postalCode) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    /* =========================
       2️⃣ CHECK EXISTING USER
    ========================= */
    const existingUser = await User.findOne({
      email: email.toLowerCase()
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    /* =========================
       3️⃣ CREATE UNIVERSITY PROFILE
    ========================= */
    const university = await University.create({
      name,
      email: email.toLowerCase(),
      place,
      city,
      state,
      country,
      postalCode,
      approved: false
    });

    /* =========================
       4️⃣ HASH PASSWORD
    ========================= */
    const hashedPassword = await bcrypt.hash(password, 10);

    /* =========================
       5️⃣ CREATE AUTH USER
    ========================= */
    await User.create({
      role: "UNIVERSITY",
      email: email.toLowerCase(),
      loginId: email.toLowerCase(),
      password: hashedPassword,
      referenceId: university._id,
      roleModel: "University",
      isActive: true
    });

    return res.status(201).json({
      success: true,
      message: "University registered successfully. Await admin approval."
    });

  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed"
    });
  }
};
