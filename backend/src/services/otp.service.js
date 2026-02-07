import crypto from "crypto";
import Student from "../models/Student.js";
import { sendEmailOTP } from "../config/mail.js";

/* Generate 6-digit OTP */
export const generateOTP = () =>
  crypto.randomInt(100000, 999999).toString();

/* Hash OTP */
const hashOTP = (otp) =>
  crypto.createHash("sha256").update(otp).digest("hex");

/* Send OTP to student email */
export const sendStudentOTP = async ({ studentCode, email }) => {
  const student = await Student.findOne({ studentCode, email });

  if (!student) {
    throw new Error("Student not found");
  }

  const otp = generateOTP();

  student.otpHash = hashOTP(otp);
  student.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  await student.save();

  await sendEmailOTP(email, otp);

  return { message: "OTP sent to email" };
};

/* Verify OTP */
export const verifyStudentOTP = async ({ studentCode, otp }) => {
  const student = await Student.findOne({ studentCode });

  if (!student) {
    throw new Error("Student not found");
  }

  if (!student.otpHash || !student.otpExpiresAt) {
    throw new Error("OTP not generated");
  }

  if (student.otpExpiresAt < new Date()) {
    throw new Error("OTP expired");
  }

  const hashedOTP = hashOTP(otp);

  if (hashedOTP !== student.otpHash) {
    throw new Error("Invalid OTP");
  }

  student.isVerified = true;
  student.otpHash = undefined;
  student.otpExpiresAt = undefined;
  await student.save();

  return { message: "Student verified successfully" };
};
