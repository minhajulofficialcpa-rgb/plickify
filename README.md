# Plickify

Production-ready Next.js 15 App Router scaffold for an LMS and digital product shop.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style components
- Framer Motion
- Lucide React Icons
- Supabase browser/server/admin clients
- Zod
- React Hook Form

## Project structure

```txt
src/app
src/components/ui
src/components/public
src/components/dashboard
src/components/admin
src/components/player
src/components/forms
src/lib/supabase
src/lib/auth.ts
src/lib/permissions.ts
src/lib/validations.ts
src/lib/utils.ts
src/lib/seo.ts
src/lib/audit.ts
src/actions
src/middleware.ts
```

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

## Scripts

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

Payment integration is intentionally not implemented in this base phase.
