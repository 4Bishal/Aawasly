"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteListingAction } from "@/lib/actions/listings";
import { unwrapAction } from "@/lib/action-result";
export function OwnerActions({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  return (
    <div className="flex gap-2">
      <Button asChild variant="outline" size="sm">
        <Link href={`/listing/${id}/edit`}>
          <Pencil className="size-3.5" />
          Edit stay
        </Link>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Trash2 className="size-3.5" />
            Delete
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle className="text-2xl font-semibold">
            Delete this stay?
          </DialogTitle>
          <DialogDescription className="mt-3 text-muted-foreground">
            This will permanently remove the listing and all its reviews.
          </DialogDescription>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Keep stay
            </Button>
            <Button
              disabled={pending}
              onClick={async () => {
                setPending(true);
                try {
                  unwrapAction(await deleteListingAction(id));
                  toast.success("Stay deleted");
                  router.push("/listing");
                  router.refresh();
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Unable to delete stay",
                  );
                  setPending(false);
                }
              }}
            >
              {pending ? "Deleting…" : "Delete stay"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
