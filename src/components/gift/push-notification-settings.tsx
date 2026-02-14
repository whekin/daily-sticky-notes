"use client";

import { Bell, BellOff, Clock3, LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { GiftCopy } from "@/lib/i18n";
import { parseTimeInput } from "@/lib/notifications/schedule";
import { publicEnv } from "@/lib/public-env";
import type { PushSubscriptionPayload } from "@/types/gift";

interface PushNotificationSettingsProps {
  slug: string;
  copy: Pick<
    GiftCopy,
    | "notificationsTitle"
    | "notificationsDescription"
    | "notificationsUnsupported"
    | "notificationsPermissionDenied"
    | "notificationsEnable"
    | "notificationsDisable"
    | "notificationsTimeLabel"
    | "notificationsSaveTime"
    | "notificationsEnabledStatus"
    | "notificationsDisabledStatus"
    | "notificationsSavedStatus"
    | "notificationsErrorStatus"
  >;
}

const DEFAULT_TIME = "09:00";
const PRESET_TIMES = ["08:00", "09:00", "12:00", "18:00", "21:00"] as const;
const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, "0"));
const HOUR_OPTIONS = Array.from({ length: 12 }, (_, index) => String(index + 1));
const MERIDIEM_OPTIONS = ["AM", "PM"] as const;
const WHEEL_ITEM_HEIGHT = 40;
const WHEEL_VISIBLE_ROWS = 5;
const WHEEL_PADDING = ((WHEEL_VISIBLE_ROWS - 1) / 2) * WHEEL_ITEM_HEIGHT;

type Meridiem = "AM" | "PM";

interface TimeControlState {
  hour12: string;
  minute: string;
  meridiem: Meridiem;
}

interface TimeWheelColumnProps {
  options: readonly string[];
  value: string;
  onChange: (nextValue: string) => void;
  ariaLabel: string;
}

function getLocalStorageKey(slug: string): string {
  return `valentine.push.time.${slug}`;
}

function getTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function toApplicationServerKey(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);

  for (let index = 0; index < raw.length; index += 1) {
    output[index] = raw.charCodeAt(index);
  }

  return output.buffer;
}

