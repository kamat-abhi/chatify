import express from "express";
import cookieParser from "cookie-parser"
import ratelimit from "express-rate-limit";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import connectDB from "./config/db.js";
import { ENV } from "./lib/env.js";


const app = express();

const PORT = ENV.PORT || 3000;

const limiter = ratelimit({
    windowMs: 1*60*1000,
    max: 100,
    statusCode: 429,
    message: "Too many request. Please try again later",
});
app.use(limiter);

app.use(express.json())
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`);
    connectDB()
})