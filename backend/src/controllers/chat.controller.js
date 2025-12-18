import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

export const getMyconversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({ participants: userId })
      .sort({ lastActivityAt: -1 })
      .populate("participants", "fullName profilePic");

    const conversations = chats.map((chat) => {
      const peer = chat.participants.find(
        (p) => p._id.toString() !== userId.toString()
      );

      return {
        conversationId: chat._id,
        peer,
        lastMessage: chat.lastMessage,
        unreadCount: chat.unreadCount.get(userId.toString()) || 0,
        lastActivityAt: chat.lastActivityAt,
      };
    });

    res.status(200).json(conversations);
  } catch (error) {
    console.log("Error in getMyConversations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markConversationAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: conversationId } = req.params;

    const chat = await Chat.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!chat) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    await Message.updateMany(
      {
        chatId: conversationId,
        receiverId: userId,
        read: false,
      },
      {
        $set: { read: true, readAt: new Date() },
      }
    );
    chat.unreadCount.set(userId.toString(), 0);
    await chat.save();

    res.status(200).json({ message: "Conversation marked as read" });
  } catch (error) {
    console.error("Error in markConversationRead:", error);
    res.status(500).json({message: "Internal server error"});
  };
};
