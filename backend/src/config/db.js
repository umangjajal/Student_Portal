import mongoose from "mongoose";

/**
 * Connect MongoDB (Atlas / Local)
 * - Validates env
 * - Masks credentials in logs
 * - Handles Node 18+ / 22 safely
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    /* =========================
       ENV VALIDATION
    ========================= */
    if (!uri) {
      throw new Error("MONGO_URI is missing. Check backend/.env");
    }

    if (
      !uri.startsWith("mongodb://") &&
      !uri.startsWith("mongodb+srv://")
    ) {
      throw new Error("Invalid MongoDB URI format");
    }

    /* =========================
       SAFE LOG (MASK PASSWORD)
    ========================= */
    const maskedUri = uri.replace(
      /\/\/(.*?):(.*?)@/,
      "//****:****@"
    );

    console.log("🔍 MongoDB URI detected:");
    console.log(maskedUri);

    /* =========================
       MONGOOSE SETTINGS
    ========================= */
    mongoose.set("strictQuery", true);

    /* =========================
       CONNECT
    ========================= */
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed");
    console.error("Reason:", error.message);

    /* =========================
       COMMON ERROR HINTS
    ========================= */
    if (error.message.includes("hostname")) {
      console.error(
        "💡 Hint: Your MongoDB password contains special characters (@, /, :) and MUST be URL-encoded."
      );
    }

    if (error.message.includes("ENOTFOUND")) {
      console.error(
        "💡 Hint: Check your internet connection or MongoDB Atlas Network Access (0.0.0.0/0)."
      );
    }

    process.exit(1);
  }
};

export default connectDB;
