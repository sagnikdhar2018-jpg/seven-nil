import type { Player } from "@/lib/seven/types";
import { cn } from "@/lib/utils";

export function PlayerPickRow({
  player,
  legal,
  taken,
  best,
  classic,
  disabled,
  onPick,
}: {
  player: Player;
  legal: boolean;
  taken: boolean;
  best?: boolean;
  classic: boolean;
  disabled?: boolean;
  onPick: (player: Player) => void;
}) {
  const blocked = taken || !legal;
  return (
    <button
      type="button"
      className={cn("player-row", best && !blocked && "is-fit", taken && "is-taken")}
      disabled={disabled || blocked}
      onClick={() => onPick(player)}
    >
      <span className="num">#{player.num}</span>
      <span>
        <span className={cn("block text-sm font-extrabold", player.ovr > 90 ? "name-gold" : "text-ink")}>{player.name}</span>
        <span className="block text-xs font-semibold text-muted">
          {taken ? "Can't select" : player.pos.join(" · ")}
        </span>
      </span>
      <span className="text-xs font-semibold text-muted">
        {taken ? "Taken" : best ? "Fit" : legal ? "In" : "Out"}
      </span>
      <span className="font-numeral text-base font-extrabold tabular-nums text-accent">
        {classic ? player.ovr : "—"}
      </span>
    </button>
  );
}
