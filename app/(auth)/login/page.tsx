import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-6xl items-center px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Supabase Auth</p>
          <h1 className="mt-4 text-5xl font-black tracking-[-0.06em]">Secure access for admins, instructors, support, and students.</h1>
          <p className="mt-5 text-muted-foreground">Wire this form to Supabase email OTP, password auth, or social providers based on your launch plan.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Sign in to Plickify</CardTitle>
            <CardDescription>Demo UI prepared for Supabase Auth session handling.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="email" placeholder="you@example.com" />
            <Input type="password" placeholder="••••••••" />
            <Button className="w-full" variant="accent">Continue</Button>
            <Button className="w-full" variant="secondary" asChild><Link href="/dashboard/student">Open demo dashboard</Link></Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
