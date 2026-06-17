import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import Navbar from "../components/navbar.jsx";
import Footer from "../components/footer.jsx";
import ScreenshotModal from "../components/ScreenshotModal.jsx";

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

// =========================
// HELPERS — Hat vs Cap
// =========================
const isCapStyle = (product) => {
  if (!product) return false;
  if (product.type) return product.type.toLowerCase() === "cap";
  const name = product.name?.toLowerCase() ?? "";
  return (
    name.includes("cap") ||
    name.includes("snapback") ||
    name.includes("baseball") ||
    name.includes("trucker")
  );
};

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

  // =====================================================
  // FIX ✅ — "LATEST VALUE" REF FOR selectedProduct
  //
  // ROOT CAUSE OF THE FLICKER:
  // `onResults` used to be re-created via useCallback every
  // time `selectedProduct` changed, and it was only handed to
  // FaceMesh inside a *separate* `useEffect`. Effects run AFTER
  // React commits the render, and the MediaPipe camera loop is
  // driven by its own requestAnimationFrame cycle — so there was
  // always a window of one or more frames where the camera was
  // still invoking the OLD `onResults` closure (old category,
  // old sizing) even though the product banner had already
  // switched to the new product. That's exactly the "new product
  // briefly renders at the old product's size/position" symptom.
  //
  // FIX: keep a ref that is written directly in the render body
  // (not inside an effect), so it is always in sync the instant
  // React re-renders — no effect-timing gap at all. `onResults`
  // now reads `selectedProductRef.current` instead of closing
  // over `selectedProduct`, so it never goes stale and never
  // needs to be re-registered with FaceMesh.
  // =====================================================
  const selectedProductRef = useRef(selectedProduct);

  // =========================
  // REFS
  // =========================
  const videoRef = useRef(null);

  const canvasRef = useRef(null);

  const overlayImageRef = useRef(null);

  // =====================================================
  // FIX ✅ — SNAP FLAGS (prevents smoothing from dragging
  // a NEW product in from the OLD product's last position)
  //
  // `previousPositionsRef` is reused across products so that
  // each product transitions smoothly frame-to-frame. But when
  // the product itself changes, blending toward the old stored
  // x/y/angle would visibly drag the new overlay across the
  // screen for a few frames. These flags force the very first
  // frame after a switch to SNAP directly to the correct value
  // (no blending), then resume normal smoothing afterward.
  // =====================================================
  const positionsInitializedRef = useRef({
    glasses: false,
    hat: false
  });

  useLayoutEffect(() => {
    selectedProductRef.current = selectedProduct;
    positionsInitializedRef.current = {
      glasses: false,
      hat: false
    };
  }, [selectedProduct]);

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

  // =====================================================
  // FIX ✅ — LOAD PRODUCT IMAGE (race-safe)
  //
  // Two changes vs before:
  //   1. `overlayImageRef.current` is cleared the INSTANT the
  //      product changes (synchronously, before the new image
  //      starts loading) so the old image can never be drawn
  //      under the new product's category logic, even for a
  //      single frame.
  //   2. A `cancelled` flag guards the async `onload`. If the
  //      user flips through products quickly (e.g. cap → earring
  //      → glasses before the earring image has finished
  //      loading), the stale `onload` from the abandoned earring
  //      request can no longer overwrite the ref with the wrong
  //      image once a newer product has already been selected.
  // =====================================================
  useEffect(() => {

    overlayImageRef.current = null;

    if (!selectedProduct) {
      return;
    }

    let cancelled = false;

    const img = new Image();

    img.crossOrigin = "anonymous";

    img.onload = () => {
      if (!cancelled) {
        overlayImageRef.current = img;
      }
    };

    img.src = selectedProduct.image;

    return () => {
      cancelled = true;
    };

  }, [selectedProduct]);

  // =========================
  // PREVIOUS POSITIONS REF
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

  // =====================================================
  // DRAW RESULTS
  //
  // FIX ✅ — `useCallback` now has an EMPTY dependency array.
  // This function is created exactly once and handed to FaceMesh
  // exactly once. It reads `selectedProductRef.current` (always
  // fresh, see above) instead of closing over `selectedProduct`,
  // so there is no longer any "stale callback" window at all —
  // the very next processed camera frame reflects the new
  // product, with no in-between frame rendering the old one.
  // =====================================================
  const onResults = useCallback((results) => {

    const product = selectedProductRef.current;

    const previousPositions =
      previousPositionsRef.current;

    const canvasElement =
      canvasRef.current;

    if (!canvasElement) return;

    const canvasCtx =
      canvasElement.getContext("2d", {
        willReadFrequently: true
      });

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
    // DRAW CAMERA FEED
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

        const w = canvasElement.width;
        const h = canvasElement.height;

        // =============================================
        // 👓 GLASSES
        // =============================================
        if (
          product &&
          product.category === "glasses"
        ) {

          // LANDMARKS
          const leftEye     = landmarks[33];
          const rightEye    = landmarks[263];
          const noseBridge  = landmarks[168];
          const leftTemple  = landmarks[127];
          const rightTemple = landmarks[356];

          // PIXEL COORDINATES
          const leftX       = leftEye.x    * w;
          const leftY       = leftEye.y    * h;
          const rightX      = rightEye.x   * w;
          const rightY      = rightEye.y   * h;
          const noseX       = noseBridge.x * w;
          const noseY       = noseBridge.y * h;
          const leftTempleX = leftTemple.x  * w;
          const rightTempleX= rightTemple.x * w;

          const faceWidth =
            Math.abs(rightTempleX - leftTempleX);

          const eyeDistance =
            Math.abs(rightX - leftX);

          const rotationFactor =
            Math.abs(leftTemple.x - rightTemple.x);

          let width = faceWidth * 1.22;

          width *= (1 - (1 - rotationFactor) * 0.15);

          width = Math.min(Math.max(width, 60), 520);

          const aspectRatio = img.height / img.width;
          const height      = width * aspectRatio;

          let centerX = noseX;
          let centerY = noseY - (eyeDistance * 0.04);

          let angle = Math.atan2(
            rightY - leftY,
            rightX - leftX
          );

          const depthScale = eyeDistance / 120;
          centerY += depthScale * 2;

          // ───────────────────────────────────────
          // FIX ✅ — snap on first frame after switch
          // ───────────────────────────────────────
          if (!positionsInitializedRef.current.glasses) {
            previousPositions.glasses = { x: centerX, y: centerY, angle };
            positionsInitializedRef.current.glasses = true;
          } else {
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
          }

          // DRAW
          canvasCtx.save();
          canvasCtx.shadowColor    = "rgba(0,0,0,0.30)";
          canvasCtx.shadowBlur     = 12;
          canvasCtx.shadowOffsetY  = 3;
          canvasCtx.globalAlpha    = 0.98;
          canvasCtx.translate(centerX, centerY);
          canvasCtx.rotate(angle);
          canvasCtx.scale(1, 0.98);
          canvasCtx.drawImage(
            img,
            -width / 2,
            -height / 2 + 10,
            width,
            height
          );
          canvasCtx.restore();
        }

        // =============================================
        // 💎 EARRINGS
        // =============================================
        if (
          product &&
          product.category === "earring"
        ) {

          const leftEar  = landmarks[234];
          const rightEar = landmarks[454];
          const nose     = landmarks[1];
          const forehead = landmarks[10];

          const leftX  = leftEar.x  * w;
          const leftY  = leftEar.y  * h;
          const rightX = rightEar.x * w;
          const rightY = rightEar.y * h;

          const faceWidth =
            Math.abs((rightEar.x - leftEar.x) * w);

          let size = faceWidth * 0.045;
          size = Math.min(Math.max(size, 10), 22);

          const faceTurn = nose.x - forehead.x;

          let leftOpacity = 0;
          if (faceTurn > -0.015) {
            leftOpacity = Math.min(
              Math.abs(faceTurn) * 50,
              1
            );
          }

          let rightOpacity = 0;
          if (faceTurn < 0.015) {
            rightOpacity = Math.min(
              Math.abs(faceTurn) * 50,
              1
            );
          }

          // LEFT EARRING
          if (leftOpacity > 0.05) {
            canvasCtx.save();
            canvasCtx.globalAlpha   = leftOpacity;
            canvasCtx.shadowColor   = "rgba(0,0,0,0.2)";
            canvasCtx.shadowBlur    = 4;

            const leftDrawX = leftX - size * 0.55 - 8;
            const leftDrawY = leftY + size * 0.38 + 10;

            canvasCtx.drawImage(
              img,
              leftDrawX,
              leftDrawY,
              size,
              size
            );
            canvasCtx.restore();
          }

          // RIGHT EARRING
          if (rightOpacity > 0.05) {
            canvasCtx.save();
            canvasCtx.globalAlpha   = rightOpacity;
            canvasCtx.shadowColor   = "rgba(0,0,0,0.2)";
            canvasCtx.shadowBlur    = 4;

            const rightDrawX = rightX - size * 0.45 + 8;
            const rightDrawY = rightY + size * 0.38 + 10;

            canvasCtx.drawImage(
              img,
              rightDrawX,
              rightDrawY,
              size,
              size
            );
            canvasCtx.restore();
          }
        }

        // =============================================
        // 🎩 HAT  /  🧢 CAP
        // =============================================
        if (
          product &&
          product.category === "hat"
        ) {

          const forehead  = landmarks[10];
          const leftFace  = landmarks[234];
          const rightFace = landmarks[454];
          const leftEye   = landmarks[33];
          const rightEye  = landmarks[263];

          let foreheadX = forehead.x * w;
          let foreheadY = forehead.y * h;

          const faceWidth =
            Math.abs((rightFace.x - leftFace.x) * w);

          const cap = isCapStyle(product);

          const sizeMultiplier = cap ? 1.22 : 1.85;

          let width = faceWidth * sizeMultiplier;

          width = Math.max(width, 80);

          const aspectRatio = img.height / img.width;
          const height      = width * aspectRatio * 0.89;

          let angle = Math.atan2(
            rightEye.y - leftEye.y,
            rightEye.x - leftEye.x
          );

          foreheadY -= 4;
          foreheadX -= Math.sin(angle) * 8;

          // ───────────────────────────────────────
          // FIX ✅ — snap on first frame after switch
          // ───────────────────────────────────────
          if (!positionsInitializedRef.current.hat) {
            previousPositions.hat = { x: foreheadX, y: foreheadY, angle };
            positionsInitializedRef.current.hat = true;
          } else {
            foreheadX = smoothValue(
              previousPositions.hat.x,
              foreheadX,
              0.84
            );
            foreheadY = smoothValue(
              previousPositions.hat.y,
              foreheadY,
              0.84
            );
            angle = smoothValue(
              previousPositions.hat.angle,
              angle,
              0.86
            );

            previousPositions.hat = {
              x: foreheadX,
              y: foreheadY,
              angle
            };
          }

          // DRAW
          canvasCtx.save();
          canvasCtx.shadowColor   = "rgba(0,0,0,0.25)";
          canvasCtx.shadowBlur    = 14;
          canvasCtx.shadowOffsetY = 4;
          canvasCtx.globalAlpha   = 0.99;
          canvasCtx.translate(foreheadX, foreheadY);
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

  }, []);

  // =========================
  // START FACEMESH
  // =========================
  useEffect(() => {

    if (!videoRef.current) return;

    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    faceMesh.setOptions({
      maxNumFaces:           1,
      refineLandmarks:       true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence:  0.5
    });

    faceMesh.onResults(onResults);

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await faceMesh.send({ image: videoRef.current });
      },
      width:  640,
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
          {/* PRODUCT SWITCHER          */}
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
          {/* TRY ON AREA               */}
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
      {/* SCREENSHOT MODAL          */}
      {/* ========================= */}
      <ScreenshotModal
        image={capturedImage}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onRetake={retakeScreenshot}
      />
    </>
  );
}

export default TryOn;
