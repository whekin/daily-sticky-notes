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
  const locale = resolveLocaleFromSearchParams(await searchParams);

  const expectedSlug = env.GIFT_SECRET_SLUG;
  if (expectedSlug && slug !== expectedSlug) {
    notFound();
  }

  return (
    <main
      lang={locale}
      className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12 sm:px-10"
    >
      <GiftExperience slug={slug} locale={locale} />
    </main>
  );
}
