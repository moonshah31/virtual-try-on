import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prescriptionsDir = path.resolve(
  __dirname,
  "..",
  "uploads",
  "prescriptions"
);

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const getSafeExtension = (filename = "", contentType = "") => {
  const extension = path.extname(filename).toLowerCase();

  if (allowedExtensions.has(extension)) {
    return extension;
  }

  if (contentType.includes("png")) return ".png";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return ".jpg";

  return "";
};

export const uploadPrescription = async (req, res) => {
  try {
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    const originalName = req.header("x-file-name") || "prescription";
    const extension = getSafeExtension(originalName, req.header("content-type"));

    if (!extension) {
      return res.status(400).json({ message: "Only JPG, PNG, or WEBP images are allowed" });
    }

    await fs.mkdir(prescriptionsDir, { recursive: true });

    const filename = `prescription-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${extension}`;
    const absolutePath = path.join(prescriptionsDir, filename);

    await fs.writeFile(absolutePath, req.body);

    res.status(201).json({
      message: "Prescription uploaded successfully",
      filePath: `/uploads/prescriptions/${filename}`
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Prescription upload failed" });
  }
};
