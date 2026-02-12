import mongoose from "mongoose";

const facultySchema = new mongoose.Schema(
  {
    universityId: { type: mongoose.Schema.Types.ObjectId, ref: "University", required: true },
    facultyCode: { type: String, unique: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String },
    department: String,
    experience: Number,
    specialization: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"] },
    address: String,
    city: String,
    state: String,
    postalCode: String,
    avatar: { type: String, default: null },
    bio: String
  },
  { timestamps: true }
);

export default mongoose.model("Faculty", facultySchema);
