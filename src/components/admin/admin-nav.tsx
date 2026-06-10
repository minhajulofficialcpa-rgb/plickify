"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import type { LucideIcon } from "lucide-react";
import { BadgeDollarSign, BookOpen, ClipboardList, GraduationCap, Home, Inbox, Layers, MessageSquare, Package, Receipt, Settings, ShieldCheck, Star, Users, Video } from "lucide-react";
import { cn } from "@/lib/utils";

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

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:mt-8 lg:grid lg:grid-cols-1 lg:overflow-visible lg:pb-0">
      {links.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn(
            "inline-flex min-h-10 shrink-0 items-center gap-3 rounded-lg border px-3 py-2 text-sm font-semibold transition lg:w-full",
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
