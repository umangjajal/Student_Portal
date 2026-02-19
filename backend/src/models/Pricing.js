import mongoose from "mongoose";

const pricingSchema = new mongoose.Schema(
  {
    planName: {
      type: String,
      enum: ["FREE_TRIAL", "BASIC", "ADVANCED", "PREMIUM"],
      required: true,
      unique: true
    },
    
    pricePerStudent: {
      type: Number,
      required: true,
      description: "Price per student per month (in rupees)"
    },

    isFreeTrial: {
      type: Boolean,
      default: false,
      description: "Is this a free trial plan"
    },

    freeTrialDays: {
      type: Number,
      default: 0,
      description: "Number of free trial days (30 for free trial)"
    },

    freeTrialMaxStudents: {
      type: Number,
      default: 0,
      description: "Maximum students in free trial (100)"
    },

    description: String,

    // Features included in this plan
    features: {
      // Core features - Basic has these
      studentManagement: { type: Boolean, default: true },
      attendanceTracking: { type: Boolean, default: true },
      notificationSystem: { type: Boolean, default: true },
      feeManagement: { type: Boolean, default: true },
      basicReports: { type: Boolean, default: true },

      // Advanced features
      advancedAnalytics: { type: Boolean, default: false },
      customReports: { type: Boolean, default: false },
      bulkUpload: { type: Boolean, default: false },
      apiAccess: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },

      // Premium features
      aiInsights: { type: Boolean, default: false },
      advancedFeeTracking: { type: Boolean, default: false },
      customIntegrations: { type: Boolean, default: false },
      dedicatedAccountManager: { type: Boolean, default: false },
      sso: { type: Boolean, default: false }, // Single Sign-On
      dataExport: { type: Boolean, default: false },
      whiteLabel: { type: Boolean, default: false }
    },

    maxStudents: {
      type: Number,
      description: "Maximum number of students allowed (null = unlimited)"
    },

    maxFaculty: {
      type: Number,
      description: "Maximum faculty members (null = unlimited)"
    },

    storageGB: {
      type: Number,
      default: 5,
      description: "Storage in GB"
    },

    color: {
      type: String,
      default: "#3B82F6",
      description: "UI color for this plan"
    },

    badge: {
      type: String,
      description: "Badge label (e.g., 'Most Popular')"
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Pricing", pricingSchema);
