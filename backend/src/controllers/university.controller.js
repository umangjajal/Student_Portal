import Student from "../models/Student.js";
import Faculty from "../models/Faculty.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { parseCSV, generateCSV } from "../services/csv.service.js";
import fs from "fs";

/* =========================
   UTILS
========================= */
const generatePassword = () =>
  crypto.randomBytes(4).toString("hex");

const generateEnrollmentNo = (universityId) => {
  const year = new Date().getFullYear();
  const rand = crypto.randomInt(1000, 9999);
  return `UNI-${year}-${universityId.toString().slice(-4)}-${rand}`;
};

/* =========================
   CREATE STUDENT
========================= */
export const createStudent = async (req, res) => {
  try {
    const universityId = req.user.referenceId;

    if (!universityId) {
      return res.status(400).json({ message: "Invalid university user" });
    }

    const enrollmentNo = generateEnrollmentNo(universityId);
    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await Student.create({
      universityId,
      enrollmentNo,
      name: req.body.name,
      department: req.body.department,
      year: req.body.year
    });

    await User.create({
      role: "STUDENT",
      loginId: enrollmentNo,
      password: hashedPassword,
      referenceId: student._id
    });

    res.status(201).json({
      message: "Student created successfully",
      credentials: {
        enrollmentNo,
        password
      }
    });
  } catch (error) {
    console.error("Create Student Error:", error.message);
    res.status(500).json({ message: "Failed to create student" });
  }
};

/* =========================
   CREATE FACULTY
========================= */
export const createFaculty = async (req, res) => {
  try {
    const universityId = req.user.referenceId;

    if (!universityId) {
      return res.status(400).json({ message: "Invalid university user" });
    }

    const facultyId = `FAC-${crypto.randomInt(1000, 9999)}`;
    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    const faculty = await Faculty.create({
      universityId,
      facultyId,
      name: req.body.name,
      department: req.body.department
    });

    await User.create({
      role: "FACULTY",
      loginId: facultyId,
      password: hashedPassword,
      referenceId: faculty._id
    });

    res.status(201).json({
      message: "Faculty created successfully",
      credentials: {
        facultyId,
        password
      }
    });
  } catch (error) {
    console.error("Create Faculty Error:", error.message);
    res.status(500).json({ message: "Failed to create faculty" });
  }
};

