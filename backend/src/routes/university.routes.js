import express from "express";
import multer from "multer";
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
  deleteFaculty,
  bulkUploadStudents
} from "../controllers/university.controller.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// ========== STUDENTS ==========
// Bulk upload MUST come first before ID routes
router.post(
  "/students/bulk/upload",
  auth,
  roleCheck("UNIVERSITY"),
  upload.single("file"),
  bulkUploadStudents
);

router.post("/students", auth, roleCheck("UNIVERSITY"), createStudent);
router.get("/students", auth, roleCheck("UNIVERSITY"), getStudents);
router.put("/students/:id", auth, roleCheck("UNIVERSITY"), updateStudent);
router.delete("/students/:id", auth, roleCheck("UNIVERSITY"), deleteStudent);

// ========== BULK UPLOAD ==========
// (Moved above to prevent route conflicts)

// ========== FACULTY ==========
router.post("/faculty", auth, roleCheck("UNIVERSITY"), createFaculty);
router.get("/faculty", auth, roleCheck("UNIVERSITY"), getFaculty);
router.put("/faculty/:id", auth, roleCheck("UNIVERSITY"), updateFaculty);
router.delete("/faculty/:id", auth, roleCheck("UNIVERSITY"), deleteFaculty);

export default router;
