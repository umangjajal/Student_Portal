import express from "express";
import { login, universitySignup } from "../controllers/auth.controller.js";

const router = express.Router();

/* =========================
   UNIVERSITY SIGNUP
========================= */
router.post("/university/signup", universitySignup);

/* =========================
   LOGIN (ALL ROLES)
========================= */
router.post("/login", login);

export default router;
