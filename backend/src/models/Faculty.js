import mongoose from "mongoose";

const facultySchema = new mongoose.Schema(
  {
    // The reference linking the faculty to their specific university
    universityId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "University", 
      required: true 
    },
    
    // Fixed: Changed from 'facultyCode' to 'facultyId' to match the controller logic
    facultyId: { 
      type: String, 
      unique: true,
      required: true
    },
    
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

// CRITICAL FOR MULTI-TENANCY: 
// This index makes filtering faculty by university extremely fast.
facultySchema.index({ universityId: 1 });

// This compound index ensures a faculty member's ID is unique within their specific university
facultySchema.index({ universityId: 1, facultyId: 1 }, { unique: true });

export default mongoose.model("Faculty", facultySchema);