"use client";

import { useEffect } from "react";
import { trackContentView, trackGaEvent, trackMetaEvent, type AnalyticsPayload, type GaEventName, type MetaEventName } from "@/lib/analytics";

export function EventTracker({ gaEvent, metaEvent, payload = {} }: { gaEvent?: GaEventName; metaEvent?: MetaEventName; payload?: AnalyticsPayload }) {
  useEffect(() => {
    if (gaEvent) trackGaEvent(gaEvent, payload);
    if (metaEvent) trackMetaEvent(metaEvent, payload);
  }, [gaEvent, metaEvent, payload]);

  return null;
}

export function ContentViewTracker({ kind, payload }: { kind: "course" | "product"; payload: AnalyticsPayload }) {
  useEffect(() => {
    trackContentView(kind, payload);
  }, [kind, payload]);

  return null;
}
