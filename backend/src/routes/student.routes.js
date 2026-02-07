import express from "express";
import auth from "../middlewares/auth.middleware.js";
import { roleCheck } from "../middlewares/role.middleware.js";
import { getAttendance } from "../controllers/student.controller.js";

const router = express.Router();

router.get(
  "/attendance",
  auth,
  roleCheck("STUDENT"),
  getAttendance
);

export default router;
