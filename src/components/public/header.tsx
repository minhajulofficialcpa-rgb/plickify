import Link from "next/link";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/courses/digital-business-foundations", label: "Courses" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/75 backdrop-blur-xl">
      <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-lg font-black tracking-tight">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-accent/20">P</span>
          Plickify
        </Link>
        <div className="hidden items-center gap-7 text-sm font-semibold text-muted-foreground md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
        </div>
        <Button asChild variant="accent"><Link href="/login">Sign in</Link></Button>
      </nav>
    </header>
  );
}
