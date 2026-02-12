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

// Routes
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import universityRoutes from "./routes/university.routes.js";
import studentRoutes from "./routes/student.routes.js";
import facultyRoutes from "./routes/faculty.routes.js";
import otpRoutes from "./routes/otp.routes.js";



/* =========================
   LOAD ENV (CRITICAL)
========================= */
dotenv.config({ path: ".env" });

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is UNDEFINED. .env is not loading.");
  process.exit(1);
}

/* =========================
   CONNECT DB
========================= */
await connectDB();

/* =========================
   APP & SERVER
========================= */
const app = express();
const server = http.createServer(app);

/* =========================
   SOCKET.IO
========================= */
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

initSocket(io);
app.set("io", io);

/* =========================
   SECURITY & MIDDLEWARES
========================= */
app.use(helmet());

// Allow multiple client URLs for CORS
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:3001",
  "https://student-portal-pearl-tau.vercel.app",
  // Add your deployed frontend URL here
].filter(Boolean);

app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(xss());
app.use(morgan("dev"));

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000
  })
);

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
   HEALTH & DEBUG
========================= */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "General Student Portal Backend Running",
    uptime: process.uptime()
  });
});

// Debug endpoint to verify env and routes
app.get("/debug", (req, res) => {
  res.json({
    env_loaded: !!process.env.JWT_SECRET,
    jwt_secret_length: process.env.JWT_SECRET?.length || 0,
    mongo_connected: !!process.env.MONGO_URI,
    email_user: process.env.EMAIL_USER || "NOT SET",
    email_pass_length: process.env.EMAIL_PASS?.length || 0,
    timestamp: new Date().toISOString()
  });
});

// Test email endpoint
app.post("/test-email", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email address required" });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ 
        message: "Email credentials not configured",
        email_user: !!process.env.EMAIL_USER,
        email_pass: !!process.env.EMAIL_PASS
      });
    }

    const { sendOTPEmail } = await import("./services/mail.service.js");
    
    await sendOTPEmail(email, "123456", "Test User");

    res.json({
      message: "✅ Test email sent successfully!",
      email,
      timestamp: new Date().toISOString(),
      note: "Check your inbox and spam folder"
    });
  } catch (error) {
    console.error("Test Email Error:", error);
    res.status(500).json({
      message: "❌ Failed to send test email",
      error: error.message,
      details: "Check backend console for more details"
    });
  }
});

/* =========================
   404 HANDLER
========================= */
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

/* =========================
   ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err);
  res.status(500).json({ success: false, message: "Server error" });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
