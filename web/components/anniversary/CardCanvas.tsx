"use client";

import { useEffect, useRef } from "react";
import { renderCard, type CardOptions } from "@/lib/cardRender";

interface Props {
  opts: CardOptions;
  onRendered?: (blob: Blob) => void;
}

export function CardCanvas({ opts, onRendered }: Props) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    renderCard(opts).then((blob) => {
      if (cancelled || !divRef.current) return;
      const url = URL.createObjectURL(blob);
      const img = divRef.current.querySelector("img") as HTMLImageElement | null;
      if (img) img.src = url;
      onRendered?.(blob);
    }).catch(console.error);
    return () => { cancelled = true; };
  }, [opts, onRendered]);

  return (
    <div ref={divRef} style={{ width: "100%", aspectRatio: "1080/1350", borderRadius: 12, overflow: "hidden", background: "#f0e8d8" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="Anniversary card preview" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  );
}
