import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["ADMIN", "UNIVERSITY", "STUDENT", "FACULTY"],
      required: true
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "roleModel"
    },

    roleModel: {
      type: String,
      enum: ["University", "Student", "Faculty"] // Ensure 'University' is capitalized to match the Model name
    },

    email: { type: String, unique: true, sparse: true },
    loginId: { type: String, unique: true, sparse: true }, 
    password: { type: String, required: true },

    isActive: { type: Boolean, default: true },
    
    resetOTP: String,
    resetOTPExpiry: Date,
    resetToken: String,
    resetTokenExpiry: Date
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);