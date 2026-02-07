import express from "express";
import auth from "../middlewares/auth.middleware.js";
import { roleCheck } from "../middlewares/role.middleware.js";
import { markAttendance } from "../controllers/faculty.controller.js";

const router = express.Router();

router.post(
  "/attendance",
  auth,
  roleCheck("FACULTY"),
  markAttendance
);

export default router;
