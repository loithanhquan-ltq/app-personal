const OWNER = "loithanhquan-ltq";
const REPO = "app-personal";
const BRANCH = "main";
const FOLDER = "assets/photos";

export function rawURL(slotId: string): string {
  return `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${FOLDER}/${slotId}.jpg`;
}

async function getSHA(slotId: string, token: string): Promise<string | null> {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FOLDER}/${slotId}.jpg`,
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.sha ?? null;
}

export async function upload(slotId: string, blob: Blob, token: string): Promise<void> {
  const base64 = await blobToBase64(blob);
  const sha = await getSHA(slotId, token);
  const body: Record<string, unknown> = {
    message: `photo: ${slotId}`,
    content: base64,
    branch: BRANCH,
  };
  if (sha) body.sha = sha;

  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FOLDER}/${slotId}.jpg`,
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
    throw new Error(err.message ?? `Upload failed (${res.status})`);
  }
}

export async function validate(token: string): Promise<boolean> {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } }
  );
  return res.ok;
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function compressToJpeg(file: File, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("No canvas context")); return; }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => { URL.revokeObjectURL(url); blob ? resolve(blob) : reject(new Error("toBlob failed")); },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image load failed")); };
    img.src = url;
  });
}
