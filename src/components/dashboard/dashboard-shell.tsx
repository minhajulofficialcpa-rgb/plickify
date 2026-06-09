import Link from "next/link";
import type { ReactNode } from "react";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-background/75 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="font-black tracking-tight">Plickify</Link>
          <div className="flex gap-4 text-sm text-muted-foreground"><Link href="/dashboard">Dashboard</Link><Link href="/admin">Admin</Link></div>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
