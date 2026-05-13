import "../styles/styles.css";

function ScreenshotModal({
  image,
  isOpen,
  onClose,
  onRetake
}) {

  if (!isOpen || !image) return null;

  // =========================
  // SAVE IMAGE
  // =========================
  const saveImage = () => {

    const link = document.createElement("a");

    link.href = image;

    link.download = "virtual-tryon.png";

    link.click();
  };

  // =========================
  // SHARE
  // =========================
  const shareImage = async () => {

    if (navigator.share) {

      try {

        await navigator.share({
          title: "Virtual Try-On",
          text: "Check out my virtual try-on look!"
        });

      } catch (err) {

        console.log(err);

      }

    } else {

      alert("Sharing not supported on this device.");

    }
  };

  // =========================
  // WHATSAPP
  // =========================
  const shareWhatsApp = () => {

    const text =
      "Check out my Virtual Try-On look!";

    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  // =========================
  // FACEBOOK
  // =========================
  const shareFacebook = () => {

    window.open(
      "https://facebook.com",
      "_blank"
    );
  };

  // =========================
  // MESSENGER
  // =========================
  const shareMessenger = () => {

    window.open(
      "https://messenger.com",
      "_blank"
    );
  };

  return (

    <div
      className="modal-overlay"
      onClick={onClose}
    >

      <div
        className="screenshot-modal"
        onClick={(e) => e.stopPropagation()}
      >

        {/* CLOSE */}
        <button
          className="close-button"
          onClick={onClose}
        >
          &times;
        </button>

        <h2>Screenshot Preview</h2>

        {/* IMAGE */}
        <img
          src={image}
          alt="Screenshot"
          className="screenshot-preview"
        />

        {/* BUTTONS */}
        <div className="screenshot-buttons">

          <button
            className="button-primary"
            onClick={saveImage}
          >
            Save Image
          </button>

          <button
            className="button-secondary"
            onClick={shareImage}
          >
            Share
          </button>

          <button
            className="button-secondary"
            onClick={shareWhatsApp}
          >
            WhatsApp
          </button>

          <button
            className="button-secondary"
            onClick={shareFacebook}
          >
            Facebook
          </button>

          <button
            className="button-secondary"
            onClick={shareMessenger}
          >
            Messenger
          </button>

          <button
            className="button-primary"
            onClick={onRetake}
          >
            Retake
          </button>

        </div>

      </div>

    </div>
  );
}

export default ScreenshotModal;