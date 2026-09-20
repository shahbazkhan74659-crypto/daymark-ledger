export function formatINR(n: number): string {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export function formatDayLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
