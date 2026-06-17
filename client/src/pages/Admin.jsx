import { useCallback, useEffect, useState } from "react";
import Navbar from "../components/navbar.jsx";
import Footer from "../components/footer.jsx";
import { API_BASE_URL, API_ORIGIN } from "../config/api.js";

const getImageUrl = (path = "") => {
  if (!path) return "";
  return path.startsWith("http") ? path : `${API_ORIGIN}${path}`;
};

const getProductImageUrl = (path = "") => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/uploads/")) return `${API_ORIGIN}${path}`;
  return path.startsWith("/") ? path : `/${path}`;
};

const getStoredAdminToken = () => localStorage.getItem("adminToken") || "";

function Admin() {
  // =========================
  // AUTH STATE
  // =========================
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(getStoredAdminToken())
  );

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: ""
  });

  // =========================
  // DASHBOARD STATE
  // =========================
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

  const getAdminHeaders = useCallback(() => ({
    Authorization: `Basic ${getStoredAdminToken()}`
  }), []);

  // =========================
  // FETCH PRODUCTS
  // =========================
  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  // =========================
  // FETCH ORDERS
  // =========================
  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: getAdminHeaders()
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.log(error);
    }
  }, [getAdminHeaders]);

  // =========================
  // LOAD DATA AFTER LOGIN
  // =========================
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchProducts();
    fetchOrders();
  }, [fetchOrders, fetchProducts, isAuthenticated]);

  // =========================
  // LOGIN (SECURE BACKEND)
  // =========================
  const login = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(loginForm)
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem(
          "adminToken",
          btoa(`${loginForm.username}:${loginForm.password}`)
        );
        setIsAuthenticated(true);
      } else {
        alert("Invalid credentials");
      }

    } catch (error) {
      console.log(error);
      alert("Login failed");
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
  };

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // =========================
  // SAVE PRODUCT (ADD / EDIT)
  // =========================
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
          "Content-Type": "application/json",
          ...getAdminHeaders()
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
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

  // =========================
  // EDIT PRODUCT
  // =========================
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

  // =========================
  // CANCEL EDIT
  // =========================
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

  // =========================
  // DELETE PRODUCT
  // =========================
  const deleteProduct = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE",
        headers: getAdminHeaders()
      });

      fetchProducts();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("Delete this fulfilled order?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: "DELETE",
        headers: getAdminHeaders()
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Order delete failed");
      }

      fetchOrders();
    } catch (error) {
      console.log(error);
      alert("Could not delete order");
    }
  };

  // =========================
  // LOGIN SCREEN
  // =========================
  if (!isAuthenticated) {
    return (
      <>
        <Navbar />

        <main className="container admin-login-page">
          <form className="admin-login-card" onSubmit={login}>
            <h1>Admin Login</h1>

            <input
              type="text"
              placeholder="Admin Username"
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

  // =========================
  // DASHBOARD UI
  // =========================
  return (
    <>
      <Navbar />

      <main className="container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <button className="remove-btn" onClick={logout}>
            Logout
          </button>
        </div>

        {/* TABS */}
        <div className="filter-tabs">
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

        {/* PRODUCTS */}
        {activeTab === "products" && (
          <>
            <section className="admin-panel">
              <h2>{editingProductId ? "Edit Product" : "Add Product"}</h2>

              <input name="name" value={form.name} onChange={handleChange} placeholder="Name" />
              <input name="price" value={form.price} onChange={handleChange} placeholder="Price" />
              <input name="image" value={form.image} onChange={handleChange} placeholder="Image URL" />
              <input name="color" value={form.color} onChange={handleChange} placeholder="Color" />

              <select name="category" value={form.category} onChange={handleChange}>
                <option value="glasses">Glasses</option>
                <option value="hat">Hat</option>
                <option value="earring">Earring</option>
              </select>

              <button className="button-primary" onClick={saveProduct}>
                {editingProductId ? "Update" : "Add"}
              </button>

              {editingProductId && (
                <button className="button-secondary" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </section>

            <div className="product-grid">
              {products.map((p) => (
                <div key={p._id} className="product-card">
                  <img src={getProductImageUrl(p.image)} alt={p.name} />
                  <h3>{p.name}</h3>
                  <p>Rs {p.price}</p>
                  <p>{p.category}</p>

                  <div className="admin-actions">
                    <button
                      className="button-secondary"
                      type="button"
                      onClick={() => editProduct(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="remove-btn"
                      type="button"
                      onClick={() => deleteProduct(p._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ORDERS */}
        {activeTab === "orders" && (
          <section className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <div>
                    <h3>{order.customerName}</h3>
                    <p>{order.phone}</p>
                    <p>
                      {order.address}
                      {order.city ? `, ${order.city}` : ""}
                    </p>
                  </div>

                  <button
                    className="remove-btn"
                    type="button"
                    onClick={() => deleteOrder(order._id)}
                  >
                    Delete
                  </button>
                </div>

                <div className="order-items">
                  {(order.items || []).map((item, index) => (
                    <div key={`${order._id}-${item.productId || index}`} className="order-item">
                      <div>
                        <h4>{item.productName || item.name}</h4>
                        <p>Qty: {item.quantity}</p>
                        <p>Price: Rs {item.price}</p>
                        {item.prescriptionFee > 0 && (
                          <p>Prescription lenses: Rs {item.prescriptionFee}</p>
                        )}
                      </div>

                      {item.prescriptionImagePath && (
                        <a
                          className="prescription-preview"
                          href={getImageUrl(item.prescriptionImagePath)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <span>Prescription</span>
                          <img
                            src={getImageUrl(item.prescriptionImagePath)}
                            alt={`${item.productName || item.name} prescription`}
                          />
                        </a>
                      )}
                    </div>
                  ))}
                </div>

                <strong>Total: Rs {order.totalPrice}</strong>
              </div>
            ))}
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}

export default Admin;
