"use client";

import { useState } from "react";
import { Award, Headphones, MonitorPlay, Sparkles, Target, Users, X } from "lucide-react";
import type { HomeFeatureCard } from "@/lib/home-content";

const icons = {
  sparkles: Sparkles,
  monitor: MonitorPlay,
  users: Users,
  badge: Award,
  headphones: Headphones,
  target: Target
};

export function HomeFeatureDialogs({ features }: { features: HomeFeatureCard[] }) {
  const [activeFeature, setActiveFeature] = useState<HomeFeatureCard | null>(null);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => {
          const Icon = icons[feature.icon];
          return (
            <button
              key={feature.id}
              type="button"
              onClick={() => setActiveFeature(feature)}
              className="group grid min-h-52 content-between rounded-lg border border-border bg-card p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-accent/60 hover:shadow-xl hover:shadow-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent transition group-hover:bg-accent group-hover:text-accent-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-lg font-black text-foreground">{feature.title}</span>
                <span className="mt-3 block text-sm leading-6 text-muted-foreground">{feature.summary}</span>
              </span>
            </button>
          );
        })}
      </div>

      {activeFeature ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 px-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="feature-dialog-title" onClick={() => setActiveFeature(null)}>
          <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">Feature detail</p>
                <h3 id="feature-dialog-title" className="mt-3 text-2xl font-black text-foreground">{activeFeature.title}</h3>
              </div>
              <button type="button" onClick={() => setActiveFeature(null)} className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:text-foreground" aria-label="Close feature detail">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-5 text-base leading-7 text-muted-foreground">{activeFeature.detail}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
