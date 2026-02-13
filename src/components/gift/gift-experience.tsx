"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Archive, CalendarDays, Clock3, Sparkles } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { logClientDebug } from "@/lib/client-debug";
import { getGiftExperienceData } from "@/lib/supabase/gift-rpc";
import { cn } from "@/lib/utils";
import type { GiftExperienceData } from "@/types/gift";

interface GiftExperienceProps {
  slug: string;
}

function resolveTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function formatTodayHeading(dayIndex: number): string {
  return `Day ${dayIndex}`;
}

export function GiftExperience({ slug }: GiftExperienceProps) {
  const timezone = useMemo(resolveTimezone, []);
  const [data, setData] = useState<GiftExperienceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const nextData = await getGiftExperienceData(slug, timezone);
        if (!active) {
          return;
        }

        setData(nextData);
        setError(null);

        const today = nextData.notes.find((note) => note.isToday);
        logClientDebug("info", "Gift experience loaded", {
          slug,
          timezone,
          source: nextData.source,
          unlockedCount: nextData.context.unlockedCount,
          notesCount: nextData.notes.length,
          hasTodayNote: Boolean(today),
        });

        if (!today) {
          logClientDebug("warn", "No today note available for render", {
            slug,
            timezone,
            dayIndex: nextData.context.dayIndex,
            unlockedCount: nextData.context.unlockedCount,
            totalCount: nextData.context.totalCount,
          });
        }

        if (today) {
          void fetch("/api/v1/events/opened", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              slug,
              timezone,
              dayIndex: today.dayIndex,
            }),
          }).catch((eventError: unknown) => {
            logClientDebug("warn", "Failed to send opened event", {
              slug,
              timezone,
              dayIndex: today.dayIndex,
              error: eventError,
            });
          });
        }
      } catch (loadError) {
        if (!active) {
          return;
        }

        logClientDebug("error", "Gift experience load failed", {
          slug,
          timezone,
          error: loadError,
        });
        setError(loadError instanceof Error ? loadError.message : "Failed to load gift notes.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [slug, timezone]);

  if (loading) {
    return (
      <Card className="border-primary/20 bg-card/80 shadow-lg backdrop-blur">
        <CardHeader>
          <CardTitle className="font-display text-3xl">Loading today&apos;s note...</CardTitle>
          <CardDescription>Preparing your memory board.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30 bg-card/85 shadow-lg backdrop-blur">
        <CardHeader>
          <CardTitle className="font-display text-3xl">Couldn&apos;t load notes</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const todayNote = data.notes.find((note) => note.isToday) ?? data.notes[0];
  const archivedNotes = data.notes.filter((note) => !note.isToday);

  return (
    <section className="relative grid gap-8 lg:grid-cols-[1fr_0.95fr]">
      <div className="space-y-5">
        <header className="space-y-2">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs tracking-wide text-primary uppercase">
            <Sparkles className="h-4 w-4" />
            Daily inspiration
          </p>
          <h1 className="font-display text-5xl leading-tight text-foreground">For you, today.</h1>
          <p className="max-w-md text-muted-foreground">
            A new sticky note appears each day at 7:00 AM in your current timezone.
          </p>
        </header>

        <AnimatePresence mode="wait">
          {todayNote ? (
            <motion.article
              key={todayNote.id}
              initial={{ opacity: 0, rotate: -5, y: 40 }}
              animate={{ opacity: 1, rotate: -1, y: 0 }}
              exit={{ opacity: 0, rotate: 4, y: -20 }}
              transition={{ type: "spring", stiffness: 140, damping: 17 }}
              className={cn(
                "relative rounded-2xl border border-amber-300/60 bg-[#FFF6BF]/95 p-7 text-[#4A3A22] shadow-[0_28px_60px_-24px_rgba(100,77,38,0.55)]",
                "before:absolute before:-top-3 before:left-1/2 before:h-7 before:w-16 before:-translate-x-1/2 before:rounded-md before:bg-rose-300/70 before:shadow-sm",
              )}
            >
              <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
                <CalendarDays className="h-4 w-4" />
                {formatTodayHeading(todayNote.dayIndex)}
              </p>
              <p className="text-lg leading-relaxed whitespace-pre-line">{todayNote.body}</p>
              {todayNote.imageUrl ? (
                <Image
                  src={todayNote.imageUrl}
                  alt="Note memory"
                  className="mt-5 h-44 w-full rounded-xl border border-amber-200 object-cover"
                  height={176}
                  width={352}
                  unoptimized
                />
              ) : null}
            </motion.article>
          ) : (
            <Card className="border-primary/20 bg-card/80">
              <CardHeader>
                <CardTitle>No note unlocked yet</CardTitle>
                <CardDescription>Come back after the unlock time today.</CardDescription>
              </CardHeader>
            </Card>
          )}
        </AnimatePresence>
      </div>

      <aside className="space-y-4">
        <Card className="border-primary/20 bg-card/80 shadow-md backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl">Unlock status</CardTitle>
            <CardDescription>
              {data.context.unlockedCount} / {data.context.totalCount} notes unlocked
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              Timezone: {data.context.timezone}
            </p>
            <p>Unlock hour: {String(data.context.unlockHour).padStart(2, "0")}:00</p>
            <p>Start date: {data.context.startDate}</p>
            <p>Data source: {data.source}</p>
          </CardContent>
        </Card>

        <Sheet>
          <SheetTrigger asChild>
            <Button className="w-full justify-between" variant="secondary">
              Open memory board
              <Archive className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>Memory board</SheetTitle>
              <SheetDescription>Previous notes stay archived here.</SheetDescription>
            </SheetHeader>
            <div className="space-y-3 p-4">
              {archivedNotes.length ? (
                archivedNotes.map((note) => (
                  <Card key={note.id} className="border-amber-200 bg-[#FFF9D6] text-[#4A3A22]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Day {note.dayIndex}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed whitespace-pre-line">{note.body}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6 text-sm text-muted-foreground">
                    No archived notes yet.
                  </CardContent>
                </Card>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </aside>
    </section>
  );
}
