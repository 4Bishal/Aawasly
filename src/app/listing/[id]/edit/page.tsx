import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getListing } from "@/lib/services/listings";
import { ListingForm } from "@/components/forms/listing-form";
export const metadata = { title: "Edit your stay" };
export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) redirect(`/login?callbackUrl=/listing/${id}/edit`);
  const listing = await getListing(id);
  if (!listing) notFound();
  if (listing.owner?.id !== session.user.id)
    return (
      <main id="main" className="page-shell py-20">
        <h1 className="text-3xl font-semibold">
          This space belongs to another host
        </h1>
        <p className="mt-4 text-muted-foreground">
          Only its owner can edit this listing.
        </p>
        <Link
          href={`/listing/${id}`}
          className="mt-5 inline-block text-primary underline"
        >
          Back to the stay
        </Link>
      </main>
    );
  return (
    <main id="main" className="page-enter mx-auto max-w-3xl px-5 pt-12">
      <p className="eyebrow mb-4">A little refresh</p>
      <h1 className="text-4xl font-semibold tracking-tight">
        Make your stay shine.
      </h1>
      <p className="mb-10 mt-4 text-sm text-muted-foreground">
        Update the details that make your place yours.
      </p>
      <ListingForm listing={listing} />
    </main>
  );
}
