import { Router } from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Routes for all categories
router
  .route("/")
  .get(verifyJWT, getAllCategories)
  .post(verifyJWT, createCategory);

// Routes for a single category
router
  .route("/:id")
  .get(verifyJWT, getCategoryById)
  .put(verifyJWT, updateCategory)
  .delete(verifyJWT, deleteCategory);

export default router;
