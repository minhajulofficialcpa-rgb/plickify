# Plickify Site Upgrade Report

Date: 2026-06-10

## Executive Summary

The project already has the main production foundation: Next.js 15 App Router, TypeScript, Tailwind, Supabase auth/database/storage patterns, public pages, LMS/shop/admin/student dashboard routes, RLS migrations, analytics, notifications, audit logging, certificate/invoice verification, and a hardened PipraPay webhook foundation.

The remaining work is mostly product-depth, polish, QA, and operational setup. Payment checkout UI is intentionally skipped for now.

## Completed Or Mostly Completed

- Next.js 15 App Router structure.
- Google OAuth only authentication flow.
- Onboarding with locked profile model.
- Public pages: home, about, contact, shop, course/product details, legal pages, certificate/invoice verification.
- Student dashboard route coverage.
- Admin dashboard route coverage.
- Supabase migrations for LMS, shop, support, assignments, certificates, invoices, analytics, notifications, audit logs.
- Private download model with signed URL server action.
- Hardened payment webhook route for PipraPay.
- Sitemap, robots, canonical metadata, dynamic course/product metadata.
- Initial security hardening tests.
- Light-default premium UI token pass.
- Auth-aware public header.
- Left-side dashboard/admin navigation panels.

## Fixed In This Upgrade Pass

- Site theme is now light by default with dark-mode token support.
- Header no longer always shows only Sign in; authenticated users see Dashboard/Profile and admins see Admin.
- Student dashboard menu is now a left-side panel on desktop.
- Admin menu is now a left-side panel on desktop.
- Base button/card components are light/dark compatible.

## Remaining Gaps

### UI/UX Polish

- Add an actual light/dark toggle and persist preference.
- Replace remaining hard-coded dark utility classes across all pages.
- Add active navigation states for dashboard/admin sidebars.
- Improve mobile drawer navigation for dashboard/admin instead of horizontal overflow.
- Add richer empty states and loading skeletons per data-heavy page.
- Add branded Open Graph image generation.

### Product Completeness

- Admin CRUD needs full form-level UX polish and validation feedback.
- Course and product content needs real seed/sample content.
- Assignment file upload workflow needs storage integration hardening.
- Support attachments need private upload/download policy checks.
- Certificate/invoice PDF generation is not fully implemented.
- Manual subscription/service activation workflow needs final admin UX.

### Supabase/Database

- Apply all migrations in production in order.
- Verify RLS policies with real student/admin/super_admin accounts.
- Create initial super_admin role.
- Create private downloads bucket and storage policies.
- Confirm migration idempotency in staging before production reruns.

### Payments

- Checkout UI is still skipped by request.
- PipraPay webhook exists, but checkout initiation, redirect flow, and payment status UX remain future work.
- Need real PipraPay signature/header confirmation from provider docs before live transactions.

### QA And Operations

- Need browser smoke tests for public pages, login redirect, dashboard, admin, and signed downloads.
- Need production runtime log pass after Supabase migrations are applied.
- Need Vercel environment variable audit.
- Need backup/rollback checklist for Supabase migrations.

## Recommended Build Order

1. Finish theme system: toggle, active nav states, remove hard-coded dark styles.
2. Browser QA public pages and fix visual bugs.
3. Browser QA student dashboard and fix workflow bugs.
4. Browser QA admin dashboard and fix CRUD/form bugs.
5. Apply and verify Supabase migrations in production.
6. Add storage bucket policies and test signed downloads end-to-end.
7. Add certificate/invoice PDF generation.
8. Add payment checkout only when payment phase starts.
