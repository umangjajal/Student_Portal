import express from "express";
import auth from "../middlewares/auth.middleware.js";
import { roleCheck } from "../middlewares/role.middleware.js";
import { markAttendance } from "../controllers/faculty.controller.js";
import { 
  getFacultyProfile, 
  updateFacultyProfile, 
  requestPasswordReset, 
  verifyOTPAndResetPassword 
} from "../controllers/faculty-profile.controller.js";

const router = express.Router();

router.post(
  "/attendance",
  auth,
  roleCheck("FACULTY"),
  markAttendance
);

// Profile Routes
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

// Password Reset Routes
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
