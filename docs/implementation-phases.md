# Plickify Implementation Phases

This project must be developed and reviewed in the following order. After every phase, run:

```bash
npm run lint
npm run typecheck
npm run build
```

## Phase 1: Base project setup

- Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui-style primitives, Framer Motion, ESLint, and build tooling.
- Files: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `components.json`, `app/layout.tsx`, `app/globals.css`.

## Phase 2: Supabase schema and RLS

- PostgreSQL tables, enums, storage buckets, RLS policies, role helpers, insert-only audit behavior, and payment webhook logging.
- Files: `supabase/schema.sql`, `lib/db-types.ts`.

## Phase 3: Auth, onboarding and roles

- Supabase Auth helpers, middleware, onboarding UI, protected dashboard routing, role-aware schema policies, and server-only admin client.
- Files: `lib/supabase/*`, `middleware.ts`, `app/(auth)/login/page.tsx`, `app/onboarding/page.tsx`.

## Phase 4: Public pages and SEO

- Public homepage, marketing navigation, metadata, sitemap, robots, public course/shop routes, and SEO-ready copy.
- Files: `app/page.tsx`, `components/site-nav.tsx`, `app/sitemap.ts`, `app/robots.ts`.

## Phase 5: Course, batch and lesson system

- Course detail pages, lesson/course data models, batches, course operations, and lesson-oriented UI.
- Files: `app/courses/[slug]/page.tsx`, `lib/data.ts`, `supabase/schema.sql`.

## Phase 6: Student dashboard

- Student progress, enrolled courses, assignment shortcuts, certificate/invoice/support overview, and learner navigation.
- Files: `app/dashboard/student/page.tsx`.

## Phase 7: Admin dashboard

- Revenue, learners, support SLA, course operations, audit log, certificate approvals, invoice reconciliation, and assignment review.
- Files: `app/dashboard/admin/page.tsx`, `components/dashboard/stat-card.tsx`.

## Phase 8: Assignment and support ticket

- Assignment tracking and support ticket creation surfaces backed by RLS-protected schema tables.
- Files: `app/dashboard/student/assignments/page.tsx`, `app/dashboard/student/support/page.tsx`, `supabase/schema.sql`.

## Phase 9: Shop and digital delivery

- Digital product catalog, private storage delivery model, product entitlement strategy, and checkout CTA.
- Files: `app/shop/page.tsx`, `supabase/schema.sql`.

## Phase 10: PipraPay payment

- PipraPay create-charge route, compatibility payment route, signed webhook validation, duplicate blocking, amount mismatch checks, and verified-only access grants.
- Files: `lib/payments/piprapay.ts`, `app/api/piprapay/create-charge/route.ts`, `app/api/piprapay/create-payment/route.ts`, `app/api/piprapay/webhook/route.ts`.

## Phase 11: Certificate, invoice and QR verification

- Certificate records, invoice records, QR verification page, and certificate storage bucket.
- Files: `app/certificates/verify/page.tsx`, `supabase/schema.sql`.

## Phase 12: Analytics, notification and audit log

- Analytics events, audit logs, admin visibility, insert-only audit patterns, and future notification event hooks.
- Files: `supabase/schema.sql`, `app/dashboard/admin/page.tsx`.

## Phase 13: Security hardening and production build

- Secret handling, RLS enforcement, webhook HMAC verification, service-role isolation, lint/typecheck/build gates, and audit checks.
- Files: `AGENTS.md`, `.env.example`, `test/architecture.test.js`.
