"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Toast } from "./Toast";
import { TokenSetupModal } from "@/components/github/TokenSetupModal";
import { DedicationOverlay } from "./DedicationOverlay";
import { PageTransition } from "./PageTransition";
import { BookIntro } from "@/components/intro/BookIntro";

export function AppShell({ children }: { children: React.ReactNode }) {
  const syncRemotePhotos = useAppStore((s) => s.syncRemotePhotos);
  const syncUserMemories = useAppStore((s) => s.syncUserMemories);
  const syncReactions = useAppStore((s) => s.syncReactions);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const language = useAppStore((s) => s.language);
  const introDismissed = useAppStore((s) => s.introDismissed);

  useEffect(() => {
    syncRemotePhotos();
    syncUserMemories();
    syncReactions();
  }, [syncRemotePhotos, syncUserMemories, syncReactions]);

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
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <Toast />
      <TokenSetupModal />
      {!introDismissed && <BookIntro />}
      {introDismissed && <DedicationOverlay />}
    </div>
  );
}
