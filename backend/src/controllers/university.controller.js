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
const generatePassword = () => crypto.randomBytes(4).toString("hex");

const generateEnrollmentNo = (universityId) => {
  const year = new Date().getFullYear();
  const rand = crypto.randomInt(1000, 9999);
  return `UNI-${year}-${universityId.toString().slice(-4)}-${rand}`;
};

const generateFacultyId = () => {
  return `FAC-${crypto.randomInt(1000, 9999)}`;
};

/* =========================
   STUDENT MANAGEMENT
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
      universityId, // MUST exist in Student Schema
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

export const getStudents = async (req, res) => {
  try {
    const universityId = req.user.referenceId;
    // Strict scoping
    const students = await Student.find({ universityId });
    res.json(students);
  } catch (error) {
    console.error("Get Students Error:", error.message);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const universityId = req.user.referenceId;
    const { id } = req.params;

    const student = await Student.findOneAndUpdate(
      { _id: id, universityId }, // Security Check
      req.body,
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found or access denied" });
    }

    res.json({ message: "Student updated successfully", student });
  } catch (error) {
    console.error("Update Student Error:", error.message);
    res.status(500).json({ message: "Failed to update student" });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const universityId = req.user.referenceId;
    const { id } = req.params;

    const student = await Student.findOneAndDelete({
      _id: id,
      universityId // Security Check
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found or access denied" });
    }

    await User.deleteOne({ referenceId: id, role: "STUDENT" });

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Delete Student Error:", error.message);
    res.status(500).json({ message: "Failed to delete student" });
  }
};

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

export const resetStudentPassword = async (req, res) => {
  try {
    const universityId = req.user.referenceId;
    const { studentId } = req.params;

    const student = await Student.findOne({
      _id: studentId,
      universityId // Security Check
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const newPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

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

    const csvData = await parseCSV(req.file.path);

    if (csvData.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "CSV file is empty" });
    }

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

    for (let i = 0; i < csvData.length; i++) {
      try {
        const row = csvData[i];
        
        const name = row.name?.trim() || row.Name?.trim();
        const department = row.department?.trim() || row.Department?.trim();
        const year = row.year?.trim() || row.Year?.trim();

        if (!name || !department || !year) {
          errors.push(`Row ${i + 1}: Missing required fields`);
          continue;
        }

        const enrollmentNo = generateEnrollmentNo(universityId);
        const password = generatePassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        const student = await Student.create({
          universityId, // Security enforcement
          enrollmentNo,
          name,
          department,
          year
        });

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

    fs.unlinkSync(req.file.path);

    if (createdStudents.length > 0) {
      const csvHeaders = ["enrollmentNo", "name", "department", "year", "password"];
      const credentialsCSV = generateCSV(createdStudents, csvHeaders);
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="student-credentials-${Date.now()}.csv"`
      );
      
      return res.send(credentialsCSV);
    }

    res.status(400).json({
      message: "No students created. Check CSV file and try again.",
      errors,
      summary: { total: csvData.length, created: 0, failed: errors.length }
    });
  } catch (error) {
    console.error("Bulk Upload Students Error:", error.message);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: "Failed to process CSV file", error: error.message });
  }
};

/* =========================
   FACULTY MANAGEMENT
========================= */
export const createFaculty = async (req, res) => {
  try {
    const universityId = req.user.referenceId;

    if (!universityId) {
      return res.status(400).json({ message: "Invalid university user" });
    }

    const facultyId = generateFacultyId();
    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    const faculty = await Faculty.create({
      universityId, // Security enforcement
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

export const getFaculty = async (req, res) => {
  try {
    const universityId = req.user.referenceId;
    const faculty = await Faculty.find({ universityId }); // Security check
    res.json(faculty);
  } catch (error) {
    console.error("Get Faculty Error:", error.message);
    res.status(500).json({ message: "Failed to fetch faculty" });
  }
};

export const updateFaculty = async (req, res) => {
  try {
    const universityId = req.user.referenceId;
    const { id } = req.params;

    const faculty = await Faculty.findOneAndUpdate(
      { _id: id, universityId }, // Security check
      req.body,
      { new: true }
    );

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found or access denied" });
    }

    res.json({ message: "Faculty updated successfully", faculty });
  } catch (error) {
    console.error("Update Faculty Error:", error.message);
    res.status(500).json({ message: "Failed to update faculty" });
  }
};

export const deleteFaculty = async (req, res) => {
  try {
    const universityId = req.user.referenceId;
    const { id } = req.params;

    const faculty = await Faculty.findOneAndDelete({
      _id: id,
      universityId // Security check
    });

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found or access denied" });
    }

    await User.deleteOne({ referenceId: id, role: "FACULTY" });

    res.json({ message: "Faculty deleted successfully" });
  } catch (error) {
    console.error("Delete Faculty Error:", error.message);
    res.status(500).json({ message: "Failed to delete faculty" });
  }
};

export const getFacultyWithCredentials = async (req, res) => {
  try {
    const universityId = req.user.referenceId;

    const faculties = await Faculty.find({ universityId });
    const facultyWithCreds = [];

    for (const faculty of faculties) {
      const user = await User.findOne({
        referenceId: faculty._id,
        role: "FACULTY"
      });

      if (user) {
        facultyWithCreds.push({
          facultyId: faculty._id,
          systemId: faculty.facultyId,
          name: faculty.name,
          department: faculty.department,
          loginId: user.loginId,
          hashedPassword: user.password,
          isActive: user.isActive
        });
      }
    }

    res.json({
      message: "Faculty with credentials retrieved successfully",
      count: facultyWithCreds.length,
      data: facultyWithCreds
    });
  } catch (error) {
    console.error("Get Faculty with Credentials Error:", error.message);
    res.status(500).json({ message: "Failed to fetch faculty credentials" });
  }
};

export const resetFacultyPassword = async (req, res) => {
  try {
    const universityId = req.user.referenceId;
    const { facultyId } = req.params;

    const faculty = await Faculty.findOne({
      _id: facultyId,
      universityId // Security check
    });

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    const newPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await User.findOneAndUpdate(
      { referenceId: facultyId, role: "FACULTY" },
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User account not found" });
    }

    res.json({
      message: "Password reset successfully",
      facultyData: {
        facultyId: faculty._id,
        systemId: faculty.facultyId,
        name: faculty.name,
        newPassword: newPassword,
        loginId: updatedUser.loginId
      }
    });
  } catch (error) {
    console.error("Reset Faculty Password Error:", error.message);
    res.status(500).json({ message: "Failed to reset faculty password" });
  }
};

export const resetAllFacultyPasswords = async (req, res) => {
  try {
    const universityId = req.user.referenceId;

    const faculties = await Faculty.find({ universityId });
    const resetData = [];

    for (const faculty of faculties) {
      const newPassword = generatePassword();
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updatedUser = await User.findOneAndUpdate(
        { referenceId: faculty._id, role: "FACULTY" },
        { password: hashedPassword },
        { new: true }
      );

      if (updatedUser) {
        resetData.push({
          systemId: faculty.facultyId,
          name: faculty.name,
          loginId: updatedUser.loginId,
          newPassword: newPassword,
          department: faculty.department
        });
      }
    }

    res.json({
      message: "All faculty passwords reset successfully",
      count: resetData.length,
      data: resetData
    });
  } catch (error) {
    console.error("Reset All Faculty Passwords Error:", error.message);
    res.status(500).json({ message: "Failed to reset all faculty passwords" });
  }
};

export const exportFacultyCredentials = async (req, res) => {
  try {
    const universityId = req.user.referenceId;

    const faculties = await Faculty.find({ universityId });
    const credentials = [];

    for (const faculty of faculties) {
      const user = await User.findOne({
        referenceId: faculty._id,
        role: "FACULTY"
      });

      if (user) {
        credentials.push({
          facultyId: faculty.facultyId,
          name: faculty.name,
          department: faculty.department,
          loginId: user.loginId,
          isActive: user.isActive
        });
      }
    }

    if (credentials.length === 0) {
      return res.status(404).json({ message: "No faculty credentials found" });
    }

    const csvHeaders = ["facultyId", "name", "department", "loginId", "isActive"];
    const credentialsCSV = generateCSV(credentials, csvHeaders);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="faculty-credentials-${Date.now()}.csv"`
    );
    res.send(credentialsCSV);
  } catch (error) {
    console.error("Export Faculty Credentials Error:", error.message);
    res.status(500).json({ message: "Failed to export faculty credentials" });
  }
};

export const bulkUploadFaculty = async (req, res) => {
  try {
    const universityId = req.user.referenceId;

    if (!universityId) {
      return res.status(400).json({ message: "Invalid university user" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const csvData = await parseCSV(req.file.path);

    if (csvData.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "CSV file is empty" });
    }

    const requiredHeaders = ["name", "department"];
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

    const createdFaculty = [];
    const errors = [];

    for (let i = 0; i < csvData.length; i++) {
      try {
        const row = csvData[i];
        
        const name = row.name?.trim() || row.Name?.trim();
        const department = row.department?.trim() || row.Department?.trim();

        if (!name || !department) {
          errors.push(`Row ${i + 1}: Missing required fields (name, department)`);
          continue;
        }

        const facultyId = generateFacultyId();
        const password = generatePassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        const faculty = await Faculty.create({
          universityId, // Security enforcement
          facultyId,
          name,
          department
        });

        await User.create({
          role: "FACULTY",
          loginId: facultyId,
          password: hashedPassword,
          referenceId: faculty._id
        });

        createdFaculty.push({
          name,
          facultyId,
          password,
          department
        });
      } catch (rowError) {
        errors.push(`Row ${i + 1}: ${rowError.message}`);
      }
    }

    fs.unlinkSync(req.file.path);

    if (createdFaculty.length > 0) {
      const csvHeaders = ["facultyId", "name", "department", "password"];
      const credentialsCSV = generateCSV(createdFaculty, csvHeaders);
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="faculty-credentials-${Date.now()}.csv"`
      );
      
      return res.send(credentialsCSV);
    }

    res.status(400).json({
      message: "No faculty created. Check CSV file and try again.",
      errors,
      summary: { total: csvData.length, created: 0, failed: errors.length }
    });
  } catch (error) {
    console.error("Bulk Upload Faculty Error:", error.message);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: "Failed to process CSV file", error: error.message });
  }
};

