import { redirect } from "next/navigation";
import { LogIn } from "lucide-react";
import { signInWithGoogleAction } from "@/actions";
import { FormShell } from "@/components/forms/form-shell";
import { PublicHeader } from "@/components/public/header";
import { Button } from "@/components/ui/button";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    const profile = await getCurrentProfile();
    redirect(profile?.onboarding_completed ? "/dashboard" : "/onboarding");
  }

  return (
    <>
      <PublicHeader />
      <main className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-md items-center px-4 py-12">
        <FormShell title="Sign in" description="Continue with your Google account to access Plickify.">
          <form action={signInWithGoogleAction} className="grid gap-4">
            <Button type="submit" variant="accent" className="w-full">
              <LogIn className="size-4" aria-hidden="true" />
              Continue with Google
            </Button>
          </form>
        </FormShell>
      </main>
    </>
  );
}
