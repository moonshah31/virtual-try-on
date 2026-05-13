import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import "../styles/styles.css";
import { Link } from "react-router-dom";

function Cart() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <>
      <Navbar />

      <div className="container">
        <h1>Your Cart</h1>

        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <div className="cart-list">
              {cartItems.map((item) => (
                <div key={item._id} className="cart-item">
                  <img src={item.image} alt={item.name} />

                  <div className="cart-info">
                    <p>
  Subtotal: Rs. {item.price * item.quantity}
</p>
                    <h3>{item.name}</h3>
                    <p>Rs. {item.price}</p>

                    <div className="quantity-controls">
                      <button
                      onClick={() => {
  if (item.quantity > 1) {
    updateQuantity(item._id, item.quantity - 1);
  }
}}
                      >
                        -
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() =>
                          updateQuantity(item._id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-total">
              <h2>Total: Rs. {totalPrice}</h2>

              

<Link to="/checkout">
  <button className="button-primary">
    Proceed to Checkout
  </button>
</Link>
            </div>
          </>
        )}
      </div>

      <Footer />
    </>
  );
}

export default Cart;