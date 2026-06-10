  import { useCallback, useEffect, useRef, useState } from "react";
  import { useLocation } from "react-router-dom";

  import Navbar from "../components/Navbar";
  import Footer from "../components/Footer";
  import ScreenshotModal from "../components/ScreenshotModal";

  import { FaceMesh } from "@mediapipe/face_mesh";
  import { Camera } from "@mediapipe/camera_utils";

  import "../styles/styles.css";

  const smoothValue = (
    previous,
    current,
    smoothness = 0.75
  ) => (
    previous * smoothness +
    current * (1 - smoothness)
  );

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

    if (!selectedProduct) {
      overlayImageRef.current = null;
      return;
    }

    const img = new Image();

  img.crossOrigin = "anonymous";

  img.src = selectedProduct.image;

      img.onload = () => {

        overlayImageRef.current = img;
      };

    }, [selectedProduct]);

    // =========================
    // DRAW RESULTS
    // =========================
    const previousPositionsRef = useRef({
      glasses: {
        x: 0,
        y: 0,
        angle: 0
      },
      hat: {
        x: 0,
        y: 0,
        angle: 0
      },
      earring: {
        x: 0,
        y: 0
      }
    });

  // =========================
  // DRAW RESULTS
  // =========================
  const onResults = useCallback((results) => {
    const previousPositions =
      previousPositionsRef.current;

    const canvasElement =
      canvasRef.current;

    if (!canvasElement) return;

    const canvasCtx =
      canvasElement.getContext(
        "2d",
        {
          willReadFrequently: true
        }
      );

    const img =
      overlayImageRef.current;

    canvasCtx.save();

    canvasCtx.clearRect(
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    // =========================
    // DRAW CAMERA
    // =========================
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    if (!img) {
      canvasCtx.restore();
      return;
    }

    // =========================
    // LANDMARKS
    // =========================
    if (results.multiFaceLandmarks) {

      for (const landmarks of results.multiFaceLandmarks) {

        const w =
          canvasElement.width;

        const h =
          canvasElement.height;

       // =====================================
// 👓 GLASSES
// =====================================
if (
  selectedProduct &&
  selectedProduct.category === "glasses"
) {

  // =====================================
  // LANDMARKS
  // =====================================
  const leftEye =
    landmarks[33];

  const rightEye =
    landmarks[263];

  const noseBridge =
    landmarks[168];

  const leftTemple =
    landmarks[127];

  const rightTemple =
    landmarks[356];

  // =====================================
  // COORDINATES
  // =====================================
  const leftX =
    leftEye.x * w;

  const leftY =
    leftEye.y * h;

  const rightX =
    rightEye.x * w;

  const rightY =
    rightEye.y * h;

  const noseX =
    noseBridge.x * w;

  const noseY =
    noseBridge.y * h;

  const leftTempleX =
    leftTemple.x * w;

  const rightTempleX =
    rightTemple.x * w;

  // =====================================
  // FACE WIDTH
  // =====================================
  const faceWidth =
    Math.abs(
      rightTempleX -
      leftTempleX
    );

  // =====================================
  // EYE DISTANCE
  // =====================================
  const eyeDistance =
    Math.abs(
      rightX - leftX
    );

  // =====================================
  // FACE ROTATION
  // =====================================
  const rotationFactor =
    Math.abs(
      leftTemple.x -
      rightTemple.x
    );

  // =====================================
  // WIDTH
  // =====================================
  let width =
    faceWidth * 1.02;

  // Compress slightly when head turns
  width *= (
    1 -
    (1 - rotationFactor) * 0.18
  );

  // Normalize
  width = Math.min(
    Math.max(width, 150),
    290
  );

  // =====================================
  // HEIGHT
  // =====================================
  const aspectRatio =
    img.height / img.width;

  const height =
    width * aspectRatio;

  // =====================================
  // POSITION
  // =====================================

  // Better nose anchoring
  let centerX =
    noseX;

  let centerY =
    noseY - (
      eyeDistance * 0.04
    );

  // =====================================
  // ROTATION
  // =====================================
  let angle =
    Math.atan2(
      rightY - leftY,
      rightX - leftX
    );

  // =====================================
  // FACE DEPTH ADJUSTMENT
  // =====================================
  const depthScale =
    eyeDistance / 120;

  centerY +=
    depthScale * 2;

  // =====================================
  // SMOOTHING
  // =====================================
  centerX = smoothValue(
    previousPositions.glasses.x,
    centerX,
    0.84
  );

  centerY = smoothValue(
    previousPositions.glasses.y,
    centerY,
    0.84
  );

  angle = smoothValue(
    previousPositions.glasses.angle,
    angle,
    0.88
  );

  previousPositions.glasses = {
    x: centerX,
    y: centerY,
    angle
  };

  // =====================================
  // DRAW
  // =====================================
  canvasCtx.save();

  // Better shadows
  canvasCtx.shadowColor =
    "rgba(0,0,0,0.30)";

  canvasCtx.shadowBlur = 12;

  canvasCtx.shadowOffsetY = 3;

  // Slight transparency
  canvasCtx.globalAlpha = 0.98;

  canvasCtx.translate(
    centerX,
    centerY
  );

  canvasCtx.rotate(angle);

  // Slight perspective compression
  canvasCtx.scale(
    1,
    0.98
  );

  canvasCtx.drawImage(
    img,
    -width / 2,
    -height / 2 + 10  ,
    width,
    height
  );

  canvasCtx.restore();
}

       // =====================================
// 💎 EARRINGS
// =====================================
if (
  selectedProduct &&
  selectedProduct.category === "earring"
) {

  // =====================================
  // LANDMARKS
  // =====================================
  const leftEar =
  landmarks[234 ];

const rightEar =
  landmarks[454];

  const nose =
    landmarks[1];

  const forehead =
    landmarks[10];

  // =====================================
  // COORDINATES
  // =====================================
  const leftX =
    leftEar.x * w;

  const leftY =
    leftEar.y * h;

  const rightX =
    rightEar.x * w;

  const rightY =
    rightEar.y * h;

  // =====================================
  // FACE WIDTH
  // =====================================
  const faceWidth =
    Math.abs(
      (rightEar.x - leftEar.x) * w
    );

  // =====================================
  // SMALL STUD SIZE
  // =====================================
  let size =
    faceWidth * 0.045;

  size = Math.min(
    Math.max(size, 10),
    22
  );

  // =====================================
  // HEAD ROTATION
  // =====================================
  const faceTurn =
    nose.x - forehead.x;

  // =====================================
  // LEFT VISIBILITY
  // =====================================
  let leftOpacity = 0;

  if (faceTurn > -0.015) {
    leftOpacity = Math.min(
      Math.abs(faceTurn) * 50,
      1
    );
  }

  // =====================================
  // RIGHT VISIBILITY
  // =====================================
  let rightOpacity = 0;

  if (faceTurn < 0.015) {
    rightOpacity = Math.min(
      Math.abs(faceTurn) * 50,
      1
    );
  }

  // =====================================
  // LEFT EARRING
  // =====================================
  if (leftOpacity > 0.05) {

    canvasCtx.save();

    canvasCtx.globalAlpha =
      leftOpacity;

    canvasCtx.shadowColor =
      "rgba(0,0,0,0.2)";

    canvasCtx.shadowBlur = 4;

    canvasCtx.drawImage(
      img,
      leftX - size * 0.55,
leftY + size * 0.38,
      size,
      size
    );

    canvasCtx.restore();
  }

  // =====================================
  // RIGHT EARRING
  // =====================================
  if (rightOpacity > 0.05) {

    canvasCtx.save();

    canvasCtx.globalAlpha =
      rightOpacity;

    canvasCtx.shadowColor =
      "rgba(0,0,0,0.2)";

    canvasCtx.shadowBlur = 4;

    canvasCtx.drawImage(
      img,
     rightX - size * 0.45,
rightY + size * 0.38,
      size,
      size
    );

    canvasCtx.restore();
  }
}

        // =====================================
// 🎩 HAT
// =====================================
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

  const leftEye =
    landmarks[33];

  const rightEye =
    landmarks[263];

  // =====================================
  // POSITION
  // =====================================
  let foreheadX =
    forehead.x * w;

  let foreheadY =
    forehead.y * h;

  // =====================================
  // FACE WIDTH
  // =====================================
  const faceWidth =
    Math.abs(
      (
        rightFace.x -
        leftFace.x
      ) * w
    );

  // =====================================
  // BETTER SCALING
  // =====================================
  let width =
    faceWidth * 1.08;

  // Better normalization
  width = Math.min(
    Math.max(width, 180),
    330
  );

  // Preserve PNG ratio
  const aspectRatio =
    img.height / img.width;

  // Fix flat/stretch issue
  const height =
    width *
    aspectRatio *
    0.92;

  // =====================================
  // HEAD ROTATION
  // =====================================
  let angle =
    Math.atan2(
      rightEye.y -
        leftEye.y,
      rightEye.x -
        leftEye.x
    );

  // Slight backward tilt
  angle -= 0.06;

  // =====================================
  // POSITIONING
  // =====================================

  // Raise hat higher
  foreheadY -= 8;

  // Slight backward offset
  foreheadX -= Math.sin(angle) * 8;

  // =====================================
  // SMOOTHING
  // =====================================
  foreheadX =
    smoothValue(
      previousPositions.hat.x,
      foreheadX,
      0.84
    );

  foreheadY =
    smoothValue(
      previousPositions.hat.y,
      foreheadY,
      0.84
    );

  angle =
    smoothValue(
      previousPositions.hat.angle,
      angle,
      0.86
    );

  previousPositions.hat = {
    x: foreheadX,
    y: foreheadY,
    angle
  };

  // =====================================
  // DRAW
  // =====================================
  canvasCtx.save();

  canvasCtx.shadowColor =
    "rgba(0,0,0,0.25)";

  canvasCtx.shadowBlur = 14;

  canvasCtx.shadowOffsetY = 4;

  canvasCtx.globalAlpha = 0.99;

  canvasCtx.translate(
    foreheadX,
    foreheadY
  );

  canvasCtx.rotate(angle);

  canvasCtx.drawImage(
    img,
    -width / 2,
    -height + 35,
    width,
    height
  );

  canvasCtx.restore();
}
      }
    }

    canvasCtx.restore();
  }, [selectedProduct]);
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

    }, [onResults]);

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
              aria-label="Previous product"
            >
              &lt;
            </button>

            <div className="current-product-banner">

              <p>Currently Trying</p>

              <h2>
                {selectedProduct?.name || "Choose a product first"}
              </h2>

            </div>

            <button
              className="switch-btn"
              onClick={nextProduct}
              aria-label="Next product"
            >
              &gt;
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
  />

            <p className="privacy-note">
              We do not store any image of you.
            </p>

            {/* SCREENSHOT BUTTON */}
            <button
              className="button-primary capture-btn"
              onClick={captureScreenshot}
            >
              Capture Screenshot
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
