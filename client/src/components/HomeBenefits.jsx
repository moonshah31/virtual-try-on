import "../styles/styles.css";

const benefits = [
  "Real-time face tracking",
  "We make prescription glasses",
  "Cart and checkout ready",
  "Works across desktop and mobile"
];

function HomeBenefits() {
  return (
    <section className="benefit-strip" aria-label="Store benefits">
      {benefits.map((benefit) => (
        <div className="benefit-item" key={benefit}>
          <span />
          <p>{benefit}</p>
        </div>
      ))}
    </section>
  );
}

export default HomeBenefits;
