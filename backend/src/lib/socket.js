import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});

io.use(socketAuthMiddleware);

const userSocketMap = {};

export function getReceiverSocketId(userId) {
  if (userSocketMap[userId]) {
    return userId;
  }
  return null;
}

const getOnlineUsers = () => {
  return Object.keys(userSocketMap).filter(
    (userId) => userSocketMap[userId].size > 0
  );
};

io.on("connection", (socket) => {
  console.log("A user connected", socket.user.fullName);

  const userId = socket.userId;

  socket.join(userId);

  if (!userSocketMap[userId]) {
    userSocketMap[userId] = new Set();
  }
  userSocketMap[userId].add(socket.id);

  io.emit("getOnlineUsers", getOnlineUsers()); //send events to all connected clients

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.user.fullName);

    if (userSocketMap[userId]) {
      userSocketMap[userId].delete(socket.id);
    }

    if (userSocketMap[userId].size === 0) {
      delete userSocketMap[userId];
    }

    io.emit("getOnlineUsers", getOnlineUsers());
  });
});

export { io, app, server };
