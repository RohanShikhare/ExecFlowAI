export function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | string;
  tone?: "default" | "warning" | "danger";
}) {
  const valueColor =
    tone === "danger"
      ? "text-priority-urgent"
      : tone === "warning"
        ? "text-priority-high"
        : "text-ink";

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-2 font-display text-3xl font-semibold ${valueColor}`}>
        {value}
      </p>
    </div>
  );
}
