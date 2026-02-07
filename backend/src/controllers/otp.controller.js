import {
  sendStudentOTP,
  verifyStudentOTP
} from "../services/otp.service.js";

export const sendOTP = async (req, res) => {
  try {
    const result = await sendStudentOTP(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const result = await verifyStudentOTP(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
