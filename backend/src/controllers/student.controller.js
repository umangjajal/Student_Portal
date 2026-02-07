import Attendance from "../models/Attendance.js";

export const getAttendance = async (req, res) => {
  const records = await Attendance.find({ studentId: req.user.id });
  res.json(records);
};
