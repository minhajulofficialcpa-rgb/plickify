import Image from "next/image";
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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-lg font-black tracking-tight" aria-label="Plickify home">
          <Image src="/brand/plickify-mark.svg" alt="" width={44} height={44} className="h-11 w-11 rounded-full shadow-lg shadow-accent/20" priority />
          <span className="leading-none">
            <span className="block text-white">Plickify</span>
            <span className="block text-[0.62rem] font-bold uppercase tracking-[0.28em] text-accent">Digital Products</span>
          </span>
        </Link>
        <div className="hidden items-center gap-7 text-sm font-semibold text-muted-foreground md:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </div>
        <Button asChild variant="accent"><Link href="/login">Sign in</Link></Button>
      </nav>
    </header>
  );
}