/* =========================
   NOTIFICATIONS (UPDATES)
========================= */
export const createNotification = async (req, res) => {
  try {
    const universityId = req.user.referenceId;
    const { title, message, roleTarget, priority } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    const notification = await Notification.create({
      universityId, // Security check
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

export const getUniversityNotifications = async (req, res) => {
  try {
    const universityId = req.user.referenceId;

    const notifications = await Notification.find({ universityId }) // Security check
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

export const getNotificationDetail = async (req, res) => {
  try {
    const universityId = req.user.referenceId;
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      _id: notificationId,
      universityId // Security check
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

export const updateNotification = async (req, res) => {
  try {
    const universityId = req.user.referenceId;
    const { notificationId } = req.params;
    const { title, message, roleTarget, priority, isActive } = req.body;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, universityId }, // Security check
      { title, message, roleTarget, priority, isActive },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Update not found or access denied" });
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

export const deleteNotification = async (req, res) => {
  try {
    const universityId = req.user.referenceId;
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      universityId // Security check
    });

    if (!notification) {
      return res.status(404).json({ message: "Update not found or access denied" });
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
      return res.status(400).json({ message: "Invalid university session" });
    }

    // Parallel execution for maximum speed
    const [studentsCount, facultyCount, activeNotifications, recentNotifications] = await Promise.all([
      Student.countDocuments({ universityId }), 
      Faculty.countDocuments({ universityId }), 
      Notification.countDocuments({ universityId, isActive: true }), 
      Notification.find({ universityId }).sort({ createdAt: -1 }).limit(5)
      // Course.countDocuments({ universityId }) // Add this once Course model exists
    ]);

    res.json({
      success: true,
      message: "Dashboard data synced successfully",
      data: {
        totalStudents: studentsCount,
        totalFaculty: facultyCount,
        activeNotifications: activeNotifications,
        totalCourses: 0, // Update this to actual count later
        recentNotifications
      }
    });
  } catch (error) {
    console.error("Dashboard Aggregation Error:", error.message);
    res.status(500).json({ message: "Failed to compile dashboard statistics" });
  }
};