export type GaEventName =
  | "page_view"
  | "course_view"
  | "product_view"
  | "lesson_start"
  | "lesson_progress"
  | "lesson_complete"
  | "assignment_submit"
  | "signup_complete"
  | "order_submit"
  | "download_click"
  | "certificate_claim";

export type MetaEventName =
  | "ViewContent"
  | "Lead"
  | "CompleteRegistration"
  | "InitiateCheckout"
  | "Purchase"
  | "Contact"
  | "Subscribe";

export interface AnalyticsPayload {
  eventId?: string;
  contentType?: string;
  contentId?: string;
  contentName?: string;
  value?: number;
  currency?: string;
  path?: string;
  [key: string]: unknown;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function analyticsEventId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function trackGaEvent(eventName: GaEventName, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", eventName, payload);
}

export function trackMetaEvent(eventName: MetaEventName, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined" || !window.fbq) return;
  const eventId = payload.eventId ?? analyticsEventId(eventName);
  window.fbq("track", eventName, payload, { eventID: eventId });
  void fetch("/api/meta-capi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventName, eventId, customData: payload, eventSourceUrl: window.location.href })
  }).catch(() => undefined);
}

export function trackContentView(kind: "course" | "product", payload: AnalyticsPayload) {
  trackGaEvent(kind === "course" ? "course_view" : "product_view", payload);
  trackMetaEvent("ViewContent", { ...payload, contentType: kind });
}
