import { PublicHeader } from "@/components/public/header";
import { FormShell } from "@/components/forms/form-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  return (
    <>
      <PublicHeader />
      <main className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-md items-center px-4 py-12">
        <FormShell title="Sign in" description="Supabase Auth form placeholder for the base scaffold.">
          <form className="grid gap-4">
            <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" placeholder="you@example.com" /></div>
            <div className="grid gap-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" placeholder="••••••••" /></div>
            <Button type="button" variant="accent">Continue</Button>
          </form>
        </FormShell>
      </main>
    </>
  );
}
