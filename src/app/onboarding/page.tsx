import { redirect } from "next/navigation";
import { completeOnboardingAction } from "@/actions";
import { FormShell } from "@/components/forms/form-shell";
import { PublicHeader } from "@/components/public/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentProfile, requireUser } from "@/lib/auth";

export default async function OnboardingPage() {
  const user = await requireUser();
  const profile = await getCurrentProfile();

  if (profile?.onboarding_completed) {
    redirect("/dashboard");
  }

  const metadata = user.user_metadata as Record<string, unknown>;
  const metadataName = metadata.full_name ?? metadata.name;
  const defaultName = profile?.full_name ?? (typeof metadataName === "string" ? metadataName : "");

  return (
    <>
      <PublicHeader />
      <main className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-lg items-center px-4 py-12">
        <FormShell title="Complete your profile" description="Confirm your details once. Your profile locks after onboarding.">
          <form action={completeOnboardingAction} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" defaultValue={defaultName} required autoComplete="name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={profile?.email ?? user.email ?? ""} required autoComplete="email" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone number</Label>
              <Input id="phoneNumber" name="phoneNumber" defaultValue={profile?.phone_number ?? ""} required autoComplete="tel" />
            </div>
            <Button type="submit" variant="accent" className="mt-2 w-full">Save and continue</Button>
          </form>
        </FormShell>
      </main>
    </>
  );
}
