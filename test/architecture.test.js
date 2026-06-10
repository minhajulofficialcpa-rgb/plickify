const { existsSync, readFileSync } = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');

const read = (path) => readFileSync(path, 'utf8');

test('uses the requested production Next.js stack', () => {
  const pkg = JSON.parse(read('package.json'));

  for (const dependency of [
    'next',
    'framer-motion',
    'lucide-react',
    '@supabase/supabase-js',
    '@supabase/ssr',
    'zod',
    'react-hook-form'
  ]) {
    assert.ok(pkg.dependencies[dependency] || pkg.devDependencies[dependency], `${dependency} should be installed`);
  }

  assert.ok(pkg.devDependencies.tailwindcss, 'tailwindcss should be installed');
  assert.match(pkg.dependencies.next, /^15\./);
  assert.ok(existsSync('components.json'), 'shadcn/ui config should exist');
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

test('provides requested student dashboard routes', () => {
  for (const path of [
    'src/app/dashboard/page.tsx',
    'src/app/dashboard/courses/page.tsx',
    'src/app/dashboard/courses/[courseId]/page.tsx',
    'src/app/dashboard/batches/page.tsx',
    'src/app/dashboard/lessons/[lessonId]/page.tsx',
    'src/app/dashboard/assignments/page.tsx',
    'src/app/dashboard/orders/page.tsx',
    'src/app/dashboard/downloads/page.tsx',
    'src/app/dashboard/certificates/page.tsx',
    'src/app/dashboard/support/page.tsx',
    'src/app/dashboard/profile/page.tsx'
  ]) {
    assert.ok(existsSync(path), `${path} should exist`);
  }

  assert.match(read('src/components/player/lesson-player.tsx'), /setInterval\(sendHeartbeat, 10000\)/);
  assert.match(read('src/app/dashboard/profile/page.tsx'), /Open support ticket/);
  assert.match(read('src/app/dashboard/downloads/page.tsx'), /signed URL/i);
  assert.match(read('src/actions/student.ts'), /openProfileChangeTicketAction/);
});

test('provides requested admin dashboard routes and audited actions', () => {
  for (const path of [
    'src/app/admin/page.tsx',
    'src/app/admin/users/page.tsx',
    'src/app/admin/courses/page.tsx',
    'src/app/admin/batches/page.tsx',
    'src/app/admin/lessons/page.tsx',
    'src/app/admin/products/page.tsx',
    'src/app/admin/orders/page.tsx',
    'src/app/admin/payments/page.tsx',
    'src/app/admin/enrollments/page.tsx',
    'src/app/admin/assignments/page.tsx',
    'src/app/admin/tickets/page.tsx',
    'src/app/admin/contacts/page.tsx',
    'src/app/admin/reviews/page.tsx',
    'src/app/admin/certificates/page.tsx',
    'src/app/admin/audit-logs/page.tsx',
    'src/app/admin/settings/page.tsx'
  ]) {
    assert.ok(existsSync(path), `${path} should exist`);
  }

  assert.match(read('src/actions/admin.ts'), /writeAuditEvent/);
  assert.match(read('src/lib/audit.ts'), /audit_logs/);
  assert.match(read('src/app/admin/audit-logs/page.tsx'), /requireSuperAdmin/);
  assert.match(read('src/lib/admin-dashboard.ts'), /getAdminAnalytics/);
});

test('does not implement payment yet', () => {
  assert.equal(existsSync('src/app/api/piprapay'), false);
  assert.equal(existsSync('src/lib/payments'), false);
  assert.doesNotMatch(read('package.json'), /piprapay/i);
});
