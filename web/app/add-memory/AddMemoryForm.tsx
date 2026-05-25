"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { newMemoryId, formatDateLabel, dateToSortKey } from "@/lib/githubMemories";
import { PhotoSlot } from "@/components/shared/PhotoSlot";
import type { Memory } from "@/data/types";

/* ── shared input styles ─────────────────────────────────────── */
const base = {
  fontFamily: "var(--font-serif)",
  fontSize: 15,
  color: "var(--color-ink)",
  background: "var(--color-bg)",
  border: "1px solid var(--color-rule)",
  borderRadius: 8,
  padding: "10px 13px",
  width: "100%",
  outline: "none",
  boxSizing: "border-box" as const,
  transition: "border-color 0.15s, box-shadow 0.15s",
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
    letterSpacing: "0.14em", textTransform: "uppercase",
    color: "var(--color-ink3)", marginBottom: 10,
  }}>
    {children}
  </div>
);

const Divider = () => (
  <div style={{ borderTop: "1px solid var(--color-rule)", margin: "28px 0" }} />
);

/* ── focused input wrapper ───────────────────────────────────── */
function Field({
  label, children, half,
}: { label: string; children: React.ReactNode; half?: boolean }) {
  return (
    <div style={{ flex: half ? "1 1 160px" : "1 1 100%", minWidth: 0 }}>
      <SectionLabel>{label}</SectionLabel>
      {children}
    </div>
  );
}

