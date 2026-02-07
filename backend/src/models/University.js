import express from "express";
import auth from "../middlewares/auth.middleware.js";
import { roleCheck } from "../middlewares/role.middleware.js";
import {
  createStudent,
  createFaculty
} from "../controllers/university.controller.js";

const router = express.Router();

router.post(
  "/students",
  auth,
  roleCheck("UNIVERSITY"),
  createStudent
);

router.post(
  "/faculty",
  auth,
  roleCheck("UNIVERSITY"),
  createFaculty
);

export default router;
