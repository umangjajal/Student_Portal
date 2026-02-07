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
      enum: ["University", "Student", "Faculty"]
    },

    email: { type: String, unique: true, sparse: true },
    loginId: { type: String, unique: true, sparse: true }, // studentId / facultyId
    password: { type: String, required: true },

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
