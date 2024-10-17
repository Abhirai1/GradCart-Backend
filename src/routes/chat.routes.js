import { Router } from "express";
import {
  getAllChats,
  getChatById,
  createChat,
  updateChat,
  deleteChat,
} from "../controllers/chat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Routes for all chats
router.route("/").get(verifyJWT, getAllChats).post(verifyJWT, createChat);

// Routes for a single chat
router
  .route("/:id")
  .get(verifyJWT, getChatById)
  .put(verifyJWT, updateChat)
  .delete(verifyJWT, deleteChat);

export default router;
