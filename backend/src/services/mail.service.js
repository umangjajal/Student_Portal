import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/* =========================
   VALIDATE ENV
========================= */
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("❌ Email credentials missing in .env");
}

/* =========================
   CREATE TRANSPORTER
========================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* =========================
   VERIFY CONNECTION
========================= */
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email Transporter Error:", error.message);
  } else {
    console.log("✅ Email Transporter Ready");
  }
});

/* =========================
   SEND OTP EMAIL
========================= */
export const sendOTPEmail = async (email, otp, userName) => {
  try {
    const mailOptions = {
      from: `"Student Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP - Student Portal",
      html: `
        <h2>Hello ${userName},</h2>
        <p>Your OTP is:</p>
        <h1 style="letter-spacing:5px;">${otp}</h1>
        <p>This OTP expires in 10 minutes.</p>
      `
    };

    const result = await transporter.sendMail(mailOptions);

    console.log("✅ OTP Email sent:", result.messageId);
    return result;

  } catch (error) {
    console.error("❌ Send OTP Email Error:", error.message);
    throw new Error("Failed to send OTP email");
  }
};

/* =========================
   SEND WELCOME EMAIL
========================= */
export const sendWelcomeEmail = async (email, loginId, password, userName, role) => {
  try {
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Welcome to Student Portal - ${role}`,
      html: `
        <h2>Welcome ${userName}</h2>
        <p><b>Login ID:</b> ${loginId}</p>
        <p><b>Password:</b> ${password}</p>
        <p>Please change your password after login.</p>
      `
    });

    return result;

  } catch (error) {
    console.error("❌ Welcome Email Error:", error.message);
    throw new Error("Failed to send welcome email");
  }
};
