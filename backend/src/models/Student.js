import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: true
    },

    enrollmentNo: {
      type: String,
      unique: true,
      required: true
    },

    name: { type: String, required: true },
    department: String,
    year: String
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);
