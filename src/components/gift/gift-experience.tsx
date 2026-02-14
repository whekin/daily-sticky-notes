"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Archive, Clock3, PawPrint, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PushNotificationSettings } from "@/components/gift/push-notification-settings";
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
import {
  type AppLocale,
  buildLocaleHref,
  type GiftCopy,
  getLocaleCopy,
  SUPPORTED_LOCALES,
} from "@/lib/i18n";
import { getGiftExperienceData } from "@/lib/supabase/gift-rpc";
import { cn } from "@/lib/utils";
import type { GiftExperienceData } from "@/types/gift";

interface GiftExperienceProps {
  slug: string;
  locale: AppLocale;
  demoMode?: boolean;
}

interface CatNoteCardProps {
  body: string;
  dayLabel: string;
  cardImageAlt: string;
  memoryImageAlt: string;
  imageUrl?: string | null;
  compact?: boolean;
}

const isDev = process.env.NODE_ENV !== "production";
const CAT_NOTE_IMAGE_SRC = "/images/cat-sticky-note-v3.png";

function resolveTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function getLiteralBodyClass(): string {
  return "rotate-0";
}

function getFallbackBodyClass(): string {
  return "rotate-0";
}

function getMinFontPx(variant: "literal" | "fallback"): number {
  return variant === "literal" ? 12 : 14;
}

function getMaxFontPx(variant: "literal" | "fallback"): number {
  return variant === "literal" ? 66 : 64;
}

interface AutoFitHandwritingProps {
  body: string;
  variant: "literal" | "fallback";
}

function AutoFitHandwriting({ body, variant }: AutoFitHandwritingProps) {
  const isLiteral = variant === "literal";
  const lineHeight = isLiteral ? 1.14 : 1.1;
  const verticalSafetyPx = isLiteral ? 16 : 7;
  const horizontalSafetyPx = isLiteral ? 8 : 10;
  const minFontPx = getMinFontPx(variant);
  const maxFontPx = getMaxFontPx(variant);

  const textClass = variant === "literal" ? getLiteralBodyClass() : getFallbackBodyClass();

  const [fontSizePx, setFontSizePx] = useState(maxFontPx);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLParagraphElement | null>(null);

  const fitText = useCallback(() => {
    const container = containerRef.current;
    const text = textRef.current;

    if (!container || !text) {
      return;
    }

    let currentSize = maxFontPx;
    text.style.fontSize = `${currentSize}px`;
    text.style.lineHeight = String(lineHeight);

    const isOverflowing = () =>
      text.scrollHeight > container.clientHeight - verticalSafetyPx ||
      text.scrollWidth > container.clientWidth - horizontalSafetyPx;

    while (isOverflowing() && currentSize > minFontPx) {
      currentSize -= 0.5;
      text.style.fontSize = `${currentSize}px`;
    }

    setFontSizePx(Number(currentSize.toFixed(1)));
  }, [horizontalSafetyPx, lineHeight, maxFontPx, minFontPx, verticalSafetyPx]);

  useEffect(() => {
    fitText();

    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener("resize", fitText);
    return () => {
      window.removeEventListener("resize", fitText);
    };
  }, [fitText]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "h-full w-full px-1",
        "overflow-hidden",
        variant === "literal" ? "pt-2 pb-1" : "pt-1.5",
      )}
    >
      <p
        ref={textRef}
        className={cn(
          "font-handwriting break-words text-center tracking-[0.01em] text-[#4a3424] whitespace-pre-line [text-shadow:0_0_0.35px_rgba(74,52,36,0.95),0_1px_0_rgba(255,255,255,0.42)]",
          textClass,
        )}
        style={{
          fontSize: `${fontSizePx}px`,
          lineHeight,
        }}
      >
        {body}
      </p>
    </div>
  );
}

