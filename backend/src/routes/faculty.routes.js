import express from "express";
import auth from "../middlewares/auth.middleware.js";
import { roleCheck } from "../middlewares/role.middleware.js";

// Import operational controllers (Attendance, etc.)
import { 
  markAttendance 
} from "../controllers/faculty.controller.js";

// Import profile & security controllers
import { 
  getFacultyProfile, 
  updateFacultyProfile, 
  requestPasswordReset, 
  verifyOTPAndResetPassword 
} from "../controllers/faculty-profile.controller.js";

const router = express.Router();

/* =========================================
   OPERATIONAL ROUTES
========================================= */
router.post(
  "/attendance",
  auth,
  roleCheck("FACULTY"),
  markAttendance
);

/* =========================================
   PROFILE ROUTES
========================================= */
router.get(
  "/profile",
  auth,
  roleCheck("FACULTY"),
  getFacultyProfile
);

router.put(
  "/profile",
  auth,
  roleCheck("FACULTY"),
  updateFacultyProfile
);

/* =========================================
   PASSWORD RESET ROUTES
========================================= */
router.post(
  "/password/request-reset",
  auth,
  roleCheck("FACULTY"),
  requestPasswordReset
);

router.post(
  "/password/verify-otp",
  auth,
  roleCheck("FACULTY"),
  verifyOTPAndResetPassword
);

export default router;