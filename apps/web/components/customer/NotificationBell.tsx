"use client";

import { useCallback, useEffect, useState } from "react";
import { notificationApi, type NotificationItem } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { DEMO_MODE } from "@/lib/demo";
import { Action, Box, CustomerIcon, Dialog, IconButton, PlatformLink, Text } from "./ui";

const POLL_MS = 60_000;

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshCount = useCallback(async () => {
    if (DEMO_MODE || !isLoggedIn()) {
      setCount(0);
      return;
    }
    try {
      setCount(await notificationApi.unreadCount());
    } catch {
      // Keep the last known count. The next poll retries.
    }
  }, []);

  useEffect(() => {
    refreshCount();
    const id = window.setInterval(refreshCount, POLL_MS);
    return () => window.clearInterval(id);
  }, [refreshCount]);

  async function openPanel() {
    setOpen(true);
    setError("");
    if (DEMO_MODE) {
      setItems([]);
      return;
    }
    if (!isLoggedIn()) {
      setError("Sign in to see your notifications.");
      return;
    }
    setLoading(true);
    try {
      const page = await notificationApi.list(0, 20);
      setItems(page.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Notifications could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  async function markOne(item: NotificationItem) {
    if (item.read) return;
    setItems((list) => list.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
    setCount((c) => Math.max(0, c - 1));
    try {
      await notificationApi.markRead(item.id);
    } catch {
      refreshCount();
    }
  }

  async function markAll() {
    const previous = items;
    setItems((list) => list.map((n) => ({ ...n, read: true })));
    setCount(0);
    try {
      await notificationApi.markAllRead();
    } catch {
      setItems(previous);
      refreshCount();
    }
  }

  function openRow(item: NotificationItem) {
    markOne(item);
    if (!item.link) return;
    if (item.link.startsWith("/")) {
      setOpen(false);
    } else {
      window.open(item.link, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <>
      <Box className="c-notification-icon">
        <IconButton icon="bell" label={`Notifications, ${count} unread`} onClick={openPanel} />
        {count > 0 && <span className="c-unread-dot" />}
      </Box>

      <Dialog
        open={open}
        title="Notifications"
        onClose={() => setOpen(false)}
        actions={
          <Action disabled={DEMO_MODE || count === 0} onClick={markAll}>
            Mark all as read
          </Action>
        }
      >
        <Box className="c-dialog-stack">
          {loading && (
            <Text variant="small" tone="muted">
              Loading…
            </Text>
          )}
          {error && (
            <Text variant="small" tone="muted">
              {error}
            </Text>
          )}
          {!loading && !error && items.length === 0 && (
            <Text variant="small" tone="muted">
              No notifications yet.
            </Text>
          )}

          {items.map((item) => {
            const content = (
              <>
                <Box>
                  <Text>{item.title}</Text>
                  {item.body && (
                    <Text variant="small" tone="muted">
                      {item.body}
                    </Text>
                  )}
                  <Text variant="small" tone="muted">
                    {new Date(item.createdAt).toLocaleString()}
                    {!item.read && " · New"}
                  </Text>
                </Box>
                {item.link && <CustomerIcon name="arrowRight" size={16} />}
              </>
            );

            if (item.link && item.link.startsWith("/")) {
              return (
                <PlatformLink
                  key={item.id}
                  href={item.link}
                  className="c-notification"
                  onClick={() => openRow(item)}
                >
                  {content}
                </PlatformLink>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                className="c-notification"
                style={{ textAlign: "left" }}
                onClick={() => openRow(item)}
              >
                {content}
              </button>
            );
          })}
        </Box>
      </Dialog>
    </>
  );
}