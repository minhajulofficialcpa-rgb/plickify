"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackGaEvent } from "@/lib/analytics";

interface LessonPlayerProps {
  lessonId: string;
  title: string;
  embedUrl: string | null;
  initialPositionSeconds: number;
  durationSeconds: number;
  watermark: string;
}

function formatSeconds(value: number) {
  const minutes = Math.floor(value / 60).toString().padStart(2, "0");
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function LessonPlayer({ lessonId, title, embedUrl, initialPositionSeconds, durationSeconds, watermark }: LessonPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(initialPositionSeconds);
  const lastSentRef = useRef(initialPositionSeconds);
  const lastProgressEventRef = useRef(0);
  const completedEventSentRef = useRef(false);
  const startedAt = useMemo(() => Date.now(), []);

  useEffect(() => {
    if (!isPlaying) return;
    trackGaEvent("lesson_start", { lesson_id: lessonId, lesson_title: title, position_seconds: position });
  }, [isPlaying, lessonId, position, title]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setPosition((current) => Math.min(durationSeconds || Number.MAX_SAFE_INTEGER, current + 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [durationSeconds, isPlaying]);

  useEffect(() => {
    const progressPercent = durationSeconds ? Math.round((position / durationSeconds) * 100) : 0;
    if (progressPercent >= lastProgressEventRef.current + 25 && progressPercent < 100) {
      lastProgressEventRef.current = progressPercent;
      trackGaEvent("lesson_progress", { lesson_id: lessonId, lesson_title: title, progress_percent: progressPercent });
    }

    if (durationSeconds > 0 && position >= durationSeconds - 5 && !completedEventSentRef.current) {
      completedEventSentRef.current = true;
      trackGaEvent("lesson_complete", { lesson_id: lessonId, lesson_title: title, progress_percent: 100 });
    }
  }, [durationSeconds, lessonId, position, title]);

  useEffect(() => {
    const sendHeartbeat = async () => {
      if (Math.abs(position - lastSentRef.current) < 10) return;
      lastSentRef.current = position;
      await fetch(`/api/lessons/${lessonId}/heartbeat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          positionSeconds: position,
          durationSeconds,
          isCompleted: durationSeconds > 0 && position >= durationSeconds - 5
        })
      }).catch(() => undefined);
    };

    const timer = window.setInterval(sendHeartbeat, 10000);
    return () => window.clearInterval(timer);
  }, [durationSeconds, lessonId, position]);

  useEffect(() => {
    return () => {
      const watchedFor = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
      navigator.sendBeacon?.(
        `/api/lessons/${lessonId}/heartbeat`,
        new Blob([JSON.stringify({ positionSeconds: position, durationSeconds, watchedFor })], { type: "application/json" })
      );
    };
  }, [durationSeconds, lessonId, position, startedAt]);

  return (
    <section className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-black shadow-2xl shadow-black/30">
      <div className="relative aspect-video bg-slate-950">
        {embedUrl ? (
          <iframe
            title={title}
            src={embedUrl}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
            Video source is not configured yet. The protected player shell is ready for this lesson.
          </div>
        )}
        <div className="pointer-events-none absolute right-4 top-4 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur">
          {watermark}
        </div>
        <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 rotate-[-8deg] select-none text-3xl font-black text-white/10 sm:text-5xl">
          {watermark}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-white/[0.04] p-4">
        <div>
          <p className="text-sm font-bold text-white">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">Resume point {formatSeconds(position)}{durationSeconds ? ` / ${formatSeconds(durationSeconds)}` : ""}</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => setPosition(0)} aria-label="Restart lesson">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button type="button" variant="accent" size="sm" onClick={() => setIsPlaying((value) => !value)}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? "Pause tracking" : "Start tracking"}
          </Button>
        </div>
      </div>
    </section>
  );
}
