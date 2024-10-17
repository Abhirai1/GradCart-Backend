import Chat from "../models/chat.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Get all chats
const getAllChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find().populate("participants").populate("product");
  return res
    .status(200)
    .json(new ApiResponse(200, chats, "Chats fetched successfully"));
});

// Get a chat by ID
const getChatById = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id)
    .populate("participants")
    .populate("product");

  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, chat, "Chat details fetched successfully"));
});

// Create a new chat
const createChat = asyncHandler(async (req, res) => {
  const { participants, product, messages } = req.body;

  if (!participants || !product) {
    throw new ApiError(400, "Participants and product are required");
  }

  const newChat = await Chat.create({ participants, product, messages });
  await newChat.populate("participants").populate("product").execPopulate();

  return res
    .status(201)
    .json(new ApiResponse(201, newChat, "Chat created successfully"));
});

// Update a chat by ID
const updateChat = asyncHandler(async (req, res) => {
  const chatId = req.params.id;
  const { participants, product, messages } = req.body;

  const chat = await Chat.findById(chatId);

  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  if (participants) {
    chat.participants = participants;
  }
  if (product) {
    chat.product = product;
  }
  if (messages) {
    chat.messages = messages;
  }

  await chat.save();
  await chat.populate("participants").populate("product").execPopulate();

  return res
    .status(200)
    .json(new ApiResponse(200, chat, "Chat updated successfully"));
});

// Delete a chat by ID
const deleteChat = asyncHandler(async (req, res) => {
  const chatId = req.params.id;

  const chat = await Chat.findById(chatId);

  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  await chat.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Chat deleted successfully"));
});

export { getAllChats, getChatById, createChat, updateChat, deleteChat };
