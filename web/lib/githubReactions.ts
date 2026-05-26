const OWNER = "loithanhquan-ltq";
const REPO = "app-personal";
const BRANCH = "main";
const FILE = "assets/data/reactions.json";

export type ReactionMap = Record<string, Record<string, number>>;

export async function fetchReactions(): Promise<ReactionMap> {
  try {
    const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${FILE}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
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

export async function commitReactions(reactions: ReactionMap, token: string): Promise<void> {
  const sha = await getFileSHA(token);
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(reactions, null, 2))));
  const body: Record<string, unknown> = {
    message: `reactions: update`,
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
