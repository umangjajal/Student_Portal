import mongoose from "mongoose";

const feesSchema = new mongoose.Schema(
  {
    universityId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "University", 
      required: true 
    },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    amount: { type: Number, required: true },
    paid: { type: Boolean, default: false },
    paymentDate: Date,
    remarks: String
  },
  { timestamps: true }
);

feesSchema.index({ universityId: 1 });

export default mongoose.model("Fees", feesSchema);