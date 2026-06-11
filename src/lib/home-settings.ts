import "server-only";
import { homeHero } from "@/lib/home-content";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminEnv } from "@/lib/lms";
import type { HomeHeroMutationInput } from "@/lib/validations";

export const HOME_HERO_SETTING_KEY = "home.hero";
export type HomeHeroContent = typeof homeHero;

interface SiteSettingRow {
  value: unknown;
}

export function buildHomeHeroContent(input: HomeHeroMutationInput): HomeHeroContent {
  return {
    eyebrow: input.eyebrow,
    title: input.title,
    description: input.description,
    primaryCta: { label: input.primaryCtaLabel, href: input.primaryCtaHref },
    secondaryCta: { label: input.secondaryCtaLabel, href: input.secondaryCtaHref },
    imageUrl: input.imageUrl,
    stats: [
      { label: input.statOneLabel, value: input.statOneValue },
      { label: input.statTwoLabel, value: input.statTwoValue },
      { label: input.statThreeLabel, value: input.statThreeValue }
    ]
  };
}

export async function getHomeHeroContent(): Promise<HomeHeroContent> {
  if (!hasSupabaseAdminEnv()) return homeHero;

  try {
    const { data, error } = await createAdminClient()
      .from("site_settings")
      .select("value")
      .eq("key", HOME_HERO_SETTING_KEY)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return mergeHomeHero((data as SiteSettingRow | null)?.value);
  } catch (error) {
    console.warn(error instanceof Error ? error.message : "Could not read homepage hero settings.");
    return homeHero;
  }
}

function mergeHomeHero(value: unknown): HomeHeroContent {
  if (!value || typeof value !== "object") return homeHero;
  const hero = value as Partial<HomeHeroContent>;
  return {
    eyebrow: stringOr(hero.eyebrow, homeHero.eyebrow),
    title: stringOr(hero.title, homeHero.title),
    description: stringOr(hero.description, homeHero.description),
    primaryCta: {
      label: stringOr(hero.primaryCta?.label, homeHero.primaryCta.label),
      href: stringOr(hero.primaryCta?.href, homeHero.primaryCta.href)
    },
    secondaryCta: {
      label: stringOr(hero.secondaryCta?.label, homeHero.secondaryCta.label),
      href: stringOr(hero.secondaryCta?.href, homeHero.secondaryCta.href)
    },
    imageUrl: stringOr(hero.imageUrl, homeHero.imageUrl),
    stats: Array.isArray(hero.stats) && hero.stats.length >= 3 ? hero.stats.slice(0, 3).map((stat, index) => ({
      label: stringOr(stat?.label, homeHero.stats[index]?.label ?? "Stat"),
      value: stringOr(stat?.value, homeHero.stats[index]?.value ?? "0")
    })) : homeHero.stats
  };
}

function stringOr(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}
