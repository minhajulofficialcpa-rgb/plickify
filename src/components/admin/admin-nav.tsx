"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import type { LucideIcon } from "lucide-react";
import { BadgeDollarSign, BookOpen, ClipboardList, GraduationCap, Home, Inbox, Layers, MessageSquare, Package, Receipt, Settings, ShieldCheck, Star, Users, Video } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminNavItem { href: Route; label: string; icon: LucideIcon; group: string }

const links: AdminNavItem[] = [
  { href: "/admin", label: "Overview", icon: Home, group: "Workspace" },
  { href: "/admin/users", label: "Users", icon: Users, group: "Workspace" },
  { href: "/admin/courses", label: "Courses", icon: BookOpen, group: "Learning" },
  { href: "/admin/batches", label: "Batches", icon: Layers, group: "Learning" },
  { href: "/admin/lessons", label: "Lessons", icon: Video, group: "Learning" },
  { href: "/admin/assignments", label: "Assignments", icon: ClipboardList, group: "Learning" },
  { href: "/admin/products", label: "Products", icon: Package, group: "Shop" },
  { href: "/admin/orders", label: "Orders", icon: Receipt, group: "Shop" },
  { href: "/admin/invoices", label: "Invoices", icon: Receipt, group: "Shop" },
  { href: "/admin/payments", label: "Payments", icon: BadgeDollarSign, group: "Shop" },
  { href: "/admin/enrollments", label: "Enrollments", icon: ShieldCheck, group: "Access" },
  { href: "/admin/tickets", label: "Tickets", icon: MessageSquare, group: "Support" },
  { href: "/admin/contacts", label: "Contacts", icon: Inbox, group: "Support" },
  { href: "/admin/reviews", label: "Reviews", icon: Star, group: "Content" },
  { href: "/admin/certificates", label: "Certificates", icon: GraduationCap, group: "Content" },
  { href: "/admin/audit-logs", label: "Audit", icon: ShieldCheck, group: "System" },
  { href: "/admin/settings", label: "Settings", icon: Settings, group: "System" }
];

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
}

export function AdminNav() {
  const pathname = usePathname();
  const groups = Array.from(new Set(links.map((link) => link.group)));

  return (
    <nav className="flex gap-2 overflow-x-auto pb-2 lg:grid lg:grid-cols-1 lg:gap-5 lg:overflow-visible lg:pb-0" aria-label="Admin navigation">
      {groups.map((group) => (
        <div key={group} className="flex shrink-0 gap-2 lg:grid lg:gap-1.5">
          <p className="hidden px-3 text-[0.68rem] font-black uppercase tracking-[0.22em] text-muted-foreground lg:block">{group}</p>
          {links.filter((item) => item.group === group).map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn(
                "inline-flex min-h-10 shrink-0 items-center gap-3 rounded-lg border px-3 py-2 text-sm font-semibold transition lg:w-full",
                active
                  ? "border-accent/30 bg-accent/15 text-foreground shadow-sm shadow-accent/10"
                  : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/70 hover:text-foreground"
              )}>
                <item.icon className="h-4 w-4 shrink-0 text-accent" /> <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
