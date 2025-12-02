import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if(!token){
            return res.status(401).json({message: "Unauthorised -No token provide"});
        }

        const decode = jwt.verify(token, ENV.JWT_SECRET)
        if(!decode) {
            return res.status(401).json({message: "Unauthorized -Invalid token"});
        }

        const user = await User.findById(decode.userId).select("-password");
        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error in protect route middleware", error);
        res.status(500).json({message: "Internal server error"});
    }
};