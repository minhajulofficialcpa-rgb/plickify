import Link from "next/link";
import { ShieldCheck, UsersRound } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const roles = ["student", "instructor", "support", "admin"];

export default function OnboardingPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <Badge>Phase 3 · Auth, onboarding and roles</Badge>
          <h1 className="mt-4 text-5xl font-black tracking-[-0.06em]">Collect profile details before dashboard access.</h1>
          <p className="mt-5 text-muted-foreground">
            Supabase Auth creates the user. Onboarding completes the profile, then database RLS and role checks decide what the user can access.
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm text-accent">
            <ShieldCheck className="h-4 w-4" /> Super admin role changes are enforced in PostgreSQL.
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Complete workspace profile</CardTitle>
            <CardDescription>This form is ready to be wired to a Server Action using Zod validation.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Input placeholder="Full name" />
            <Input placeholder="Phone number" />
            <div className="grid gap-3 sm:grid-cols-2">
              {roles.map((role) => (
                <button key={role} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-sm font-semibold capitalize transition hover:border-accent/60" type="button">
                  <UsersRound className="mb-3 h-5 w-5 text-accent" /> {role}
                </button>
              ))}
            </div>
            <Button asChild variant="accent"><Link href="/dashboard/student">Continue onboarding</Link></Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
