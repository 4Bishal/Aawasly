import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ListingForm } from "@/components/forms/listing-form";
export const metadata = { title: "Share your space" };
export default async function NewListingPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login?callbackUrl=/listing/new");
  return (
    <main id="main" className="page-enter mx-auto max-w-3xl px-5 pt-12">
      <p className="eyebrow mb-4">Make room for a new story</p>
      <h1 className="text-4xl font-semibold tracking-tight">
        Good stays start with you.
      </h1>
      <p className="mb-10 mt-4 text-sm leading-6 text-muted-foreground">
        Tell us about your space. We’ll help the right people find it.
      </p>
      <ListingForm />
    </main>
  );
}
