import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  name: string;
  content: string;
  avatar: string;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
}

const PostSchema: Schema = new Schema({
  name: { type: String, required: true },
  content: { type: String, required: true },
  avatar: { type: String },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IPost>("Post", PostSchema);
