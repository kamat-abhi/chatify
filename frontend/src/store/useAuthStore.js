import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { useChatStore } from "./useChatStore.js";
import {io} from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "https://chatify-asjd.onrender.com";


function handleAxiosError(error, fallbackMessage) {
  if (error.code === "ECONNABORTED") {
    toast.error("Request timed out.");
  } else if (error.response.status === 401) {
    // Unauthorized (invalid or expired token)
    toast.error("Unauthorized! Please login again.");
  } else {
    toast.error(error.response.data?.message || fallbackMessage);
  }
}

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSignup: false,
  isLogin: false,
  isUploading: false,
  socket: null,
  onLineUsers: [],

  checkAuth: async () => {
    set({ isCheckingAuth: true });

    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      handleAxiosError(error, "Authentication failed.");
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSignup: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully!");
      get().connectSocket()
    } catch (error) {
      handleAxiosError(error, "Signup failed");
    } finally {
      set({ isSignup: false });
    }
  },

  login: async (data) => {
    set({ isLogin: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully!");

      get().connectSocket();
    } catch (error) {
      handleAxiosError(error, "Login failed");
    } finally {
      set({ isLogin: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      useChatStore.setState({ selectedUser: null });
      toast.success("Logged out successfully");

      get().disconnectSocket();
    } catch (error) {
      toast.error("Error logging out");
      console.log("Logout error", error);
    }
  },

  updateProfile: async (data) => {
    set({ isUploading: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      handleAxiosError(error, "Failed to update profile.");
    } finally {
      set({ isUploading: false });
    }
  },

  connectSocket: async () =>{
    const { authUser} = get()
    if(!authUser || get().socket?.connected) return

    const socket = io(BASE_URL, {
      withCredentials: true,
    })

    socket.connect()

    set({socket: socket})

    socket.on("getOnlineUsers", (userId) => {
      set({onLineUsers: userId});
    });
  },

  disconnectSocket: () => {
    if(get().socket?.connected) get().socket.disconnect();
  }
}));