/* ── focus ring via state, since inline :focus doesn't work ─── */
function FocusInput({ style, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{
        ...base, ...style,
        boxShadow: focused ? "0 0 0 2.5px rgba(164,74,42,0.18)" : "none",
        borderColor: focused ? "rgba(164,74,42,0.5)" : "var(--color-rule)",
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function FocusSelect({ style, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      {...props}
      style={{
        ...base, ...style,
        boxShadow: focused ? "0 0 0 2.5px rgba(164,74,42,0.18)" : "none",
        borderColor: focused ? "rgba(164,74,42,0.5)" : "var(--color-rule)",
        cursor: "pointer",
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function FocusTextarea({ style, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      {...props}
      style={{
        ...base, ...style,
        resize: "vertical",
        minHeight: 180,
        lineHeight: 1.75,
        boxShadow: focused ? "0 0 0 2.5px rgba(164,74,42,0.18)" : "none",
        borderColor: focused ? "rgba(164,74,42,0.5)" : "var(--color-rule)",
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

/* ── main form ───────────────────────────────────────────────── */
export function AddMemoryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const content = useAppStore((s) => s.content);
  const githubToken = useAppStore((s) => s.githubToken);
  const userMemories = useAppStore((s) => s.userMemories);
  const saveUserMemory = useAppStore((s) => s.saveUserMemory);
  const deleteUserMemory = useAppStore((s) => s.deleteUserMemory);
  const showToast = useAppStore((s) => s.showToast);

  // Pre-generate ID so PhotoSlot can upload before form is submitted
  const memIdRef = useRef(newMemoryId());

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [chapterId, setChapterId] = useState(content.chapters[0]?.id ?? "");
  const [placeId, setPlaceId] = useState(content.places[0]?.id ?? "");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isEdit = !!editId && editId.startsWith("um-");
  const memId = isEdit ? editId! : memIdRef.current;

  useEffect(() => {
    if (!githubToken) { router.replace("/library"); return; }
    if (isEdit) {
      const mem = userMemories.find((m) => m.id === editId);
      if (mem) {
        setTitle(mem.title);
        setDate(mem.sortKey);
        setChapterId(mem.chapterId);
        setPlaceId(mem.placeId);
        setBody(mem.body);
        setTags(mem.tags.join(", "));
        setSelectedPeople(mem.peopleIds);
      }
    }
  }, [githubToken, isEdit, editId, userMemories, router]);

  function togglePerson(id: string) {
    setSelectedPeople((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date || !body.trim()) return;
    const mem: Memory = {
      id: memId,
      year: new Date(date).getFullYear(),
      date: formatDateLabel(date),
      sortKey: dateToSortKey(date),
      chapterId,
      title: title.trim(),
      placeId,
      peopleIds: selectedPeople,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      body: body.trim(),
      favorite: false,
    };
    setSaving(true);
    try {
      await saveUserMemory(mem);
      showToast(isEdit ? "Memory updated! Site rebuilding…" : "Memory saved! Appears in ~2 min after rebuild.");
      router.push("/timeline");
    } catch (err) {
      showToast(`Error: ${String(err)}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editId || !window.confirm("Delete this memory?")) return;
    setDeleting(true);
    try {
      await deleteUserMemory(editId);
      showToast("Memory deleted.");
      router.push("/timeline");
    } catch (err) {
      showToast(`Error: ${String(err)}`);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 680, margin: "0 auto", padding: "32px 36px 80px" }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
          letterSpacing: "0.14em", textTransform: "uppercase",
          color: "var(--color-accent)", marginBottom: 10,
        }}>
          {isEdit ? "Edit memory" : "New memory"}
        </div>
        <h1 style={{
          fontFamily: "var(--font-serif)", fontSize: 40, fontStyle: "italic",
          fontWeight: 600, color: "var(--color-ink)", margin: 0,
          letterSpacing: "-0.025em", lineHeight: 1.1,
        }}>
          {isEdit ? "Edit this moment" : "Capture a moment"}
        </h1>
      </div>

      {/* ── Card ── */}
      <div style={{
        background: "var(--color-card)",
        borderRadius: 16,
        border: "1px solid var(--color-rule)",
        overflow: "hidden",
        boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
      }}>

        {/* Cover photo — full bleed */}
        <div style={{ borderBottom: "1px solid var(--color-rule)" }}>
          <PhotoSlot slotId={`hero-${memId}`} height={240} borderRadius={0} width={680} />
        </div>

        <div style={{ padding: "28px 28px 32px" }}>

          {/* Title — big and editorial */}
          <div style={{ marginBottom: 28 }}>
            <SectionLabel>Title</SectionLabel>
            <FocusInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What happened?"
              required
              style={{ fontSize: 20, fontStyle: "italic", padding: "12px 14px" }}
            />
          </div>

          {/* Date + Chapter + Place in a row */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
            <Field label="Date" half>
              <FocusInput
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </Field>
            <Field label="Chapter" half>
              <FocusSelect value={chapterId} onChange={(e) => setChapterId(e.target.value)}>
                {content.chapters.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </FocusSelect>
            </Field>
            <Field label="Place" half>
              <FocusSelect value={placeId} onChange={(e) => setPlaceId(e.target.value)}>
                {content.places.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </FocusSelect>
            </Field>
          </div>

          <Divider />

          {/* Story */}
          <div style={{ marginBottom: 28 }}>
            <SectionLabel>Story</SectionLabel>
            <FocusTextarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Tell the story of this moment…"
              required
            />
          </div>

          <Divider />

          {/* Tags + People */}
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginBottom: 4 }}>
            <div style={{ flex: "1 1 180px", minWidth: 0 }}>
              <SectionLabel>Tags</SectionLabel>
              <FocusInput
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="travel, firsts, food…"
              />
            </div>
            <div style={{ flex: "1 1 220px", minWidth: 0 }}>
              <SectionLabel>With</SectionLabel>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 2 }}>
                {content.people.map((p) => {
                  const checked = selectedPeople.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePerson(p.id)}
                      style={{
                        padding: "7px 14px", borderRadius: 20,
                        border: `1.5px solid ${checked ? "var(--color-accent)" : "var(--color-rule)"}`,
                        background: checked ? "rgba(164,74,42,0.09)" : "transparent",
                        color: checked ? "var(--color-accent)" : "var(--color-ink2)",
                        fontFamily: "var(--font-sans)", fontSize: 13,
                        cursor: "pointer", transition: "all 0.14s",
                        fontWeight: checked ? 600 : 400,
                      }}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Action row ── */}
      <div style={{
        display: "flex", gap: 10, marginTop: 20,
        alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "13px 28px", borderRadius: 10,
              background: saving ? "var(--color-ink3)" : "var(--color-accent)",
              color: "#fff", border: "none",
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 600,
              boxShadow: saving ? "none" : "0 2px 8px rgba(164,74,42,0.28)",
              transition: "background 0.15s, box-shadow 0.15s",
            }}
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add memory"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: "13px 20px", borderRadius: 10,
              background: "transparent", border: "1px solid var(--color-rule)",
              color: "var(--color-ink2)", cursor: "pointer",
              fontFamily: "var(--font-sans)", fontSize: 15,
            }}
          >
            Cancel
          </button>
        </div>

        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            style={{
              padding: "13px 16px", borderRadius: 10,
              background: "transparent", border: "1px solid rgba(200,60,20,0.35)",
              color: "rgba(200,60,20,0.75)", cursor: deleting ? "not-allowed" : "pointer",
              fontFamily: "var(--font-sans)", fontSize: 14,
            }}
          >
            {deleting ? "Deleting…" : "Delete memory"}
          </button>
        )}
      </div>
    </form>
  );
}