function CatNoteCard({
  body,
  dayLabel,
  cardImageAlt,
  memoryImageAlt,
  imageUrl,
  compact = false,
}: CatNoteCardProps) {
  const [useLiteralImage, setUseLiteralImage] = useState(true);

  if (useLiteralImage) {
    return (
      <div className={cn("relative mx-auto w-full", compact ? "max-w-sm" : "max-w-2xl")}>
        <div className={cn("relative mx-auto", compact ? "max-w-xs" : "max-w-xl")}>
          <Image
            src={CAT_NOTE_IMAGE_SRC}
            alt={cardImageAlt}
            width={900}
            height={1200}
            className="h-auto w-full drop-shadow-[0_18px_24px_rgba(75,46,31,0.28)]"
            onError={() => setUseLiteralImage(false)}
            priority={!compact}
          />
          <p
            className={cn(
              "pointer-events-none absolute left-1/2 z-20 inline-flex -translate-x-1/2 items-center font-semibold text-[#4f3526] uppercase [text-shadow:0_1px_0_rgba(255,245,232,0.85)]",
              compact
                ? "top-[77.35%] origin-center scale-[0.68] gap-0.5 text-xs tracking-[0.14em]"
                : "top-[77.8%] gap-1 text-xs tracking-[0.18em]",
            )}
          >
            <PawPrint className={cn(compact ? "h-2.5 w-2.5" : "h-3 w-3")} />
            {dayLabel}
          </p>
          <div
            className={cn(
              "absolute z-10 flex items-start justify-center text-center",
              "left-[29.5%] top-[32.8%] h-[33.4%] w-[40.6%] px-1.5",
            )}
          >
            <AutoFitHandwriting body={body} variant="literal" />
          </div>
        </div>
        {!compact && imageUrl ? (
          <Image
            src={imageUrl}
            alt={memoryImageAlt}
            className="mx-auto mt-4 h-44 w-full max-w-md rounded-2xl border border-amber-200 object-cover"
            height={176}
            width={352}
            unoptimized
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("relative mx-auto w-full", compact ? "max-w-sm" : "max-w-2xl")}>
      {!compact ? (
        <div className="pointer-events-none absolute inset-x-6 -top-6 -bottom-10 -z-10 overflow-hidden rounded-[2rem] border border-[#f6ccb2] shadow-[0_20px_50px_-30px_rgba(70,40,20,0.45)]">
          <div className="h-1/2 w-full bg-[#f8d8c4]" />
          <div className="h-1/2 w-full bg-[linear-gradient(90deg,#d8a58f_0_20%,#f8e7df_20_40%,#d8a58f_40_60%,#f8e7df_60_80%,#d8a58f_80_100%)] opacity-45" />
        </div>
      ) : null}

      <div
        className={cn(
          "relative border-[3px] border-[#f2c6a8] bg-[#fffaf3] text-[#4a3424]",
          "shadow-[0_24px_50px_-32px_rgba(85,52,28,0.7)]",
          compact ? "rounded-[2.5rem] px-6 pt-10 pb-14" : "rounded-[3.5rem] px-8 pt-14 pb-20",
        )}
      >
        <div
          className={cn(
            "absolute rounded-full border-[3px] border-[#f2c6a8] bg-[#fffaf3]",
            compact ? "left-10 -top-8 h-14 w-14" : "left-14 -top-10 h-20 w-20",
          )}
        />
        <div
          className={cn(
            "absolute rounded-full border-[3px] border-[#f2c6a8] bg-[#fffaf3]",
            compact ? "right-10 -top-8 h-14 w-14" : "right-14 -top-10 h-20 w-20",
          )}
        />

        <div
          className={cn(
            "absolute rounded-full border-[3px] border-[#f2c6a8] bg-[#fffaf3]",
            compact ? "-left-5 bottom-10 h-16 w-16" : "-left-6 bottom-12 h-20 w-20",
          )}
        />
        <div
          className={cn(
            "absolute rounded-full border-[3px] border-[#f2c6a8] bg-[#fffaf3]",
            compact ? "-right-5 bottom-10 h-16 w-16" : "-right-6 bottom-12 h-20 w-20",
          )}
        />

        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 border-[3px] border-[#f2c6a8] bg-[#f6bf7f]",
            "relative",
            compact
              ? "-bottom-12 h-[4.5rem] w-[3.5rem] rounded-b-[2rem]"
              : "-bottom-14 h-24 w-[4.5rem] rounded-b-[2.25rem]",
          )}
        >
          <p
            className={cn(
              "pointer-events-none absolute left-1/2 top-1 z-10 inline-flex -translate-x-1/2 items-center gap-1 font-semibold tracking-[0.14em] text-[#4f3526] uppercase [text-shadow:0_1px_0_rgba(255,246,233,0.85)]",
              compact ? "-top-1 text-[9px]" : "-top-0.5 text-[10px]",
            )}
          >
            <PawPrint className={cn(compact ? "h-2 w-2" : "h-2.5 w-2.5")} />
            {dayLabel}
          </p>
          <div className="mx-auto mt-4 h-1.5 w-[80%] rounded bg-[#3f2f25]/75" />
          <div className="mx-auto mt-3 h-1.5 w-[82%] rounded bg-[#3f2f25]/75" />
          <div className="mx-auto mt-3 h-1.5 w-[78%] rounded bg-[#3f2f25]/75" />
        </div>

        {!compact ? (
          <>
            <span className="absolute left-2 top-1/3 text-4xl text-[#8a5a43]">(</span>
            <span className="absolute right-2 top-1/3 text-4xl text-[#8a5a43]">)</span>
          </>
        ) : null}

        <div
          className={cn(
            compact ? "h-[9.3rem] w-[72%]" : "h-[14.2rem] w-[74%]",
            "mx-auto flex items-start justify-center pt-2",
          )}
        >
          <AutoFitHandwriting body={body} variant="fallback" />
        </div>

        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={memoryImageAlt}
            className="mt-5 h-44 w-full rounded-2xl border border-amber-200 object-cover"
            height={176}
            width={352}
            unoptimized
          />
        ) : null}
      </div>
    </div>
  );
}

