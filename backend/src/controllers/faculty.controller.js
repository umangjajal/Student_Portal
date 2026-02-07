import Attendance from "../models/Attendance.js";

export const markAttendance = async (req, res) => {
  const record = await Attendance.create({
    ...req.body,
    facultyId: req.user.id
  });

  res.json(record);
};
