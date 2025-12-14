import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

//Helper to play sound safely (avoids SSR crashes)
let audioUnlocked = false;
if(typeof window !== "undefined"){
  const unlock = () => {
    audioUnlocked = true;
    window.removeEventListener("click", unlock);
    window.removeEventListener("keydown", unlock);
  };

  window.addEventListener("click", unlock, {once: true});
  window.addEventListener("keydown", unlock, {once: true});
};

const playSound = (type) => {
  if (typeof window === "undefined") return;
  if(!audioUnlocked) return;
  const sounds = {
    notification: "/sounds/notification.mp3",
    send: "/sounds/sendSound.mp3",
    chat: "/sounds/chat2.mp3",
  };
  const audio = new Audio(sounds[type]);
  audio.play().catch((e) => console.warn("Audio play failed:", e));
};

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUserLoading: false,
  isMessagesLoading: false,
  //Parse explicitly to avoid string comparison errors later
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled") ?? "true"),

  toggleSound: () => {
    const newVal = !get().isSoundEnabled;
    localStorage.setItem("isSoundEnabled", JSON.stringify(newVal));
    set({ isSoundEnabled: newVal });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),

  getAllContacts: async () => {
    set({ isUserLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch contacts");
    } finally {
      set({ isUserLoading: false });
    }
  },

  getMyChatPartners: async () => {
    set({ isUserLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch chats");
    } finally {
      set({ isUserLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages, isSoundEnabled } = get();
    const { authUser } = useAuthStore.getState();

    if (!selectedUser || !authUser) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true, //Useful for UI styling (e.g. fading opacity)
    };

    // 1. Optimistic Update
    set({ messages: [...messages, optimisticMessage] });
    if (isSoundEnabled) playSound("send");

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      // 2. Success: Replace temp message with real one
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === tempId ? res.data : msg
        ),
      }));
    } catch (error) {
      // 3. Failure: Rollback (remove the temp message)
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== tempId),
      }));
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: async () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      const { isSoundEnabled, selectedUser } = get();

      const isMessageAlreadyReceived = get().messages.some(
        (msg) => msg._id === newMessage._id
      );
      if(isMessageAlreadyReceived) return;

      const senderId = newMessage.senderId._id;
      const isFromSelectedUser = selectedUser?._id === senderId;

      if (isFromSelectedUser) {
        set((state) => ({
          messages: [...state.messages, { ...newMessage, senderId: senderId }],
        }));
        if (isSoundEnabled) playSound("chat");
      } else {
        if (isSoundEnabled) playSound("notification");
      }
      set((state) => {
        const existingChatIndex = state.chats.findIndex(
          (chat) => chat._id === senderId
        );

        if (existingChatIndex !== -1) {
          const updatedChats = [...state.chats];
          const chatToMove = { ...updatedChats[existingChatIndex] };

          chatToMove.lastMessage = {
            ...newMessage,
            senderId: senderId,
          };

          updatedChats.splice(existingChatIndex, 1);
          updatedChats.unshift(chatToMove);

          return { chats: updatedChats };
        } else {
          const newChatEntry = {
            _id: senderId,
            fullName: newMessage.senderId.fullName,
            profilePic: newMessage.senderId.profilePic,
            lastMessage: {
              ...newMessage,
              senderId: senderId,
            },
          };
          return { chats: [newChatEntry, ...state.chats] };
        }
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if(socket) socket.off("newMessage");
  },
}));
