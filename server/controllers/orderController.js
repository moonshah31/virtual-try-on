import Order from "../models/Orders.js";
import mongoose from "mongoose";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, "..");
const uploadsRoot = path.join(serverRoot, "uploads");
const prescriptionsDir = path.join(uploadsRoot, "prescriptions");

const slugify = (value = "file") => (
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "file"
);

const getRequestOrigin = (req) => `${req.protocol}://${req.get("host")}`;

const getUploadRelativePath = (filePath = "") => {
  if (!filePath) return "";

  try {
    const parsedUrl = new URL(filePath);
    return parsedUrl.pathname;
  } catch {
    return filePath;
  }
};

const getAbsoluteUploadPath = (filePath = "") => {
  const relativePath = getUploadRelativePath(filePath);

  if (!relativePath.startsWith("/uploads/prescriptions/")) {
    return "";
  }

  const filename = path.basename(relativePath);
  return path.join(prescriptionsDir, filename);
};

const renamePrescriptionFile = async ({
  customerName,
  item,
  itemIndex,
  orderId,
  origin
}) => {
  const currentPath = item.prescriptionImagePath;
  const currentAbsolutePath = getAbsoluteUploadPath(currentPath);

  if (!currentAbsolutePath) {
    return currentPath;
  }

  try {
    await fs.access(currentAbsolutePath);
  } catch {
    return currentPath.startsWith("http")
      ? currentPath
      : `${origin}${getUploadRelativePath(currentPath)}`;
  }

  const extension = path.extname(currentAbsolutePath) || ".jpg";
  const filename = [
    "prescription",
    slugify(customerName),
    String(orderId).slice(-6),
    itemIndex + 1,
    slugify(item.productName)
  ].join("-") + extension;
  const nextAbsolutePath = path.join(prescriptionsDir, filename);
  const nextRelativePath = `/uploads/prescriptions/${filename}`;

  await fs.rename(currentAbsolutePath, nextAbsolutePath);

  return `${origin}${nextRelativePath}`;
};

const attachPrescriptionUrls = async ({
  customerName,
  items,
  orderId,
  req
}) => {
  const origin = getRequestOrigin(req);

  return Promise.all(
    items.map(async (item, itemIndex) => ({
      ...item,
      prescriptionImagePath: item.prescriptionImagePath
        ? await renamePrescriptionFile({
            customerName,
            item,
            itemIndex,
            orderId,
            origin
          })
        : ""
    }))
  );
};

const prepareOrderItems = (items = []) => (
  items.map((item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;
    const baseSubtotal = Number(item.baseSubtotal) || price * quantity;
    const prescriptionFee = Number(item.prescriptionFee) || 0;
    const itemTotal = Number(item.itemTotal) || baseSubtotal + prescriptionFee;
    const productName = item.productName || item.name || "Product";
    const prescriptionImagePath =
      item.prescriptionImagePath || item.prescriptionCardImage || "";

    return {
      productId: item.productId || item._id || item.id || "",
      name: productName,
      productName,
      category: item.category || "",
      image: item.image || "",
      price,
      quantity,
      baseSubtotal,
      prescriptionFee,
      prescriptionUploaded:
        Boolean(item.prescriptionUploaded) || Boolean(prescriptionImagePath),
      prescriptionImagePath,
      itemTotal
    };
  })
);

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrder = async (req, res) => {

  try {

    const {
      customerName,
      phone,
      address,
      city,
      items,
      totalPrice
    } = req.body;

    const orderItems = prepareOrderItems(items);

    const newOrder = new Order({
      customerName,
      phone,
      address,
      city,
      items: orderItems,
      productSummary: orderItems
        .map((item) => `${item.productName} x ${item.quantity}`)
        .join(", "),
      hasPrescriptionImages: orderItems.some(
        (item) => item.prescriptionUploaded
      ),
      totalPrice: Number(totalPrice) ||
        orderItems.reduce((total, item) => total + item.itemTotal, 0)
    });

    newOrder.items = await attachPrescriptionUrls({
      customerName,
      items: orderItems,
      orderId: newOrder._id,
      req
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order placed successfully",
      order: newOrder
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};

export const updateOrder = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      message: "Order updated successfully",
      order
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
