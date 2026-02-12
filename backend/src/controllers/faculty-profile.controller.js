import Faculty from "../models/Faculty.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendOTPEmail } from "../services/mail.service.js";

/* =========================
   GET FACULTY PROFILE
========================= */
export const getFacultyProfile = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.user.referenceId).select("-__v");
    const user = await User.findOne({ referenceId: req.user.referenceId, role: "FACULTY" }).select("-password -resetOTP -resetToken -__v");

    if (!faculty) {
      return res.status(404).json({ message: "Faculty profile not found" });
    }

    res.json({
      message: "Faculty profile retrieved successfully",
      data: {
        ...faculty.toObject(),
        loginId: user?.loginId,
        email: user?.email || faculty.email
      }
    });
  } catch (error) {
    console.error("Get Profile Error:", error.message);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

/* =========================
   UPDATE FACULTY PROFILE
========================= */
export const updateFacultyProfile = async (req, res) => {
  try {
    const { name, phone, dateOfBirth, gender, specialization, address, city, state, postalCode, bio, avatar } = req.body;

    const faculty = await Faculty.findByIdAndUpdate(
      req.user.referenceId,
      {
        name,
        phone,
        dateOfBirth,
        gender,
        specialization,
        address,
        city,
        state,
        postalCode,
        bio,
        avatar
      },
      { new: true }
    );

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    res.json({
      message: "Profile updated successfully",
      data: faculty
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
    // Verify email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Email credentials not configured");
      return res.status(500).json({ message: "Email service not configured. Please contact administrator." });
    }

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
    const faculty = await Faculty.findById(req.user.referenceId);
    const emailRecipient = user.email || faculty.email;

    if (!emailRecipient) {
      return res.status(400).json({ message: "No email address on file" });
    }

    try {
      await sendOTPEmail(emailRecipient, otp, faculty.name || "Faculty");
    } catch (emailError) {
      console.error("Email sending failed:", emailError.message);
      return res.json({
        message: "OTP saved (email delivery may be delayed)",
        email: emailRecipient,
        warning: "Check your email including spam folder"
      });
    }

    res.json({
      message: "OTP sent to your email",
      email: emailRecipient
    });
  } catch (error) {
    console.error("Request Password Reset Error:", error.message);
    res.status(500).json({ message: "Failed to send OTP: " + error.message });
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
