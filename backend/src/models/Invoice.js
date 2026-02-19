import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: true
    },

    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true
    },

    invoiceNumber: {
      type: String,
      unique: true,
      required: true
    },

    billingPeriodStart: Date,
    billingPeriodEnd: Date,

    studentCount: Number,
    pricePerStudent: Number,

    subtotal: Number,
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: Number,

    status: {
      type: String,
      enum: ["DRAFT", "SENT", "VIEWED", "PAID", "OVERDUE", "CANCELLED"],
      default: "DRAFT"
    },

    dueDate: Date,
    paidDate: Date,
    
    paymentMethod: String,
    transactionId: String,

    notes: String,
    
    items: [{
      description: String,
      quantity: Number,
      unitPrice: Number,
      amount: Number
    }]
  },
  { timestamps: true }
);

invoiceSchema.index({ universityId: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ dueDate: 1 });

export default mongoose.model("Invoice", invoiceSchema);
