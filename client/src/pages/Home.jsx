import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HowItWorks from "../components/howItWorks";
import ProductModal from "../components/productModal";
import CategoryShowcase from "../components/CategoryShowcase";
import HomeBenefits from "../components/HomeBenefits";
import { API_BASE_URL } from "../config/api";
import { normalizeProduct } from "../utils/productCategories";
import "../styles/styles.css";

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error(error);
        }
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, []);

  const trending = useMemo(
    () => products.slice(0, 4),
    [products]
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
        products
      }
    });
  };

  return (
    <>
      <div className="home-background">
        <Navbar />

        <main>
          <section className="hero">
            <div className="hero-content">
              <p className="eyebrow">Virtual accessory store</p>
              <h1>Try your next look before you buy.</h1>
              <p>
                Browse accessories, preview them with your camera, and checkout
                with confidence.
              </p>
              <div className="hero-actions">
                <Link className="button-primary" to="/products">
                  Shop Products
                </Link>
              </div>
            </div>
          </section>

          <HomeBenefits />

          <section className="container section">
            <div className="section-heading">
              <p className="eyebrow">Featured picks</p>
              <h2>Trending Accessories</h2>
            </div>

            {isLoading ? (
              <p className="empty-state">Loading products...</p>
            ) : (
              <div className="product-grid">
                {trending.map((product) => (
                  <article
                    className="product-card"
                    key={product._id}
                    onClick={() => openModal(product)}
                  >
                    <img src={product.image} alt={product.name} loading="lazy" />
                    <h3>{product.name}</h3>
                    <p>Rs. {product.price}</p>
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
            )}
          </section>

          <CategoryShowcase />
          <HowItWorks />
        </main>

        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={closeModal}
        />

        <Footer />
      </div>
    </>
  );
}

export default Home;
