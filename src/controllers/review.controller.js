import Review from "../models/review.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Get all reviews
const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .populate("seller", "username email")
    .populate("buyer", "username email");
  return res
    .status(200)
    .json(new ApiResponse(200, reviews, "Reviews fetched successfully"));
});

// Get a review by ID
const getReviewById = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
    .populate("seller", "username email")
    .populate("buyer", "username email");

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, review, "Review details fetched successfully"));
});

// Create a new review
const createReview = asyncHandler(async (req, res) => {
  const { seller, buyer, rating, comment } = req.body;

  if (!seller || !buyer || !rating) {
    throw new ApiError(400, "Seller, buyer, and rating are required");
  }

  if (rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  const newReview = await Review.create({
    seller,
    buyer,
    rating,
    comment,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newReview, "Review created successfully"));
});

// Update a review by ID
const updateReview = asyncHandler(async (req, res) => {
  const reviewId = req.params.id;
  const { rating, comment } = req.body;

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // Ensure only the buyer can update the review
  if (review.buyer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this review");
  }

  review.rating = rating || review.rating;
  review.comment = comment || review.comment;

  await review.save();

  return res
    .status(200)
    .json(new ApiResponse(200, review, "Review updated successfully"));
});

// Delete a review by ID
const deleteReview = asyncHandler(async (req, res) => {
  const reviewId = req.params.id;

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // Ensure only the buyer can delete the review
  if (review.buyer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this review");
  }

  await review.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Review deleted successfully"));
});

export {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
};
