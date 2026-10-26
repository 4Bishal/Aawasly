"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  loginSchema,
  signupSchema,
  type LoginInput,
  type SignupInput,
} from "@/lib/validation";
import { api } from "@/lib/client-api";
function safeCallback(value: string | null) {
  return value?.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\")
    ? value
    : "/listing";
}
export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });
  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit(async (values) => {
        try {
          const callbackUrl = safeCallback(params.get("callbackUrl"));
          const result = await signIn("credentials", {
            ...values,
            redirect: false,
            callbackUrl,
          });
          if (!result?.ok || result.error) {
            setError("root", {
              message:
                "Unable to log in. Check your credentials or try again later.",
            });
            return;
          }
          toast.success("Welcome back to Aawasly");
          router.push(callbackUrl);
          router.refresh();
        } catch {
          setError("root", { message: "Unable to log in. Please try again." });
        }
      })}
    >
      <label className="field-label">
        Username
        <input
          className="input"
          autoComplete="username"
          {...register("username")}
          aria-invalid={!!errors.username}
        />
        {errors.username && (
          <span className="field-error">{errors.username.message}</span>
        )}
      </label>
      <label className="field-label">
        Password
        <input
          className="input"
          type="password"
          autoComplete="current-password"
          {...register("password")}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <span className="field-error">{errors.password.message}</span>
        )}
      </label>
      {errors.root && (
        <p className="field-error" role="alert">
          {errors.root.message}
        </p>
      )}
      <Button className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <>
            Log in <ArrowRight className="size-4" />
          </>
        )}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        New around here?{" "}
        <Link href="/signup" className="font-semibold text-primary">
          Create an account
        </Link>
      </p>
    </form>
  );
}
export function SignupForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });
  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit(async (values) => {
        try {
          await api("/api/auth/signup", {
            method: "POST",
            body: JSON.stringify(values),
          });
          const result = await signIn("credentials", {
            username: values.username,
            password: values.password,
            redirect: false,
          });
          if (!result?.ok || result.error) {
            toast.success("Account created. Please log in.");
            router.push("/login");
            return;
          }
          toast.success("Welcome to Aawasly");
          router.push("/listing");
          router.refresh();
        } catch (error) {
          setError("root", {
            message:
              error instanceof Error
                ? error.message
                : "Unable to create your account",
          });
        }
      })}
    >
      <label className="field-label">
        Username
        <input
          className="input"
          autoComplete="username"
          {...register("username")}
          aria-invalid={!!errors.username}
        />
        {errors.username && (
          <span className="field-error">{errors.username.message}</span>
        )}
      </label>
      <label className="field-label">
        Email
        <input
          className="input"
          type="email"
          autoComplete="email"
          {...register("email")}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <span className="field-error">{errors.email.message}</span>
        )}
      </label>
      <label className="field-label">
        Password
        <input
          className="input"
          type="password"
          autoComplete="new-password"
          placeholder="At least 12 characters"
          {...register("password")}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <span className="field-error">{errors.password.message}</span>
        )}
      </label>
      {errors.root && (
        <p className="field-error" role="alert">
          {errors.root.message}
        </p>
      )}
      <Button className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <>
            Create account <ArrowRight className="size-4" />
          </>
        )}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already part of the journey?{" "}
        <Link href="/login" className="font-semibold text-primary">
          Log in
        </Link>
      </p>
    </form>
  );
}
