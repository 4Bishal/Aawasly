import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SignupForm } from "@/components/forms/auth-forms";
export const metadata = { title: "Join the journey" };
export default async function SignupPage() {
  if ((await getSession())?.user) redirect("/listing");
  return (
    <main id="main" className="page-enter mx-auto max-w-md px-5 py-16">
      <p className="eyebrow mb-4">There’s a place for you here</p>
      <h1 className="text-4xl font-semibold tracking-tight">
        Let the journey begin.
      </h1>
      <p className="mb-9 mt-4 text-sm text-muted-foreground">
        Join a world of thoughtful stays and open doors.
      </p>
      <SignupForm />
    </main>
  );
}
