import Category from "../models/category.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Get all categories
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  return res
    .status(200)
    .json(new ApiResponse(200, categories, "Categories fetched successfully"));
});

// Get a category by ID
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, category, "Category details fetched successfully")
    );
});

// Create a new category
const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    throw new ApiError(400, "Category name is required");
  }

  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    throw new ApiError(400, "Category name must be unique");
  }

  const newCategory = await Category.create({ name, description });

  return res
    .status(201)
    .json(new ApiResponse(201, newCategory, "Category created successfully"));
});

// Update a category by ID
const updateCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const categoryId = req.params.id;

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  if (name) {
    const existingCategory = await Category.findOne({ name });
    if (existingCategory && existingCategory._id.toString() !== categoryId) {
      throw new ApiError(400, "Category name must be unique");
    }
    category.name = name;
  }

  category.description = description || category.description;

  await category.save();

  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category updated successfully"));
});

// Delete a category by ID
const deleteCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  await category.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Category deleted successfully"));
});

export {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
