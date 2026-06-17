import { useState } from "react";
import "../styles/styles.css";
import { useCart } from "../context/useCart.js";
import { useNavigate } from "react-router-dom";
import {
  getProductDescription,
  getPrescriptionPath,
  isGlassesProduct,
  PRESCRIPTION_FEE
} from "../utils/productCategories.js";
import { uploadPrescriptionImage } from "../utils/prescriptionUpload.js";

const ProductModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [prescriptionUpload, setPrescriptionUpload] = useState({
    productId: "",
    path: ""
  });

  if (!isOpen || !product) return null;

  const productId = product._id || product.id || product.name;
  const currentPrescriptionImage =
    prescriptionUpload.productId === productId
      ? prescriptionUpload.path
      : "";
  const hasPrescriptionCard =
    currentPrescriptionImage || getPrescriptionPath(product);

  const handlePrescriptionUpload = async (file) => {
    try {
      const filePath = await uploadPrescriptionImage(file);
      setPrescriptionUpload({
        productId,
        path: filePath
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const addProductToCart = () => {
    addToCart({
      ...product,
      prescriptionImagePath: hasPrescriptionCard || "",
      prescriptionCardImage: ""
    });
  };

  return (
    
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-button" onClick={onClose}>
          &times;
        </button>

        <img
          src={product.image}
          alt={product.name}
          className="modal-image"
        />

        <div className="modal-info">
          <h2>{product.name}</h2>
          <p className="price">Rs. {product.price}</p>
          <p>{getProductDescription(product)}</p>

          <p><strong>Category:</strong> {product.category}</p>

          {product.dimensions && (
            <p><strong>Dimensions:</strong> {product.dimensions}</p>
          )}

          {product.color && (
            <p><strong>Color:</strong> {product.color}</p>
          )}

          {product.colors && (
            <div className="colors">
              <strong>Colors:</strong>
              {product.colors.map((color, index) => (
                <span key={index} className="color-badge">{color}</span>
              ))}
            </div>
          )}

          {isGlassesProduct(product) && (
            <div className="prescription-upload">
              <p>
                Need eyesight lenses? Upload your prescription card image.
                Prescription glasses add Rs. {PRESCRIPTION_FEE}.
              </p>
              <label className="button-secondary prescription-upload-btn">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handlePrescriptionUpload(e.target.files[0])
                  }
                />
              </label>
              {hasPrescriptionCard && (
                <span className="prescription-status">
                  Prescription card attached
                </span>
              )}
            </div>
          )}

          <div className="modal-buttons">
            <button
              className="button-primary"
              onClick={addProductToCart}
            >
              Add to Cart
            </button>

            <button
              className="button-secondary"
              onClick={() => navigate("/tryon", { state: { product } })}
            >
              Try On
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
