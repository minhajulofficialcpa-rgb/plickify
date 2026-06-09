import type { MetadataRoute } from "next";
import { courses } from "@/lib/data";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://plickify.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/checkout", "/login", "/onboarding", "/shop", "/certificates/verify"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date()
  }));

  const courseRoutes = courses.map((course) => ({
    url: `${baseUrl}/courses/${course.slug}`,
    lastModified: new Date()
  }));

  return [...staticRoutes, ...courseRoutes];
}
