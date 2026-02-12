import express from "express";
import auth from "../middlewares/auth.middleware.js";
import { roleCheck } from "../middlewares/role.middleware.js";
import { getAttendance, getUniversityUpdates, getUpdateDetail } from "../controllers/student.controller.js";
import { getStudentProfile, updateStudentProfile, requestPasswordReset, verifyOTPAndResetPassword } from "../controllers/student-profile.controller.js";

const router = express.Router();

router.get(
  "/attendance",
  auth,
  roleCheck("STUDENT"),
  getAttendance
);

// University Updates/Notifications
router.get(
  "/updates",
  auth,
  roleCheck("STUDENT"),
  getUniversityUpdates
);

router.get(
  "/updates/:updateId",
  auth,
  roleCheck("STUDENT"),
  getUpdateDetail
);

// Profile Routes
router.get(
  "/profile",
  auth,
  roleCheck("STUDENT"),
  getStudentProfile
);

router.put(
  "/profile",
  auth,
  roleCheck("STUDENT"),
  updateStudentProfile
);

// Password Reset Routes
router.post(
  "/password/request-reset",
  auth,
  roleCheck("STUDENT"),
  requestPasswordReset
);

router.post(
  "/password/verify-otp",
  auth,
  roleCheck("STUDENT"),
  verifyOTPAndResetPassword
);

export default router;
