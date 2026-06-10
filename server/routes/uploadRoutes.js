import express from "express";
import { uploadPrescription } from "../controllers/uploadController.js";

const router = express.Router();

router.post(
  "/prescriptions",
  express.raw({
    limit: "5mb",
    type: ["image/*", "application/octet-stream"]
  }),
  uploadPrescription
);

export default router;
