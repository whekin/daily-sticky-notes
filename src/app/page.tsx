import { Heart, NotebookPen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildLocaleHref,
  getLocaleCopy,
  type LocaleSearchParams,
  resolveLocaleFromSearchParams,
  SUPPORTED_LOCALES,
} from "@/lib/i18n";

interface HomePageProps {
  searchParams: Promise<LocaleSearchParams>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const locale = resolveLocaleFromSearchParams(await searchParams);
  const copy = getLocaleCopy(locale);
  const giftPath = buildLocaleHref("/gift/demo-secret?mode=demo", locale);

  return (
    <main
      lang={locale}
      className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-16 sm:px-10"
    >
      <section className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              {copy.languageLabel}
            </p>
            <div className="flex items-center gap-1 rounded-full border border-border/80 bg-background/70 p-1">
              {SUPPORTED_LOCALES.map((nextLocale) => (
                <Button
                  key={nextLocale}
                  asChild
                  size="xs"
                  variant={nextLocale === locale ? "secondary" : "ghost"}
                >
                  <Link href={buildLocaleHref("/", nextLocale)}>
                    {copy.localeNames[nextLocale]}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Heart className="h-4 w-4" />
            {copy.home.badge}
          </p>
          <h1 className="font-display text-5xl leading-tight tracking-tight text-foreground sm:text-6xl">
            {copy.home.titlePrimary}
            <span className="block text-primary">{copy.home.titleAccent}</span>
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">{copy.home.description}</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={giftPath}>{copy.home.openGift}</Link>
            </Button>
          </div>
        </div>

        <Card className="border-primary/20 bg-card/80 shadow-lg backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <NotebookPen className="h-5 w-5 text-primary" />
              {copy.home.aboutTitle}
            </CardTitle>
            <CardDescription>{copy.home.aboutDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{copy.home.noteUnlocksDaily}</p>
            <p>{copy.home.notesArchived}</p>
            <p>{copy.home.morningRitual}</p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
