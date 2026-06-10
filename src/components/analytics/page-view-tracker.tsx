"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackContentView, trackGaEvent, trackMetaEvent } from "@/lib/analytics";

export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    trackGaEvent("page_view", { page_path: path, page_location: window.location.href });

    if (pathname.startsWith("/courses/")) {
      trackContentView("course", { path, contentId: pathname.split("/").at(-1), contentName: document.title });
    }

    if (pathname.startsWith("/products/")) {
      trackContentView("product", { path, contentId: pathname.split("/").at(-1), contentName: document.title });
    }

    if (pathname === "/contact" && searchParams.get("sent") === "1") {
      trackMetaEvent("Lead", { path, contentName: "Contact message" });
      trackMetaEvent("Contact", { path, contentName: "Contact message" });
    }
  }, [pathname, searchParams]);

  return null;
}
