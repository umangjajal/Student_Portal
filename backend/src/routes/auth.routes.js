import express from "express";
import { login, universitySignup } from "../controllers/auth.controller.js";

const router = express.Router();

// LOGIN (Admin / University / Student / Faculty)
router.post("/login", login);

// UNIVERSITY SIGNUP
router.post("/university/signup", universitySignup);

export default router;
