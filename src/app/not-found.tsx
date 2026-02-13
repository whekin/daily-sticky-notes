import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-5 px-6 text-center">
      <h1 className="font-display text-5xl text-foreground">That note board is private.</h1>
      <p className="text-muted-foreground">
        The URL slug is incorrect or this gift has not been configured yet.
      </p>
      <Button asChild>
        <Link href="/">Back home</Link>
      </Button>
    </main>
  );
}
