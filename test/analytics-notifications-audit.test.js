const { existsSync, readFileSync } = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');

const read = (path) => readFileSync(path, 'utf8');
const migration = read('supabase/migrations/20260610090000_analytics_notifications_audit.sql');

test('analytics notification audit migration adds event metadata and immutable audit logs', () => {
  for (const column of ['event_type', 'related_type', 'related_id', 'metadata']) {
    assert.match(migration, new RegExp(`alter table public\\.notifications add column if not exists ${column}`));
  }

  assert.match(migration, /create table if not exists public\.analytics_events/);
  assert.match(migration, /create or replace function public\.create_app_notification/);
  assert.match(migration, /create or replace function public\.write_analytics_event/);
  assert.match(migration, /create or replace function public\.prevent_audit_log_mutation/);
  assert.match(migration, /create trigger audit_logs_prevent_update/);
  assert.match(migration, /create trigger audit_logs_prevent_delete/);
  assert.match(migration, /drop policy if exists analytics_events_admin_read/);
  assert.match(migration, /auth\.role\(\) = 'service_role'/);
});

test('dashboard includes notification bell and mark-read actions', () => {
  assert.ok(existsSync('src/components/dashboard/notification-bell.tsx'));
  assert.ok(existsSync('src/actions/notifications.ts'));

  const shell = read('src/components/dashboard/dashboard-shell.tsx');
  const layout = read('src/app/dashboard/layout.tsx');
  const actions = read('src/actions/notifications.ts');

  assert.match(shell, /NotificationBell/);
  assert.match(layout, /getCurrentUserNotifications/);
  assert.match(actions, /markNotificationReadAction/);
  assert.match(actions, /markAllNotificationsReadAction/);
  assert.match(actions, /status: "read"/);
});

test('GA4 and Meta Pixel CAPI events are wired', () => {
  const analytics = read('src/lib/analytics.ts');
  const scripts = read('src/components/analytics/analytics-scripts.tsx');
  const pageTracker = read('src/components/analytics/page-view-tracker.tsx');
  const metaRoute = read('src/app/api/meta-capi/route.ts');
  const lessonPlayer = read('src/components/player/lesson-player.tsx');

  for (const eventName of ['page_view', 'course_view', 'product_view', 'lesson_start', 'lesson_progress', 'lesson_complete', 'assignment_submit', 'signup_complete', 'order_submit', 'download_click', 'certificate_claim']) {
    assert.match(analytics, new RegExp(eventName));
  }

  for (const eventName of ['ViewContent', 'Lead', 'CompleteRegistration', 'InitiateCheckout', 'Purchase', 'Contact', 'Subscribe']) {
    assert.match(analytics, new RegExp(eventName));
    assert.match(metaRoute, new RegExp(eventName));
  }

  assert.match(scripts, /NEXT_PUBLIC_GA_MEASUREMENT_ID/);
  assert.match(scripts, /NEXT_PUBLIC_META_PIXEL_ID/);
  assert.match(pageTracker, /trackContentView\("course"/);
  assert.match(pageTracker, /trackContentView\("product"/);
  assert.match(pageTracker, /trackMetaEvent\("Lead"/);
  assert.match(metaRoute, /META_CAPI_ACCESS_TOKEN/);
  assert.match(metaRoute, /graph\.facebook\.com\/v19\.0/);
  assert.match(lessonPlayer, /lesson_start/);
  assert.match(lessonPlayer, /lesson_progress/);
  assert.match(lessonPlayer, /lesson_complete/);
});

test('server actions create notifications and analytics events', () => {
  const rootActions = read('src/actions/index.ts');
  const certificateActions = read('src/actions/certificates.ts');
  const adminActions = read('src/actions/admin.ts');
  const studentActions = read('src/actions/student.ts');

  assert.match(rootActions, /onboarding_complete/);
  assert.match(rootActions, /signup_complete/);
  assert.match(rootActions, /Lead/);
  assert.match(certificateActions, /certificate_issued/);
  assert.match(certificateActions, /certificate_claim/);
  assert.match(adminActions, /writeAuditEvent/);
  assert.match(adminActions, /Assignment reviewed/);
  assert.match(adminActions, /Support replied/);
  assert.match(adminActions, /Course access granted/);
  assert.match(studentActions, /Order created/);
  assert.match(studentActions, /Assignment submitted/);
  assert.match(studentActions, /Download/);
});

test('audit logs remain super-admin read only in UI', () => {
  const auditPage = read('src/app/admin/audit-logs/page.tsx');
  assert.match(auditPage, /requireSuperAdmin/);
  assert.doesNotMatch(auditPage, /delete/i);
  assert.doesNotMatch(auditPage, /update/i);
});
