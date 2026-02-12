import mongoose from "mongoose";

/**
 * University Schema
 * -----------------
 * Stores university profile & approval status
 * Linked to User model via referenceId
 */
const universitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "University name is required"],
      trim: true
    },

    email: {
      type: String,
      required: [true, "University email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },

    place: {
      type: String,
      required: [true, "Place is required"],
      trim: true
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true
    },

    state: {
      type: String,
      required: [true, "State is required"],
      trim: true
    },

    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true
    },

    postalCode: {
      type: String,
      required: [true, "Postal code is required"],
      trim: true
    },

    phone: String,
    website: String,
    logo: String,
    avatar: String,
    contactPerson: String,

    approved: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

/**
 * Indexes (performance & safety)
 */
universitySchema.index({ email: 1 });

export default mongoose.model("University", universitySchema);
