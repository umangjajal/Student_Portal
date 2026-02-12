import User from "../models/User.js";
import University from "../models/University.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* =====================================
   UNIVERSITY SIGNUP
===================================== */
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

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "University already registered"
      });
    }

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

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      role: "UNIVERSITY",
      email,
      password: hashedPassword,
      referenceId: university._id,
      isActive: true
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

/* =====================================
   LOGIN (ALL ROLES)
===================================== */
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Identifier and password required"
      });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier },
        { loginId: identifier }
      ]
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is inactive"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    // University approval check
    if (user.role === "UNIVERSITY") {
      const university = await University.findById(
        user.referenceId
      );

      if (!university || !university.approved) {
        return res.status(403).json({
          message: "University not approved yet"
        });
      }
    }

    const payload = {
      id: user._id,
      role: user.role,
      referenceId: user.referenceId || null
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      refreshToken,
      role: user.role
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Login failed"
    });
  }
};
