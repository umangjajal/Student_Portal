import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty" },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ["PRESENT", "ABSENT"], required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Attendance", attendanceSchema);
