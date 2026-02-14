export interface GiftNote {
  id: string;
  dayIndex: number;
  body: string;
  imageUrl: string | null;
  isToday: boolean;
}

export interface UnlockContext {
  dayIndex: number;
  unlockedCount: number;
  totalCount: number;
  isComplete: boolean;
  unlockHour: number;
  startDate: string;
  timezone: string;
}

export interface GiftExperienceData {
  notes: GiftNote[];
  context: UnlockContext;
  source: "supabase-rpc" | "local-fallback";
}

export interface OpenedEventPayload {
  slug: string;
  timezone: string;
  dayIndex: number;
}

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionPayload {
  slug: string;
  timezone: string;
  notifyHour: number;
  notifyMinute: number;
  endpoint: string;
  keys: PushSubscriptionKeys;
}

export interface PushSubscriptionDeletePayload {
  endpoint: string;
}
