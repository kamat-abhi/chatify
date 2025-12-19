import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { deleteConversation, getMyconversations, markConversationAsRead } from "../controllers/chat.controller.js";


const router = express.Router();

router.use(protectRoute);

router.get("/", getMyconversations);
router.post("/:id/read", markConversationAsRead);
router.delete("/:id", deleteConversation);

export default router;