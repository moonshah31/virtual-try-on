import { API_BASE_URL } from "../config/api";

export const uploadPrescriptionImage = async (file) => {
  if (!file) {
    return "";
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload an image file.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Please upload an image smaller than 5MB.");
  }

  const response = await fetch(`${API_BASE_URL}/uploads/prescriptions`, {
    method: "POST",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
      "x-file-name": file.name
    },
    body: await file.arrayBuffer()
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Prescription upload failed.");
  }

  return data.filePath;
};
