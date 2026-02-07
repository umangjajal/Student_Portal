import express from "express";
import auth from "../middlewares/auth.middleware.js";
import { roleCheck } from "../middlewares/role.middleware.js";
import {
  getUniversities,
  approveUniversity
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/universities", auth, roleCheck("ADMIN"), getUniversities);
router.put(
  "/universities/:id/approve",
  auth,
  roleCheck("ADMIN"),
  approveUniversity
);

export default router;
