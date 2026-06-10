const { existsSync, readFileSync } = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');

const read = (path) => readFileSync(path, 'utf8');
const adminRouteCount = 16;

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
  assert.match(read('src/app/dashboard/downloads/page.tsx'), /5-minute signed/i);
  assert.match(read('src/actions/student.ts'), /openProfileChangeTicketAction/);
});

test('provides requested admin dashboard routes and audited actions', () => {
  const adminRoutes = [
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
  ];

  assert.equal(adminRoutes.length, adminRouteCount);
  for (const path of adminRoutes) {
    assert.ok(existsSync(path), `${path} should exist`);
  }

  assert.match(read('src/actions/admin.ts'), /writeAuditEvent/);
  assert.match(read('src/lib/audit.ts'), /audit_logs/);
  assert.match(read('src/app/admin/audit-logs/page.tsx'), /requireSuperAdmin/);
  assert.match(read('src/lib/admin-dashboard.ts'), /getAdminAnalytics/);
});

test('implements assignment and support ticket workflows', () => {
  const studentActions = read('src/actions/student.ts');
  const adminActions = read('src/actions/admin.ts');
  const studentAssignments = read('src/app/dashboard/assignments/page.tsx');
  const studentSupport = read('src/app/dashboard/support/page.tsx');
  const adminAssignments = read('src/app/admin/assignments/page.tsx');
  const adminTickets = read('src/app/admin/tickets/page.tsx');

  assert.match(studentActions, /submitAssignmentAction/);
  assert.match(studentActions, /replySupportTicketAction/);
  assert.match(adminActions, /updateAssignmentSubmissionAction/);
  assert.match(adminActions, /replySupportTicketAsStaffAction/);
  assert.match(adminActions, /notifications/);
  assert.match(adminActions, /support_ticket\.reply/);
  assert.match(studentAssignments, /submissionText/);
  assert.match(studentAssignments, /githubUrl/);
  assert.match(studentSupport, /priority/);
  assert.match(studentSupport, /support_messages/);
  assert.match(adminAssignments, /batchId/);
  assert.match(adminAssignments, /Feedback/);
  assert.match(adminTickets, /updateTicketStatusAction/);
  assert.match(adminTickets, /replySupportTicketAsStaffAction/);
});

test('implements digital product shop access and downloads', () => {
  const publicData = read('src/lib/public-data.ts');
  const studentActions = read('src/actions/student.ts');
  const adminActions = read('src/actions/admin.ts');
  const shopPage = read('src/app/shop/page.tsx');
  const productPage = read('src/app/products/[slug]/page.tsx');
  const downloadsPage = read('src/app/dashboard/downloads/page.tsx');
  const productManager = read('src/components/admin/product-manager.tsx');
  const ordersPage = read('src/app/admin/orders/page.tsx');

  assert.match(shopPage, /category=/);
  assert.match(shopPage, /manual_service/);
  assert.match(productPage, /startProductCheckoutAction/);
  assert.match(productPage, /Request activation/);
  assert.match(studentActions, /startProductCheckoutAction/);
  assert.match(studentActions, /createDownloadUrlAction/);
  assert.match(studentActions, /createSignedUrl\(privatePath, 60 \* 5\)/);
  assert.match(studentActions, /download_count/);
  assert.doesNotMatch(publicData, /select\("id, title, slug, description, file_path/);
  assert.match(productManager, /Private file path/);
  assert.match(productManager, /manual_service/);
  assert.match(adminActions, /productMutationSchema/);
  assert.match(adminActions, /updateOrderAccessAction/);
  assert.match(ordersPage, /activationStatus/);
  assert.match(downloadsPage, /Generate 5-minute link/);
});

test('does not implement payment yet', () => {
  assert.equal(existsSync('src/app/api/piprapay'), false);
  assert.equal(existsSync('src/lib/payments'), false);
  assert.doesNotMatch(read('package.json'), /piprapay/i);
});
