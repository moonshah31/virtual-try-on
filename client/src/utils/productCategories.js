const categoryAliases = {
  earrings: "earring",
  jewelry: "earring",
  jewellery: "earring"
};

export const normalizeProductCategory = (category) => {
  const normalized = String(category || "").trim().toLowerCase();

  return categoryAliases[normalized] || normalized;
};

export const normalizeProduct = (product) => ({
  ...product,
  category: normalizeProductCategory(product.category)
});

export const PRESCRIPTION_FEE = 1000;

export const getProductKey = (product) =>
  product?._id || product?.id || product?.name;

export const getPrescriptionPath = (item) =>
  item?.prescriptionImagePath || item?.prescriptionCardImage || "";

export const isGlassesProduct = (product) =>
  normalizeProductCategory(product?.category) === "glasses";

export const getPrescriptionFee = (item) =>
  isGlassesProduct(item) && getPrescriptionPath(item)
    ? PRESCRIPTION_FEE * item.quantity
    : 0;

export const getItemTotal = (item) =>
  item.price * item.quantity + getPrescriptionFee(item);

export const getProductDescription = (product) => {
  const colorText = product.color ? `${product.color} finish` : "easy-wear finish";

  if (isGlassesProduct(product)) {
    return `${colorText} frames designed for a balanced everyday fit.`;
  }

  if (normalizeProductCategory(product.category) === "hat") {
    return `${colorText} headwear with a clean shape for casual styling.`;
  }

  if (normalizeProductCategory(product.category) === "earring") {
    return `${colorText} earrings that add a polished accent to your look.`;
  }

  return `${colorText} accessory selected for quick virtual previewing.`;
};
