import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
  from: mongoose.Types.ObjectId;
  to: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  read: boolean;
}

const chatSchema = new Schema<IChat>(
  {
    from: { type: Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for faster queries
chatSchema.index({ from: 1, to: 1, createdAt: -1 });

export default mongoose.model<IChat>("Chat", chatSchema);
