import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  universityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "University",
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  roleTarget: {
    type: String,
    enum: ["STUDENT", "FACULTY", "ADMIN", "ALL"],
    default: "ALL"
  },
  priority: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH"],
    default: "MEDIUM"
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

notificationSchema.index({ universityId: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);