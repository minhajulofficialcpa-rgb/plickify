import type { Metadata } from "next";
import { PublicFooter } from "@/components/public/footer";
import { PublicHeader } from "@/components/public/header";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Copyright Policy",
  description: "Copyright rules for Plickify course content, digital products, and brand materials.",
  path: "/copyright-policy"
});

const sections = [
  ["Ownership", "Plickify course videos, lesson materials, downloadable assets, copy, design, and brand elements are protected by copyright and other intellectual property rights."],
  ["Permitted use", "Students and customers may use purchased materials for personal learning and authorized business implementation, subject to the access terms for each product."],
  ["Prohibited use", "Reselling, reposting, redistributing, scraping, recording, or sharing protected content without permission is not allowed."],
  ["Reports", "If you believe content on Plickify infringes your rights, contact support with ownership details, the affected URL, and enough information to review the claim."],
  ["Enforcement", "We may remove content, restrict accounts, revoke access, or take other appropriate action when copyright or licensing rules are violated."]
];

export default function CopyrightPolicyPage() {
  return (
    <main className="min-h-screen bg-background">
      <PublicHeader />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase text-accent">Last updated June 10, 2026</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Copyright Policy</h1>
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
