/** Simple deterministic string hash -> [0,1), so word-note positions are
 * stable across renders without needing to persist random state. */
export function hash01(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // unsigned, normalize to [0,1)
  return (h >>> 0) / 4294967296;
}

export function hashRange(input: string, min: number, max: number): number {
  return min + hash01(input) * (max - min);
}
