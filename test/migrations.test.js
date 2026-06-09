const { readFileSync } = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');

const migrationPath = 'supabase/migrations/202606090001_phase_2_lms_shop_schema.sql';
const sql = readFileSync(migrationPath, 'utf8');

const requiredTables = [
  'profiles',
  'admin_roles',
  'courses',
  'batches',
  'course_lessons',
  'enrollments',
  'user_batches',
  'products',
  'orders',
  'payments',
  'payment_webhook_logs',
  'downloads',
  'assignments',
  'assignment_submissions',
  'watch_analytics',
  'support_tickets',
  'support_messages',
  'certificates',
  'invoices',
  'contact_messages',
  'reviews',
  'device_sessions',
  'notifications',
  'audit_logs',
  'abandoned_carts'
];

test('phase 2 migration creates all requested LMS and shop tables with UUID primary keys', () => {
  for (const table of requiredTables) {
    assert.match(sql, new RegExp(`create table public\\.${table} \\(`), `${table} should be created`);
    assert.match(sql, new RegExp(`create table public\\.${table} \\([\\s\\S]*?id uuid primary key`, 'm'), `${table} should use a UUID primary key`);
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`), `${table} should enable RLS`);
  }

  assert.match(sql, /profiles \([\s\S]*id uuid primary key references auth\.users\(id\) on delete cascade/);
});

test('phase 2 migration defines status fields, unique constraints, and payment safeguards', () => {
  for (const enumName of ['order_status', 'payment_status', 'activation_status']) {
    assert.match(sql, new RegExp(`create type public\\.${enumName} as enum`), `${enumName} should exist`);
  }

  assert.match(sql, /status public\.order_status not null default 'pending'/);
  assert.match(sql, /payment_status public\.payment_status not null default 'pending'/);
  assert.match(sql, /activation_status public\.activation_status not null default 'pending'/);
  assert.match(sql, /provider text not null default 'piprapay'/);
  assert.match(sql, /constraint payments_transaction_id_unique unique \(transaction_id\)/);
  assert.match(sql, /constraint payments_provider_transaction_unique unique \(provider, transaction_id\)/);
  assert.match(sql, /constraint payment_webhook_logs_transaction_unique unique \(transaction_id\)/);
});

test('phase 2 migration adds required indexes and timestamp triggers', () => {
  for (const index of [
    'enrollments_user_id_idx',
    'enrollments_course_id_idx',
    'user_batches_batch_id_idx',
    'orders_user_id_idx',
    'payments_order_id_idx',
    'payments_transaction_id_idx',
    'payment_webhook_logs_order_id_idx',
    'watch_analytics_batch_id_idx'
  ]) {
    assert.match(sql, new RegExp(`create index ${index}`), `${index} should exist`);
  }

  assert.match(sql, /create or replace function public\.set_updated_at\(\)/);
  assert.match(sql, /create trigger profiles_set_updated_at/);
  assert.match(sql, /create trigger orders_set_updated_at/);
  assert.match(sql, /create trigger payments_set_updated_at/);
});

test('phase 2 migration includes batch allocation and audit triggers', () => {
  assert.match(sql, /create or replace function public\.allocate_user_to_active_batches\(\)/);
  assert.match(sql, /create trigger enrollments_allocate_active_batches/);
  assert.match(sql, /insert into public\.user_batches/);
  assert.match(sql, /new\.activation_status = 'active'/);

  assert.match(sql, /create or replace function public\.audit_sensitive_admin_change\(\)/);
  for (const trigger of ['admin_roles_audit', 'courses_audit', 'batches_audit', 'products_audit', 'assignments_audit']) {
    assert.match(sql, new RegExp(`create trigger ${trigger}`), `${trigger} should exist`);
  }
});
