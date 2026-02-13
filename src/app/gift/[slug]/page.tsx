import { notFound } from "next/navigation";
import { GiftExperience } from "@/components/gift/gift-experience";
import { env } from "@/lib/env";

interface GiftPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function GiftPage({ params }: GiftPageProps) {
  const { slug } = await params;

  const expectedSlug = env.GIFT_SECRET_SLUG;
  if (expectedSlug && slug !== expectedSlug) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12 sm:px-10">
      <GiftExperience slug={slug} />
    </main>
  );
}
