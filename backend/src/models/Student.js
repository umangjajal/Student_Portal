import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    // The reference linking the student to their specific university
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
    email: { type: String, unique: true, sparse: true }, // Sparse allows multiple students to have null/no email
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

// CRITICAL FOR MULTI-TENANCY: 
// This index makes filtering students by university extremely fast.
studentSchema.index({ universityId: 1 });

// This compound index ensures a student's enrollment number is unique within their specific university
studentSchema.index({ universityId: 1, enrollmentNo: 1 }, { unique: true });

export default mongoose.model("Student", studentSchema);