"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] z-40 rounded-full shadow-lg sm:bottom-6 sm:left-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="relative size-12 bg-card/95 backdrop-blur-md transition-colors hover:bg-accent"
            aria-label="Choose color theme"
            title="Change theme"
            disabled={!mounted}
          >
            <Sun
              aria-hidden="true"
              className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0"
            />
            <Moon
              aria-hidden="true"
              className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" sideOffset={12}>
          <DropdownMenuRadioGroup
            aria-label="Color theme"
            value={mounted ? theme : undefined}
            onValueChange={setTheme}
          >
            <DropdownMenuRadioItem value="light">
              <Sun aria-hidden="true" className="size-4" />
              Light
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">
              <Moon aria-hidden="true" className="size-4" />
              Dark
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system">
              <Monitor aria-hidden="true" className="size-4" />
              System
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