interface GiftLoadingStateProps {
  copy: GiftCopy;
}

function GiftLoadingState({ copy }: GiftLoadingStateProps) {
  return (
    <section className="relative grid w-full gap-8 lg:grid-cols-[1fr_0.95fr]">
      <div className="space-y-5">
        <header className="space-y-2">
          <div className="h-7 w-36 animate-pulse rounded-full bg-primary/15" />
          <div className="h-14 w-72 animate-pulse rounded-lg bg-foreground/10" />
          <div className="h-5 w-80 animate-pulse rounded-md bg-foreground/10" />
        </header>

        <article
          className={cn(
            "relative min-h-[320px] rounded-2xl border border-amber-300/55 bg-[#FFF6BF]/95 p-7 shadow-[0_28px_60px_-24px_rgba(100,77,38,0.55)]",
            "before:absolute before:-top-3 before:left-1/2 before:h-7 before:w-16 before:-translate-x-1/2 before:rounded-md before:bg-rose-300/70 before:shadow-sm",
          )}
        >
          <div className="mb-4 h-4 w-20 animate-pulse rounded bg-amber-700/15" />
          <div className="space-y-3">
            <div className="h-6 w-full animate-pulse rounded bg-amber-700/15" />
            <div className="h-6 w-[92%] animate-pulse rounded bg-amber-700/15" />
            <div className="h-6 w-[78%] animate-pulse rounded bg-amber-700/15" />
          </div>
          <p className="mt-6 font-handwriting text-2xl text-[#6D5B3A]">{copy.loadingTodayNote}</p>
        </article>
      </div>

      <aside className="space-y-4">
        <Card className="border-primary/20 bg-card/80 shadow-md backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl">{copy.preparingMemoryBoard}</CardTitle>
            <CardDescription>{copy.fetchingUnlockContext}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-4 w-3/4 animate-pulse rounded bg-foreground/10" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-foreground/10" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-foreground/10" />
          </CardContent>
        </Card>
        <div className="h-11 w-full animate-pulse rounded-md bg-foreground/10" />
      </aside>
    </section>
  );
}

