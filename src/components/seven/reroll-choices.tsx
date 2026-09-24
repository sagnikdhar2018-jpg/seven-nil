import { useEffect, useState } from "react";
import { RotateCcw, Trophy } from "lucide-react";
import type { PoolId } from "@/lib/seven/types";
import { cn } from "@/lib/utils";

export function RerollChoices({
  left,
  pool,
  canYear,
  busy,
  locked,
  onTeam,
  onYear,
}: {
  left: number;
  pool: PoolId;
  canYear: boolean;
  busy: boolean;
  locked?: boolean;
  onTeam: () => void;
  onYear: () => void;
}) {
  const [hot, setHot] = useState<"team" | "year" | null>(null);
  const club = pool === "club";
  const out = left <= 0 || locked;

  useEffect(() => {
    if (!busy) setHot(null);
  }, [busy]);

  const press = (which: "team" | "year") => {
    if (out || busy) return;
    if (which === "year" && !canYear) return;
    setHot(which);
    if (which === "team") onTeam();
    else onYear();
  };

  return (
    <div className="flex flex-col gap-2 border-b border-line px-4 py-3">
      <p className="text-[11px] font-extrabold tracking-[0.14em] text-muted uppercase">
        Not feeling it? Re-roll · {left} left
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className={cn("reroll-btn", hot === "team" && "is-hot")}
          disabled={out || busy}
          onClick={() => press("team")}
        >
          <RotateCcw className="size-3.5 shrink-0" strokeWidth={2.4} />
          Another {club ? "club" : "team"}
        </button>
        <button
          type="button"
          className={cn("reroll-btn", hot === "year" && "is-hot")}
          data-action="same-year"
          disabled={out || busy || !canYear}
          title={canYear ? "Same side, another year. Uses one re-roll." : "No other year for this side"}
          aria-label={club ? "Same club, another season" : "Same team, another cup"}
          onClick={() => press("year")}
        >
          <Trophy className="size-3.5 shrink-0" strokeWidth={2.4} />
          Another {club ? "season" : "cup"}
        </button>
      </div>
    </div>
  );
}
