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
