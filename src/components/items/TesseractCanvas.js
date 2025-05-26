"use client";
import React, { useRef, useEffect, useMemo } from "react";

// ─── TESSERACT CANVAS ──────────────────────────────────────────────────────────
export default function TesseractCanvas() {
  // ─── CANVAS REF ─────────────────────────────────────────────────────────────
  const canvasRef = useRef(null);

  // ─── VERTEX + EDGE DATA (STATIC) ────────────────────────────────────────────
  const tesseractVertices = useMemo(() => {
    const points = [];
    for (let x = -1; x <= 1; x += 2) {
      for (let y = -1; y <= 1; y += 2) {
        for (let z = -1; z <= 1; z += 2) {
          for (let w = -1; w <= 1; w += 2) {
            points.push([x, y, z, w]);
          }
        }
      }
    }
    return points;
  }, []);

  const tesseractEdges = useMemo(() => {
    const edges = [];
    for (let i = 0; i < tesseractVertices.length; i++) {
      for (let j = i + 1; j < tesseractVertices.length; j++) {
        const [x1, y1, z1, w1] = tesseractVertices[i];
        const [x2, y2, z2, w2] = tesseractVertices[j];
        let diff = 0;
        if (x1 !== x2) diff++;
        if (y1 !== y2) diff++;
        if (z1 !== z2) diff++;
        if (w1 !== w2) diff++;
        if (diff === 1) edges.push([i, j]);
      }
    }
    return edges;
  }, [tesseractVertices]);

  // ─── ONE-TIME SETUP ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // ── CONFIG ────────────────────────────────────────────────────────────────
    const CONFIG = {
      backgroundColor: "#000",
      nodeColor: "#0ff",
      dotSize: 9,
      showEdges: false,
      edgeColor: "#ff0",
      lineWidth: 0.0,
      fadeAlpha: 0.0658,
      rotationSpeedRange: [0.0023, 0.00181],
      scaleFactor: 0.6,
    };
    const {
      backgroundColor,
      nodeColor,
      dotSize,
      showEdges,
      edgeColor,
      lineWidth,
      fadeAlpha,
      rotationSpeedRange,
      scaleFactor,
    } = CONFIG;

    // ── RESIZE HANDLER (NO RERENDER) ─────────────────────────────────────────
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // ── RANDOM ROTATION SPEEDS ───────────────────────────────────────────────
    const [minSpeed, maxSpeed] = rotationSpeedRange;
    const randSpeed = () =>
      (Math.random() < 0.5 ? -1 : 1) *
      (Math.random() * (maxSpeed - minSpeed) + minSpeed);

    let angleXY = 0,
      angleXZ = 0,
      angleYZ = 0,
      angleXW = 0,
      angleYW = 0,
      angleZW = 0;
    const speedXY = randSpeed();
    const speedXZ = randSpeed();
    const speedYZ = randSpeed();
    const speedXW = randSpeed();
    const speedYW = randSpeed();
    const speedZW = randSpeed();

    let animationId;

    // ── 4D ROTATION ──────────────────────────────────────────────────────────
    function rotate4D([x, y, z, w], angle, plane) {
      let x2 = x,
        y2 = y,
        z2 = z,
        w2 = w;
      switch (plane) {
        case "XY":
          x2 = x * Math.cos(angle) - y * Math.sin(angle);
          y2 = x * Math.sin(angle) + y * Math.cos(angle);
          break;
        case "XZ":
          x2 = x * Math.cos(angle) - z * Math.sin(angle);
          z2 = x * Math.sin(angle) + z * Math.cos(angle);
          break;
        case "YZ":
          y2 = y * Math.cos(angle) - z * Math.sin(angle);
          z2 = y * Math.sin(angle) + z * Math.cos(angle);
          break;
        case "XW":
          x2 = x * Math.cos(angle) - w * Math.sin(angle);
          w2 = x * Math.sin(angle) + w * Math.cos(angle);
          break;
        case "YW":
          y2 = y * Math.cos(angle) - w * Math.sin(angle);
          w2 = y * Math.sin(angle) + w * Math.cos(angle);
          break;
        case "ZW":
          z2 = z * Math.cos(angle) - w * Math.sin(angle);
          w2 = z * Math.sin(angle) + w * Math.cos(angle);
          break;
        default:
          break;
      }
      return [x2, y2, z2, w2];
    }

    // ── 4D→2D PROJECTION ─────────────────────────────────────────────────────
    function project([x0, y0, z0, w0]) {
      const wFactor = 2 / (2 - w0);
      let x = x0 * wFactor;
      let y = y0 * wFactor;
      let z = z0 * wFactor;

      const zFactor = 2 / (2 - z);
      x *= zFactor;
      y *= zFactor;

      const scale = Math.min(canvas.width, canvas.height) * scaleFactor;
      return [
        x * scale + canvas.width / 2,
        y * scale + canvas.height / 2,
      ];
    }

    // ── ANIMATION LOOP ───────────────────────────────────────────────────────
    function animate() {
      animationId = requestAnimationFrame(animate);

      // Advance angles
      angleXY += speedXY;
      angleXZ += speedXZ;
      angleYZ += speedYZ;
      angleXW += speedXW;
      angleYW += speedYW;
      angleZW += speedZW;

      // Fade previous frame
      ctx.fillStyle = `rgba(0,0,0,${fadeAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Project all vertices
      const projected = tesseractVertices.map((v) => {
        let p = rotate4D(v, angleXY, "XY");
        p = rotate4D(p, angleXZ, "XZ");
        p = rotate4D(p, angleYZ, "YZ");
        p = rotate4D(p, angleXW, "XW");
        p = rotate4D(p, angleYW, "YW");
        p = rotate4D(p, angleZW, "ZW");
        return project(p);
      });

      // Draw edges if enabled
      if (showEdges) {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = edgeColor;
        tesseractEdges.forEach(([i, j]) => {
          const [x1, y1] = projected[i];
          const [x2, y2] = projected[j];
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        });
      }

      // Draw nodes
      ctx.fillStyle = nodeColor;
      projected.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // ── INITIAL BACKGROUND + START LOOP ──────────────────────────────────────
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animate();

    // ── CLEANUP ──────────────────────────────────────────────────────────────
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <canvas
      ref={canvasRef}
      className="login-container-splash"
      style={{ display: "block" }}
    />
  );
}
