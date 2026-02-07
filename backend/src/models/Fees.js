import mongoose from "mongoose";

const feesSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    amount: { type: Number, required: true },
    paid: { type: Boolean, default: false },
    paymentDate: Date
  },
  { timestamps: true }
);

export default mongoose.model("Fees", feesSchema);
