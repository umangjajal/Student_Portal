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

    // Check existing
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "University already exists" });
    }

    // Create university
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

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      role: "UNIVERSITY",
      email,
      password: hashedPassword,
      referenceId: university._id
    });

    res.status(201).json({
      message: "University registered. Await admin approval."
    });
  } catch (error) {
    console.error("University Signup Error:", error.message);
    res.status(500).json({ message: "Signup failed" });
  }
};

/* =========================
   LOGIN (KEEP YOUR EXISTING)
========================= */
export const login = async (req, res) => {
  const { identifier, password } = req.body;

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

  const token = jwt.sign(
    { id: user._id, role: user.role, referenceId: user.referenceId },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token, role: user.role });
};
