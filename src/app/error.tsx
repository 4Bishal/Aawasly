"use client";
import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      id="main"
      className="page-shell flex flex-col items-center py-24 text-center"
    >
      <Compass className="mb-6 size-12 text-primary" />
      <h1 className="text-3xl font-semibold tracking-tight">
        A little detour.
      </h1>
      <p className="my-5 max-w-md text-sm leading-6 text-muted-foreground">
        We couldn’t load this page. Please try again in a moment.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/listing">Back to exploring</Link>
        </Button>
      </div>
    </main>
  );
}
