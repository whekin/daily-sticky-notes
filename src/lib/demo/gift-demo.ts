import { GIFT_CONFIG } from "@/lib/config";
import { normalizeTimeZone } from "@/lib/gift-time";
import type { AppLocale } from "@/lib/i18n";
import type { GiftExperienceData, GiftNote } from "@/types/gift";

const MS_IN_DAY = 86_400_000;

const DEMO_NOTE_BODIES: Record<AppLocale, string[]> = {
  en: [
    "You make ordinary moments feel special just by being there.",
    "You are my safe place, even on noisy days.",
    "I love your smile, and I love how kind your heart is.",
    "Thank you for believing in me when I doubt myself.",
    "With you, even a quiet evening feels like a little celebration.",
    "I admire how deeply you care about people you love.",
    "You inspire me to be softer, stronger, and more honest.",
    "I love how your laugh can reset my whole day.",
    "You are beautiful in ways words never fully capture.",
    "Being with you feels like coming home.",
    "I love the way you notice small details others miss.",
    "You are my favorite good morning and my favorite good night.",
    "I am grateful for us, for this, for every little step.",
    "You make hard days easier and happy days brighter.",
    "I still get excited when I see your name on my screen.",
    "You are not just loved, you are cherished.",
    "I admire your strength and your gentle soul.",
    "I love how patient you are, even when things are messy.",
    "You are my calm in chaos and my spark in routine.",
    "You make me want to build a beautiful life together.",
    "Thank you for your warmth, your trust, and your light.",
    "You are the reason many of my best memories exist.",
    "I love you for who you are, not for what you do.",
    "You make this world feel kinder and safer for me.",
    "I admire your talent and the way you see beauty.",
    "I am proud of you, always.",
    "You are my daily reminder that love can be gentle and strong.",
    "I choose you in every season.",
    "You are my favorite person, every single day.",
    "Thank you for being you. I love you deeply.",
  ],
  ru: [
    "Пусть этот день будет спокойным и добрым.",
    "Пусть маленькие радости находят тебя сегодня чаще.",
    "Ты заслуживаешь бережности, тепла и поддержки.",
    "Даже небольшой шаг сегодня — уже большой прогресс.",
    "Пусть в этом дне будет больше света, чем суеты.",
    "Ты справляешься лучше, чем кажется в трудный момент.",
    "Пусть утром будет ясная голова, а вечером — легкое сердце.",
    "Замедлись на минуту и просто подыши — этого достаточно.",
    "Каждый день можно начать заново, мягко и без спешки.",
    "Пусть сегодня получится то, что давно откладывалось.",
    "Ты имеешь право на отдых, тишину и паузу.",
    "Пусть рядом будут люди, с которыми спокойно.",
    "Пусть привычные вещи сегодня подарят уют.",
    "Теплые слова и добрые мысли тоже меняют день.",
    "Пусть этот день запомнится чем-то хорошим и простым.",
    "У тебя уже есть все, чтобы сделать этот день лучше.",
    "Пусть случайная улыбка поднимет настроение.",
    "Пусть забота о себе сегодня будет в приоритете.",
    "Ты можешь двигаться в своем темпе — это нормально.",
    "Пусть будет меньше лишнего шума и больше ясности.",
    "Сегодня достаточно сделать главное и похвалить себя за это.",
    "Пусть получится сохранить внутреннее спокойствие.",
    "Теплый чай, глубокий вдох и один хороший шаг — отличный план.",
    "Пусть день сложится мягко и без лишнего давления.",
    "Сохраняй фокус на хорошем, даже если день непростой.",
    "Пусть впереди ждет что-то приятное и неожиданное.",
    "Каждое усилие имеет значение, даже если его не видно сразу.",
    "Пусть в конце дня будет чувство: сегодня было не зря.",
    "Ты уже молодец за то, что продолжаешь идти вперед.",
    "Пусть завтра станет еще немного легче, чем сегодня.",
  ],
};

function getLocalDayIndex(
  timezone: string,
  unlockHour: number,
  totalCount: number,
  now: Date,
): number {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);
  const hour = Number(parts.find((part) => part.type === "hour")?.value);

  if ([year, month, day, hour].some((value) => Number.isNaN(value))) {
    return 1;
  }

  const epochDay = Math.floor(Date.UTC(year, month - 1, day) / MS_IN_DAY);
  const adjustedEpochDay = hour < unlockHour ? epochDay - 1 : epochDay;
  const normalized = ((adjustedEpochDay % totalCount) + totalCount) % totalCount;
  return normalized + 1;
}

export function buildDemoGiftData(
  timezone: string,
  locale: AppLocale,
  now: Date = new Date(),
): GiftExperienceData {
  const normalizedTimezone = normalizeTimeZone(timezone);
  const bodies = DEMO_NOTE_BODIES[locale];
  const totalCount = bodies.length;
  const dayIndex = getLocalDayIndex(normalizedTimezone, GIFT_CONFIG.unlockHour, totalCount, now);

  const notes: GiftNote[] = bodies
    .map((body, index) => {
      const noteDayIndex = index + 1;
      return {
        id: `demo-${locale}-${noteDayIndex}`,
        dayIndex: noteDayIndex,
        body,
        imageUrl: null,
        isToday: noteDayIndex === dayIndex,
      };
    })
    .sort((a, b) => b.dayIndex - a.dayIndex);

  return {
    notes,
    context: {
      dayIndex,
      unlockedCount: totalCount,
      totalCount,
      isComplete: true,
      unlockHour: GIFT_CONFIG.unlockHour,
      startDate: "2025-01-01",
      timezone: normalizedTimezone,
    },
    source: "local-fallback",
  };
}
