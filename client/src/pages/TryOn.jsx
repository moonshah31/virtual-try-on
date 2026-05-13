import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScreenshotModal from "../components/ScreenshotModal";

import glassesImg from "../assets/accessories/glasses.png";

import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

import "../styles/styles.css";

function TryOn() {

  const location = useLocation();

  // =========================
  // PRODUCTS ARRAY
  // =========================
  const products =
    location.state?.products || [];

  const initialProduct =
    location.state?.product || null;

  // =========================
  // CURRENT PRODUCT INDEX
  // =========================
  const initialIndex = products.findIndex(
    (p) => p._id === initialProduct?._id
  );

  const [currentIndex, setCurrentIndex] = useState(
    initialIndex >= 0 ? initialIndex : 0
  );

  const selectedProduct =
    products.length > 0
      ? products[currentIndex]
      : initialProduct;

  // =========================
  // REFS
  // =========================
  const videoRef = useRef(null);

  const canvasRef = useRef(null);

  const overlayImageRef = useRef(null);

  // =========================
  // SCREENSHOT STATES
  // =========================
  const [capturedImage, setCapturedImage] =
    useState(null);

  const [showPreview, setShowPreview] =
    useState(false);

  // =========================
  // NEXT PRODUCT
  // =========================
  const nextProduct = () => {

    if (products.length === 0) return;

    setCurrentIndex((prev) =>
      prev === products.length - 1
        ? 0
        : prev + 1
    );
  };

  // =========================
  // PREVIOUS PRODUCT
  // =========================
  const prevProduct = () => {

    if (products.length === 0) return;

    setCurrentIndex((prev) =>
      prev === 0
        ? products.length - 1
        : prev - 1
    );
  };

  // =========================
  // SCREENSHOT
  // =========================
  const captureScreenshot = () => {

    const canvas = canvasRef.current;

    if (!canvas) return;

    const image =
      canvas.toDataURL("image/png");

    setCapturedImage(image);

    setShowPreview(true);
  };

  const retakeScreenshot = () => {

    setCapturedImage(null);

    setShowPreview(false);
  };

  // =========================
  // LOAD PRODUCT IMAGE
  // =========================
  useEffect(() => {

  const img = new Image();

img.crossOrigin = "anonymous";

img.src = selectedProduct
  ? selectedProduct.image
  : glassesImg;

    img.onload = () => {

      overlayImageRef.current = img;
    };

  }, [selectedProduct]);

  // =========================
  // DRAW RESULTS
  // =========================
  const onResults = (results) => {

    const canvasElement =
      canvasRef.current;

    if (!canvasElement) return;

    const canvasCtx = canvasElement.getContext(
  "2d",
  {
    willReadFrequently: true
  }
);

    const img =
      overlayImageRef.current;

    if (!img) return;

    canvasCtx.save();

    canvasCtx.clearRect(
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    // =========================
    // CAMERA FEED
    // =========================
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    // =========================
    // FACE LANDMARKS
    // =========================
    if (results.multiFaceLandmarks) {

      for (const landmarks of results.multiFaceLandmarks) {

        const w = canvasElement.width;

        const h = canvasElement.height;

        // =========================
        // 👓 GLASSES
        // =========================
        if (
          !selectedProduct ||
          selectedProduct.category === "glasses"
        ) {

          const leftEye = landmarks[33];

          const rightEye = landmarks[263];

          const leftX = leftEye.x * w;

          const leftY = leftEye.y * h;

          const rightX = rightEye.x * w;

          const rightY = rightEye.y * h;

          const eyeDistance =
            Math.abs(rightX - leftX);

          const width =
            eyeDistance * 2;

          const height =
            width * 0.5;

          const centerX =
            (leftX + rightX) / 2;

          const centerY =
            (leftY + rightY) / 2;

          const angle = Math.atan2(
            rightY - leftY,
            rightX - leftX
          );

          canvasCtx.save();

          canvasCtx.translate(
            centerX,
            centerY
          );

          canvasCtx.rotate(angle);

          canvasCtx.drawImage(
            img,
            -width / 2,
            -height / 2,
            width,
            height
          );

          canvasCtx.restore();
        }

        // =========================
        // 💎 EARRINGS
        // =========================
        if (
          selectedProduct &&
          selectedProduct.category === "earring"
        ) {

          const leftEar =
            landmarks[177];

          const rightEar =
            landmarks[401];

          const leftX =
            leftEar.x * w;

          const leftY =
            leftEar.y * h;

          const rightX =
            rightEar.x * w;

          const rightY =
            rightEar.y * h;

          const faceWidth =
            Math.abs(
              (landmarks[454].x -
                landmarks[234].x) * w
            );

          const size =
            faceWidth * 0.12;

          // LEFT
          canvasCtx.drawImage(
            img,
            leftX - size / 2,
            leftY + size * 0.2,
            size,
            size
          );

          // RIGHT
          canvasCtx.save();

          canvasCtx.translate(
            rightX,
            rightY + size * 0.2
          );

          canvasCtx.scale(-1, 1);

          canvasCtx.drawImage(
            img,
            -size / 2,
            0,
            size,
            size
          );

          canvasCtx.restore();
        }

        // =========================
        // 🎩 HAT
        // =========================
        if (
          selectedProduct &&
          selectedProduct.category === "hat"
        ) {

          const forehead =
            landmarks[10];

          const leftFace =
            landmarks[234];

          const rightFace =
            landmarks[454];

          const foreheadX =
            forehead.x * w;

          const foreheadY =
            forehead.y * h;

          const faceWidth =
            Math.abs(
              (rightFace.x -
                leftFace.x) * w
            );

          const width =
            faceWidth * 1.5;

          const height =
            width * 0.8;

          canvasCtx.drawImage(
            img,
            foreheadX - width / 2,
            foreheadY - height + 20,
            width,
            height
          );
        }
      }
    }

    canvasCtx.restore();
  };

  // =========================
  // START FACEMESH
  // =========================
  useEffect(() => {

    if (!videoRef.current) return;

    const faceMesh =
      new FaceMesh({

        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });

    faceMesh.setOptions({

      maxNumFaces: 1,

      refineLandmarks: true,

      minDetectionConfidence: 0.5,

      minTrackingConfidence: 0.5
    });

    faceMesh.onResults(onResults);

    const camera =
      new Camera(videoRef.current, {

        onFrame: async () => {

          await faceMesh.send({
            image: videoRef.current
          });
        },

        width: 640,

        height: 480
      });

    camera.start();

    return () => {

      camera.stop();
    };

  }, [selectedProduct]);

  return (
    <>
      <Navbar />

      <div className="container">
 <div className="tryon-wrapper">
        <h1>Virtual Try-On</h1>

        {/* ========================= */}
        {/* PRODUCT SWITCHER */}
        {/* ========================= */}
        <div className="product-switcher">

          <button
            className="switch-btn"
            onClick={prevProduct}
          >
            ◀
          </button>

          <div className="current-product-banner">

            <p>Currently Trying</p>

            <h2>
              {selectedProduct?.name}
            </h2>

          </div>

          <button
            className="switch-btn"
            onClick={nextProduct}
          >
            ▶
          </button>

        </div>

        {/* ========================= */}
        {/* TRY ON AREA */}
        {/* ========================= */}
        <div className="tryon-container">

          {/* HIDDEN VIDEO */}
          <video
            ref={videoRef}
            style={{ display: "none" }}
          />

          {/* CANVAS */}
       <canvas
  ref={canvasRef}
  width="640"
  height="480"
  className="tryon-video"
  willReadFrequently="true"
/>

          {/* SCREENSHOT BUTTON */}
          <button
            className="button-primary capture-btn"
            onClick={captureScreenshot}
          >
            📸 Capture Screenshot
          </button>

        </div>
      </div>
</div>
      <Footer />

      {/* ========================= */}
      {/* SCREENSHOT MODAL */}
      {/* ========================= */}
      <ScreenshotModal
        image={capturedImage}
        isOpen={showPreview}
        onClose={() =>
          setShowPreview(false)
        }
        onRetake={retakeScreenshot}
      />
    </>
  );
}

export default TryOn;