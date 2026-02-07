import mongoose from "mongoose";

const facultySchema = new mongoose.Schema(
  {
    universityId: { type: mongoose.Schema.Types.ObjectId, ref: "University", required: true },
    facultyCode: { type: String, unique: true },
    name: { type: String, required: true },
    department: String,
    experience: Number
  },
  { timestamps: true }
);

export default mongoose.model("Faculty", facultySchema);
