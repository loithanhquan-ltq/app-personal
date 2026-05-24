"use client";

import { useEffect, useRef } from "react";
import { stripeParams } from "@/lib/stripedHash";

export function StripedPlaceholder({
  slotId,
  width,
  height,
  borderRadius = 10,
}: {
  slotId: string;
  width: number;
  height: number;
  borderRadius?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { hue, angle } = stripeParams(slotId);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const bands = [
      `hsl(${hue}, 18%, 86%)`,
      `hsl(${hue}, 22%, 78%)`,
      `hsl(${hue}, 12%, 92%)`,
    ];

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((angle * Math.PI) / 180);

    const diag = Math.sqrt(width * width + height * height);
    const stripeW = 18;
    const count = Math.ceil(diag / stripeW) + 2;

    for (let i = -count; i <= count; i++) {
      ctx.fillStyle = bands[Math.abs(i) % bands.length];
      ctx.fillRect(i * stripeW - diag, -diag, stripeW, diag * 2);
    }

    ctx.restore();

    // Radial overlay
    const grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, diag / 2);
    grad.addColorStop(0, "rgba(255,255,255,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.10)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }, [slotId, width, height, hue, angle]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display: "block", borderRadius, width: "100%", height: "100%" }}
    />
  );
}
