import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, LogIn, ShieldCheck, UserRound } from "lucide-react";
import { ThemeToggle } from "@/components/public/theme-toggle";
import { Button } from "@/components/ui/button";
import { getCurrentProfile, getCurrentRole } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/permissions";

const navItems = [
  { href: "/courses/digital-business-foundations", label: "Courses" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
] satisfies Array<{ href: Route; label: string }>;

export async function PublicHeader() {
  const [profile, role] = await Promise.all([getCurrentProfile(), getCurrentRole()]);
  const isSignedIn = Boolean(profile);
  const displayName = profile?.full_name?.split(" ")[0] ?? "Profile";
  const showAdmin = canAccessAdmin(role);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 shadow-sm shadow-slate-900/5 backdrop-blur-xl">
      <nav className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3 text-lg font-black tracking-tight" aria-label="Plickify home">
          <Image src="/brand/plickify-mark.svg" alt="" width={44} height={44} className="h-11 w-11 rounded-full shadow-lg shadow-accent/20" priority />
          <span className="leading-none">
            <span className="block text-foreground">Plickify</span>
            <span className="block text-[0.62rem] font-bold uppercase tracking-[0.28em] text-accent">Digital Products</span>
          </span>
        </Link>
        <div className="hidden items-center gap-7 text-sm font-semibold text-muted-foreground md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-foreground">{item.label}</Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isSignedIn ? (
            <>
              {showAdmin ? (
                <Button asChild variant="secondary" size="sm"><Link href="/admin"><ShieldCheck className="h-4 w-4" /> Admin</Link></Button>
              ) : null}
              <Button asChild variant="secondary" size="sm"><Link href="/dashboard"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link></Button>
              <Button asChild variant="accent" size="sm"><Link href="/dashboard/profile"><UserRound className="h-4 w-4" /> {displayName}</Link></Button>
            </>
          ) : (
            <Button asChild variant="accent"><Link href="/login"><LogIn className="h-4 w-4" /> Sign in</Link></Button>
          )}
        </div>
      </nav>
    </header>
  );
}
