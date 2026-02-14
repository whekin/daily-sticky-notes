export const SUPPORTED_LOCALES = ["en", "ru"] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en";

export interface LocaleSearchParams {
  lang?: string | string[];
  locale?: string | string[];
  mode?: string | string[];
}

function normalizeLocaleCandidate(candidate?: string | string[]): string | null {
  if (!candidate) {
    return null;
  }

  const value = Array.isArray(candidate) ? candidate[0] : candidate;
  if (!value) {
    return null;
  }

  const [languageCode] = value.toLowerCase().split(/[-_]/);
  return languageCode ?? null;
}

export function isSupportedLocale(value: string): value is AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale);
}

export function resolveLocaleFromSearchParams(searchParams?: LocaleSearchParams): AppLocale {
  const langCandidate = normalizeLocaleCandidate(searchParams?.lang);
  if (langCandidate && isSupportedLocale(langCandidate)) {
    return langCandidate;
  }

  const localeCandidate = normalizeLocaleCandidate(searchParams?.locale);
  if (localeCandidate && isSupportedLocale(localeCandidate)) {
    return localeCandidate;
  }

  return DEFAULT_LOCALE;
}

export function buildLocaleHref(pathname: string, locale: AppLocale): string {
  const [basePath, existingQuery = ""] = pathname.split("?");
  const searchParams = new URLSearchParams(existingQuery);
  searchParams.set("lang", locale);
  return `${basePath}?${searchParams.toString()}`;
}

export interface HomeCopy {
  badge: string;
  titlePrimary: string;
  titleAccent: string;
  description: string;
  openGift: string;
  aboutTitle: string;
  aboutDescription: string;
  noteUnlocksDaily: string;
  notesArchived: string;
  morningRitual: string;
}

export interface GiftCopy {
  dayLabel: (dayIndex: number) => string;
  cardImageAlt: string;
  memoryImageAlt: string;
  loadingTodayNote: string;
  preparingMemoryBoard: string;
  fetchingUnlockContext: string;
  loadErrorTitle: string;
  loadErrorFallback: string;
  dailyInspiration: string;
  forYouToday: string;
  dailyUnlockDescription: string;
  noNoteUnlocked: string;
  comeBackLaterToday: string;
  unlockStatus: string;
  notesUnlocked: (unlockedCount: number, totalCount: number) => string;
  timezoneLabel: (timezone: string) => string;
  unlockHourDescription: (hour: number) => string;
  archiveDescription: string;
  debugSource: (source: string) => string;
  openMemoryBoard: string;
  memoryBoardTitle: string;
  memoryBoardDescription: string;
  noArchivedNotes: string;
  notificationsTitle: string;
  notificationsDescription: string;
  notificationsUnsupported: string;
  notificationsPermissionDenied: string;
  notificationsEnable: string;
  notificationsDisable: string;
  notificationsTimeLabel: string;
  notificationsSaveTime: string;
  notificationsEnabledStatus: string;
  notificationsDisabledStatus: string;
  notificationsSavedStatus: string;
  notificationsErrorStatus: string;
}

export interface FallbackCopy {
  todaysNotePending: string;
  archivedNoteLabel: (dayIndex: number) => string;
}

export interface LocaleCopy {
  languageLabel: string;
  localeNames: Record<AppLocale, string>;
  home: HomeCopy;
  gift: GiftCopy;
  fallback: FallbackCopy;
}

