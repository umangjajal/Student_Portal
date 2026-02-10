import express from "express";
import auth from "../middlewares/auth.middleware.js";
import { roleCheck } from "../middlewares/role.middleware.js";
import {
  createStudent,
  createFaculty,
  getStudents,
  getFaculty,
  updateStudent,
  updateFaculty,
  deleteStudent,
  deleteFaculty
} from "../controllers/university.controller.js";

const router = express.Router();

// ========== STUDENTS ==========
router.post("/students", auth, roleCheck("UNIVERSITY"), createStudent);
router.get("/students", auth, roleCheck("UNIVERSITY"), getStudents);
router.put("/students/:id", auth, roleCheck("UNIVERSITY"), updateStudent);
router.delete("/students/:id", auth, roleCheck("UNIVERSITY"), deleteStudent);

// ========== FACULTY ==========
router.post("/faculty", auth, roleCheck("UNIVERSITY"), createFaculty);
router.get("/faculty", auth, roleCheck("UNIVERSITY"), getFaculty);
router.put("/faculty/:id", auth, roleCheck("UNIVERSITY"), updateFaculty);
router.delete("/faculty/:id", auth, roleCheck("UNIVERSITY"), deleteFaculty);

export default router;
