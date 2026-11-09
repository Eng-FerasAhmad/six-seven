const dateFormat = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
export function formatDate(value: string | number) {
  return dateFormat.format(
    typeof value === "string" ? new Date(`${value}T12:00:00`) : value,
  );
}
export function formatDateTime(value: number) {
  return `${formatDate(value)}, ${new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit" }).format(value)}`;
}
