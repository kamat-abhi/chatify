import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Chat from "../models/Chat.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getAllContacts controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userTochatId } = req.params;

    const chat = await Chat.findOne({
      participants: { $all: [myId, userTochatId] },
    });

    if (!chat) return res.status(200).json([]);

    const messages = await Message.find({
      chatId: chat._id,
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessagesByUserId controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "Text or image is required" });
    }
    if (senderId.equals(receiverId)) {
      return res
        .status(400)
        .json({ message: "Cannnot send message to yourself" });
    }
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    let attachments = [];
    if (image) {
      //upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      attachments.push({ url: uploadResponse.secure_url, fileType: "image" });
    }

    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] },
    });
    if (!chat) {
      chat = await Chat.create({ participants: [senderId, receiverId] });
    }

    const newMessage = new Message({
      chatId: chat._id,
      senderId,
      receiverId,
      text: text || "",
      messageType: attachments.length > 0 ? "image" : "text",
      attachments,
    });

    await newMessage.save();

    chat.lastMessage = {
      _id: newMessage._id,
      text: newMessage.text,
      senderId: newMessage.senderId,
      createdAt: newMessage.createdAt,
    };

    chat.lastActivityAt = new Date();

    chat.unreadCount.set(
      receiverId.toString(),
      (chat.unreadCount.get(receiverId.toString()) || 0) + 1
    );

    await chat.save();

    const messagePayload = {
      ...newMessage.toObject(),
      senderId: {
        _id: req.user._id,
        fullName: req.user.fullName,
        profilePic: req.user.profilePic,
      },
    };

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", messagePayload);
    }

    res.status(201).json(messagePayload);
  } catch (error) {
    console.log("Error in sendMessage controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const chats = await Chat.find({ participants: loggedInUserId }).populate(
      "participants",
      "fullName profilePic"
    );

    const chatPartners = chats.map((chat) => {
      return chat.participants.find(
        (p) => p._id.toString() !== loggedInUserId.toString()
      );
    });

    res.status(200).json(chatPartners);
  } catch (error) {
    console.log("Error in getChatPartners controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
