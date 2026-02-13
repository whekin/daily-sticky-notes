import { Heart, NotebookPen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { env } from "@/lib/env";

export default function Home() {
  const slug = env.GIFT_SECRET_SLUG ?? "demo-secret";
  const giftPath = `/gift/${slug}`;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-16 sm:px-10">
      <section className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Heart className="h-4 w-4" />
            Valentine project starter
          </p>
          <h1 className="font-display text-5xl leading-tight tracking-tight text-foreground sm:text-6xl">
            One sticky note a day.
            <span className="block text-primary">One memory at a time.</span>
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            This app unlocks a new daily message at 7:00 AM based on the visitor timezone, with
            previous notes kept in a hidden memory board.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={giftPath}>Open gift experience</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/api/v1/health">API health</Link>
            </Button>
          </div>
        </div>

        <Card className="border-primary/20 bg-card/80 shadow-lg backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <NotebookPen className="h-5 w-5 text-primary" />
              Next setup steps
            </CardTitle>
            <CardDescription>Connect Supabase and Vercel to make this live.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>1. Add `.env.local` from `.env.example`.</p>
            <p>2. Create tables/RPCs from `drizzle/0000_initial.sql` in Supabase SQL Editor.</p>
            <p>3. Insert your first gift row and note rows in Supabase dashboard.</p>
            <p>4. Push to GitHub and connect to Vercel.</p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
