import { Router } from "express";
import {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/review.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Routes for all reviews
router.route("/").get(verifyJWT, getAllReviews).post(verifyJWT, createReview);

// Routes for a single review
router
  .route("/:id")
  .get(verifyJWT, getReviewById)
  .put(verifyJWT, updateReview)
  .delete(verifyJWT, deleteReview);

export default router;
