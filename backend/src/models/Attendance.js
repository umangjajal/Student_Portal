import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    // Essential for multi-tenancy security
    universityId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "University", 
      required: true 
    },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty" },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ["PRESENT", "ABSENT"], required: true }
  },
  { timestamps: true }
);

// Performance index for university filtering
attendanceSchema.index({ universityId: 1, date: -1 });

export default mongoose.model("Attendance", attendanceSchema);