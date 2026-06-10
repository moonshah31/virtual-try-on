import "../styles/styles.css";

function HowItWorks() {
  return (
    <section className="section how-it-works">
      <div className="section-heading">
        <p className="eyebrow">Try-on flow</p>
        <h2>How Virtual Try-On Works</h2>
      </div>

      <div className="how-steps">
        <div className="how-step">
          <div className="step-icon">1</div>
          <h3>Select Product</h3>
          <p>Browse glasses, hats, or earrings and choose your favorite.</p>
        </div>

        <div className="how-step">
          <div className="step-icon">2</div>
          <h3>Enable Camera</h3>
          <p>Allow camera access for real-time face detection.</p>
        </div>

        <div className="how-step">
          <div className="step-icon">3</div>
          <h3>Try Before You Buy</h3>
          <p>Preview the accessory instantly, then capture your look.</p>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
