import { Link } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSeven } from "@/lib/seven/store";
import { MuteButton } from "./sfx";

export function SiteHeader({ playLabel = "Play", playHref = "#draft" }: { playLabel?: string; playHref?: string }) {
  const theme = useSeven((s) => s.theme);
  const setTheme = useSeven((s) => s.setTheme);

  return (
    <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5">
      <Link to="/" className="home-brand">
        7-0
      </Link>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <MuteButton />
        <Button
          variant="secondary"
          size="icon"
          className="size-14 min-h-14 rounded-full"
          aria-label={theme === "panini" ? "Night pitch" : "Paper pitch"}
          onClick={() => setTheme(theme === "panini" ? "terrace" : "panini")}
        >
          {theme === "panini" ? (
            <Moon className="size-7" strokeWidth={2} />
          ) : (
            <Sun className="size-7" strokeWidth={2} />
          )}
        </Button>
        <Button variant="ghost" asChild>
          <Link to="/club">Clubs</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link to="/friends">Friends</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link to="/club/friends">Club friends</Link>
        </Button>
        <Button variant="secondary" asChild>
          {playHref.startsWith("#") ? (
            <a href={playHref}>{playLabel}</a>
          ) : (
            <Link to={playHref as "/"}>{playLabel}</Link>
          )}
        </Button>
      </div>
    </header>
  );
}
