import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isCheckingAuth: true,
  isSignup: false,
  isLogin: false,
  isUploading: false,

  checkAuth: async () => {
    if (!navigator.onLine) {
      toast.error("No Internet Connection! Please check your network.");
      set({ authUser: null, isCheckingAuth: false });
      return;
    }

    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
    } catch (error) {
      // If Axios throws due to DNS or ENOTFOUND
      if (error.code === "ERR_NETWORK") {
        toast.error("Cannot reach server. Check your internet connection.");
      } else {
        toast.error("User not found!");
      }
      console.log("Error in authCheck:", error);
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
    } catch (error) {
      // Backend offline or timeout
      if (!error.response) {
        toast.error("Backend is offline!");
      }
      // Axios timeout
      else if (error.code === "ECONNABORTED") {
        toast.error("Request timed out.");
      }
      // Backend sent message
      else {
        toast.error(error.response.data.message || "Signup failed.");
      }
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
    } catch (error) {
      if (!error.response) {
        toast.dismiss;
        toast.error("Backend is offline!");
      } else if (error.code === "ECONNABORTED") {
        toast.dismiss();
        toast.error("Request timed out.");
      } else {
        toast.dismiss();
        toast.error(error.response.data.message || "Login failed.");
      }
    } finally {
      set({ isLogin: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
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
      console.log("Error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUploading: false });
    }
  },
}));
