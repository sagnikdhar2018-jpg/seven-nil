import { Link } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSeven } from "@/lib/seven/store";
import type { PoolId } from "@/lib/seven/types";
import { MuteButton } from "./sfx";

export function ModeSwitch({ pool, friends = false }: { pool: PoolId; friends?: boolean }) {
  const worldTo = friends ? "/friends" : "/";
  const uclTo = friends ? "/club/friends" : "/club";
  return (
    <nav className="mode-switch" aria-label="World Cup or UCL">
      <Link to={worldTo} className={pool === "world" ? "is-on" : ""} aria-current={pool === "world" ? "page" : undefined}>
        World Cup
      </Link>
      <Link to={uclTo} className={pool === "club" ? "is-on" : ""} aria-current={pool === "club" ? "page" : undefined}>
        UCL
      </Link>
    </nav>
  );
}

export function SiteHeader({ pool = "world", friends = false }: { pool?: PoolId; friends?: boolean }) {
  const theme = useSeven((s) => s.theme);
  const setTheme = useSeven((s) => s.setTheme);
  const soloTo = pool === "club" ? "/club" : "/";
  const friendsTo = pool === "club" ? "/club/friends" : "/friends";

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
          {theme === "panini" ? <Moon className="size-7" strokeWidth={2} /> : <Sun className="size-7" strokeWidth={2} />}
        </Button>
        <ModeSwitch pool={pool} friends={friends} />
        <Button variant="ghost" asChild>
          <Link to={friends ? soloTo : friendsTo}>{friends ? "Solo draft" : "With friends"}</Link>
        </Button>
      </div>
    </header>
  );
}