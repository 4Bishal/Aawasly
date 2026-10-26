import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/forms/auth-forms";
export const metadata = { title: "Welcome back" };
export default async function LoginPage() {
  if ((await getSession())?.user) redirect("/listing");
  return (
    <main id="main" className="page-enter mx-auto max-w-md px-5 py-16">
      <p className="eyebrow mb-4">Your next chapter awaits</p>
      <h1 className="text-4xl font-semibold tracking-tight">Welcome back.</h1>
      <p className="mb-9 mt-4 text-sm text-muted-foreground">
        A familiar feeling. A new place to discover.
      </p>
      <Suspense fallback={<p>Loading…</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
