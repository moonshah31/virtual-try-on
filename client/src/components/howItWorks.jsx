import "../styles/styles.css";

function HowItWorks() {
  return (
    <section className="how-it-works">
      <h2>How Virtual Try-On Works</h2>

      <div className="how-steps">
        <div className="how-step">
          <div className="step-icon">🛍️</div>
          <h3>Select Product</h3>
          <p>Browse glasses, hats, or jewellery and choose your favorite.</p>
        </div>

        <div className="how-step">
          <div className="step-icon">📷</div>
          <h3>Enable Camera</h3>
          <p>Allow camera access for real-time face detection.</p>
        </div>

        <div className="how-step">
          <div className="step-icon">✨</div>
          <h3>Try Before You Buy</h3>
          <p>See how the accessory looks on you instantly.</p>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
