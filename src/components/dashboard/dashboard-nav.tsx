"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import type { LucideIcon } from "lucide-react";
import { BookOpen, Boxes, FileCheck2, GraduationCap, HelpCircle, Home, LibraryBig, Receipt, User } from "lucide-react";
import { cn } from "@/lib/utils";

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

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
}

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:mt-8 lg:flex-col lg:overflow-visible lg:pb-0">
      {links.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn(
            "inline-flex min-h-11 shrink-0 items-center gap-3 rounded-lg border px-3 py-2 text-sm font-semibold transition lg:w-full",
            active
              ? "border-accent/30 bg-accent/15 text-foreground shadow-sm shadow-accent/10"
              : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/70 hover:text-foreground"
          )}>
            <item.icon className="h-4 w-4 text-accent" /> {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
