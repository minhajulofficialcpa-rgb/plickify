# Plickify

Production-ready Next.js 15 App Router scaffold for Plickify with TypeScript, Tailwind CSS, shadcn/ui-style primitives, Framer Motion, Lucide icons, Supabase clients, Zod, and React Hook Form.

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
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed to client components.

## Implemented systems

- Google-only Supabase auth with onboarding and locked profiles.
- LMS course, batch, lesson, enrollment, student dashboard, and admin dashboard foundations.
- Batch assignment submissions with admin review, marks, feedback, and notifications.
- Threaded support tickets with priorities, attachments, staff replies, status updates, and notifications.
- Digital product shop with category filters, order access rules, and private signed downloads.
- Assignment, support, and shop deployment verification are tracked through the production build.

## Scripts

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

Payment integration is intentionally not implemented in this base phase.