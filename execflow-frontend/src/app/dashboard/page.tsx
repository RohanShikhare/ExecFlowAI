import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";

// Static placeholder for Module 1 (scaffolding). Replaced with a
// GET /api/v1/dashboard/summary React Query hook in the Dashboard module.
const PLACEHOLDER_STATS = [
  { label: "Total Inputs", value: 0 },
  { label: "Total Actions", value: 0 },
  { label: "Pending Actions", value: 0 },
  { label: "Completed Actions", value: 0 },
  { label: "Overdue Actions", value: 0, tone: "danger" as const },
];

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {PLACEHOLDER_STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted">
        No inputs yet. Once the Inputs module ships, recent voice notes and
        text inputs will appear here.
      </div>
    </AppShell>
  );
}
