const { existsSync, readFileSync } = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');

const read = (path) => readFileSync(path, 'utf8');
const migrations = [
  'supabase/migrations/202606090001_phase_2_lms_shop_schema.sql',
  'supabase/migrations/202606090002_phase_3_auth_rls.sql',
  'supabase/migrations/202606090003_phase_3_auth_functions_rls.sql',
  'supabase/migrations/20260610020000_course_access_system.sql',
  'supabase/migrations/20260610030000_student_dashboard_support.sql',
  'supabase/migrations/20260610050000_assignment_support_system.sql',
  'supabase/migrations/20260610070000_digital_product_shop.sql',
  'supabase/migrations/20260610080000_certificate_invoice_verification.sql',
  'supabase/migrations/20260610090000_analytics_notifications_audit.sql'
].map(read).join('\n');

test('service role client is server-only and not imported by client components', () => {
  assert.match(read('src/lib/supabase/admin.ts'), /server-only/);
  assert.match(read('src/lib/supabase/admin.ts'), /SUPABASE_SERVICE_ROLE_KEY/);

  for (const file of [
    'src/components/dashboard/notification-bell.tsx',
    'src/components/player/lesson-player.tsx',
    'src/components/analytics/page-view-tracker.tsx'
  ]) {
    assert.doesNotMatch(read(file), /supabase\/admin|SUPABASE_SERVICE_ROLE_KEY/);
  }
});

test('protected layouts and admin routes enforce server-side role checks', () => {
  assert.match(read('src/app/dashboard/layout.tsx'), /requireOnboardedUser/);
  assert.match(read('src/app/admin/layout.tsx'), /requireAdmin/);
  assert.match(read('src/app/admin/audit-logs/page.tsx'), /requireSuperAdmin/);
  assert.match(read('src/lib/auth.ts'), /requirePlatformAdmin/);
  assert.match(read('src/lib/auth.ts'), /requireSuperAdmin/);
  assert.match(read('src/lib/auth.ts'), /admin_roles/);
});

test('sensitive tables use RLS and profile lock is database-enforced', () => {
  for (const table of ['profiles', 'admin_roles', 'orders', 'payments', 'payment_webhook_logs', 'downloads', 'audit_logs']) {
    assert.match(migrations, new RegExp(`alter table public\\.${table} enable row level security`), `${table} should enable RLS`);
  }

  assert.match(migrations, /complete_profile_onboarding/);
  assert.match(migrations, /is_locked = true/);
  assert.match(migrations, /profiles_update_unlocked_own_or_admin/);
  assert.match(migrations, /id = auth\.uid\(\) and is_locked = false/);
});

test('payment webhook validates signature, blocks duplicates, and rejects amount mismatch', () => {
  const webhook = read('src/app/api/piprapay/webhook/route.ts');
  assert.match(webhook, /PIPRAPAY_WEBHOOK_SECRET/);
  assert.match(webhook, /createHmac\("sha256"/);
  assert.match(webhook, /timingSafeEqual/);
  assert.match(webhook, /Duplicate transaction_id/);
  assert.match(webhook, /Payment amount or currency mismatch/);
  assert.match(webhook, /payment_webhook_logs/);
  assert.match(migrations, /payments_transaction_id_unique/);
  assert.match(migrations, /payment_webhook_logs_transaction_unique/);
});

test('downloads never expose raw file paths publicly and use signed urls only', () => {
  const studentActions = read('src/actions/student.ts');
  const publicData = read('src/lib/public-data.ts');
  assert.match(studentActions, /createSignedUrl\(privatePath, 60 \* 5\)/);
  assert.match(studentActions, /redirect\(data\.signedUrl/);
  assert.doesNotMatch(publicData, /private_file_path/);
  assert.doesNotMatch(publicData, /file_path/);
});

test('audit logs are read-only in UI and immutable in database', () => {
  const auditPage = read('src/app/admin/audit-logs/page.tsx');
  assert.match(auditPage, /requireSuperAdmin/);
  assert.doesNotMatch(auditPage, /delete/i);
  assert.doesNotMatch(auditPage, /update/i);
  assert.match(migrations, /prevent_audit_log_mutation/);
  assert.match(migrations, /audit_logs_prevent_update/);
  assert.match(migrations, /audit_logs_prevent_delete/);
});

test('forms and webhook inputs use Zod validation and avoid unsafe raw SQL', () => {
  assert.match(read('src/lib/validations.ts'), /from "zod"/);
  for (const file of ['src/actions/index.ts', 'src/actions/admin.ts', 'src/actions/student.ts', 'src/app/api/piprapay/webhook/route.ts']) {
    assert.match(read(file), /Schema|schema|safeParse|parse/);
    assert.doesNotMatch(read(file), /\.query\(|execute\(|raw\(/);
  }
});

test('env docs and app fallback states exist', () => {
  const env = read('.env.example');
  for (const name of ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'PIPRAPAY_WEBHOOK_SECRET', 'META_CAPI_ACCESS_TOKEN']) {
    assert.match(env, new RegExp(name));
  }

  assert.ok(existsSync('src/app/error.tsx'));
  assert.ok(existsSync('src/app/not-found.tsx'));
  assert.ok(existsSync('src/app/loading.tsx'));
});
