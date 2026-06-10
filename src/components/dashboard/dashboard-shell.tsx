import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { BookOpen, Boxes, FileCheck2, GraduationCap, HelpCircle, Home, LibraryBig, Receipt, User, Video } from "lucide-react";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import type { AppNotification } from "@/lib/notifications";

interface DashboardNavItem {
  href: Route;
  label: string;
  icon: LucideIcon;
}

const links: DashboardNavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/courses", label: "Courses", icon: BookOpen },
  { href: "/dashboard/batches", label: "Batches", icon: LibraryBig },
  { href: "/dashboard/assignments", label: "Assignments", icon: FileCheck2 },
  { href: "/dashboard/orders", label: "Orders", icon: Receipt },
  { href: "/dashboard/downloads", label: "Downloads", icon: Boxes },
  { href: "/dashboard/certificates", label: "Certificates", icon: GraduationCap },
  { href: "/dashboard/support", label: "Support", icon: HelpCircle },
  { href: "/dashboard/profile", label: "Profile", icon: User }
];

export function DashboardShell({ children, notifications = [] }: { children: ReactNode; notifications?: AppNotification[] }) {
  return (
    <div className="min-h-screen bg-[var(--surface-subtle)]/60">
      <div className="mx-auto flex min-h-screen w-full max-w-[1540px] flex-col lg:flex-row">
        <aside className="border-b border-border/70 bg-card/90 px-4 py-4 shadow-sm backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
          <div className="flex items-center justify-between gap-3 lg:block">
            <Link href="/" className="flex items-center gap-3 font-black tracking-tight">
              <Image src="/brand/plickify-mark.svg" alt="" width={40} height={40} className="h-10 w-10 rounded-full shadow-lg shadow-accent/20" />
              <span>
                <span className="block text-foreground">Plickify</span>
                <span className="block text-xs font-bold uppercase tracking-[0.22em] text-accent">Student</span>
              </span>
            </Link>
            <NotificationBell notifications={notifications} />
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:mt-8 lg:flex-col lg:overflow-visible lg:pb-0">
            {links.map((item) => (
              <Link key={item.href} href={item.href} className="inline-flex min-h-11 shrink-0 items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:border-border hover:bg-muted/70 hover:text-foreground lg:w-full">
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
