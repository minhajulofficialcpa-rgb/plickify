import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-16">
      <section className="w-full max-w-lg rounded-2xl border border-white/10 bg-card/80 p-8 text-center shadow-2xl shadow-black/20">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent/15 text-accent">
          <SearchX className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-3xl font-black text-white">Page not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">The page may have moved, expired, or never existed.</p>
        <Button asChild variant="accent" className="mt-6"><Link href="/">Go home</Link></Button>
      </section>
    </main>
  );
}
