const { existsSync, readFileSync } = require('node:fs');
const { readFileSync, existsSync } = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');

const read = (path) => readFileSync(path, 'utf8');

test('uses the requested production Next.js stack', () => {
  const pkg = JSON.parse(read('package.json'));
  for (const dependency of ['next', 'tailwindcss', 'framer-motion', 'lucide-react', '@supabase/supabase-js', '@supabase/ssr', 'zod', 'react-hook-form']) {
    assert.ok(pkg.dependencies[dependency] || pkg.devDependencies[dependency], `${dependency} should be installed`);
  }
  assert.match(pkg.dependencies.next, /^15\./);
});

test('uses the requested src folder structure', () => {
  for (const path of [
    'src/app',
    'src/components/ui',
    'src/components/public',
    'src/components/dashboard',
    'src/components/admin',
    'src/components/player',
    'src/components/forms',
    'src/lib/supabase',
    'src/actions',
    'src/middleware.ts'
  ]) {
    assert.ok(existsSync(path), `${path} should exist`);
  }
});

test('provides required app placeholders and Supabase clients', () => {
  for (const path of [
    'src/app/layout.tsx',
    'src/app/page.tsx',
    'src/app/dashboard/layout.tsx',
    'src/app/admin/layout.tsx',
    'src/lib/supabase/browser.ts',
    'src/lib/supabase/server.ts',
    'src/lib/supabase/admin.ts',
    'src/lib/auth.ts',
    'src/lib/permissions.ts',
    'src/lib/validations.ts',
    'src/lib/seo.ts',
    'src/lib/audit.ts'
  ]) {
    assert.ok(existsSync(path), `${path} should exist`);
  }
  assert.match(read('src/lib/supabase/admin.ts'), /server-only/);
  assert.match(read('src/lib/supabase/admin.ts'), /SUPABASE_SERVICE_ROLE_KEY/);
});

test('does not implement payment yet', () => {
  assert.equal(existsSync('src/app/api/piprapay'), false);
  assert.equal(existsSync('src/lib/payments'), false);
});
test('uses the requested production framework stack', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.match(pkg.dependencies.next, /^15\./);
  assert.ok(pkg.dependencies['@supabase/supabase-js']);
  assert.ok(pkg.dependencies['@supabase/ssr']);
  assert.ok(pkg.dependencies['framer-motion']);
  assert.ok(pkg.dependencies['class-variance-authority']);
  assert.ok(existsSync('components.json'));
});

test('defines LMS, commerce, analytics, and audit database tables with RLS', () => {
  const schema = read('supabase/schema.sql');
  for (const table of ['courses', 'batches', 'lessons', 'assignments', 'certificates', 'invoices', 'support_tickets', 'analytics_events', 'audit_logs', 'digital_products', 'payments', 'payment_webhook_events']) {

  for (const table of ['courses', 'batches', 'lessons', 'assignments', 'certificates', 'invoices', 'support_tickets', 'analytics_events', 'audit_logs', 'digital_products', 'payments']) {
    assert.match(schema, new RegExp(`create table public\\.${table}`));
    assert.match(schema, new RegExp(`alter table public\\.${table} enable row level security`));
  }
  assert.match(schema, /insert into storage\.buckets/);
});

test('includes PipraPay checkout and webhook integration points', () => {
  assert.match(read('lib/payments/piprapay.ts'), /createPipraPayCheckout/);
  assert.match(read('lib/payments/piprapay.ts'), /verifyPipraPaySignature/);
  assert.match(read('app/api/piprapay/create-charge/route.ts'), /POST/);
  assert.match(read('app/api/piprapay/create-payment/route.ts'), /create-charge/);
  assert.match(read('app/api/piprapay/webhook/route.ts'), /provider_payment_id/);
  assert.match(read('app/api/piprapay/webhook/route.ts'), /Amount mismatch/);
  assert.match(read('app/api/piprapay/webhook/route.ts'), /Duplicate transaction/);

  assert.match(read('app/api/piprapay/create-payment/route.ts'), /POST/);
  assert.match(read('app/api/piprapay/webhook/route.ts'), /provider_payment_id/);
});

test('ships admin and student dashboard routes', () => {
  assert.ok(existsSync('app/dashboard/admin/page.tsx'));
  assert.ok(existsSync('app/dashboard/student/page.tsx'));
  assert.match(read('app/dashboard/admin/page.tsx'), /Audit log/);
  assert.match(read('app/dashboard/student/page.tsx'), /Assignments/);
});


test('enforces the requested phase order and phase routes', () => {
  const phases = read('docs/implementation-phases.md');
  const expected = [
    'Phase 1: Base project setup',
    'Phase 2: Supabase schema and RLS',
    'Phase 3: Auth, onboarding and roles',
    'Phase 4: Public pages and SEO',
    'Phase 5: Course, batch and lesson system',
    'Phase 6: Student dashboard',
    'Phase 7: Admin dashboard',
    'Phase 8: Assignment and support ticket',
    'Phase 9: Shop and digital delivery',
    'Phase 10: PipraPay payment',
    'Phase 11: Certificate, invoice and QR verification',
    'Phase 12: Analytics, notification and audit log',
    'Phase 13: Security hardening and production build'
  ];

  let lastIndex = -1;
  for (const phase of expected) {
    const index = phases.indexOf(phase);
    assert.ok(index > lastIndex, `${phase} should appear in order`);
    lastIndex = index;
  }

  for (const route of [
    'app/onboarding/page.tsx',
    'app/shop/page.tsx',
    'app/certificates/verify/page.tsx',
    'app/dashboard/student/assignments/page.tsx',
    'app/dashboard/student/support/page.tsx',
    'app/sitemap.ts',
    'app/robots.ts'
  ]) {
    assert.ok(existsSync(route), `${route} should exist`);
  }
});

