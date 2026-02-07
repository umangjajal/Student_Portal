import nodemailer from "nodemailer";

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn("⚠️ Email credentials missing in .env");
}

export const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
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
