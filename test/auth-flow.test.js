const { existsSync, readFileSync } = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');

const read = (path) => readFileSync(path, 'utf8');

const authMigration = () => read('supabase/migrations/202606090003_phase_3_auth_functions_rls.sql');

test('login is Google OAuth only', () => {
  const loginPage = read('src/app/login/page.tsx');
  const actions = read('src/actions/index.ts');

  assert.match(actions, /signInWithOAuth/);
  assert.match(actions, /provider:\s*"google"/);
  assert.match(loginPage, /Continue with Google/);
  assert.doesNotMatch(loginPage, /type="password"/);
});

test('auth callback, onboarding and logout routes exist', () => {
  for (const path of [
    'src/app/auth/callback/route.ts',
    'src/app/onboarding/page.tsx',
    'src/app/logout/route.ts'
  ]) {
    assert.ok(existsSync(path), `${path} should exist`);
  }

  assert.match(read('src/app/onboarding/page.tsx'), /completeOnboardingAction/);
  assert.match(read('src/app/auth/callback/route.ts'), /exchangeCodeForSession/);
  assert.match(read('src/app/logout/route.ts'), /signOut/);
});

test('middleware and layouts protect private routes', () => {
  const middleware = read('src/lib/supabase/middleware.ts');
  const dashboardLayout = read('src/app/dashboard/layout.tsx');
  const adminLayout = read('src/app/admin/layout.tsx');

  assert.match(middleware, /protectedRoutes = \["\/dashboard", "\/admin", "\/onboarding"\]/);
  assert.match(middleware, /adminRoles = new Set\(\["admin", "super_admin"\]\)/);
  assert.match(dashboardLayout, /requireOnboardedUser/);
  assert.match(adminLayout, /requireAdmin/);
});

test('profile onboarding is locked through database RPC and RLS', () => {
  const migration = authMigration();
  const actions = read('src/actions/index.ts');

  assert.match(actions, /complete_profile_onboarding/);
  assert.match(migration, /create or replace function public\.complete_profile_onboarding/);
  assert.match(migration, /onboarding_completed = true/);
  assert.match(migration, /is_locked = true/);
  assert.match(migration, /id = auth\.uid\(\) and is_locked = false/);
  assert.match(migration, /Profile is locked and cannot be edited by this user/);
});

test('role management and audit logs are restricted', () => {
  const migration = authMigration();
  const roleManagement = read('src/lib/role-management.ts');

  assert.match(roleManagement, /requireSuperAdmin/);
  assert.match(roleManagement, /manage_user_role/);
  assert.match(migration, /Only super_admin can manage roles/);
  assert.match(migration, /admin_roles_read_own_or_super_admin/);
  assert.match(migration, /admin_roles_super_admin_write/);
  assert.match(migration, /audit_logs_super_admin_read/);
  assert.doesNotMatch(migration, /on public\.audit_logs for insert/i);
});
