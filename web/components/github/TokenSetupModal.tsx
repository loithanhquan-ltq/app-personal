"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";

export function TokenSetupModal() {
  const showGitHubSetup = useAppStore((s) => s.showGitHubSetup);
  const setShowGitHubSetup = useAppStore((s) => s.setShowGitHubSetup);
  const setGithubToken = useAppStore((s) => s.setGithubToken);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!showGitHubSetup) return null;

  async function handleConnect() {
    if (!token.trim()) return;
    setLoading(true);
    setError("");
    const ok = await setGithubToken(token.trim());
    setLoading(false);
    if (!ok) setError("Token invalid or no access to the repository. Check your PAT and try again.");
    else setToken("");
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10000,
      background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}
      onClick={() => setShowGitHubSetup(false)}
    >
      <div
        style={{
          width: 480, background: "var(--color-card)",
          borderRadius: 14, padding: 28,
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          border: "0.5px solid var(--color-rule)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontStyle: "italic", fontWeight: 600, margin: 0 }}>
            Connect GitHub
          </h2>
          <button onClick={() => setShowGitHubSetup(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--color-ink3)" }}>×</button>
        </div>

        <p style={{ fontFamily: "var(--font-serif)", fontSize: 14, fontStyle: "italic", color: "var(--color-ink2)", marginBottom: 16 }}>
          Connect a GitHub Personal Access Token to sync photos to the repository.
        </p>

        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleConnect()}
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          style={{
            width: "100%", padding: "10px 12px",
            borderRadius: 8, border: "1px solid var(--color-rule)",
            background: "var(--color-bg)",
            fontFamily: "var(--font-mono)", fontSize: 13,
            color: "var(--color-ink)",
            outline: "none",
            marginBottom: 8,
            boxSizing: "border-box",
          }}
        />

        {error && (
          <p style={{ color: "rgba(180,40,20,0.85)", fontFamily: "var(--font-sans)", fontSize: 12, marginBottom: 12 }}>
            {error}
          </p>
        )}

        <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--color-ink3)", marginBottom: 20 }}>
          Create a PAT at GitHub → Settings → Developer settings → Personal access tokens.
          Needs <code>contents: write</code> permission for the repository.
          Stored in your browser&apos;s localStorage.
        </p>

        <button
          onClick={handleConnect}
          disabled={!token.trim() || loading}
          style={{
            width: "100%", padding: "10px",
            borderRadius: 8,
            background: token.trim() && !loading ? "var(--color-accent)" : "rgba(164,74,42,0.3)",
            border: "none", cursor: token.trim() && !loading ? "pointer" : "not-allowed",
            fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600,
            color: "#fff",
          }}
        >
          {loading ? "Verifying…" : "Connect"}
        </button>
      </div>
    </div>
  );
}
