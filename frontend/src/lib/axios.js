import axios from "axios";
import toast from "react-hot-toast";

export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "https://chatify-backend-zeta.vercel.app/api",
    withCredentials:true,
});

axiosInstance.interceptors.response.use(
    response => response,

    error => {
        if(!error.response){
            toast.error("Cannot reach server. Check your connection.")
        }
        return Promise.reject(error);
    }
);