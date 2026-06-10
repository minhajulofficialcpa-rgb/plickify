import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export interface PublicCourse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  price_bdt: number;
  published_at: string | null;
  batches?: PublicBatch[];
  lessons?: PublicLesson[];
  reviews?: PublicReview[];
}

export interface PublicBatch {
  id: string;
  title: string;
  starts_at: string | null;
  ends_at: string | null;
  capacity: number | null;
  status: string;
}

export interface PublicLesson {
  id: string;
  title: string;
  description: string | null;
  position: number;
  duration_seconds: number;
  is_preview: boolean;
}

export interface PublicProduct {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price_bdt: number;
  file_path: string | null;
  published_at: string | null;
}

export interface PublicReview {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
}

export interface CertificateVerification {
  certificate_number: string;
  verification_code: string;
  issued_at: string;
  revoked_at: string | null;
}

export interface InvoiceVerification {
  invoice_number: string;
  status: string;
  amount_bdt: number;
  currency: string;
  paid_at: string | null;
}

const fallbackCourses: PublicCourse[] = [
  {
    id: "course-foundations",
    title: "Digital Business Foundations",
    slug: "digital-business-foundations",
    description: "Build the operating basics for selling, teaching, and supporting learners online.",
    thumbnail_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    price_bdt: 4500,
    published_at: new Date().toISOString(),
    batches: [
      {
        id: "batch-foundations",
        title: "Weekend live cohort",
        starts_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
        ends_at: null,
        capacity: 40,
        status: "enrolling"
      }
    ],
    lessons: [
      { id: "lesson-1", title: "Market and offer clarity", description: "Find a focused learning promise.", position: 1, duration_seconds: 1800, is_preview: true },
      { id: "lesson-2", title: "Course delivery workflow", description: "Plan lessons, batches, and learner support.", position: 2, duration_seconds: 2400, is_preview: true },
      { id: "lesson-3", title: "Digital product launch map", description: "Package products for repeatable sales.", position: 3, duration_seconds: 2100, is_preview: true }
    ],
    reviews: [
      { id: "review-1", rating: 5, title: "Clear and practical", body: "The structure made it easy to move from idea to a working offer." }
    ]
  },
  {
    id: "course-shop",
    title: "Creator Shop Sprint",
    slug: "creator-shop-sprint",
    description: "Launch a focused digital shop with product pages, delivery rules, and customer support.",
    thumbnail_url: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=1200&q=80",
    price_bdt: 3200,
    published_at: new Date().toISOString()
  }
];

const fallbackProducts: PublicProduct[] = [
  {
    id: "product-launch-kit",
    title: "Launch Checklist Kit",
    slug: "launch-checklist-kit",
    description: "Downloadable planning templates for course and product launches.",
    price_bdt: 1200,
    file_path: "digital-download",
    published_at: new Date().toISOString()
  },
  {
    id: "product-content-pack",
    title: "Content Calendar Pack",
    slug: "content-calendar-pack",
    description: "A practical calendar system for publishing lessons, emails, and shop updates.",
    price_bdt: 900,
    file_path: "digital-download",
    published_at: new Date().toISOString()
  }
];

function hasSupabasePublicEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function hasSupabaseAdminEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function formatErrorSafe(error: unknown) {
  return error instanceof Error ? error.message : "Unknown Supabase read error";
}

export function getFallbackCourses() {
  return fallbackCourses;
}

export function getFallbackProducts() {
  return fallbackProducts;
}

export async function getPublishedCourses(limit = 12): Promise<PublicCourse[]> {
  if (!hasSupabasePublicEnv()) return fallbackCourses.slice(0, limit);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("courses")
      .select("id, title, slug, description, thumbnail_url, price_bdt, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data?.length ? (data as PublicCourse[]) : fallbackCourses.slice(0, limit);
  } catch (error) {
    console.warn(formatErrorSafe(error));
    return fallbackCourses.slice(0, limit);
  }
}

export async function getFeaturedCourse() {
  const courses = await getPublishedCourses(1);
  return courses[0] ?? fallbackCourses[0];
}

export async function getCourseBySlug(slug: string): Promise<PublicCourse | null> {
  const fallback = fallbackCourses.find((course) => course.slug === slug) ?? null;
  if (!hasSupabasePublicEnv()) return fallback;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("courses")
      .select("id, title, slug, description, thumbnail_url, price_bdt, published_at")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return fallback;

    const [{ data: batches }, { data: lessons }, { data: reviews }] = await Promise.all([
      supabase.from("batches").select("id, title, starts_at, ends_at, capacity, status").eq("course_id", data.id).in("status", ["enrolling", "active", "completed"]).order("starts_at", { ascending: true }),
      supabase.from("course_lessons").select("id, title, description, position, duration_seconds, is_preview").eq("course_id", data.id).or("is_preview.eq.true,status.eq.published").order("position", { ascending: true }).limit(10),
      supabase.from("reviews").select("id, rating, title, body").eq("course_id", data.id).eq("is_published", true).order("created_at", { ascending: false }).limit(6)
    ]);

    return {
      ...(data as PublicCourse),
      batches: (batches ?? []) as PublicBatch[],
      lessons: (lessons ?? []) as PublicLesson[],
      reviews: (reviews ?? []) as PublicReview[]
    };
  } catch (error) {
    console.warn(formatErrorSafe(error));
    return fallback;
  }
}

export async function getPublishedProducts(limit = 12): Promise<PublicProduct[]> {
  if (!hasSupabasePublicEnv()) return fallbackProducts.slice(0, limit);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, title, slug, description, file_path, price_bdt, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data?.length ? (data as PublicProduct[]) : fallbackProducts.slice(0, limit);
  } catch (error) {
    console.warn(formatErrorSafe(error));
    return fallbackProducts.slice(0, limit);
  }
}

export async function getProductBySlug(slug: string): Promise<PublicProduct | null> {
  const fallback = fallbackProducts.find((product) => product.slug === slug) ?? null;
  if (!hasSupabasePublicEnv()) return fallback;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, title, slug, description, file_path, price_bdt, published_at")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? (data as PublicProduct) : fallback;
  } catch (error) {
    console.warn(formatErrorSafe(error));
    return fallback;
  }
}

export async function verifyCertificate(code: string): Promise<CertificateVerification | null> {
  if (!hasSupabaseAdminEnv()) return null;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("certificates")
      .select("certificate_number, verification_code, issued_at, revoked_at")
      .eq("verification_code", code)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as CertificateVerification | null;
  } catch (error) {
    console.warn(formatErrorSafe(error));
    return null;
  }
}

export async function verifyInvoice(code: string): Promise<InvoiceVerification | null> {
  if (!hasSupabaseAdminEnv()) return null;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("invoices")
      .select("invoice_number, status, amount_bdt, currency, paid_at")
      .eq("invoice_number", code)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as InvoiceVerification | null;
  } catch (error) {
    console.warn(formatErrorSafe(error));
    return null;
  }
}

export function formatBdt(amount: number) {
  return new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string | null | undefined) {
  if (!date) return "To be announced";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(date));
}

export function getCountdownLabel(date: string | null | undefined) {
  if (!date) return "Schedule opening soon";
  const days = Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 86400000));
  if (days === 0) return "Starts today";
  if (days === 1) return "Starts tomorrow";
  return `${days} days to start`;
}
