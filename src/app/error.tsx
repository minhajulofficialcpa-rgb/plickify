"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-16">
      <section className="w-full max-w-lg rounded-2xl border border-white/10 bg-card/80 p-8 text-center shadow-2xl shadow-black/20">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-destructive/15 text-destructive">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-3xl font-black text-white">Something went wrong</h1>
        <p className="mt-3 text-sm text-muted-foreground">The request could not be completed. Please retry, or contact support if it keeps happening.</p>
        <Button type="button" variant="accent" className="mt-6" onClick={() => reset()}>
          <RotateCcw className="h-4 w-4" /> Retry
        </Button>
      </section>
    </main>
  );
}