function supportsPushNotifications(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

function toTimeControlState(value: string): TimeControlState {
  const parsed = parseTimeInput(value) ?? parseTimeInput(DEFAULT_TIME);

  if (!parsed) {
    return {
      hour12: "9",
      minute: "00",
      meridiem: "AM",
    };
  }

  return {
    hour12: String(parsed.hour % 12 || 12),
    minute: String(parsed.minute).padStart(2, "0"),
    meridiem: parsed.hour >= 12 ? "PM" : "AM",
  };
}

function to24HourTimeValue(state: TimeControlState): string {
  const baseHour = Number(state.hour12) % 12;
  const hour = state.meridiem === "PM" ? baseHour + 12 : baseHour;
  return `${String(hour).padStart(2, "0")}:${state.minute}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function TimeWheelColumn({ options, value, onChange, ariaLabel }: TimeWheelColumnProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const scrollEndTimeoutRef = useRef<number | null>(null);
  const selectedIndex = Math.max(options.indexOf(value), 0);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }

    const top = selectedIndex * WHEEL_ITEM_HEIGHT;
    if (Math.abs(scroller.scrollTop - top) > 2) {
      scroller.scrollTo({ top, behavior: "auto" });
    }
  }, [selectedIndex]);

  useEffect(
    () => () => {
      if (scrollEndTimeoutRef.current !== null) {
        window.clearTimeout(scrollEndTimeoutRef.current);
      }
    },
    [],
  );

  const snapToClosest = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }

    const nextIndex = clamp(
      Math.round(scroller.scrollTop / WHEEL_ITEM_HEIGHT),
      0,
      options.length - 1,
    );
    const nextValue = options[nextIndex];
    const alignedTop = nextIndex * WHEEL_ITEM_HEIGHT;

    if (Math.abs(scroller.scrollTop - alignedTop) > 1) {
      scroller.scrollTo({ top: alignedTop, behavior: "smooth" });
    }

    if (nextValue && nextValue !== value) {
      onChange(nextValue);
    }
  }, [onChange, options, value]);

  const handleScroll = useCallback(() => {
    if (scrollEndTimeoutRef.current !== null) {
      window.clearTimeout(scrollEndTimeoutRef.current);
    }

    scrollEndTimeoutRef.current = window.setTimeout(() => {
      snapToClosest();
    }, 90);
  }, [snapToClosest]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-2 top-1/2 z-20 h-10 -translate-y-1/2 rounded-lg border border-primary/30 bg-primary/12 shadow-[0_0_0_1px_rgba(255,255,255,0.25)_inset]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-14 bg-gradient-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-14 bg-gradient-to-t from-background to-transparent" />
      <div
        aria-label={ariaLabel}
        className="h-[200px] overflow-y-auto rounded-xl border border-border/80 bg-card/70 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        onScroll={handleScroll}
        ref={scrollerRef}
        role="listbox"
        style={{
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div style={{ paddingTop: `${WHEEL_PADDING}px`, paddingBottom: `${WHEEL_PADDING}px` }}>
          {options.map((option) => {
            const selected = option === value;

            return (
              <button
                aria-selected={selected}
                className="flex h-10 w-full snap-center items-center justify-center text-base font-medium text-foreground/80 transition-colors hover:text-foreground data-[selected=true]:text-foreground"
                data-selected={selected}
                key={option}
                onClick={() => onChange(option)}
                role="option"
                type="button"
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function buildSubscriptionPayload(
  slug: string,
  timeValue: string,
  subscription: PushSubscription,
): PushSubscriptionPayload | null {
  const parsedTime = parseTimeInput(timeValue);
  if (!parsedTime) {
    return null;
  }

  const json = subscription.toJSON();
  const keys = json.keys;

  const p256dh = keys?.["p256dh"];
  const auth = keys?.["auth"];

  if (!p256dh || !auth || !subscription.endpoint) {
    return null;
  }

  return {
    slug,
    timezone: getTimezone(),
    notifyHour: parsedTime.hour,
    notifyMinute: parsedTime.minute,
    endpoint: subscription.endpoint,
    keys: {
      p256dh,
      auth,
    },
  };
}

async function upsertSubscription(payload: PushSubscriptionPayload): Promise<void> {
  const response = await fetch("/api/v1/notifications/subscriptions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to upsert push subscription.");
  }
}

async function deleteSubscription(endpoint: string): Promise<void> {
  await fetch("/api/v1/notifications/subscriptions", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ endpoint }),
  });
}

export function PushNotificationSettings({ slug, copy }: PushNotificationSettingsProps) {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [timeValue, setTimeValue] = useState(DEFAULT_TIME);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  const timeControl = useMemo(() => toTimeControlState(timeValue), [timeValue]);
  const prettyTime = `${timeControl.hour12}:${timeControl.minute} ${timeControl.meridiem}`;
  const hasVapidKey = Boolean(publicEnv.NEXT_PUBLIC_PUSH_VAPID_PUBLIC_KEY);
  const isValidTime = Boolean(parseTimeInput(timeValue));
  const canSetup = useMemo(
    () => supported && hasVapidKey && permission !== "denied",
    [hasVapidKey, permission, supported],
  );

  const syncSubscription = useCallback(
    async (nextSubscription: PushSubscription, nextTimeValue: string) => {
      const payload = buildSubscriptionPayload(slug, nextTimeValue, nextSubscription);
      if (!payload) {
        throw new Error("Invalid subscription payload.");
      }

      await upsertSubscription(payload);
    },
    [slug],
  );

  useEffect(() => {
    let active = true;

    async function loadState() {
      if (!supportsPushNotifications()) {
        if (active) {
          setSupported(false);
          setLoading(false);
        }
        return;
      }

      const savedTime = window.localStorage.getItem(getLocalStorageKey(slug));
      if (savedTime && parseTimeInput(savedTime) && active) {
        setTimeValue(savedTime);
      }

      setSupported(true);
      setPermission(Notification.permission);

      const registration = await navigator.serviceWorker.register("/sw.js");
      const existing = await registration.pushManager.getSubscription();

      if (!active) {
        return;
      }

      setSubscription(existing);
      setEnabled(Boolean(existing));
      setLoading(false);
    }

    void loadState().catch(() => {
      if (!active) {
        return;
      }

      setSupported(false);
      setLoading(false);
      setStatusMessage(copy.notificationsErrorStatus);
    });

    return () => {
      active = false;
    };
  }, [copy.notificationsErrorStatus, slug]);

  const handleEnable = useCallback(async () => {
    if (!canSetup || !isValidTime || !publicEnv.NEXT_PUBLIC_PUSH_VAPID_PUBLIC_KEY) {
      setStatusMessage(copy.notificationsErrorStatus);
      return;
    }

    setBusy(true);
    setStatusMessage(null);

    try {
      const requestedPermission = await Notification.requestPermission();
      setPermission(requestedPermission);

      if (requestedPermission !== "granted") {
        setStatusMessage(copy.notificationsPermissionDenied);
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      let nextSubscription = await registration.pushManager.getSubscription();

      if (!nextSubscription) {
        nextSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: toApplicationServerKey(publicEnv.NEXT_PUBLIC_PUSH_VAPID_PUBLIC_KEY),
        });
      }

      await syncSubscription(nextSubscription, timeValue);
      window.localStorage.setItem(getLocalStorageKey(slug), timeValue);

      setSubscription(nextSubscription);
      setEnabled(true);
      setStatusMessage(copy.notificationsEnabledStatus);
    } catch {
      setStatusMessage(copy.notificationsErrorStatus);
    } finally {
      setBusy(false);
    }
  }, [
    canSetup,
    copy.notificationsEnabledStatus,
    copy.notificationsErrorStatus,
    copy.notificationsPermissionDenied,
    isValidTime,
    slug,
    syncSubscription,
    timeValue,
  ]);

  const handleDisable = useCallback(async () => {
    if (!subscription) {
      setEnabled(false);
      setStatusMessage(copy.notificationsDisabledStatus);
      return;
    }

    setBusy(true);
    setStatusMessage(null);

    try {
      await deleteSubscription(subscription.endpoint);
      await subscription.unsubscribe();
      setSubscription(null);
      setEnabled(false);
      setStatusMessage(copy.notificationsDisabledStatus);
    } catch {
      setStatusMessage(copy.notificationsErrorStatus);
    } finally {
      setBusy(false);
    }
  }, [copy.notificationsDisabledStatus, copy.notificationsErrorStatus, subscription]);

  const handleSaveTime = useCallback(async () => {
    if (!subscription) {
      return;
    }

    setBusy(true);
    setStatusMessage(null);

    try {
      await syncSubscription(subscription, timeValue);
      window.localStorage.setItem(getLocalStorageKey(slug), timeValue);
      setStatusMessage(copy.notificationsSavedStatus);
    } catch {
      setStatusMessage(copy.notificationsErrorStatus);
    } finally {
      setBusy(false);
    }
  }, [
    copy.notificationsErrorStatus,
    copy.notificationsSavedStatus,
    slug,
    subscription,
    syncSubscription,
    timeValue,
  ]);

  const updateHour = useCallback((nextHour: string) => {
    setTimeValue((current) =>
      to24HourTimeValue({
        ...toTimeControlState(current),
        hour12: nextHour,
      }),
    );
  }, []);

  const updateMinute = useCallback((nextMinute: string) => {
    setTimeValue((current) =>
      to24HourTimeValue({
        ...toTimeControlState(current),
        minute: nextMinute,
      }),
    );
  }, []);

  const updateMeridiem = useCallback((nextMeridiem: Meridiem) => {
    setTimeValue((current) =>
      to24HourTimeValue({
        ...toTimeControlState(current),
        meridiem: nextMeridiem,
      }),
    );
  }, []);

  if (loading) {
    return (
      <Card className="border-primary/20 bg-card/80 shadow-md backdrop-blur">
        <CardHeader>
          <CardTitle className="text-xl">{copy.notificationsTitle}</CardTitle>
          <CardDescription>{copy.notificationsDescription}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p className="inline-flex items-center gap-2">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Loading...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-card/80 shadow-md backdrop-blur">
      <CardHeader>
        <CardTitle className="text-xl">{copy.notificationsTitle}</CardTitle>
        <CardDescription>{copy.notificationsDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        {!supported ? (
          <p>{copy.notificationsUnsupported}</p>
        ) : permission === "denied" ? (
          <p>{copy.notificationsPermissionDenied}</p>
        ) : (
          <>
            <div className="space-y-2 rounded-xl border border-primary/20 bg-background/70 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-foreground">{copy.notificationsTimeLabel}</p>
                <p className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-card px-2 py-1 text-xs text-foreground">
                  <Clock3 className="h-3.5 w-3.5" />
                  {prettyTime}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <TimeWheelColumn
                  ariaLabel="Hour"
                  onChange={updateHour}
                  options={HOUR_OPTIONS}
                  value={timeControl.hour12}
                />
                <TimeWheelColumn
                  ariaLabel="Minute"
                  onChange={updateMinute}
                  options={MINUTE_OPTIONS}
                  value={timeControl.minute}
                />
                <TimeWheelColumn
                  ariaLabel="AM PM"
                  onChange={(nextValue) => updateMeridiem(nextValue as Meridiem)}
                  options={MERIDIEM_OPTIONS}
                  value={timeControl.meridiem}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {PRESET_TIMES.map((preset) => (
                  <Button
                    key={preset}
                    onClick={() => setTimeValue(preset)}
                    size="xs"
                    type="button"
                    variant={preset === timeValue ? "secondary" : "outline"}
                  >
                    {preset}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {enabled ? (
                <>
                  <Button
                    disabled={busy || !isValidTime}
                    onClick={handleSaveTime}
                    variant="secondary"
                  >
                    {copy.notificationsSaveTime}
                  </Button>
                  <Button disabled={busy} onClick={handleDisable} variant="outline">
                    {copy.notificationsDisable}
                    <BellOff className="ml-2 h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button disabled={busy || !canSetup || !isValidTime} onClick={handleEnable}>
                  {copy.notificationsEnable}
                  <Bell className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </>
        )}

        {statusMessage ? <p>{statusMessage}</p> : null}
      </CardContent>
    </Card>
  );
}