export function GiftExperience({ slug, locale, demoMode = false }: GiftExperienceProps) {
  const copy = getLocaleCopy(locale);
  const giftCopy = copy.gift;
  const timezone = useMemo(resolveTimezone, []);
  const [data, setData] = useState<GiftExperienceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const nextData = await getGiftExperienceData(slug, timezone, locale, demoMode);
        if (!active) {
          return;
        }

        setData(nextData);
        setError(null);

        const today = nextData.notes.find((note) => note.isToday);
        logClientDebug("info", "Gift experience loaded", {
          slug,
          timezone,
          demoMode,
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

        if (today && !demoMode) {
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
          locale,
          demoMode,
          error: loadError,
        });
        setError(
          loadError instanceof Error
            ? loadError.message
            : getLocaleCopy(locale).gift.loadErrorFallback,
        );
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
  }, [demoMode, locale, slug, timezone]);

  if (loading) {
    return <GiftLoadingState copy={giftCopy} />;
  }

  if (error) {
    return (
      <Card className="border-destructive/30 bg-card/85 shadow-lg backdrop-blur">
        <CardHeader>
          <CardTitle className="font-display text-3xl">{giftCopy.loadErrorTitle}</CardTitle>
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs tracking-wide text-primary uppercase">
              <Sparkles className="h-4 w-4" />
              {giftCopy.dailyInspiration}
            </p>
            <div className="flex items-center gap-1 rounded-full border border-border/80 bg-background/70 p-1">
              {SUPPORTED_LOCALES.map((nextLocale) => (
                <Button
                  key={nextLocale}
                  asChild
                  size="xs"
                  variant={nextLocale === locale ? "secondary" : "ghost"}
                >
                  <Link href={buildLocaleHref(`/gift/${slug}`, nextLocale)}>
                    {copy.localeNames[nextLocale]}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
          <h1 className="font-display text-5xl leading-tight text-foreground">
            {giftCopy.forYouToday}
          </h1>
          <p className="max-w-md text-muted-foreground">{giftCopy.dailyUnlockDescription}</p>
        </header>

        <AnimatePresence mode="wait">
          {todayNote ? (
            <motion.article
              key={todayNote.id}
              initial={{ opacity: 0, rotate: -5, y: 40 }}
              animate={{ opacity: 1, rotate: -1, y: 0 }}
              exit={{ opacity: 0, rotate: 4, y: -20 }}
              transition={{ type: "spring", stiffness: 140, damping: 17 }}
              className="pt-2"
            >
              <CatNoteCard
                body={todayNote.body}
                dayLabel={giftCopy.dayLabel(todayNote.dayIndex)}
                cardImageAlt={giftCopy.cardImageAlt}
                memoryImageAlt={giftCopy.memoryImageAlt}
                imageUrl={todayNote.imageUrl}
              />
            </motion.article>
          ) : (
            <Card className="border-primary/20 bg-card/80">
              <CardHeader>
                <CardTitle>{giftCopy.noNoteUnlocked}</CardTitle>
                <CardDescription>{giftCopy.comeBackLaterToday}</CardDescription>
              </CardHeader>
            </Card>
          )}
        </AnimatePresence>
      </div>

      <aside className="space-y-4">
        <Card className="border-primary/20 bg-card/80 shadow-md backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl">{giftCopy.unlockStatus}</CardTitle>
            <CardDescription>
              {giftCopy.notesUnlocked(data.context.unlockedCount, data.context.totalCount)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              {giftCopy.timezoneLabel(data.context.timezone)}
            </p>
            <p>{giftCopy.unlockHourDescription(data.context.unlockHour)}</p>
            <p>{giftCopy.archiveDescription}</p>
            {isDev ? (
              <p className="text-xs opacity-70">{giftCopy.debugSource(data.source)}</p>
            ) : null}
          </CardContent>
        </Card>

        <PushNotificationSettings copy={giftCopy} slug={slug} />

        <Sheet>
          <SheetTrigger asChild>
            <Button className="w-full justify-between" variant="secondary">
              {giftCopy.openMemoryBoard}
              <Archive className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>{giftCopy.memoryBoardTitle}</SheetTitle>
              <SheetDescription>{giftCopy.memoryBoardDescription}</SheetDescription>
            </SheetHeader>
            <div className="space-y-5 p-4">
              {archivedNotes.length ? (
                archivedNotes.map((note) => (
                  <CatNoteCard
                    key={note.id}
                    body={note.body}
                    dayLabel={giftCopy.dayLabel(note.dayIndex)}
                    cardImageAlt={giftCopy.cardImageAlt}
                    memoryImageAlt={giftCopy.memoryImageAlt}
                    compact
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6 text-sm text-muted-foreground">
                    {giftCopy.noArchivedNotes}
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
