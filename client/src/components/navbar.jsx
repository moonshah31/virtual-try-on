import { Link } from "react-router-dom";
import { useCart } from "../context/useCart.js";
import "../styles/styles.css";

function Navbar() {
  const { cartItems } = useCart();

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        Virtual Try-On
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/cart" className="cart-link">
          Cart ({totalItems})
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
