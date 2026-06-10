const { existsSync, readFileSync } = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');

const read = (path) => readFileSync(path, 'utf8');
const migration = read('supabase/migrations/20260610080000_certificate_invoice_verification.sql');

test('certificate invoice migration adds public codes, QR URLs, and eligibility functions', () => {
  for (const column of ['certificate_code', 'certificate_url', 'qr_code_url', 'progress_percent', 'assignment_criteria_completed', 'issue_source']) {
    assert.match(migration, new RegExp(`alter table public\\.certificates add column if not exists ${column}`));
  }

  for (const column of ['invoice_code', 'invoice_url', 'qr_code_url', 'course_id', 'product_id', 'issued_at']) {
    assert.match(migration, new RegExp(`alter table public\\.invoices add column if not exists ${column}`));
  }

  assert.match(migration, /certificates_certificate_code_unique/);
  assert.match(migration, /invoices_invoice_code_unique/);
  assert.match(migration, /create or replace function public\.course_certificate_progress/);
  assert.match(migration, /wa\.progress_percent >= 100/);
  assert.match(migration, /create or replace function public\.course_assignment_criteria_completed/);
  assert.match(migration, /assignment_submissions/);
  assert.match(migration, /create or replace function public\.issue_course_certificate/);
  assert.match(migration, /Certificate is locked until course progress is 100 percent/);
  assert.match(migration, /create or replace function public\.generate_paid_order_invoice/);
  assert.match(migration, /new\.status = 'paid'/);
  assert.match(migration, /new\.payment_status = 'paid'/);
  assert.match(migration, /orders_generate_paid_order_invoice/);
});

test('public verification pages expose safe record fields', () => {
  const certificatePage = read('src/app/certificate/verify/[code]/page.tsx');
  const invoicePage = read('src/app/invoice/verify/[code]/page.tsx');
  const verificationData = read('src/lib/verification-data.ts');

  assert.match(certificatePage, /student_name/);
  assert.match(certificatePage, /course_title/);
  assert.match(certificatePage, /qr_code_url/);
  assert.doesNotMatch(certificatePage, /phone_number/);
  assert.match(invoicePage, /student_name/);
  assert.match(invoicePage, /item_title/);
  assert.match(invoicePage, /qr_code_url/);
  assert.doesNotMatch(invoicePage, /phone_number/);
  assert.match(verificationData, /certificate_code/);
  assert.match(verificationData, /invoice_code/);
  assert.match(verificationData, /profiles\(full_name\)/);
  assert.doesNotMatch(verificationData, /profiles\(full_name, email/);
});

test('admin can issue certificates and view invoices', () => {
  assert.ok(existsSync('src/app/admin/invoices/page.tsx'), 'admin invoices page should exist');

  const certificateActions = read('src/actions/certificates.ts');
  const adminCertificates = read('src/app/admin/certificates/page.tsx');
  const adminInvoices = read('src/app/admin/invoices/page.tsx');
  const adminShell = read('src/components/admin/admin-shell.tsx');

  assert.match(certificateActions, /issue_course_certificate/);
  assert.match(certificateActions, /writeAuditEvent/);
  assert.match(certificateActions, /certificate\.manual_issue/);
  assert.match(certificateActions, /notifications/);
  assert.match(adminCertificates, /Manual override/);
  assert.match(adminCertificates, /progress_percent/);
  assert.match(adminInvoices, /getAdminInvoices/);
  assert.match(adminInvoices, /Verify page/);
  assert.match(adminShell, /\/admin\/invoices/);
});
