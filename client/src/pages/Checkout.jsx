import { useMemo, useState } from "react";
import Navbar from "../components/navbar.jsx";
import Footer from "../components/footer.jsx";
import { API_BASE_URL } from "../config/api.js";
import { useCart } from "../context/useCart.js";
import {
  getItemTotal,
  getProductKey,
  getPrescriptionPath,
  normalizeProductCategory,
  getPrescriptionFee
} from "../utils/productCategories.js";
import "../styles/styles.css";

function Checkout() {
  const { cartItems, clearCart } = useCart();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: ""
  });

  const totalPrice = useMemo(
    () => cartItems.reduce(
      (total, item) => total + getItemTotal(item),
      0
    ),
    [cartItems]
  );

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const placeOrder = async () => {
    if (!form.name || !form.phone || !form.address || !form.city) {
      alert("Please fill all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        customerName: form.name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        items: cartItems.map((item) => ({
          productId: getProductKey(item),
          name: item.name,
          productName: item.name,
          category: normalizeProductCategory(item.category),
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          baseSubtotal: item.price * item.quantity,
          prescriptionFee: getPrescriptionFee(item),
          prescriptionUploaded: Boolean(getPrescriptionPath(item)),
          itemTotal: getItemTotal(item),
          prescriptionImagePath: getPrescriptionPath(item)
        })),
        totalPrice
      };

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error("Order request failed");
      }

      setOrderPlaced(true);
      clearCart();
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <>
        <Navbar />
        <main className="container success-page">
          <h1>Order Placed Successfully!</h1>
          <p>Your order has been confirmed.</p>
          <p>Thank you for shopping with us.</p>
        </main>
        <Footer />
      </>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <main className="container empty-state">
          <h1>Your cart is empty.</h1>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="container">
        <h1>Checkout</h1>

        <div className="checkout-grid">
          <section className="checkout-form">
            <h2>Shipping Information</h2>

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
            />

            <input
              type="text"
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
            />

            <input
              type="text"
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
            />

            <p>
              <strong>Payment Method:</strong> Cash on Delivery
            </p>

            <button
              className="button-primary"
              onClick={placeOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Placing Order..." : "Place Order"}
            </button>
          </section>

          <aside className="order-summary">
            <h2>Order Summary</h2>

            {cartItems.map((item) => (
              <div key={item._id} className="summary-item">
                <div>
                  <p>{item.name} x {item.quantity}</p>
                  {getPrescriptionPath(item) && (
                    <p className="prescription-status">
                      Prescription card uploaded (+Rs. {getPrescriptionFee(item)})
                    </p>
                  )}
                </div>
                <p>Rs. {getItemTotal(item)}</p>
              </div>
            ))}

            <hr />
            <h3>Total: Rs. {totalPrice}</h3>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Checkout;
