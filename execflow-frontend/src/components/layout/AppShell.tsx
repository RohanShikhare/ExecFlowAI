import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { RequireAuth } from "./RequireAuth";

export function AppShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Topbar title={title} />
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}
