import express from "express";
import auth from "../middlewares/auth.middleware.js";
import { roleCheck } from "../middlewares/role.middleware.js";
import {
  getUniversities,
  approveUniversity
} from "../controllers/admin.controller.js";

const router = express.Router();

/* =====================================
   GET ALL UNIVERSITIES (ADMIN)
===================================== */
router.get(
  "/universities",
  auth,
  roleCheck("ADMIN"),
  getUniversities
);

/* =====================================
   APPROVE UNIVERSITY (ADMIN)
===================================== */
router.put(
  "/universities/:id/approve",
  auth,
  roleCheck("ADMIN"),
  approveUniversity
);

export default router;
