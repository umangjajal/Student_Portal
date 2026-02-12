import nodemailer from "nodemailer";

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn("⚠️ Email credentials missing in .env");
}

// Remove spaces from app password (Gmail app passwords have spaces by default)
const EMAIL_PASSWORD = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s/g, '') : '';

export const mailTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,  // TLS/SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: EMAIL_PASSWORD  // Password with spaces removed
  }
});

export const sendEmailOTP = async (to, otp) => {
  try {
    await mailTransporter.sendMail({
      from: `"Student Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your OTP Verification Code",
      html: `
        <h2>OTP Verification</h2>
        <p>Your OTP is:</p>
        <h1 style="letter-spacing:4px;">${otp}</h1>
        <p>This OTP is valid for <b>5 minutes</b>.</p>
      `
    });
  } catch (error) {
    console.error("❌ Email OTP failed:", error.message);
    throw new Error("Email OTP failed");
  }
};
