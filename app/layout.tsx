import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plickify LMS + Digital Product Shop",
  description: "A production-ready learning management system and digital product shop with Supabase, PipraPay, and dashboards.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://plickify.com")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
