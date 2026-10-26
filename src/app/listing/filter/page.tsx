import { redirect } from "next/navigation";
export default async function LegacyFilter({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  redirect(
    category ? `/listing?category=${encodeURIComponent(category)}` : "/listing",
  );
}
