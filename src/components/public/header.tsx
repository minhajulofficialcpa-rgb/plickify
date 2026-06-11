import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, ChevronDown, LayoutDashboard, LogIn, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { ThemeToggle } from "@/components/public/theme-toggle";
import { Button } from "@/components/ui/button";
import { getCurrentProfile, getCurrentRole } from "@/lib/auth";
import { publicNavItems } from "@/lib/home-content";
import { canAccessAdmin } from "@/lib/permissions";

export async function PublicHeader() {
  const [profile, role] = await Promise.all([getCurrentProfile(), getCurrentRole()]);
  const isSignedIn = Boolean(profile);
  const displayName = profile?.full_name?.split(" ")[0] ?? "Profile";
  const profileEmail = profile?.email ?? "Signed in";
  const showAdmin = canAccessAdmin(role);
  const visibleNavItems = publicNavItems.filter((item) => item.enabled);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/88 shadow-[0_10px_34px_hsl(172_55%_16%/0.08)] backdrop-blur-xl">
      <nav className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3 text-lg font-black tracking-tight" aria-label="Plickify home">
          <Image src="/brand/plickify-mark.svg" alt="" width={44} height={44} className="h-11 w-11 rounded-full border border-border shadow-lg shadow-primary/15" priority />
          <span className="leading-none">
            <span className="block text-foreground">Plickify</span>
            <span className="block text-[0.62rem] font-bold uppercase tracking-[0.28em] text-accent">Digital Products</span>
          </span>
        </Link>
        <div className="hidden items-center gap-6 text-sm font-semibold text-muted-foreground lg:flex">
          {visibleNavItems.map((item) => (
            <Link key={item.id} href={item.href as Route} className="rounded-full px-1.5 py-1 transition hover:bg-muted hover:text-foreground">{item.label}</Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isSignedIn ? (
            <div className="group relative">
              <button type="button" className="flex items-center gap-2 rounded-full border border-border bg-card/92 px-2 py-1.5 text-sm font-bold text-foreground shadow-sm backdrop-blur transition hover:border-accent/60 hover:shadow-[0_12px_28px_hsl(172_55%_16%/0.10)]" aria-haspopup="menu">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-sm"><UserRound className="h-4 w-4" /></span>
                <span className="hidden max-w-24 truncate sm:inline">{displayName}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              <div className="invisible absolute right-0 top-full z-50 mt-3 w-72 rounded-lg border border-border bg-card/96 p-2 opacity-0 shadow-2xl shadow-slate-950/15 backdrop-blur-xl transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100" role="menu">
                <div className="border-b border-border px-3 py-3">
                  <p className="truncate text-sm font-black text-foreground">{profile?.full_name ?? "Plickify learner"}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{profileEmail}</p>
                </div>
                <Link href="/dashboard" className="mt-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground" role="menuitem"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
                <Link href="/dashboard/courses" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground" role="menuitem"><BookOpen className="h-4 w-4" /> My course</Link>
                {showAdmin ? <Link href="/admin" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground" role="menuitem"><ShieldCheck className="h-4 w-4" /> Admin</Link> : null}
                <Link href="/logout" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground" role="menuitem"><LogOut className="h-4 w-4" /> Logout</Link>
              </div>
            </div>
          ) : (
            <Button asChild variant="accent"><Link href="/login"><LogIn className="h-4 w-4" /> Get started</Link></Button>
          )}
        </div>
      </nav>
    </header>
  );
}
