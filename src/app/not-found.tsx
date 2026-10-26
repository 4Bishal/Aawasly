import Link from "next/link";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <main
      id="main"
      className="page-shell flex flex-col items-center py-24 text-center"
    >
      <MapPin className="mb-6 size-12 text-primary" />
      <p className="eyebrow mb-3">Off the beaten path · 404</p>
      <h1 className="text-3xl font-semibold tracking-tight">
        This place isn’t on the map.
      </h1>
      <p className="my-5 text-sm text-muted-foreground">
        The stay may have moved on. There’s still plenty to discover.
      </p>
      <Button asChild>
        <Link href="/listing">Find your next stay</Link>
      </Button>
    </main>
  );
}
