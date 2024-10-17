import { Router } from "express";
import {
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
} from "../controllers/product.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Get all products
router.route("/").get(verifyJWT, getAllProducts).post(
  verifyJWT,
  upload.array("images", 5), // max 5 images
  createProduct
);

// Single product operations
router
  .route("/:id")
  .get(verifyJWT, getProductById)
  .put(verifyJWT, upload.array("images", 5), updateProduct)
  .delete(verifyJWT, deleteProduct);

export default router;
