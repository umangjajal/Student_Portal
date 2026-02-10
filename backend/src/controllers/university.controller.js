import Student from "../models/Student.js";
import Faculty from "../models/Faculty.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { parseCSV } from "../services/csv.service.js";
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

    res.status(201).json({
      message: `Successfully created ${createdStudents.length} students`,
      students: createdStudents,
      errors: errors.length > 0 ? errors : null,
      summary: {
        total: csvData.length,
        created: createdStudents.length,
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
