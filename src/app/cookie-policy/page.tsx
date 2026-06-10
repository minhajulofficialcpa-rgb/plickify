import type { Metadata } from "next";
import { PublicFooter } from "@/components/public/footer";
import { PublicHeader } from "@/components/public/header";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Cookie Policy",
  description: "How Plickify uses cookies and similar technologies for login, security, analytics, and preferences.",
  path: "/cookie-policy"
});

const sections = [
  ["Essential cookies", "We use essential cookies for authentication, session security, route protection, and keeping your account access working correctly."],
  ["Analytics and performance", "We may use privacy-conscious analytics to understand page performance, conversion paths, and product usage patterns."],
  ["Preference storage", "Some preferences may be stored locally so the interface can remember practical settings across visits."],
  ["Third parties", "Payment, authentication, video, and infrastructure providers may set cookies or similar technologies when their services are used."],
  ["Managing cookies", "You can manage browser cookie settings, but blocking essential cookies may prevent login or protected course access from working."]
];

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-background">
      <PublicHeader />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase text-accent">Last updated June 10, 2026</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Cookie Policy</h1>
        <div className="mt-10 space-y-8 text-muted-foreground">
          {sections.map(([heading, body]) => (
            <section key={heading}>
              <h2 className="text-xl font-bold text-white">{heading}</h2>
              <p className="mt-3 leading-7">{body}</p>
            </section>
          ))}
        </div>
      </article>
      <PublicFooter />
    </main>
  );
}
