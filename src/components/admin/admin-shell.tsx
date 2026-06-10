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
  return <div className="min-h-screen"><header className="border-b border-white/10 bg-background/75 backdrop-blur-xl"><nav className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8"><Link href="/" className="font-black tracking-tight">Plickify Admin</Link><div className="flex flex-wrap gap-2 text-sm text-muted-foreground">{links.map((item) => <Link key={item.href} href={item.href} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 transition hover:bg-white/[0.08] hover:text-white"><item.icon className="h-4 w-4" /> {item.label}</Link>)}</div><Link href="/dashboard" className="text-sm font-semibold text-accent">Student</Link></nav></header><main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</main></div>;
}
