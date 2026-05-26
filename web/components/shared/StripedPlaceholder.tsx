"use client";

export function StripedPlaceholder({
  slotId: _slotId,
  width: _width,
  height,
  borderRadius = 10,
}: {
  slotId: string;
  width: number;
  height: number;
  borderRadius?: number;
}) {
  const heartSize = Math.max(20, Math.round(height * 0.32));

  return (
    <div style={{
      width: "100%",
      height: "100%",
      borderRadius,
      background: "linear-gradient(135deg, #fdf8ec 0%, #f5ead8 55%, #ede0c8 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <span style={{
        fontSize: heartSize,
        color: "rgba(164,74,42,0.18)",
        lineHeight: 1,
        userSelect: "none",
      }}>♡</span>
    </div>
  );
}
