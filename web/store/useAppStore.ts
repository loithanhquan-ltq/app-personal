"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getContent } from "@/data";
import { rawURL, upload, validate, compressToJpeg } from "@/lib/githubPhotos";
import { readUserMemories, writeUserMemories, triggerRebuild } from "@/lib/githubMemories";
import type { Language, Content, Memory } from "@/data";

interface AppStore {
  language: Language;
  content: Content;
  filterChapter: string | null;
  query: string;
  photos: Record<string, string>;
  userFavorites: string[];
  toast: string | null;
  githubToken: string | null;
  showGitHubSetup: boolean;
  uploadingSlots: string[];
  uploadErrors: Record<string, string>;
  userMemories: Memory[];

  setLanguage: (l: Language) => void;
  syncUserMemories: () => Promise<void>;
  saveUserMemory: (mem: Memory) => Promise<void>;
  deleteUserMemory: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  showToast: (msg: string) => void;
  setPhoto: (slotId: string, file: File) => Promise<void>;
  clearPhoto: (slotId: string) => void;
  retryUpload: (slotId: string, file: File) => Promise<void>;
  setGithubToken: (token: string) => Promise<boolean>;
  disconnectGithub: () => void;
  setFilterChapter: (id: string | null) => void;
  setQuery: (q: string) => void;
  setShowGitHubSetup: (show: boolean) => void;
  syncRemotePhotos: () => Promise<void>;
}

function mergeMemories(base: Memory[], user: Memory[]): Memory[] {
  const userIds = new Set(user.map((m) => m.id));
  return [...base.filter((m) => !userIds.has(m.id)), ...user];
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      language: "en",
      content: getContent("en"),
      filterChapter: null,
      query: "",
      photos: {},
      userFavorites: [],
      toast: null,
      githubToken: null,
      showGitHubSetup: false,
      uploadingSlots: [],
      uploadErrors: {},
      userMemories: [],

      setLanguage: (l) => {
        const userMems = get().userMemories;
        const base = getContent(l);
        set({
          language: l,
          content: {
            ...base,
            memories: mergeMemories(base.memories, userMems),
          },
        });
      },

      syncUserMemories: async () => {
        const mems = await readUserMemories();
        set((s) => ({
          userMemories: mems,
          content: {
            ...s.content,
            memories: mergeMemories(getContent(s.language).memories, mems),
          },
        }));
      },

      saveUserMemory: async (mem) => {
        const { githubToken, userMemories } = get();
        if (!githubToken) throw new Error("No token");
        const existing = userMemories.find((m) => m.id === mem.id);
        const updated = existing
          ? userMemories.map((m) => (m.id === mem.id ? mem : m))
          : [...userMemories, mem];
        await writeUserMemories(updated, githubToken);
        set((s) => ({
          userMemories: updated,
          content: {
            ...s.content,
            memories: mergeMemories(getContent(s.language).memories, updated),
          },
        }));
        await triggerRebuild(githubToken).catch(() => null);
      },

      deleteUserMemory: async (id) => {
        const { githubToken, userMemories } = get();
        if (!githubToken) throw new Error("No token");
        const updated = userMemories.filter((m) => m.id !== id);
        await writeUserMemories(updated, githubToken);
        set((s) => ({
          userMemories: updated,
          content: {
            ...s.content,
            memories: mergeMemories(getContent(s.language).memories, updated),
          },
        }));
        await triggerRebuild(githubToken).catch(() => null);
      },

      toggleFavorite: (id) => {
        const { userFavorites, content, showToast } = get();
        const isFav = userFavorites.includes(id) || content.memories.find((m) => m.id === id)?.favorite;
        if (isFav && !userFavorites.includes(id)) {
          set({ userFavorites: [...userFavorites, id] });
          showToast("Removed from favorites");
        } else if (userFavorites.includes(id)) {
          set({ userFavorites: userFavorites.filter((f) => f !== id) });
          showToast("Removed from favorites");
        } else {
          set({ userFavorites: [...userFavorites, id] });
          showToast("Added to favorites");
        }
      },

      isFavorite: (id) => {
        const { userFavorites, content } = get();
        const mem = content.memories.find((m) => m.id === id);
        if (mem?.favorite) return !userFavorites.includes(`__removed__${id}`);
        return userFavorites.includes(id);
      },

      showToast: (msg) => {
        set({ toast: msg });
        setTimeout(() => set({ toast: null }), 2500);
      },

      setPhoto: async (slotId, file) => {
        const blobUrl = URL.createObjectURL(file);
        set((s) => ({ photos: { ...s.photos, [slotId]: blobUrl } }));

        const { githubToken, showToast } = get();
        if (!githubToken) return;

        set((s) => ({ uploadingSlots: [...s.uploadingSlots, slotId] }));
        try {
          const blob = await compressToJpeg(file);
          await upload(slotId, blob, githubToken);
          set((s) => ({
            uploadingSlots: s.uploadingSlots.filter((x) => x !== slotId),
            uploadErrors: Object.fromEntries(Object.entries(s.uploadErrors).filter(([k]) => k !== slotId)),
          }));
          showToast("Photo synced");
        } catch (err) {
          set((s) => ({
            uploadingSlots: s.uploadingSlots.filter((x) => x !== slotId),
            uploadErrors: { ...s.uploadErrors, [slotId]: String(err) },
          }));
        }
      },

      clearPhoto: (slotId) => {
        set((s) => {
          const { [slotId]: _, ...rest } = s.photos;
          const { [slotId]: __, ...errs } = s.uploadErrors;
          return { photos: rest, uploadErrors: errs };
        });
      },

      retryUpload: async (slotId, file) => {
        set((s) => ({
          uploadErrors: Object.fromEntries(Object.entries(s.uploadErrors).filter(([k]) => k !== slotId)),
        }));
        await get().setPhoto(slotId, file);
      },

      setGithubToken: async (token) => {
        const ok = await validate(token);
        if (ok) {
          set({ githubToken: token, showGitHubSetup: false });
          get().syncRemotePhotos();
        }
        return ok;
      },

      disconnectGithub: () => {
        set({ githubToken: null });
      },

      setFilterChapter: (id) => set({ filterChapter: id }),
      setQuery: (q) => set({ query: q }),
      setShowGitHubSetup: (show) => set({ showGitHubSetup: show }),

      syncRemotePhotos: async () => {
        const { content } = get();
        const slotIds = [
          ...content.memories.map((m) => `hero-${m.id}`),
          ...content.places.map((p) => `place-${p.id}`),
        ];
        const updates: Record<string, string> = {};
        await Promise.all(
          slotIds.map(async (id) => {
            const url = rawURL(id);
            const res = await fetch(url, { method: "HEAD" }).catch(() => null);
            if (res?.ok) updates[id] = url;
          })
        );
        set((s) => ({ photos: { ...updates, ...s.photos } }));
      },
    }),
    {
      name: "memories-store",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      partialize: (s) => ({
        language: s.language,
        userFavorites: s.userFavorites,
        githubToken: s.githubToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.content = getContent(state.language);
        }
      },
    }
  )
);
