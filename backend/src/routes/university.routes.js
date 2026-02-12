import express from "express";
import multer from "multer";
import auth from "../middlewares/auth.middleware.js";
import { roleCheck } from "../middlewares/role.middleware.js";
import {
  // --- Student Controllers ---
  createStudent,
  getStudents,
  updateStudent,
  deleteStudent,
  bulkUploadStudents,
  getStudentsWithCredentials,
  resetStudentPassword,
  resetAllStudentPasswords,
  exportStudentCredentials,

  // --- Faculty Controllers ---
  createFaculty,
  getFaculty,
  updateFaculty,
  deleteFaculty,
  bulkUploadFaculty,        // <--- CRITICAL IMPORT
  getFacultyWithCredentials,
  resetFacultyPassword,
  resetAllFacultyPasswords,
  exportFacultyCredentials,

  // --- Notification Controllers ---
  createNotification,
  getUniversityNotifications,
  getNotificationDetail,
  updateNotification,
  deleteNotification,
  getDashboardStats
} from "../controllers/university.controller.js";

import {
  getUniversityProfile,
  updateUniversityProfile,
  requestPasswordReset,
  verifyOTPAndResetPassword
} from "../controllers/university-profile.controller.js";

const router = express.Router();

/* =========================================
   MULTER CONFIG (For CSV Uploads)
========================================= */
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "text/csv" || 
      file.mimetype === "application/vnd.ms-excel" || 
      file.originalname.toLowerCase().endsWith(".csv")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/* =========================================
   DASHBOARD ROUTES
========================================= */
router.get("/dashboard/stats", auth, roleCheck("UNIVERSITY"), getDashboardStats);

/* =========================================
   STUDENT ROUTES
========================================= */
// Static Routes (MUST BE FIRST)
router.post("/students/bulk/upload", auth, roleCheck("UNIVERSITY"), upload.single("file"), bulkUploadStudents);
router.get("/students/export/credentials", auth, roleCheck("UNIVERSITY"), exportStudentCredentials);
router.get("/students/credentials/all", auth, roleCheck("UNIVERSITY"), getStudentsWithCredentials);
router.post("/students/reset-all-passwords", auth, roleCheck("UNIVERSITY"), resetAllStudentPasswords);

// Dynamic/ID Routes (MUST BE AFTER)
router.post("/students", auth, roleCheck("UNIVERSITY"), createStudent);
router.get("/students", auth, roleCheck("UNIVERSITY"), getStudents);
router.post("/students/:studentId/reset-password", auth, roleCheck("UNIVERSITY"), resetStudentPassword);
router.put("/students/:id", auth, roleCheck("UNIVERSITY"), updateStudent);
router.delete("/students/:id", auth, roleCheck("UNIVERSITY"), deleteStudent);

/* =========================================
   FACULTY ROUTES (The Fix)
========================================= */
// 1. Static Routes (Place these BEFORE any /:id route)
router.post("/faculty/bulk/upload", auth, roleCheck("UNIVERSITY"), upload.single("file"), bulkUploadFaculty); // <--- THIS FIXES YOUR ERROR
router.get("/faculty/export/credentials", auth, roleCheck("UNIVERSITY"), exportFacultyCredentials);
router.get("/faculty/credentials/all", auth, roleCheck("UNIVERSITY"), getFacultyWithCredentials);
router.post("/faculty/reset-all-passwords", auth, roleCheck("UNIVERSITY"), resetAllFacultyPasswords);

// 2. Dynamic/ID Routes
router.post("/faculty", auth, roleCheck("UNIVERSITY"), createFaculty);
router.get("/faculty", auth, roleCheck("UNIVERSITY"), getFaculty);
router.post("/faculty/reset-password/:facultyId", auth, roleCheck("UNIVERSITY"), resetFacultyPassword);
router.put("/faculty/:id", auth, roleCheck("UNIVERSITY"), updateFaculty);
router.delete("/faculty/:id", auth, roleCheck("UNIVERSITY"), deleteFaculty);

/* =========================================
   NOTIFICATION ROUTES
========================================= */
router.post("/updates", auth, roleCheck("UNIVERSITY"), createNotification);
router.get("/updates", auth, roleCheck("UNIVERSITY"), getUniversityNotifications);
router.get("/updates/:notificationId", auth, roleCheck("UNIVERSITY"), getNotificationDetail);
router.put("/updates/:notificationId", auth, roleCheck("UNIVERSITY"), updateNotification);
router.delete("/updates/:notificationId", auth, roleCheck("UNIVERSITY"), deleteNotification);

/* =========================================
   PROFILE ROUTES
========================================= */
router.get("/profile", auth, roleCheck("UNIVERSITY"), getUniversityProfile);
router.put("/profile", auth, roleCheck("UNIVERSITY"), updateUniversityProfile);
router.post("/password/request-reset", auth, roleCheck("UNIVERSITY"), requestPasswordReset);
router.post("/password/verify-otp", auth, roleCheck("UNIVERSITY"), verifyOTPAndResetPassword);

export default router;