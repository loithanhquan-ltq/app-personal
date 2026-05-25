"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { newMemoryId, formatDateLabel, dateToSortKey } from "@/lib/githubMemories";
import type { Memory } from "@/data/types";

const FIELD = {
  label: { fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--color-ink3)", marginBottom: 6, display: "block" },
  input: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--color-rule)", background: "var(--color-card)", fontFamily: "var(--font-serif)", fontSize: 15, color: "var(--color-ink)", outline: "none", boxSizing: "border-box" as const },
  textarea: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--color-rule)", background: "var(--color-card)", fontFamily: "var(--font-serif)", fontSize: 15, color: "var(--color-ink)", outline: "none", resize: "vertical" as const, minHeight: 140, boxSizing: "border-box" as const },
  select: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--color-rule)", background: "var(--color-card)", fontFamily: "var(--font-serif)", fontSize: 15, color: "var(--color-ink)", outline: "none", boxSizing: "border-box" as const },
  group: { marginBottom: 20 },
};

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
    setSelectedPeople((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date || !body.trim()) return;

    const mem: Memory = {
      id: isEdit ? editId! : newMemoryId(),
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
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 36px 80px" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-ink3)", marginBottom: 8 }}>
          {isEdit ? "Edit memory" : "New memory"}
        </div>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 36, fontStyle: "italic", fontWeight: 600, color: "var(--color-ink)", margin: 0, letterSpacing: "-0.02em" }}>
          {isEdit ? "Edit this moment" : "Add a new moment"}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={FIELD.group}>
          <label style={FIELD.label}>Title</label>
          <input style={FIELD.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What happened?" required />
        </div>

        <div style={FIELD.group}>
          <label style={FIELD.label}>Date</label>
          <input type="date" style={FIELD.input} value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div>
            <label style={FIELD.label}>Chapter</label>
            <select style={FIELD.select} value={chapterId} onChange={(e) => setChapterId(e.target.value)}>
              {content.chapters.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label style={FIELD.label}>Place</label>
            <select style={FIELD.select} value={placeId} onChange={(e) => setPlaceId(e.target.value)}>
              {content.places.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
        </div>

        <div style={FIELD.group}>
          <label style={FIELD.label}>Story</label>
          <textarea style={FIELD.textarea} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Tell the story…" required />
        </div>

        <div style={FIELD.group}>
          <label style={FIELD.label}>Tags (comma-separated)</label>
          <input style={FIELD.input} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="travel, firsts, food…" />
        </div>

        <div style={FIELD.group}>
          <label style={FIELD.label}>With</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {content.people.map((p) => {
              const checked = selectedPeople.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePerson(p.id)}
                  style={{
                    padding: "6px 12px", borderRadius: 20,
                    border: `1px solid ${checked ? "var(--color-accent)" : "var(--color-rule)"}`,
                    background: checked ? "rgba(164,74,42,0.08)" : "var(--color-card)",
                    color: checked ? "var(--color-accent)" : "var(--color-ink2)",
                    fontFamily: "var(--font-sans)", fontSize: 13, cursor: "pointer",
                  }}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 32 }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              flex: 1, padding: "12px 24px", borderRadius: 10,
              background: saving ? "var(--color-ink3)" : "var(--color-accent)",
              color: "#fff", border: "none", cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 600,
            }}
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add memory"}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: "12px 20px", borderRadius: 10,
              background: "var(--color-card)", border: "1px solid var(--color-rule)",
              color: "var(--color-ink2)", cursor: "pointer",
              fontFamily: "var(--font-sans)", fontSize: 15,
            }}
          >
            Cancel
          </button>

          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              style={{
                padding: "12px 16px", borderRadius: 10,
                background: "transparent", border: "1px solid rgba(200,60,20,0.4)",
                color: "rgba(200,60,20,0.8)", cursor: deleting ? "not-allowed" : "pointer",
                fontFamily: "var(--font-sans)", fontSize: 15,
              }}
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
