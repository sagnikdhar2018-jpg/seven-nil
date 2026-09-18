import { Link } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSeven } from "@/lib/seven/store";
import { MuteButton } from "./sfx";

export function SiteHeader({ playLabel = "Play", playHref = "#draft" }: { playLabel?: string; playHref?: string }) {
  const theme = useSeven((s) => s.theme);
  const setTheme = useSeven((s) => s.setTheme);

  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-5">
      <Link to="/" className="home-brand">
        Seven Nil
      </Link>
      <div className="flex items-center gap-2">
        <MuteButton />
        <Button
          variant="ghost"
          size="icon"
          aria-label={theme === "panini" ? "Night pitch" : "Paper pitch"}
          onClick={() => setTheme(theme === "panini" ? "terrace" : "panini")}
        >
          {theme === "panini" ? (
            <Moon className="size-5" strokeWidth={1.75} />
          ) : (
            <Sun className="size-5" strokeWidth={1.75} />
          )}
        </Button>
        <Button variant="ghost" asChild>
          <Link to="/club">Clubs</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link to="/friends">Friends</Link>
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
