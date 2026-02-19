import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: true,
      unique: true
    },

    planName: {
      type: String,
      enum: ["FREE_TRIAL", "BASIC", "ADVANCED", "PREMIUM"],
      default: "FREE_TRIAL",
      required: true
    },

    isFreeTrial: {
      type: Boolean,
      default: false,
      description: "Is this subscription using free trial"
    },

    freeTrialStartDate: Date,
    freeTrialEndDate: Date,
    freeTrialDaysRemaining: {
      type: Number,
      default: 0,
      description: "Days remaining in free trial"
    },

    studentCount: {
      type: Number,
      default: 0,
      description: "Current number of students (auto-updated)"
    },

    monthlyCharges: {
      type: Number,
      default: 0,
      description: "Monthly charges = studentCount × pricePerStudent"
    },

    billingCycle: {
      type: String,
      enum: ["MONTHLY", "QUARTERLY", "ANNUALLY"],
      default: "MONTHLY"
    },

    startDate: {
      type: Date,
      default: Date.now
    },

    renewalDate: {
      type: Date,
      description: "Next renewal/billing date"
    },

    endDate: {
      type: Date,
      description: "Subscription end date (if cancelled)"
    },

    status: {
      type: String,
      enum: ["PENDING_ACCEPTANCE", "GRACE_PERIOD", "ACTIVE", "PAYMENT_OVERDUE", "CANCELLED", "EXPIRED"],
      default: "PENDING_ACCEPTANCE"
    },

    // Acceptance & Grace Period Fields
    isAccepted: {
      type: Boolean,
      default: false
    },

    acceptedAt: Date,
    
    acceptanceToken: {
      type: String,
      description: "Token sent in email for acceptance verification"
    },

    acceptanceTokenExpiresAt: Date,

    gracePeriodEndDate: {
      type: Date,
      description: "5 days from acceptance - deadline to add students/faculty and pay"
    },

    paymentDueDate: {
      type: Date,
      description: "Same as gracePeriodEndDate - when full payment is due"
    },

    gracePeriodDaysRemaining: {
      type: Number,
      default: 5,
      description: "Days remaining in grace period"
    },

    paymentMethod: {
      type: String,
      enum: ["BANK_TRANSFER", "INVOICE", "CREDIT_CARD"],
      default: "INVOICE"
    },

    lastPaymentDate: Date,
    lastPaymentAmount: Number,
    
    upgradedFrom: {
      type: String,
      description: "Previous plan if upgraded"
    },

    upgradedAt: Date,

    notes: String,

    autoRenewal: {
      type: Boolean,
      default: true
    },

    // Email tracking
    confirmationEmailSent: {
      type: Boolean,
      default: false
    },

    confirmationEmailSentAt: Date,

    reminderEmailsSent: [{
      type: {
        type: String,
        enum: ["DAY_3", "DAY_5_CRITICAL"]
      },
      sentAt: Date
    }]
  },
  { timestamps: true }
);

// Index for faster queries
subscriptionSchema.index({ universityId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ renewalDate: 1 });

export default mongoose.model("Subscription", subscriptionSchema);
