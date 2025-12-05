import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isCheckingAuth: true,
  isSignup: false,
  isLogin: false,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
    } catch (error) {
      console.log("Error in authCheck", error);
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
        toast.error("Backend is offline!");
      } else if (error.code === "ECONNABORTED") {
        toast.error("Request timed out.");
      } else {
        toast.error(error.response.data.message || "Login failed.");
      }

    } finally {
      set({ isLogin: false });
    }
  },

}));
