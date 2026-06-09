import type { Metadata } from "next";

export const siteConfig = {
  name: "Plickify",
  description: "Production-ready LMS and digital product shop scaffold.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://plickify.com"
};

export function createMetadata({ title, description }: { title?: string; description?: string } = {}): Metadata {
  return {
    title: title ?? siteConfig.name,
    description: description ?? siteConfig.description,
    metadataBase: new URL(siteConfig.url)
  };
}
