import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import ProductModal from "../components/productModal";
import { API_BASE_URL } from "../config/api";
import { normalizeProduct } from "../utils/productCategories";
import "../styles/styles.css";

const categories = [
  { label: "All", value: "all" },
  { label: "Glasses", value: "glasses" },
  { label: "Hats", value: "hat" },
  { label: "Earrings", value: "earring" }
];

function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API_BASE_URL}/products`, {
      signal: controller.signal
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }

        return res.json();
      })
      .then((data) => setProducts(data.map(normalizeProduct)))
      .catch((fetchError) => {
        if (fetchError.name !== "AbortError") {
          console.error(fetchError);
          setError("Products could not be loaded.");
        }
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, []);

  const filteredProducts = useMemo(
    () => (
      category === "all"
        ? products
        : products.filter((product) => product.category === category)
    ),
    [category, products]
  );

  const openModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  const tryProduct = (product) => {
    navigate("/tryon", {
      state: {
        product,
        products: filteredProducts
      }
    });
  };

  return (
    <>
      <Navbar />

      <main className="container">
        <div className="page-heading">
          <p className="eyebrow">Catalog</p>
          <h1>All Products</h1>
        </div>

        <div className="filter-tabs" aria-label="Product categories">
          {categories.map((item) => (
            <button
              key={item.value}
              className={
                category === item.value
                  ? "filter-tab active"
                  : "filter-tab"
              }
              onClick={() => setCategory(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <p className="empty-state">Loading products...</p>
        )}

        {error && (
          <p className="empty-state">{error}</p>
        )}

        {!isLoading && !error && filteredProducts.length === 0 && (
          <p className="empty-state">No products found in this category.</p>
        )}

        <div className="product-grid">
          {filteredProducts.map((product) => (
            <article
              className="product-card"
              key={product._id || product.id || product.name}
              onClick={() => openModal(product)}
            >
              <img src={product.image} alt={product.name} loading="lazy" />
              <h3>{product.name}</h3>
              <p className="product-price">Rs. {product.price}</p>
              <button
                className="button-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  tryProduct(product);
                }}
              >
                Try On
              </button>
            </article>
          ))}
        </div>
      </main>

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      <Footer />
    </>
  );
}

export default Products;
