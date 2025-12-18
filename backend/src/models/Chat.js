import mongoose, { MongooseError } from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
      text: String,
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      createdAt: Date,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    unreadCount: {
      type: Map, //key=userId, value=number
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);

