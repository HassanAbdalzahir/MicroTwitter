import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  name: string;
  content: string;
  avatar: string;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  likes: mongoose.Types.ObjectId[];
}

const PostSchema: Schema = new Schema({
  name: { type: String, required: true },
  content: { type: String, required: true },
  avatar: { type: String },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  likes: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
});

export default mongoose.model<IPost>("Post", PostSchema);