const localeCopy: Record<AppLocale, LocaleCopy> = {
  en: {
    languageLabel: "Language",
    localeNames: {
      en: "English",
      ru: "Russian",
    },
    home: {
      badge: "Daily love note",
      titlePrimary: "One sticky note a day.",
      titleAccent: "One memory at a time.",
      description:
        "This app unlocks a new daily message at 7:00 AM based on the visitor timezone, with previous notes kept in a hidden memory board.",
      openGift: "Open gift experience",
      aboutTitle: "About this gift",
      aboutDescription: "A slow little ritual, one note each morning.",
      noteUnlocksDaily: "Each day unlocks one new sticky note.",
      notesArchived: "Old notes stay archived in the memory board.",
      morningRitual: "Open it in the morning and keep a little moment for yourself.",
    },
    gift: {
      dayLabel: (dayIndex) => `Day ${dayIndex}`,
      cardImageAlt: "Cat sticky note",
      memoryImageAlt: "Note memory",
      loadingTodayNote: "Loading today's note...",
      preparingMemoryBoard: "Preparing memory board",
      fetchingUnlockContext: "Fetching unlock context and notes",
      loadErrorTitle: "Couldn't load notes",
      loadErrorFallback: "Failed to load gift notes.",
      dailyInspiration: "Daily inspiration",
      forYouToday: "For you, today.",
      dailyUnlockDescription:
        "A new sticky note appears each day at 7:00 AM in your current timezone.",
      noNoteUnlocked: "No note unlocked yet",
      comeBackLaterToday: "Come back after the unlock time today.",
      unlockStatus: "Unlock status",
      notesUnlocked: (unlockedCount, totalCount) =>
        `${unlockedCount} / ${totalCount} notes unlocked`,
      timezoneLabel: (timezone) => `Timezone: ${timezone}`,
      unlockHourDescription: (hour) =>
        `A new note appears at ${String(hour).padStart(2, "0")}:00 local time.`,
      archiveDescription:
        "Unlocked notes stay in your memory board so you can revisit them anytime.",
      debugSource: (source) => `Debug source: ${source}`,
      openMemoryBoard: "Open memory board",
      memoryBoardTitle: "Memory board",
      memoryBoardDescription: "Previous notes stay archived here.",
      noArchivedNotes: "No archived notes yet.",
      notificationsTitle: "Daily reminder",
      notificationsDescription: "Get a push reminder at your chosen local time.",
      notificationsUnsupported: "Push notifications are not supported in this browser.",
      notificationsPermissionDenied:
        "Notifications are blocked in your browser settings for this site.",
      notificationsEnable: "Enable notifications",
      notificationsDisable: "Disable notifications",
      notificationsTimeLabel: "Reminder time",
      notificationsSaveTime: "Save reminder time",
      notificationsEnabledStatus: "Notifications enabled.",
      notificationsDisabledStatus: "Notifications disabled.",
      notificationsSavedStatus: "Reminder time saved.",
      notificationsErrorStatus: "Could not update notification settings.",
    },
    fallback: {
      todaysNotePending: "Today's note will appear here once Supabase is connected.",
      archivedNoteLabel: (dayIndex) => `Archived note #${dayIndex}`,
    },
  },
  ru: {
    languageLabel: "Язык",
    localeNames: {
      en: "Английский",
      ru: "Русский",
    },
    home: {
      badge: "Ежедневная записка о любви",
      titlePrimary: "Одна записка в день.",
      titleAccent: "Одно воспоминание за раз.",
      description:
        "Это приложение открывает новое послание каждый день в 07:00 по часовому поясу посетителя, а прошлые записки сохраняются на скрытой доске воспоминаний.",
      openGift: "Открыть подарок",
      aboutTitle: "Об этом подарке",
      aboutDescription: "Небольшой ритуал: каждое утро новая записка.",
      noteUnlocksDaily: "Каждый день открывается одна новая записка.",
      notesArchived: "Старые записки сохраняются на доске воспоминаний.",
      morningRitual: "Открывай утром и сохраняй небольшой момент для себя.",
    },
    gift: {
      dayLabel: (dayIndex) => `День ${dayIndex}`,
      cardImageAlt: "Стикер с котиком",
      memoryImageAlt: "Воспоминание к записке",
      loadingTodayNote: "Загружаем сегодняшнюю записку...",
      preparingMemoryBoard: "Подготовка доски воспоминаний",
      fetchingUnlockContext: "Загружаем контекст открытия и записки",
      loadErrorTitle: "Не удалось загрузить записки",
      loadErrorFallback: "Не удалось загрузить записки подарка.",
      dailyInspiration: "Ежедневное вдохновение",
      forYouToday: "Для тебя сегодня.",
      dailyUnlockDescription:
        "Новая записка появляется каждый день в 07:00 по твоему текущему часовому поясу.",
      noNoteUnlocked: "Сегодня записка еще не открылась",
      comeBackLaterToday: "Вернись после времени открытия сегодня.",
      unlockStatus: "Статус открытия",
      notesUnlocked: (unlockedCount, totalCount) =>
        `Открыто записок: ${unlockedCount} из ${totalCount}`,
      timezoneLabel: (timezone) => `Часовой пояс: ${timezone}`,
      unlockHourDescription: (hour) =>
        `Новая записка появляется в ${String(hour).padStart(2, "0")}:00 по местному времени.`,
      archiveDescription:
        "Открытые записки сохраняются на доске воспоминаний, и к ним можно вернуться в любой момент.",
      debugSource: (source) => `Источник отладки: ${source}`,
      openMemoryBoard: "Открыть доску воспоминаний",
      memoryBoardTitle: "Доска воспоминаний",
      memoryBoardDescription: "Здесь хранятся предыдущие записки.",
      noArchivedNotes: "Пока нет архивных записок.",
      notificationsTitle: "Ежедневное напоминание",
      notificationsDescription: "Получай push-напоминание в выбранное местное время.",
      notificationsUnsupported: "Push-уведомления не поддерживаются в этом браузере.",
      notificationsPermissionDenied:
        "Уведомления заблокированы в настройках браузера для этого сайта.",
      notificationsEnable: "Включить уведомления",
      notificationsDisable: "Отключить уведомления",
      notificationsTimeLabel: "Время напоминания",
      notificationsSaveTime: "Сохранить время напоминания",
      notificationsEnabledStatus: "Уведомления включены.",
      notificationsDisabledStatus: "Уведомления отключены.",
      notificationsSavedStatus: "Время напоминания сохранено.",
      notificationsErrorStatus: "Не удалось обновить настройки уведомлений.",
    },
    fallback: {
      todaysNotePending: "Сегодняшняя записка появится здесь после подключения Supabase.",
      archivedNoteLabel: (dayIndex) => `Архивная записка №${dayIndex}`,
    },
  },
};

export function getLocaleCopy(locale: AppLocale): LocaleCopy {
  return localeCopy[locale];
}
