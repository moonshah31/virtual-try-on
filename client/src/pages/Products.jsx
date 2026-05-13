import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductModal from "../components/productModal";
import "../styles/styles.css";
import { useNavigate } from "react-router-dom";
function Products() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("all");
const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  const filteredProducts =
    category === "all"
      ? products
      : products.filter((p) => p.category === category);

  const openModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

 

  return (
    <>
      <Navbar />

      <div className="container">
        <h1>All Products</h1>

        {/* Category Filter */}
        <div style={{ marginBottom: "20px" }}>
          <button onClick={() => setCategory("all")} className="button-primary">
            All
          </button>{" "}
          <button onClick={() => setCategory("glasses")} className="button-primary">
            Glasses
          </button>{" "}
          <button onClick={() => setCategory("hat")} className="button-primary">
            Hats
          </button>{" "}
          <button onClick={() => setCategory("jewellery")} className="button-primary">
            Jewellery
          </button>{" "}
          <button onClick={() => setCategory("lipstick")} className="button-primary">
            Lipstick
          </button>
        </div>

        {/* Products Grid */}
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <div
              className="product-card"
              key={product._id}
              onClick={() => openModal(product)}
            >
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <p>Rs. {product.price}</p>
              <button
  className="button-primary"
  onClick={(e) => {
    e.stopPropagation();

    navigate("/tryon", {
      state: {
        product,
        products: filteredProducts
      }
    });
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
      
      />

      <Footer />
    </>
  );
}

export default Products;
