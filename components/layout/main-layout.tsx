import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar authenticated />
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
