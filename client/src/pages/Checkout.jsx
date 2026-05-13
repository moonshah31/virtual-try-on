import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import "../styles/styles.css";

function Checkout() {

  const { cartItems, clearCart } = useCart();

  const [orderPlaced, setOrderPlaced] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: ""
  });

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const placeOrder = async () => {

  if (
    !form.name ||
    !form.phone ||
    !form.address ||
    !form.city
  ) {
    alert("Please fill all fields");
    return;
  }

  try {

    const orderData = {

      customerName: form.name,

      phone: form.phone,

      address: form.address,

      city: form.city,

      items: cartItems.map(item => ({
        productId: item._id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity
      })),

      totalPrice
    };

    const response = await fetch(
      "http://localhost:5000/api/orders",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(orderData)
      }
    );

    const data = await response.json();

    console.log(data);

   setOrderPlaced(true);

setTimeout(() => {
  clearCart();
}, 1000);

  } catch (error) {

    console.log(error);

    alert("Something went wrong");
  }
};  
  // =========================
  // ORDER SUCCESS
  // =========================
  if (orderPlaced) {
    return (
      <>
        <Navbar />

        <div className="container success-page">

          <h1>
            🎉 Order Placed Successfully!
          </h1>

          <p>
            Your order has been confirmed.
          </p>

          <p>
            Thank you for shopping with us.
          </p>

        </div>

        <Footer />
      </>
    );
  }
  // =========================
  // EMPTY CART
  // =========================
  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />

        <div className="container">
          <h1>Your cart is empty.</h1>
        </div>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="container">

        <h1>Checkout</h1>

        <div className="checkout-grid">

          {/* SHIPPING FORM */}
          <div className="checkout-form">

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
              <strong>Payment Method:</strong>
              {" "}
              Cash on Delivery
            </p>

            <button
              className="button-primary"
              onClick={placeOrder}
            >
              Place Order
            </button>

          </div>

          {/* ORDER SUMMARY */}
          <div className="order-summary">

            <h2>Order Summary</h2>

            {cartItems.map((item) => (

              <div
                key={item._id}
                className="summary-item"
              >
                <p>
                  {item.name} x {item.quantity}
                </p>

                <p>
                  Rs. {item.price * item.quantity}
                </p>
              </div>

            ))}

            <hr />

            <h3>
              Total: Rs. {totalPrice}
            </h3>

          </div>

        </div>

      </div>

      <Footer />
    </>
  );
}

export default Checkout;