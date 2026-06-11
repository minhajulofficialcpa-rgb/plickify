"use server";

import { revalidatePath } from "next/cache";
import { requirePlatformAdmin } from "@/lib/auth";
import { writeAuditEvent } from "@/lib/audit";
import { HOME_HERO_SETTING_KEY, buildHomeHeroContent } from "@/lib/home-settings";
import { hasSupabaseAdminEnv } from "@/lib/lms";
import { createAdminClient } from "@/lib/supabase/admin";
import { homeHeroMutationSchema } from "@/lib/validations";

function text(formData: FormData, key: string) {
  return formData.get(key)?.toString().trim() ?? "";
}

export async function saveHomeHeroAction(formData: FormData) {
  const auth = await requirePlatformAdmin();
  if (!hasSupabaseAdminEnv()) throw new Error("Supabase admin environment variables are required.");

  const input = homeHeroMutationSchema.parse({
    eyebrow: text(formData, "eyebrow"),
    title: text(formData, "title"),
    description: text(formData, "description"),
    primaryCtaLabel: text(formData, "primaryCtaLabel"),
    primaryCtaHref: text(formData, "primaryCtaHref"),
    secondaryCtaLabel: text(formData, "secondaryCtaLabel"),
    secondaryCtaHref: text(formData, "secondaryCtaHref"),
    imageUrl: text(formData, "imageUrl"),
    statOneLabel: text(formData, "statOneLabel"),
    statOneValue: text(formData, "statOneValue"),
    statTwoLabel: text(formData, "statTwoLabel"),
    statTwoValue: text(formData, "statTwoValue"),
    statThreeLabel: text(formData, "statThreeLabel"),
    statThreeValue: text(formData, "statThreeValue")
  });

  const value = buildHomeHeroContent(input);
  const { error } = await createAdminClient()
    .from("site_settings")
    .upsert({ key: HOME_HERO_SETTING_KEY, value, updated_by: auth.user.id }, { onConflict: "key" });

  if (error) throw new Error(error.message);
  await writeAuditEvent({ actorId: auth.user.id, action: "homepage.hero.update", target: HOME_HERO_SETTING_KEY, targetTable: "site_settings", metadata: { title: value.title } });
  revalidatePath("/");
  revalidatePath("/admin/settings");
}
