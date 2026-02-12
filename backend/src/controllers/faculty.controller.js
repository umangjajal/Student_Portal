import Attendance from "../models/Attendance.js";

/* =========================
   MARK ATTENDANCE
========================= */
export const markAttendance = async (req, res) => {
  try {
    const record = await Attendance.create({
      ...req.body,
      facultyId: req.user.referenceId // Assuming referenceId is the Faculty ID
    });

    res.json({
        message: "Attendance marked successfully",
        data: record
    });
  } catch (error) {
    console.error("Mark Attendance Error:", error.message);
    res.status(500).json({ message: "Failed to mark attendance" });
  }
};