import { PlayCircle } from "lucide-react";

export function PlayerPlaceholder() {
  return (
    <div className="grid aspect-video place-items-center rounded-3xl border border-white/10 bg-white/[0.07] text-muted-foreground">
      <div className="text-center"><PlayCircle className="mx-auto mb-3 h-10 w-10 text-accent" /><p>Course player placeholder</p></div>
    </div>
  );
}
