import type { Metadata } from "next";
import { PublicFooter } from "@/components/public/footer";
import { PublicHeader } from "@/components/public/header";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Privacy Policy",
  description: "How Plickify collects, uses, protects, and retains learner and customer information.",
  path: "/privacy-policy"
});

export default function PrivacyPolicyPage() {
  return <PolicyPage title="Privacy Policy" updated="June 10, 2026" sections={sections} />;
}

const sections = [
  ["Information we collect", "We collect account details, onboarding information, course activity, purchases, support messages, and contact requests needed to deliver Plickify services."],
  ["How we use information", "We use data to provide courses, digital products, certificates, invoices, support, fraud prevention, security monitoring, and product improvement."],
  ["Data sharing", "We do not sell personal information. Limited data may be processed by trusted infrastructure, analytics, payment, and email providers where needed to operate the platform."],
  ["Security and retention", "We protect records with access controls, audit logs, and role-based permissions, and retain information only for business, legal, tax, and platform integrity needs."],
  ["Your choices", "You may contact support to request access, correction, or deletion where permitted by law and platform obligations."]
];

function PolicyPage({ title, updated, sections }: { title: string; updated: string; sections: string[][] }) {
  return (
    <main className="min-h-screen bg-background">
      <PublicHeader />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase text-accent">Last updated {updated}</p>
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
