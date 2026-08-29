"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Topbar({ title }: { title: string }) {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-8">
      <h1 className="font-display text-xl font-semibold text-ink">{title}</h1>

      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-ink/80">{user.fullName}</span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted transition-colors hover:bg-canvas hover:text-ink"
          >
            <LogOut size={15} />
            Log out
          </button>
        </div>
      )}
    </header>
  );
}
