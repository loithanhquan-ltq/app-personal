import type { Memory } from "@/data/types";

const OWNER = "loithanhquan-ltq";
const REPO = "app-personal";
const BRANCH = "main";
const FILE = "assets/data/user-memories.json";

export function rawUserMemoriesURL(): string {
  return `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${FILE}`;
}

export async function readUserMemories(): Promise<Memory[]> {
  try {
    const res = await fetch(rawUserMemoriesURL(), { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function getFileSHA(token: string): Promise<string | null> {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.sha ?? null;
}

export async function writeUserMemories(memories: Memory[], token: string): Promise<void> {
  const sha = await getFileSHA(token);
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(memories, null, 2))));
  const body: Record<string, unknown> = {
    message: `memories: update user-memories.json`,
    content,
    branch: BRANCH,
  };
  if (sha) body.sha = sha;

  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `Write failed (${res.status})`);
  }
}

export async function triggerRebuild(token: string): Promise<void> {
  await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/deploy.yml/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref: BRANCH }),
    }
  );
}

export function newMemoryId(): string {
  return `um-${Date.now()}`;
}

export function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function dateToSortKey(dateStr: string): string {
  return dateStr;
}