/* =========================
   GET STUDENTS
========================= */
export const getStudents = async (req, res) => {
  try {
    const universityId = req.user.referenceId;
    const students = await Student.find({ universityId });
    res.json(students);
  } catch (error) {
    console.error("Get Students Error:", error.message);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

/* =========================
   UPDATE STUDENT
========================= */
export const updateStudent = async (req, res) => {
  try {
    const universityId = req.user.referenceId;
    const { id } = req.params;

    const student = await Student.findOneAndUpdate(
      { _id: id, universityId },
      req.body,
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student updated successfully", student });
  } catch (error) {
    console.error("Update Student Error:", error.message);
    res.status(500).json({ message: "Failed to update student" });
  }
};

/* =========================
   DELETE STUDENT
========================= */
export const deleteStudent = async (req, res) => {
  try {
    const universityId = req.user.referenceId;
    const { id } = req.params;

    const student = await Student.findOneAndDelete({
      _id: id,
      universityId
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Delete associated user account
    await User.deleteOne({ referenceId: id, role: "STUDENT" });

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Delete Student Error:", error.message);
    res.status(500).json({ message: "Failed to delete student" });
  }
};

/* =========================
   GET FACULTY
========================= */
export const getFaculty = async (req, res) => {
  try {
    const universityId = req.user.referenceId;
    const faculty = await Faculty.find({ universityId });
    res.json(faculty);
  } catch (error) {
    console.error("Get Faculty Error:", error.message);
    res.status(500).json({ message: "Failed to fetch faculty" });
  }
};

/* =========================
   UPDATE FACULTY
========================= */
export const updateFaculty = async (req, res) => {
  try {
    const universityId = req.user.referenceId;
    const { id } = req.params;

    const faculty = await Faculty.findOneAndUpdate(
      { _id: id, universityId },
      req.body,
      { new: true }
    );

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    res.json({ message: "Faculty updated successfully", faculty });
  } catch (error) {
    console.error("Update Faculty Error:", error.message);
    res.status(500).json({ message: "Failed to update faculty" });
  }
};

/* =========================
   DELETE FACULTY
========================= */
export const deleteFaculty = async (req, res) => {
  try {
    const universityId = req.user.referenceId;
    const { id } = req.params;

    const faculty = await Faculty.findOneAndDelete({
      _id: id,
      universityId
    });

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    // Delete associated user account
    await User.deleteOne({ referenceId: id, role: "FACULTY" });

    res.json({ message: "Faculty deleted successfully" });
  } catch (error) {
    console.error("Delete Faculty Error:", error.message);
    res.status(500).json({ message: "Failed to delete faculty" });
  }
};

/* =========================
   BULK UPLOAD STUDENTS (CSV)
========================= */
/* =========================
   GET STUDENTS WITH CREDENTIALS
========================= */
export const getStudentsWithCredentials = async (req, res) => {
  try {
    const universityId = req.user.referenceId;

    const students = await Student.find({ universityId });
    const studentsWithCreds = [];

    for (const student of students) {
      const user = await User.findOne({
        referenceId: student._id,
        role: "STUDENT"
      });

      if (user) {
        studentsWithCreds.push({
          studentId: student._id,
          enrollmentNo: student.enrollmentNo,
          name: student.name,
          department: student.department,
          year: student.year,
          loginId: user.loginId,
          hashedPassword: user.password,
          isActive: user.isActive
        });
      }
    }

    res.json({
      message: "Students with credentials retrieved successfully",
      count: studentsWithCreds.length,
      data: studentsWithCreds
    });
  } catch (error) {
    console.error("Get Students with Credentials Error:", error.message);
    res.status(500).json({ message: "Failed to fetch student credentials" });
  }
};

/* =========================
   RESET SINGLE STUDENT PASSWORD
========================= */
export const resetStudentPassword = async (req, res) => {
  try {
    const universityId = req.user.referenceId;
    const { studentId } = req.params;

    // Verify student belongs to this university
    const student = await Student.findOne({
      _id: studentId,
      universityId
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Generate new password
    const newPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    const updatedUser = await User.findOneAndUpdate(
      { referenceId: studentId, role: "STUDENT" },
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User account not found" });
    }

    res.json({
      message: "Password reset successfully",
      studentData: {
        studentId: student._id,
        enrollmentNo: student.enrollmentNo,
        name: student.name,
        newPassword: newPassword,
        loginId: updatedUser.loginId
      }
    });
  } catch (error) {
    console.error("Reset Student Password Error:", error.message);
    res.status(500).json({ message: "Failed to reset student password" });
  }
};

/* =========================
   RESET ALL STUDENT PASSWORDS
========================= */
export const resetAllStudentPasswords = async (req, res) => {
  try {
    const universityId = req.user.referenceId;

    const students = await Student.find({ universityId });
    const resetData = [];

    for (const student of students) {
      const newPassword = generatePassword();
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updatedUser = await User.findOneAndUpdate(
        { referenceId: student._id, role: "STUDENT" },
        { password: hashedPassword },
        { new: true }
      );

      if (updatedUser) {
        resetData.push({
          enrollmentNo: student.enrollmentNo,
          name: student.name,
          loginId: updatedUser.loginId,
          newPassword: newPassword,
          department: student.department,
          year: student.year
        });
      }
    }

    res.json({
      message: "All passwords reset successfully",
      count: resetData.length,
      data: resetData
    });
  } catch (error) {
    console.error("Reset All Passwords Error:", error.message);
    res.status(500).json({ message: "Failed to reset all passwords" });
  }
};

/* =========================
   EXPORT STUDENT CREDENTIALS
========================= */
export const exportStudentCredentials = async (req, res) => {
  try {
    const universityId = req.user.referenceId;

    const students = await Student.find({ universityId });
    const credentials = [];

    for (const student of students) {
      const user = await User.findOne({
        referenceId: student._id,
        role: "STUDENT"
      });

      if (user) {
        credentials.push({
          enrollmentNo: student.enrollmentNo,
          name: student.name,
          department: student.department,
          year: student.year,
          loginId: user.loginId,
          isActive: user.isActive
        });
      }
    }

    // Generate and return as CSV
    if (credentials.length === 0) {
      return res.status(404).json({ message: "No student credentials found" });
    }

    const csvHeaders = ["enrollmentNo", "name", "department", "year", "loginId", "isActive"];
    const credentialsCSV = generateCSV(credentials, csvHeaders);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="student-credentials-${Date.now()}.csv"`
    );
    res.send(credentialsCSV);
  } catch (error) {
    console.error("Export Credentials Error:", error.message);
    res.status(500).json({ message: "Failed to export credentials" });
  }
};

export const bulkUploadStudents = async (req, res) => {
  try {
    const universityId = req.user.referenceId;

    if (!universityId) {
      return res.status(400).json({ message: "Invalid university user" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Parse CSV file
    const csvData = await parseCSV(req.file.path);

    if (csvData.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "CSV file is empty" });
    }

    // Validate CSV headers
    const requiredHeaders = ["name", "department", "year"];
    const csvHeaders = Object.keys(csvData[0]).map(h => h.toLowerCase().trim());
    
    const hasAllHeaders = requiredHeaders.every(header =>
      csvHeaders.some(h => h === header)
    );

    if (!hasAllHeaders) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        message: `CSV must have columns: ${requiredHeaders.join(", ")}`
      });
    }

    const createdStudents = [];
    const errors = [];

    // Process each row
    for (let i = 0; i < csvData.length; i++) {
      try {
        const row = csvData[i];
        
        // Trim and normalize field names
        const name = row.name?.trim() || row.Name?.trim();
        const department = row.department?.trim() || row.Department?.trim();
        const year = row.year?.trim() || row.Year?.trim();

        // Validate required fields
        if (!name || !department || !year) {
          errors.push(`Row ${i + 1}: Missing required fields (name, department, year)`);
          continue;
        }

        // Generate credentials
        const enrollmentNo = generateEnrollmentNo(universityId);
        const password = generatePassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create student
        const student = await Student.create({
          universityId,
          enrollmentNo,
          name,
          department,
          year
        });

        // Create user account
        await User.create({
          role: "STUDENT",
          loginId: enrollmentNo,
          password: hashedPassword,
          referenceId: student._id
        });

        createdStudents.push({
          name,
          enrollmentNo,
          password,
          department,
          year
        });
      } catch (rowError) {
        errors.push(`Row ${i + 1}: ${rowError.message}`);
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    // Generate CSV with credentials
    if (createdStudents.length > 0) {
      const csvHeaders = ["enrollmentNo", "name", "department", "year", "password"];
      const credentialsCSV = generateCSV(createdStudents, csvHeaders);
      
      // Send response with CSV file download
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="student-credentials-${Date.now()}.csv"`
      );
      
      // Return JSON metadata + CSV attachment in response body
      return res.send(credentialsCSV);
    }

    // Fallback response if no students created
    res.status(400).json({
      message: "No students created. Check CSV file and try again.",
      errors,
      summary: {
        total: csvData.length,
        created: 0,
        failed: errors.length
      }
    });
  } catch (error) {
    console.error("Bulk Upload Students Error:", error.message);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: "Failed to process CSV file",
      error: error.message
    });
  }
};

/* =========================
   NOTIFICATIONS (UPDATES)
========================= */

/* CREATE NEW UPDATE/NOTIFICATION */
export const createNotification = async (req, res) => {
  try {
    const universityId = req.user.referenceId;
    const { title, message, roleTarget, priority } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    const notification = await Notification.create({
      universityId,
      title,
      message,
      roleTarget: roleTarget || "ALL",
      priority: priority || "MEDIUM",
      isActive: true
    });

    res.status(201).json({
      message: "Update created successfully",
      data: notification
    });
  } catch (error) {
    console.error("Create Notification Error:", error.message);
    res.status(500).json({ message: "Failed to create update" });
  }
};

/* GET ALL UPDATES FOR UNIVERSITY */
export const getUniversityNotifications = async (req, res) => {
  try {
    const universityId = req.user.referenceId;

    const notifications = await Notification.find({ universityId })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      message: "University updates retrieved successfully",
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    console.error("Get Notifications Error:", error.message);
    res.status(500).json({ message: "Failed to fetch updates" });
  }
};

/* GET SINGLE UPDATE DETAIL */
export const getNotificationDetail = async (req, res) => {
  try {
    const universityId = req.user.referenceId;
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      _id: notificationId,
      universityId
    });

    if (!notification) {
      return res.status(404).json({ message: "Update not found" });
    }

    res.json({
      message: "Update details retrieved successfully",
      data: notification
    });
  } catch (error) {
    console.error("Get Notification Detail Error:", error.message);
    res.status(500).json({ message: "Failed to fetch update details" });
  }
};

/* UPDATE NOTIFICATION */
export const updateNotification = async (req, res) => {
  try {
    const universityId = req.user.referenceId;
    const { notificationId } = req.params;
    const { title, message, roleTarget, priority, isActive } = req.body;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, universityId },
      { title, message, roleTarget, priority, isActive },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Update not found" });
    }

    res.json({
      message: "Update modified successfully",
      data: notification
    });
  } catch (error) {
    console.error("Update Notification Error:", error.message);
    res.status(500).json({ message: "Failed to update notification" });
  }
};

