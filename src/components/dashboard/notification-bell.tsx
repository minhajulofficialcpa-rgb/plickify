import { Bell } from "lucide-react";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/actions/notifications";
import { Button } from "@/components/ui/button";
import type { AppNotification } from "@/lib/notifications";

export function NotificationBell({ notifications }: { notifications: AppNotification[] }) {
  const unreadCount = notifications.filter((notification) => notification.status === "unread").length;

  return (
    <details className="relative">
      <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/[0.08]">
        <Bell className="h-4 w-4" />
        {unreadCount ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-black text-accent-foreground">{unreadCount}</span> : null}
      </summary>
      <div className="absolute right-0 z-30 mt-3 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-slate-950 p-3 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <p className="font-bold text-white">Notifications</p>
            <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
          </div>
          {unreadCount ? <form action={markAllNotificationsReadAction}><Button type="submit" size="sm" variant="secondary">Read all</Button></form> : null}
        </div>
        <div className="mt-3 grid max-h-96 gap-2 overflow-y-auto">
          {notifications.length ? notifications.map((notification) => (
            <article key={notification.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-white">{notification.title}</p>
                  {notification.body ? <p className="mt-1 text-xs text-muted-foreground">{notification.body}</p> : null}
                  <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{notification.event_type ?? "notification"}</p>
                </div>
                {notification.status === "unread" ? <span className="mt-1 h-2 w-2 rounded-full bg-accent" /> : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {notification.action_url ? <a href={notification.action_url} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">Open</a> : null}
                {notification.status === "unread" ? (
                  <form action={markNotificationReadAction}>
                    <input type="hidden" name="id" value={notification.id} />
                    <button type="submit" className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">Mark read</button>
                  </form>
                ) : null}
              </div>
            </article>
          )) : <p className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-muted-foreground">No notifications yet.</p>}
        </div>
      </div>
    </details>
  );
}
