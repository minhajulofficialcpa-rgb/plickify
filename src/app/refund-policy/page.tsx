import type { Metadata } from "next";
import { PublicFooter } from "@/components/public/footer";
import { PublicHeader } from "@/components/public/header";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Refund Policy",
  description: "Refund handling for Plickify courses, batches, and digital products.",
  path: "/refund-policy"
});

const sections = [
  ["Digital products", "Digital downloads and instantly accessible products are generally non-refundable once access is delivered, except where required by law or where a duplicate/error payment is confirmed."],
  ["Courses and batches", "Course refund eligibility depends on batch status, access usage, payment verification, and any offer-specific refund terms shown before purchase."],
  ["Review process", "Approved refunds are processed to the original payment method where possible. Processing timelines depend on the payment provider and bank."],
  ["Abuse prevention", "Refunds may be declined for account abuse, content scraping, policy violations, or repeated suspicious transactions."],
  ["Support", "Contact support with your order, invoice, or transaction reference so we can review your request quickly."]
];

export default function RefundPolicyPage() {
  return <PolicyPage title="Refund Policy" sections={sections} />;
}

function PolicyPage({ title, sections }: { title: string; sections: string[][] }) {
  return (
    <main className="min-h-screen bg-background">
      <PublicHeader />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase text-accent">Last updated June 10, 2026</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white">{title}</h1>
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
