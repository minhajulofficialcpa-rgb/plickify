# Plickify

Plickify is a production-oriented LMS and digital product shop built with Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui-style components, Framer Motion, Supabase, and PipraPay.

## Core modules

- Supabase Auth-ready role model for admins, instructors, support agents, and students.
- Course, batch, lesson, assignment, submission, certificate, invoice, support ticket, analytics event, audit log, and digital product tables.
- Supabase PostgreSQL RLS policies and private Storage buckets for course assets, product files, and certificates.
- PipraPay create-charge API route and signed webhook handler for bKash, Nagad, and Rocket payment flows.
- Admin dashboard for revenue, learner, course, support, analytics, and audit-log operations.
- Student dashboard for learning progress, assignments, certificates, invoices, and support.

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>.

## Environment variables

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PIPRAPAY_BASE_URL=https://pay.piprapay.com
PIPRAPAY_API_KEY=
PIPRAPAY_WEBHOOK_SECRET=
```

## Database

Run `supabase/schema.sql` in the Supabase SQL editor. It creates the LMS/shop tables, role/status enums, RLS policies, and Storage buckets.

## Scripts

```bash
npm run dev
npm run build
npm run typecheck
npm test
```
