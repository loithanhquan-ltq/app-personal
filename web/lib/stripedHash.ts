export function fnv1aHash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

export function stripeParams(seed: string): { hue: number; angle: number } {
  const h = fnv1aHash(seed);
  return {
    hue: h % 360,
    angle: ((h >> 8) % 30) + 20,
  };
}
