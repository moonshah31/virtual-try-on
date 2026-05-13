import React from "react";
import "../styles/styles.css";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const ProductModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
const navigate = useNavigate();
  if (!isOpen || !product) return null;

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

          <p><strong>Category:</strong> {product.category}</p>

          {product.dimensions && (
            <p><strong>Dimensions:</strong> {product.dimensions}</p>
          )}

          {product.colors && (
            <div className="colors">
              <strong>Colors:</strong>
              {product.colors.map((color, index) => (
                <span key={index} className="color-badge">{color}</span>
              ))}
            </div>
          )}

          <div className="modal-buttons">
            <button
              className="button-primary"
              onClick={() => addToCart(product)}
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