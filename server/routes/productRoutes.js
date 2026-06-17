import express from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct
} from "../controllers/productController.js";
import { requireAdminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

router
  .route("/")
  .get(getProducts)
  .post(requireAdminAuth, createProduct);

router
  .route("/:id")
  .get(getProductById)
  .put(requireAdminAuth, updateProduct)
  .delete(requireAdminAuth, deleteProduct);

export default router;
