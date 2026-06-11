import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/admin-nav";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--surface-subtle)]/60">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-border/70 bg-card/95 shadow-sm backdrop-blur lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-80 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-4 px-4 py-4 lg:block lg:px-5 lg:py-6 lg:pb-4">
            <Link href="/admin" className="flex items-center gap-3 font-black tracking-tight">
              <Image src="/brand/plickify-mark.svg" alt="" width={42} height={42} className="h-10 w-10 rounded-full shadow-lg shadow-accent/20" />
              <span>
                <span className="block text-foreground">Plickify</span>
                <span className="block text-xs font-bold uppercase tracking-[0.22em] text-accent">Admin Console</span>
              </span>
            </Link>
            <div className="flex items-center gap-2 lg:mt-5">
              <Link href="/dashboard" className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs font-bold text-muted-foreground transition hover:text-foreground">Student view</Link>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 lg:px-5 lg:pb-6">
            <AdminNav />
          </div>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
