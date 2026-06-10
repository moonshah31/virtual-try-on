import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { API_BASE_URL } from "../config/api";

const API_ORIGIN = API_BASE_URL.replace("/api", "");

const getImageUrl = (path = "") => {
  if (!path) return "";

  return path.startsWith("http") ? path : `${API_ORIGIN}${path}`;
};

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("adminAuthenticated") === "true"
  );
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: ""
  });
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "glasses",
    image: "",
    color: ""
  });
  const [editingProductId, setEditingProductId] = useState(null);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchProducts();
    fetchOrders();
  }, [isAuthenticated]);

  const login = (e) => {
    e.preventDefault();

    if (loginForm.username === "admin" && loginForm.password === "admin") {
      localStorage.setItem("adminAuthenticated", "true");
      setIsAuthenticated(true);
      return;
    }

    alert("Invalid admin id or password");
  };

  const logout = () => {
    localStorage.removeItem("adminAuthenticated");
    setIsAuthenticated(false);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const saveProduct = async () => {
    if (!form.name || !form.price || !form.image || !form.color) {
      alert("Fill all fields");
      return;
    }

    try {
      const url = editingProductId
        ? `${API_BASE_URL}/products/${editingProductId}`
        : `${API_BASE_URL}/products`;
      const method = editingProductId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Product request failed");
      }

      alert(editingProductId ? "Product Updated" : "Product Added");
      setForm({
        name: "",
        price: "",
        category: "glasses",
        image: "",
        color: ""
      });
      setEditingProductId(null);
      fetchProducts();
    } catch (error) {
      console.log(error);
    }
  };

  const editProduct = (product) => {
    setEditingProductId(product._id);
    setForm({
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
      color: product.color
    });
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setForm({
      name: "",
      price: "",
      category: "glasses",
      image: "",
      color: ""
    });
  };

  const deleteProduct = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE"
      });
      fetchProducts();
    } catch (error) {
      console.log(error);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <main className="container admin-login-page">
          <form className="admin-login-card" onSubmit={login}>
            <h1>Admin Login</h1>
            <input
              type="text"
              placeholder="Admin ID"
              value={loginForm.username}
              onChange={(e) =>
                setLoginForm({ ...loginForm, username: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({ ...loginForm, password: e.target.value })
              }
            />
            <button className="button-primary" type="submit">
              Login
            </button>
          </form>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="container">
        <div className="admin-header">
          <div>
            <p className="eyebrow">Private</p>
            <h1>Admin Dashboard</h1>
          </div>
          <button className="remove-btn" onClick={logout}>
            Logout
          </button>
        </div>

        <div className="filter-tabs" aria-label="Admin sections">
          <button
            className={activeTab === "products" ? "filter-tab active" : "filter-tab"}
            onClick={() => setActiveTab("products")}
          >
            Products
          </button>
          <button
            className={activeTab === "orders" ? "filter-tab active" : "filter-tab"}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
        </div>

        {activeTab === "products" && (
          <>
            <section className="admin-panel">
              <h2>{editingProductId ? "Edit Product" : "Add Product"}</h2>

              <input
                type="text"
                name="name"
                placeholder="Product Name"
                value={form.name}
                onChange={handleChange}
              />

              <input
                type="number"
                name="price"
                placeholder="Price"
                value={form.price}
                onChange={handleChange}
              />

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="glasses">Glasses</option>
                <option value="hat">Hat</option>
                <option value="earring">Earring</option>
              </select>

              <input
                type="text"
                name="image"
                placeholder="Image URL"
                value={form.image}
                onChange={handleChange}
              />

              <input
                type="text"
                name="color"
                placeholder="Color"
                value={form.color}
                onChange={handleChange}
              />

              <div className="admin-actions">
                <button className="button-primary" onClick={saveProduct}>
                  {editingProductId ? "Update Product" : "Add Product"}
                </button>

                {editingProductId && (
                  <button className="button-secondary" onClick={cancelEdit}>
                    Cancel
                  </button>
                )}
              </div>
            </section>

            <div className="product-grid admin-product-grid">
              {products.map((product) => (
                <div className="product-card" key={product._id}>
                  <img src={product.image} alt={product.name} />
                  <h3>{product.name}</h3>
                  <p>Rs. {product.price}</p>
                  <p>{product.category}</p>
                  <p>{product.color}</p>

                  <button
                    className="button-primary"
                    onClick={() => editProduct(product)}
                  >
                    Edit
                  </button>

                  <button
                    className="remove-btn"
                    onClick={() => deleteProduct(product._id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "orders" && (
          <section className="orders-list">
            {orders.length === 0 && (
              <p className="empty-state">No orders yet.</p>
            )}

            {orders.map((order) => (
              <article className="order-card" key={order._id}>
                <div className="order-card-header">
                  <div>
                    <h2>{order.customerName}</h2>
                    <p>{order.phone} | {order.city}</p>
                    <p>{order.address}</p>
                  </div>
                  <div>
                    <p className="price">Rs. {order.totalPrice}</p>
                    <p>{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <p><strong>Order ID:</strong> {order._id}</p>
                <p><strong>Products:</strong> {order.productSummary}</p>

                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div className="order-item" key={`${order._id}-${index}`}>
                      <div>
                        <h3>{item.productName || item.name}</h3>
                        <p>{item.category}</p>
                        <p>Qty: {item.quantity}</p>
                        <p>Item total: Rs. {item.itemTotal}</p>
                        {item.prescriptionUploaded && (
                          <p className="prescription-status">
                            Prescription fee: Rs. {item.prescriptionFee}
                          </p>
                        )}
                      </div>

                      {item.prescriptionImagePath && (
                        <a
                          href={getImageUrl(item.prescriptionImagePath)}
                          target="_blank"
                          rel="noreferrer"
                          className="prescription-preview"
                        >
                          <img
                            src={getImageUrl(item.prescriptionImagePath)}
                            alt={`${item.productName || item.name} prescription`}
                          />
                          <span>Open prescription image</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}

export default Admin;
