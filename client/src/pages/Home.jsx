import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HowItWorks from "../components/howItWorks";
import ProductModal from "../components/productModal";
import "../styles/styles.css";

function Home() {
  const [trending, setTrending] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => setTrending(data.slice(0, 3)));
  }, []);

  const openModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  const handleAddToCart = (product) => {
    console.log("Add to cart:", product);
    // implement your cart logic here
    closeModal();
  };

  return (
    <>
    <div className="home-background">
      <Navbar />

      {/* Banner */}
      <div className="banner">
       
       
      </div>

      {/* Trending Products */}
      <div className="container">
        <h2>Trending Accessories</h2>

        <div className="product-grid">
          {trending.map((product) => (
            <div
              className="product-card"
              key={product._id}
              onClick={() => openModal(product)} // click on card opens modal
              style={{ cursor: "pointer" }}
            >
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <p>Rs. {product.price}</p>
              <button
                className="button-primary"
                onClick={(e) => {
                  e.stopPropagation(); // prevent double modal trigger
                  openModal(product);
                }}
              >
                Try On
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeModal}
        onAddToCart={handleAddToCart}
      />
<HowItWorks />

      <Footer />
      </div>
    </>
  );
}

export default Home;
