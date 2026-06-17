import express from "express";

import {
  createOrder,
  deleteOrder,
  getOrderById,
  getOrders,
  updateOrder
} from "../controllers/orderController.js";
import { requireAdminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

router
  .route("/")
  .get(requireAdminAuth, getOrders)
  .post(createOrder);

router
  .route("/:id")
  .get(requireAdminAuth, getOrderById)
  .put(requireAdminAuth, updateOrder)
  .delete(requireAdminAuth, deleteOrder);

export default router;
