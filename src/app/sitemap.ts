import type { MetadataRoute } from "next";
import { getPublishedCourses, getPublishedProducts } from "@/lib/public-data";
import { absoluteUrl, siteConfig } from "@/lib/seo";

const staticPaths = [
  "/",
  "/about",
  "/contact",
  "/shop",
  "/privacy-policy",
  "/terms-and-conditions",
  "/refund-policy",
  "/cookie-policy",
  "/copyright-policy"
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courses, products] = await Promise.all([
    getPublishedCourses(),
    getPublishedProducts()
  ]);
  const now = new Date();

  return [
    ...staticPaths.map((path) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.7
    })),
    ...courses.map((course) => ({
      url: absoluteUrl(`/courses/${course.slug}`),
      lastModified: new Date(course.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.9
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/products/${product.slug}`),
      lastModified: new Date(product.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8
    }))
  ].map((entry) => ({
    ...entry,
    alternates: {
      languages: {
        en: entry.url
      }
    }
  }));
}

export const dynamic = siteConfig.url.includes("localhost") ? "force-dynamic" : "auto";
