"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { HousePlus, Menu, UserRound } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
export function Navbar() {
  const { data: session } = useSession();
  const path = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur-xl">
      <nav
        className="page-shell flex h-21 items-center justify-between gap-3 sm:gap-5"
        aria-label="Main navigation"
      >
        <Link href="/listing" className="shrink-0" aria-label="Aawasly home">
          <BrandLogo />
        </Link>
        <div className="hidden items-center gap-8 text-sm md:flex">
          <Link
            href="/listing"
            className={
              path === "/listing"
                ? "font-semibold text-foreground"
                : "text-muted-foreground"
            }
          >
            Explore stays
          </Link>
          <Link
            href="/listing?category=Mountains"
            className="text-muted-foreground hover:text-foreground"
          >
            Find your escape
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/listing/new"
            className="hidden items-center gap-1 text-sm font-semibold sm:flex"
          >
            List your home <HousePlus aria-hidden="true" className="size-4" />
          </Link>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 px-3 sm:gap-3 sm:px-4"
                aria-label="Open account menu"
              >
                <Menu className="size-4" />
                <UserRound className="size-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogTitle className="text-2xl font-semibold">
                {session?.user
                  ? `Namaste, ${session.user.name}`
                  : "Make yourself at home"}
              </DialogTitle>
              <DialogDescription className="mt-2 text-muted-foreground">
                Your next great stay starts here.
              </DialogDescription>
              <div className="mt-6 flex flex-col gap-3">
                <DialogClose asChild>
                  <Button asChild variant="outline">
                    <Link href="/listing">Explore stays</Link>
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button asChild variant="outline">
                    <Link href="/listing/new">List your space</Link>
                  </Button>
                </DialogClose>
                {session?.user ? (
                  <Button
                    onClick={() => void signOut({ callbackUrl: "/listing" })}
                  >
                    Log out
                  </Button>
                ) : (
                  <>
                    <DialogClose asChild>
                      <Button asChild>
                        <Link href="/login">Log in</Link>
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button asChild variant="outline">
                        <Link href="/signup">Create an account</Link>
                      </Button>
                    </DialogClose>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </nav>
    </header>
  );
}
