export const AVATAR_PALETTE = [
  { bg: "#e0e7ff", fg: "#3730a3" }, // indigo
  { bg: "#e0f2fe", fg: "#075985" }, // sky
  { bg: "#fce7f3", fg: "#9d174d" }, // pink
  { bg: "#ede9fe", fg: "#5b21b6" }, // violet
  { bg: "#cffafe", fg: "#155e75" }, // cyan
  { bg: "#e2e8f0", fg: "#334155" }, // slate
];

export function hashToIndex(value: string, modulo: number): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash % modulo;
}

export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}
