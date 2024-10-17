import Product from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Get all products
const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find()
    .populate("category", "name")
    .populate("owner", "username email");
  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully"));
});

// Get a product by ID
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name")
    .populate("owner", "username email")
    .populate("interestedBuyers", "username email")
    .populate("soldTo", "username email");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, product, "Product details fetched successfully")
    );
});

// Create a new product
const createProduct = asyncHandler(async (req, res) => {
  const { title, description, price, category } = req.body;

  if (
    [title, description, price, category].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Upload images to cloudinary if present
  const images = req.files.map((file) => uploadOnCloudinary(file.path));

  // Await all images upload to complete
  const uploadedImages = await Promise.all(images);

  const newProduct = await Product.create({
    title,
    description,
    price,
    category,
    owner: req.user._id,
    images: uploadedImages.map((image) => image.url),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newProduct, "Product created successfully"));
});

// Update product details
const updateProduct = asyncHandler(async (req, res) => {
  const { title, description, price, category, status } = req.body;
  const productId = req.params.id;

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Ensure only the owner can update the product
  if (product.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this product");
  }

  // Update fields if provided
  product.title = title || product.title;
  product.description = description || product.description;
  product.price = price || product.price;
  product.category = category || product.category;
  product.status = status || product.status;

  // If new images are uploaded, upload them and replace the existing ones
  if (req.files && req.files.length > 0) {
    const images = req.files.map((file) => uploadOnCloudinary(file.path));
    const uploadedImages = await Promise.all(images);
    product.images = uploadedImages.map((image) => image.url);
  }

  await product.save();

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully"));
});

// Delete a product
const deleteProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Ensure only the owner can delete the product
  if (product.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this product");
  }

  await product.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Product deleted successfully"));
});

export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
