import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { BadgeDollarSign, BookOpen, ClipboardList, GraduationCap, Home, Inbox, Layers, MessageSquare, Package, Receipt, Settings, ShieldCheck, Star, Users, Video } from "lucide-react";

interface AdminNavItem { href: Route; label: string; icon: LucideIcon }

const links: AdminNavItem[] = [
  { href: "/admin", label: "Overview", icon: Home },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/batches", label: "Batches", icon: Layers },
  { href: "/admin/lessons", label: "Lessons", icon: Video },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/invoices", label: "Invoices", icon: Receipt },
  { href: "/admin/payments", label: "Payments", icon: BadgeDollarSign },
  { href: "/admin/enrollments", label: "Enrollments", icon: ShieldCheck },
  { href: "/admin/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/admin/tickets", label: "Tickets", icon: MessageSquare },
  { href: "/admin/contacts", label: "Contacts", icon: Inbox },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/certificates", label: "Certificates", icon: GraduationCap },
  { href: "/admin/audit-logs", label: "Audit", icon: ShieldCheck },
  { href: "/admin/settings", label: "Settings", icon: Settings }
];

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--surface-subtle)]/60">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-border/70 bg-card/95 px-4 py-4 shadow-sm backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:w-80 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
          <div className="flex items-center justify-between gap-4 lg:block">
            <Link href="/admin" className="flex items-center gap-3 font-black tracking-tight">
              <Image src="/brand/plickify-mark.svg" alt="" width={42} height={42} className="h-10 w-10 rounded-full shadow-lg shadow-accent/20" />
              <span>
                <span className="block text-foreground">Plickify</span>
                <span className="block text-xs font-bold uppercase tracking-[0.22em] text-accent">Admin Console</span>
              </span>
            </Link>
            <Link href="/dashboard" className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs font-bold text-muted-foreground transition hover:text-foreground lg:mt-5 lg:inline-flex">Student view</Link>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:mt-8 lg:grid lg:grid-cols-1 lg:overflow-visible lg:pb-0">
            {links.map((item) => (
              <Link key={item.href} href={item.href} className="inline-flex min-h-10 shrink-0 items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:border-border hover:bg-muted/70 hover:text-foreground lg:w-full">
                <item.icon className="h-4 w-4 text-accent" /> {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
