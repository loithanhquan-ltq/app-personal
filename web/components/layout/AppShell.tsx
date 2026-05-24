"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Toast } from "./Toast";
import { TokenSetupModal } from "@/components/github/TokenSetupModal";

export function AppShell({ children }: { children: React.ReactNode }) {
  const syncRemotePhotos = useAppStore((s) => s.syncRemotePhotos);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const language = useAppStore((s) => s.language);

  useEffect(() => {
    syncRemotePhotos();
  }, [syncRemotePhotos]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || !e.shiftKey) return;
      if (e.key === "E" || e.key === "e") { e.preventDefault(); setLanguage("en"); }
      if (e.key === "F" || e.key === "f") { e.preventDefault(); setLanguage("fr"); }
      if (e.key === "V" || e.key === "v") { e.preventDefault(); setLanguage("vi"); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setLanguage, language]);

  return (
    <div style={{ display: "flex", height: "100%", background: "var(--color-bg)" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar />
        <main style={{ flex: 1, overflowY: "auto", position: "relative" }}>
          {children}
        </main>
      </div>
      <Toast />
      <TokenSetupModal />
    </div>
  );
}
