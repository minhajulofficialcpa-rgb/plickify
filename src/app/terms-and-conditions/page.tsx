import type { Metadata } from "next";
import { PublicFooter } from "@/components/public/footer";
import { PublicHeader } from "@/components/public/header";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Terms and Conditions",
  description: "The terms that govern access to Plickify courses, digital products, accounts, and services.",
  path: "/terms-and-conditions"
});

const sections = [
  ["Use of the platform", "You agree to use Plickify lawfully, keep account access secure, and avoid sharing restricted course or product materials without permission."],
  ["Accounts and access", "Course, batch, product, certificate, and invoice access may depend on enrollment, payment status, account standing, and platform security rules."],
  ["Learning content", "Course materials are provided for education and practical implementation. Outcomes depend on your context, consistency, and business decisions."],
  ["Suspension", "We may restrict or suspend access for fraud, abuse, policy violations, chargeback risk, or actions that harm other users or the platform."],
  ["Changes", "We may update these terms as the product evolves. Continued use after updates means you accept the revised terms."]
];

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen bg-background">
      <PublicHeader />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase text-accent">Last updated June 10, 2026</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Terms and Conditions</h1>
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
