import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";
import Notification from "../models/Notification.js";

export const getAttendance = async (req, res) => {
  try {
    // Get student data with department and year
    const student = await Student.findById(req.user.referenceId);
    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    // Fetch attendance records for this student
    const records = await Attendance.find({ studentId: student._id })
      .populate('facultyId', 'name department')
      .sort({ date: -1 });

    // Calculate statistics
    const total = records.length;
    const present = records.filter(r => r.status === 'PRESENT').length;
    const absent = records.filter(r => r.status === 'ABSENT').length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

    res.json({
      message: "Attendance records retrieved successfully",
      student: {
        name: student.name,
        enrollmentNo: student.enrollmentNo,
        department: student.department,
        year: student.year
      },
      statistics: {
        total,
        present,
        absent,
        percentage: parseFloat(percentage)
      },
      records
    });
  } catch (error) {
    console.error("Get Attendance Error:", error.message);
    res.status(500).json({ message: "Failed to fetch attendance records" });
  }
};

/* =========================
   GET UNIVERSITY UPDATES (NOTIFICATIONS)
========================= */
export const getUniversityUpdates = async (req, res) => {
  try {
    // Get current logged-in student's data
    const student = await Student.findById(req.user.referenceId);

    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    // Get university ID from student record
    const universityId = student.universityId;

    // Fetch all active notifications for this university
    const updates = await Notification.find({
      universityId: universityId,
      isActive: true,
      $or: [
        { roleTarget: "ALL" },
        { roleTarget: "STUDENT" }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      message: "University updates retrieved successfully",
      count: updates.length,
      data: updates
    });
  } catch (error) {
    console.error("Get University Updates Error:", error.message);
    res.status(500).json({ message: "Failed to fetch university updates" });
  }
};

/* =========================
   GET SINGLE UPDATE DETAILS
========================= */
export const getUpdateDetail = async (req, res) => {
  try {
    const { updateId } = req.params;
    const student = await Student.findById(req.user.referenceId);

    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    const update = await Notification.findOne({
      _id: updateId,
      universityId: student.universityId,
      isActive: true
    });

    if (!update) {
      return res.status(404).json({ message: "Update not found" });
    }

    res.json({
      message: "Update details retrieved successfully",
      data: update
    });
  } catch (error) {
    console.error("Get Update Detail Error:", error.message);
    res.status(500).json({ message: "Failed to fetch update details" });
  }
};