/* DELETE NOTIFICATION */
export const deleteNotification = async (req, res) => {
  try {
    const universityId = req.user.referenceId;
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      universityId
    });

    if (!notification) {
      return res.status(404).json({ message: "Update not found" });
    }

    res.json({
      message: "Update deleted successfully"
    });
  } catch (error) {
    console.error("Delete Notification Error:", error.message);
    res.status(500).json({ message: "Failed to delete update" });
  }
};

/* =========================
   DASHBOARD STATS (AGGREGATED)
========================= */
export const getDashboardStats = async (req, res) => {
  try {
    const universityId = req.user.referenceId;

    if (!universityId) {
      return res.status(400).json({ message: "Invalid university user" });
    }

    // Fetch all data in parallel
    const [studentsCount, facultyCount, activeNotifications, allNotifications] = await Promise.all([
      Student.countDocuments({ universityId }),
      Faculty.countDocuments({ universityId }),
      Notification.countDocuments({ universityId, isActive: true }),
      Notification.find({ universityId })
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    res.json({
      message: "Dashboard stats retrieved successfully",
      data: {
        totalStudents: studentsCount,
        totalFaculty: facultyCount,
        activeNotifications: activeNotifications,
        totalCourses: 0,
        recentNotifications: allNotifications
      }
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error.message);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};
