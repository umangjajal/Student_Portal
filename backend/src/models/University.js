import mongoose from "mongoose";

const universitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    place: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    phone: String,
    website: String,
    logo: String,
    avatar: String,
    contactPerson: String,
    approved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Index for faster login lookups
universitySchema.index({ email: 1 });

export default mongoose.model("University", universitySchema);