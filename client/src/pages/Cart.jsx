import { useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/useCart";
import {
  getItemTotal,
  getProductKey,
  getPrescriptionPath,
  isGlassesProduct,
  PRESCRIPTION_FEE,
} from "../utils/productCategories";
import { uploadPrescriptionImage } from "../utils/prescriptionUpload";
import "../styles/styles.css";

function Cart() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    updatePrescriptionCard
  } = useCart();

  const totalPrice = useMemo(
    () => cartItems.reduce(
      (total, item) => total + getItemTotal(item),
      0
    ),
    [cartItems]
  );

  const uploadPrescriptionCard = async (item, file) => {
    try {
      const filePath = await uploadPrescriptionImage(file);
      updatePrescriptionCard(getProductKey(item), filePath);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>
      <Navbar />

      <main className="container">
        <div className="page-heading">
          <p className="eyebrow">Shopping bag</p>
          <h1>Your Cart</h1>
        </div>

        {cartItems.length === 0 ? (
          <p className="empty-state">Your cart is empty.</p>
        ) : (
          <>
            <div className="cart-list">
              {cartItems.map((item) => (
                <article key={getProductKey(item)} className="cart-item">
                  <img src={item.image} alt={item.name} />

                  <div className="cart-info">
                    <h3>{item.name}</h3>
                    <p>Rs. {item.price}</p>
                    {getPrescriptionPath(item) && (
                      <p>Prescription lenses: Rs. {PRESCRIPTION_FEE * item.quantity}</p>
                    )}
                    <p>Subtotal: Rs. {getItemTotal(item)}</p>
                    {getPrescriptionPath(item) && (
                      <p className="prescription-status">
                        Prescription card uploaded
                      </p>
                    )}
                    {isGlassesProduct(item) && !getPrescriptionPath(item) && (
                      <div className="prescription-upload cart-prescription-upload">
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
                              uploadPrescriptionCard(item, e.target.files[0])
                            }
                          />
                        </label>
                      </div>
                    )}

                    <div className="quantity-controls">
                      <button
                        aria-label={`Decrease quantity for ${item.name}`}
                        onClick={() =>
                          updateQuantity(getProductKey(item), item.quantity - 1)
                        }
                      >
                        -
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        aria-label={`Increase quantity for ${item.name}`}
                        onClick={() =>
                          updateQuantity(getProductKey(item), item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(getProductKey(item))}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="cart-total">
              <h2>Total: Rs. {totalPrice}</h2>
              <Link className="button-primary" to="/checkout">
                Proceed to Checkout
              </Link>
            </div>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}

export default Cart;
