import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

interface Relation<T> extends Array<T> {}
type MaybeRelation<T> = T | Relation<T> | null;

export interface CertificateVerificationRecord {
  certificate_number: string;
  certificate_code: string | null;
  verification_code: string;
  certificate_url: string | null;
  qr_code_url: string | null;
  issued_at: string;
  revoked_at: string | null;
  student_name: string | null;
  course_title: string | null;
}

export interface InvoiceVerificationRecord {
  invoice_number: string;
  invoice_code: string | null;
  invoice_url: string | null;
  qr_code_url: string | null;
  status: string;
  amount_bdt: number;
  currency: string;
  paid_at: string | null;
  issued_at: string | null;
  student_name: string | null;
  item_title: string | null;
}

function hasSupabaseAdminEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function firstRelation<T>(value: MaybeRelation<T> | undefined) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function safeLog(error: unknown) {
  console.warn(error instanceof Error ? error.message : "Verification lookup failed");
}

async function findCertificateBy(column: "certificate_code" | "verification_code" | "certificate_number", code: string) {
  const supabase = createAdminClient();
  return supabase
    .from("certificates")
    .select("certificate_number, certificate_code, verification_code, certificate_url, qr_code_url, issued_at, revoked_at, profiles(full_name), courses(title)")
    .eq(column, code)
    .maybeSingle();
}

async function findInvoiceBy(column: "invoice_code" | "invoice_number", code: string) {
  const supabase = createAdminClient();
  return supabase
    .from("invoices")
    .select("invoice_number, invoice_code, invoice_url, qr_code_url, status, amount_bdt, currency, paid_at, issued_at, profiles(full_name), courses(title), products(title)")
    .eq(column, code)
    .maybeSingle();
}

export async function verifyCertificate(code: string): Promise<CertificateVerificationRecord | null> {
  if (!hasSupabaseAdminEnv()) return null;

  try {
    const lookups = await Promise.all([
      findCertificateBy("certificate_code", code),
      findCertificateBy("verification_code", code),
      findCertificateBy("certificate_number", code)
    ]);
    const result = lookups.find((lookup) => lookup.data);
    if (!result) {
      const error = lookups.find((lookup) => lookup.error)?.error;
      if (error) throw new Error(error.message);
      return null;
    }
    if (result.error) throw new Error(result.error.message);

    const row = result.data as (CertificateVerificationRecord & {
      profiles?: MaybeRelation<{ full_name: string | null }>;
      courses?: MaybeRelation<{ title: string | null }>;
    }) | null;
    if (!row) return null;

    return {
      certificate_number: row.certificate_number,
      certificate_code: row.certificate_code,
      verification_code: row.verification_code,
      certificate_url: row.certificate_url,
      qr_code_url: row.qr_code_url,
      issued_at: row.issued_at,
      revoked_at: row.revoked_at,
      student_name: firstRelation(row.profiles)?.full_name ?? null,
      course_title: firstRelation(row.courses)?.title ?? null
    };
  } catch (error) {
    safeLog(error);
    return null;
  }
}

export async function verifyInvoice(code: string): Promise<InvoiceVerificationRecord | null> {
  if (!hasSupabaseAdminEnv()) return null;

  try {
    const lookups = await Promise.all([findInvoiceBy("invoice_code", code), findInvoiceBy("invoice_number", code)]);
    const result = lookups.find((lookup) => lookup.data);
    if (!result) {
      const error = lookups.find((lookup) => lookup.error)?.error;
      if (error) throw new Error(error.message);
      return null;
    }
    if (result.error) throw new Error(result.error.message);

    const row = result.data as (InvoiceVerificationRecord & {
      profiles?: MaybeRelation<{ full_name: string | null }>;
      courses?: MaybeRelation<{ title: string | null }>;
      products?: MaybeRelation<{ title: string | null }>;
    }) | null;
    if (!row) return null;

    return {
      invoice_number: row.invoice_number,
      invoice_code: row.invoice_code,
      invoice_url: row.invoice_url,
      qr_code_url: row.qr_code_url,
      status: row.status,
      amount_bdt: row.amount_bdt,
      currency: row.currency,
      paid_at: row.paid_at,
      issued_at: row.issued_at,
      student_name: firstRelation(row.profiles)?.full_name ?? null,
      item_title: firstRelation(row.courses)?.title ?? firstRelation(row.products)?.title ?? null
    };
  } catch (error) {
    safeLog(error);
    return null;
  }
}
