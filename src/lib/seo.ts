import type { Metadata } from "next";

function normalizeSiteUrl(url: string) {
  try {
    return new URL(url).origin;
  } catch {
    return "https://plickify.vercel.app";
  }
}

export const siteConfig = {
  name: "Plickify",
  description: "A focused LMS and digital product shop for practical online learning.",
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL ?? "https://plickify.vercel.app")
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}

export function createMetadata({
  title,
  description,
  path = "/",
  image
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string | null;
} = {}): Metadata {
  const resolvedTitle = title ?? siteConfig.name;
  const resolvedDescription = description ?? siteConfig.description;
  const canonical = absoluteUrl(path);
  const images = image ? [{ url: image }] : undefined;

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical
    },
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url: canonical,
      siteName: siteConfig.name,
      type: "website",
      images
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: resolvedTitle,
      description: resolvedDescription,
      images: image ? [image] : undefined
    }
  };
}

export function courseSchema(course: { title: string; description: string | null; slug: string; price_bdt: number }) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description ?? siteConfig.description,
    url: absoluteUrl(`/courses/${course.slug}`),
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      sameAs: siteConfig.url
    },
    offers: {
      "@type": "Offer",
      price: course.price_bdt,
      priceCurrency: "BDT",
      availability: "https://schema.org/InStock"
    }
  };
}

export function productSchema(product: { title: string; description: string | null; slug: string; price_bdt: number }) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description ?? siteConfig.description,
    url: absoluteUrl(`/products/${product.slug}`),
    brand: {
      "@type": "Brand",
      name: siteConfig.name
    },
    offers: {
      "@type": "Offer",
      price: product.price_bdt,
      priceCurrency: "BDT",
      availability: "https://schema.org/InStock"
    }
  };
}
