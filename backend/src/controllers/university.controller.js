import Student from "../models/Student.js";
import Faculty from "../models/Faculty.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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
