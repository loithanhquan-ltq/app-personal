"use client";

import { useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { StripedPlaceholder } from "./StripedPlaceholder";

export function PhotoSlot({
  slotId,
  height = 220,
  borderRadius = 10,
  width = 400,
}: {
  slotId: string;
  height?: number;
  borderRadius?: number;
  width?: number;
}) {
  const photos = useAppStore((s) => s.photos);
  const uploadingSlots = useAppStore((s) => s.uploadingSlots);
  const uploadErrors = useAppStore((s) => s.uploadErrors);
  const setPhoto = useAppStore((s) => s.setPhoto);
  const clearPhoto = useAppStore((s) => s.clearPhoto);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const photoUrl = photos[slotId];
  const isUploading = uploadingSlots.includes(slotId);
  const uploadError = uploadErrors[slotId];

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    await setPhoto(slotId, file);
  }

  return (
    <div
      style={{
        position: "relative",
        height,
        borderRadius,
        overflow: "hidden",
        cursor: "pointer",
        border: isDragOver ? `2px dashed var(--color-accent)` : "none",
        flexShrink: 0,
      }}
      onClick={() => inputRef.current?.click()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
    >
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <StripedPlaceholder slotId={slotId} width={width} height={height} borderRadius={0} />
      )}

      {isDragOver && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center",
          justifyContent: "center", background: "rgba(164,74,42,0.15)",
        }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-accent)", fontWeight: 600 }}>
            Drop to set photo
          </span>
        </div>
      )}

      {!photoUrl && !isDragOver && isHovered && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center",
          justifyContent: "center", background: "rgba(0,0,0,0.06)",
        }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-ink2)", fontWeight: 500 }}>
            Click to add photo
          </span>
        </div>
      )}

      {/* Status badges */}
      {isUploading && (
        <div style={badgeStyle}>
          <span style={{ fontSize: 11 }}>⟳</span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 11 }}>Syncing…</span>
        </div>
      )}
      {uploadError && !isUploading && (
        <div style={{ ...badgeStyle, background: "rgba(200,60,20,0.9)", color: "#fff" }}>
          <span>⚠</span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 11 }}>Upload failed</span>
        </div>
      )}
      {photoUrl && photoUrl.startsWith("blob:") && !isUploading && !uploadError && (
        <div style={badgeStyle}>
          <span>☁</span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 11 }}>Not synced</span>
        </div>
      )}

      {/* Remove button */}
      {photoUrl && isHovered && !isUploading && (
        <button
          onClick={(e) => { e.stopPropagation(); clearPhoto(slotId); }}
          style={{
            position: "absolute", bottom: 8, right: 8,
            background: "rgba(255,255,255,0.90)",
            border: "none", borderRadius: 6, padding: "3px 8px",
            fontFamily: "var(--font-sans)", fontSize: 11, cursor: "pointer",
            color: "var(--color-ink)",
          }}
        >
          Remove
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}

const badgeStyle: React.CSSProperties = {
  position: "absolute", top: 8, right: 8,
  display: "flex", alignItems: "center", gap: 4,
  padding: "4px 8px",
  borderRadius: 6,
  background: "rgba(255,255,255,0.90)",
  color: "var(--color-ink2)",
  boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
};
