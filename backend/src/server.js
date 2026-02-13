import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import { initSocket } from "./config/socket.js";

// Import Routes
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import universityRoutes from "./routes/university.routes.js";
import studentRoutes from "./routes/student.routes.js";
import facultyRoutes from "./routes/faculty.routes.js";
import otpRoutes from "./routes/otp.routes.js";

/* =========================
   LOAD ENV
========================= */
dotenv.config();

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env");
  process.exit(1);
}

/* =========================
   CONNECT DB
========================= */
await connectDB();

/* =========================
   APP SETUP
========================= */
const app = express();
const server = http.createServer(app);

/* =========================
   SOCKET.IO SETUP
========================= */
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
  }
});

initSocket(io);
app.set("io", io);

/* =========================
   SECURITY & MIDDLEWARE
========================= */
app.use(helmet());

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:3001"
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true
}));

// Body Parsers (CRITICAL for Login)
app.use(express.json({ limit: "10mb" })); 
app.use(express.urlencoded({ extended: true }));

// Data Sanitization
app.use(mongoSanitize());
app.use(xss());

// Logging
app.use(morgan("dev"));

// Rate Limiting
app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
}));

/* =========================
   ROUTES
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/university", universityRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/otp", otpRoutes);

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Student Portal Backend Running",
    environment: process.env.NODE_ENV
  });
});

/* =========================
   DEBUG EMAIL (Optional)
========================= */
app.post("/test-email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const { sendOTPEmail } = await import("./services/mail.service.js");
    await sendOTPEmail(email, "123456", "Test User");

    res.json({ success: true, message: "Test email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

/* =========================
   ERROR HANDLING
========================= */
// 404 Route
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err.message);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});