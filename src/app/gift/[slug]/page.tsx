import { notFound } from "next/navigation";
import { GiftExperience } from "@/components/gift/gift-experience";
import { env } from "@/lib/env";
import { type LocaleSearchParams, resolveLocaleFromSearchParams } from "@/lib/i18n";

interface GiftPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<LocaleSearchParams>;
}

export default async function GiftPage({ params, searchParams }: GiftPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const locale = resolveLocaleFromSearchParams(resolvedSearchParams);
  const modeValue = Array.isArray(resolvedSearchParams.mode)
    ? resolvedSearchParams.mode[0]
    : resolvedSearchParams.mode;
  const isDemoMode = modeValue === "demo";

  const expectedSlug = env.GIFT_SECRET_SLUG;
  if (!isDemoMode && expectedSlug && slug !== expectedSlug) {
    notFound();
  }

  return (
    <main
      lang={locale}
      className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12 sm:px-10"
    >
      <GiftExperience slug={slug} locale={locale} demoMode={isDemoMode} />
    </main>
  );
}
