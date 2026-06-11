import Image from "next/image";
import Link from "next/link";

const policyLinks = [
  { label: "Privacy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms-and-conditions" },
  { label: "Refunds", href: "/refund-policy" },
  { label: "Cookies", href: "/cookie-policy" },
  { label: "Copyright", href: "/copyright-policy" }
];

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card/82 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.5fr_1fr] lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-3 text-lg font-black tracking-tight text-foreground" aria-label="Plickify home">
            <Image src="/brand/plickify-mark.svg" alt="" width={40} height={40} className="h-10 w-10 rounded-full border border-border shadow-lg shadow-primary/10" />
            <span>
              <span className="block leading-none">Plickify</span>
              <span className="block text-[0.58rem] font-bold uppercase tracking-[0.26em] text-accent">Digital Products</span>
            </span>
          </Link>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Practical courses and digital products for creators, operators, and learners building durable online businesses.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-muted-foreground md:justify-end">
          {policyLinks.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-accent">{item.label}</Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
