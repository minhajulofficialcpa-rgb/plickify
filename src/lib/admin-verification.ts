import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminEnv } from "@/lib/lms";
import type { CourseSummary } from "@/lib/lms";
import type { AdminUserRow } from "@/lib/admin-dashboard";

interface QueryResult { data: unknown; error: { message: string } | null }
type Relation<T> = T | T[] | null;

export interface AdminCertificateVerificationRow {
  id: string;
  user_id: string;
  course_id: string | null;
  certificate_number: string;
  certificate_code: string | null;
  verification_code: string;
  certificate_url: string | null;
  qr_code_url: string | null;
  progress_percent: number | null;
  assignment_criteria_completed: boolean | null;
  issue_source: string | null;
  issued_at: string;
  revoked_at: string | null;
  profiles?: Relation<Pick<AdminUserRow, "full_name" | "email">>;
  courses?: Relation<Pick<CourseSummary, "title">>;
}

export interface AdminInvoiceVerificationRow {
  id: string;
  order_id: string;
  user_id: string;
  course_id: string | null;
  product_id: string | null;
  invoice_number: string;
  invoice_code: string | null;
  invoice_url: string | null;
  qr_code_url: string | null;
  status: string;
  amount_bdt: number;
  currency: string;
  paid_at: string | null;
  issued_at: string | null;
  profiles?: Relation<Pick<AdminUserRow, "full_name" | "email">>;
  courses?: Relation<Pick<CourseSummary, "title">>;
  products?: Relation<{ title: string }>;
}

const empty = <T>() => [] as T[];

async function readList<T>(query: PromiseLike<QueryResult>): Promise<T[]> {
  try {
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as T[];
  } catch (error) {
    console.warn(error instanceof Error ? error.message : error);
    return empty<T>();
  }
}

export function firstRelation<T>(value: Relation<T> | undefined) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export async function getAdminVerificationCertificates() {
  if (!hasSupabaseAdminEnv()) return empty<AdminCertificateVerificationRow>();
  return readList<AdminCertificateVerificationRow>(
    createAdminClient()
      .from("certificates")
      .select("id, user_id, course_id, certificate_number, certificate_code, verification_code, certificate_url, qr_code_url, progress_percent, assignment_criteria_completed, issue_source, issued_at, revoked_at, profiles(full_name, email), courses(title)")
      .order("issued_at", { ascending: false })
      .limit(100)
  );
}

export async function getAdminInvoices() {
  if (!hasSupabaseAdminEnv()) return empty<AdminInvoiceVerificationRow>();
  return readList<AdminInvoiceVerificationRow>(
    createAdminClient()
      .from("invoices")
      .select("id, order_id, user_id, course_id, product_id, invoice_number, invoice_code, invoice_url, qr_code_url, status, amount_bdt, currency, paid_at, issued_at, profiles(full_name, email), courses(title), products(title)")
      .order("issued_at", { ascending: false })
      .limit(100)
  );
}
