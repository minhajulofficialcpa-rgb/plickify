# AGENTS.md

## Project Rules

This project is a production-grade LMS and digital product shop.

Use:

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Supabase RLS
- PipraPay payment gateway
- Vercel deployment

## Coding Rules

- Use TypeScript everywhere.
- Use App Router, not Pages Router.
- Use Server Components by default.
- Use Client Components only when interactivity is required.
- Use Server Actions for forms where possible.
- Use Route Handlers for API endpoints.
- Never expose Supabase service role key to client.
- Never put secrets in frontend code.
- Validate all form inputs using Zod.
- Use role-based access control.
- Enforce security at database/RLS level, not only frontend.
- Keep components small and reusable.
- Use clean folder structure.
- Run lint, typecheck and build after each phase.

## Supabase Rules

- Enable RLS on all sensitive tables.
- Users can only read their own private data.
- Admin access must be checked by role.
- Super admin only can manage admin roles.
- Audit logs must be insert-only.
- Payment webhook must validate signature before changing order status.

## Payment Rules

- Use PipraPay as the payment gateway.
- Implement create-charge API route.
- Implement webhook API route.
- Validate webhook using HMAC-SHA256 signature.
- Block duplicate transaction IDs.
- Block amount mismatch.
- Log all webhook payloads.
- Do not grant access until payment is verified.

## Output Rules

After each task:

1. Summarize changed files.
2. Mention migrations created.
3. Mention env variables needed.
4. Run lint/typecheck/build.
5. Fix all errors before finishing.
