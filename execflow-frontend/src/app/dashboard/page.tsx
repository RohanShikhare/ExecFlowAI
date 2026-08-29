"use client";

import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { useAuth } from "@/context/AuthContext";

// Static placeholder until the Dashboard module wires up
// GET /api/v1/dashboard/summary via React Query.
const PLACEHOLDER_STATS = [
  { label: "Total Inputs", value: 0 },
  { label: "Pending Actions", value: 0 },
  { label: "In Progress", value: 0 },
  { label: "Completed", value: 0 },
  { label: "Overdue", value: 0, tone: "danger" as const },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.fullName.split(" ")[0] ?? "there";

  return (
    <AppShell title="Dashboard">
      <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
        Good morning, {firstName}
      </h2>
      <p className="mt-1 text-sm text-muted">
        Here is your executive summary for today.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {PLACEHOLDER_STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted">
        No inputs yet. Create your first one to see it show up here.
      </div>
    </AppShell>
  );
}
