import University from "../models/University.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendOTPEmail } from "../services/mail.service.js";

/* =========================
   GET UNIVERSITY PROFILE
========================= */
export const getUniversityProfile = async (req, res) => {
  try {
    const university = await University.findById(req.user.referenceId).select("-__v");
    const user = await User.findOne({ referenceId: req.user.referenceId, role: "UNIVERSITY" }).select("-password -resetOTP -resetToken -__v");

    if (!university) {
      return res.status(404).json({ message: "University profile not found" });
    }

    res.json({
      message: "University profile retrieved successfully",
      data: {
        ...university.toObject(),
        email: user?.email || university.email
      }
    });
  } catch (error) {
    console.error("Get Profile Error:", error.message);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

/* =========================
   UPDATE UNIVERSITY PROFILE
========================= */
export const updateUniversityProfile = async (req, res) => {
  try {
    const { name, phone, place, city, state, country, postalCode, avatar, logo, website, contactPerson } = req.body;

    const university = await University.findByIdAndUpdate(
      req.user.referenceId,
      {
        name,
        phone,
        place,
        city,
        state,
        country,
        postalCode,
        avatar,
        logo,
        website,
        contactPerson
      },
      { new: true }
    );

    if (!university) {
      return res.status(404).json({ message: "University not found" });
    }

    res.json({
      message: "Profile updated successfully",
      data: university
    });
  } catch (error) {
    console.error("Update Profile Error:", error.message);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

/* =========================
   REQUEST PASSWORD RESET (Send OTP)
========================= */
export const requestPasswordReset = async (req, res) => {
  try {
    const user = await User.findOne({ referenceId: req.user.referenceId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    await User.findByIdAndUpdate(user._id, {
      resetOTP: otp,
      resetOTPExpiry: otpExpiry
    });

    // Send OTP via email
    const university = await University.findById(req.user.referenceId);
    const emailRecipient = user.email || university.email;

    if (!emailRecipient) {
      return res.status(400).json({ message: "No email address on file" });
    }

    await sendOTPEmail(emailRecipient, otp, university.name);

    res.json({
      message: "OTP sent to your email",
      email: emailRecipient
    });
  } catch (error) {
    console.error("Request Password Reset Error:", error.message);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

/* =========================
   VERIFY OTP AND RESET PASSWORD
========================= */
export const verifyOTPAndResetPassword = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;

    if (!otp || !newPassword) {
      return res.status(400).json({ message: "OTP and new password are required" });
    }

    const user = await User.findOne({ referenceId: req.user.referenceId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify OTP
    if (user.resetOTP !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > user.resetOTPExpiry) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetOTP: null,
      resetOTPExpiry: null
    });

    res.json({
      message: "Password reset successfully"
    });
  } catch (error) {
    console.error("Verify OTP Error:", error.message);
    res.status(500).json({ message: "Failed to reset password" });
  }
};
