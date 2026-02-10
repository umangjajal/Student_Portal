import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const adminEmail = "admin@portal.com";
    const adminPassword = "Admin999"; // change later

    const existingAdmin = await User.findOne({
      role: "ADMIN",
      email: adminEmail
    });

    if (existingAdmin) {
      console.log("✅ Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await User.create({
      role: "ADMIN",
      email: adminEmail,
      password: hashedPassword
    });

    console.log("✅ Admin created successfully");
    console.log("📧 Email:", adminEmail);
    console.log("🔑 Password:", adminPassword);

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create admin:", error);
    process.exit(1);
  }
};

createAdmin();
