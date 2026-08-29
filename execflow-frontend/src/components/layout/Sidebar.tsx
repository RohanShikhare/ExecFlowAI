"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Mic,
  Sparkles,
  ListChecks,
  FileText,
  Wand2,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inputs", label: "Inputs", icon: Inbox },
  { href: "/transcribe", label: "Transcribe", icon: Mic },
  { href: "/analyze", label: "Analyze", icon: Sparkles },
  { href: "/actions", label: "Actions", icon: ListChecks },
  { href: "/briefs", label: "Briefs & Notes", icon: FileText },
  { href: "/ai-tools", label: "AI Tools", icon: Wand2 },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-surface">
      <div className="flex h-16 items-center border-b border-border px-6">
        <span className="font-display text-lg font-semibold text-ink">
          ExecFlow <span className="text-accent">AI</span>
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-accent text-white"
                  : "text-ink/80 hover:bg-canvas hover:text-ink"
              }`}
            >
              <Icon size={16} strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
