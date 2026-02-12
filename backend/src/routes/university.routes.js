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
  bulkUploadStudents,
  getStudentsWithCredentials,
  resetStudentPassword,
  resetAllStudentPasswords,
  exportStudentCredentials,
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

// ========== DASHBOARD ==========
router.get("/dashboard/stats", auth, roleCheck("UNIVERSITY"), getDashboardStats);

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
router.get("/students/credentials/all", auth, roleCheck("UNIVERSITY"), getStudentsWithCredentials);
router.post("/students/:studentId/reset-password", auth, roleCheck("UNIVERSITY"), resetStudentPassword);
router.post("/students/reset-all-passwords", auth, roleCheck("UNIVERSITY"), resetAllStudentPasswords);
router.get("/students/export/credentials", auth, roleCheck("UNIVERSITY"), exportStudentCredentials);
router.put("/students/:id", auth, roleCheck("UNIVERSITY"), updateStudent);
router.delete("/students/:id", auth, roleCheck("UNIVERSITY"), deleteStudent);

// ========== BULK UPLOAD ==========
// (Moved above to prevent route conflicts)

// ========== FACULTY ==========
router.post("/faculty", auth, roleCheck("UNIVERSITY"), createFaculty);
router.get("/faculty", auth, roleCheck("UNIVERSITY"), getFaculty);
router.put("/faculty/:id", auth, roleCheck("UNIVERSITY"), updateFaculty);
router.delete("/faculty/:id", auth, roleCheck("UNIVERSITY"), deleteFaculty);

// ========== NOTIFICATIONS (UPDATES/ANNOUNCEMENTS) ==========
router.post("/updates", auth, roleCheck("UNIVERSITY"), createNotification);
router.get("/updates", auth, roleCheck("UNIVERSITY"), getUniversityNotifications);
router.get("/updates/:notificationId", auth, roleCheck("UNIVERSITY"), getNotificationDetail);
router.put("/updates/:notificationId", auth, roleCheck("UNIVERSITY"), updateNotification);
router.delete("/updates/:notificationId", auth, roleCheck("UNIVERSITY"), deleteNotification);

// ========== PROFILE & PASSWORD RESET ==========
router.get("/profile", auth, roleCheck("UNIVERSITY"), getUniversityProfile);
router.put("/profile", auth, roleCheck("UNIVERSITY"), updateUniversityProfile);
router.post("/password/request-reset", auth, roleCheck("UNIVERSITY"), requestPasswordReset);
router.post("/password/verify-otp", auth, roleCheck("UNIVERSITY"), verifyOTPAndResetPassword);

export default router;
