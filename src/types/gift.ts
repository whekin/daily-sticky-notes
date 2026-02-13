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
