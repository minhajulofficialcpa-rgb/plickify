import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { BookOpen, Boxes, FileCheck2, GraduationCap, HelpCircle, Home, LibraryBig, Receipt, User, Video } from "lucide-react";

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

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-background/75 backdrop-blur-xl">
        <nav className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-black tracking-tight"><Video className="h-5 w-5 text-accent" /> Plickify</Link>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {links.map((item) => (
              <Link key={item.href} href={item.href} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 transition hover:bg-white/[0.08] hover:text-white">
                <item.icon className="h-4 w-4" /> {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
