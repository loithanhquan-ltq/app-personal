export type CardTemplate = "minimal" | "photo-heavy" | "quote-centered";

export interface CardOptions {
  photoUrl: string;
  title: string;
  date: string;
  dayCount: number;
  message: string;
  template: CardTemplate;
}

const W = 1080;
const H = 1350;
const SCALE = 2;

async function loadFont(family: string, url: string): Promise<void> {
  const font = new FontFace(family, `url(${url})`);
  await font.load();
  document.fonts.add(font);
}

async function ensureFonts() {
  await document.fonts.ready;
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawCoverFit(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const boxRatio = w / h;
  let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
  if (imgRatio > boxRatio) {
    sw = img.naturalHeight * boxRatio;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / boxRatio;
    sy = (img.naturalHeight - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function renderCard(opts: CardOptions): Promise<Blob> {
  await ensureFonts();

  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);

  const { photoUrl, title, date, dayCount, message, template } = opts;

  let img: HTMLImageElement | null = null;
  try { img = await loadImage(photoUrl); } catch { /* no photo */ }

  if (template === "minimal") {
    // Warm background, photo top 60%, text below
    ctx.fillStyle = "#f7f3ec";
    ctx.fillRect(0, 0, W, H);

    if (img) {
      ctx.save();
      ctx.beginPath();
      roundRect(ctx, 40, 40, W - 80, 740, 16);
      ctx.clip();
      drawCoverFit(ctx, img, 40, 40, W - 80, 740);
      ctx.restore();
    } else {
      ctx.fillStyle = "#ede0c8";
      ctx.fillRect(40, 40, W - 80, 740);
    }

    const grad = ctx.createLinearGradient(0, 560, 0, 780);
    grad.addColorStop(0, "rgba(247,243,236,0)");
    grad.addColorStop(1, "rgba(247,243,236,0.95)");
    ctx.fillStyle = grad;
    ctx.fillRect(40, 560, W - 80, 220);

    ctx.fillStyle = "#a44a2a";
    ctx.font = `500 ${22}px "DM Mono", monospace`;
    ctx.textAlign = "center";
    ctx.fillText(date.toUpperCase(), W / 2, 840);

    ctx.fillStyle = "#1a1209";
    ctx.font = `600 italic ${54}px "Newsreader", Georgia, serif`;
    const titleLines = wrapText(ctx, title, W - 120);
    titleLines.forEach((line, i) => ctx.fillText(line, W / 2, 910 + i * 66));

    ctx.fillStyle = "#a44a2a";
    ctx.font = `500 ${18}px "DM Mono", monospace`;
    ctx.fillText(`day ${dayCount.toLocaleString()}`, W / 2, 910 + titleLines.length * 66 + 32);

    if (message) {
      ctx.fillStyle = "#8c6a50";
      ctx.font = `italic ${24}px "Newsreader", Georgia, serif`;
      const msgLines = wrapText(ctx, message, W - 160);
      msgLines.forEach((line, i) => ctx.fillText(line, W / 2, 1060 + i * 36));
    }

    ctx.fillStyle = "#c4a882";
    ctx.font = `400 italic ${18}px "Newsreader", Georgia, serif`;
    ctx.fillText("♡", W / 2, H - 48);

  } else if (template === "photo-heavy") {
    // Full bleed photo, overlay gradient, text at bottom
    if (img) {
      drawCoverFit(ctx, img, 0, 0, W, H);
    } else {
      ctx.fillStyle = "#2d1a0e";
      ctx.fillRect(0, 0, W, H);
    }

    const grad = ctx.createLinearGradient(0, H * 0.45, 0, H);
    grad.addColorStop(0, "rgba(10,5,2,0)");
    grad.addColorStop(1, "rgba(10,5,2,0.92)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.textAlign = "center";

    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = `500 ${20}px "DM Mono", monospace`;
    ctx.fillText(date.toUpperCase(), W / 2, H - 280);

    ctx.fillStyle = "#fff";
    ctx.font = `600 italic ${58}px "Newsreader", Georgia, serif`;
    const titleLines = wrapText(ctx, title, W - 100);
    titleLines.forEach((line, i) => ctx.fillText(line, W / 2, H - 230 + i * 68));

    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.font = `400 ${18}px "DM Mono", monospace`;
    ctx.fillText(`day ${dayCount.toLocaleString()}`, W / 2, H - 230 + titleLines.length * 68 + 30);

    if (message) {
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = `italic ${26}px "Newsreader", Georgia, serif`;
      const msgLines = wrapText(ctx, message, W - 120);
      msgLines.forEach((line, i) => ctx.fillText(line, W / 2, H - 90 - (msgLines.length - 1 - i) * 36));
    }

  } else {
    // quote-centered: warm bg, large message/title centered
    ctx.fillStyle = "#f7f3ec";
    ctx.fillRect(0, 0, W, H);

    if (img) {
      ctx.save();
      ctx.globalAlpha = 0.12;
      drawCoverFit(ctx, img, 0, 0, W, H);
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    ctx.textAlign = "center";

    const quote = message || title;
    ctx.fillStyle = "#1a1209";
    ctx.font = `600 italic ${48}px "Newsreader", Georgia, serif`;
    const qLines = wrapText(ctx, `"${quote}"`, W - 140);
    const totalH = qLines.length * 62;
    const startY = (H - totalH) / 2 - 40;
    qLines.forEach((line, i) => ctx.fillText(line, W / 2, startY + i * 62));

    ctx.fillStyle = "#a44a2a";
    ctx.font = `500 ${20}px "DM Mono", monospace`;
    ctx.fillText(`— ${date}`, W / 2, startY + totalH + 40);

    ctx.fillStyle = "#c4a882";
    ctx.font = `400 ${28}px "Newsreader", Georgia, serif`;
    ctx.fillText(`day ${dayCount.toLocaleString()}`, W / 2, startY + totalH + 80);

    ctx.strokeStyle = "rgba(164,74,42,0.15)";
    ctx.lineWidth = 1;
    const mx = 60, my = 60;
    ctx.strokeRect(mx, my, W - mx * 2, H - my * 2);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("toBlob failed"));
    }, "image/png");
  });
}
