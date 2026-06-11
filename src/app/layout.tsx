import type { Metadata } from "next";
import { AnalyticsScripts } from "@/components/analytics/analytics-scripts";
import { siteConfig } from "@/lib/seo";
import "./globals.css";

const forceLightModeScript = `
try {
  document.documentElement.classList.remove("dark");
  window.localStorage.removeItem("plickify-theme");
} catch {}
`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/plickify-mark.svg", type: "image/svg+xml" }
    ],
    shortcut: "/favicon.svg",
    apple: "/brand/plickify-mark.svg"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <script dangerouslySetInnerHTML={{ __html: forceLightModeScript }} />
        {children}
        <AnalyticsScripts />
      </body>
    </html>
  );
}
