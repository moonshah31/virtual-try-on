import { Link } from "react-router-dom";
import "../styles/styles.css";

const categories = [
  {
    title: "Glasses",
    text: "Preview frames with live face tracking.",
    image: "/images/glasses_sun.png"
  },
  {
    title: "Hats",
    text: "Check fit and scale before adding to cart.",
    image: "/images/cap_grey.png"
  },
  {
    title: "Earrings",
    text: "Compare styles directly on your face.",
    image: "/images/earrings.png"
  }
];

function CategoryShowcase() {
  return (
    <section className="section category-showcase">
      <div className="section-heading">
        <p className="eyebrow">Shop by look</p>
        <h2>Choose a Try-On Category</h2>
      </div>

      <div className="category-grid">
        {categories.map((category) => (
          <Link
            to="/products"
            className="category-card"
            key={category.title}
          >
            <img src={category.image} alt={category.title} loading="lazy" />
            <div>
              <h3>{category.title}</h3>
              <p>{category.text}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default CategoryShowcase;
