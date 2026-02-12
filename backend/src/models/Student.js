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
    email: { type: String, unique: true, sparse: true },
    phone: { type: String },
    department: String,
    year: String,
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

export default mongoose.model("Student", studentSchema);
