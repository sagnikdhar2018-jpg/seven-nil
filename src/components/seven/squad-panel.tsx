import { CalendarRange, Dices, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canDrawSameTeam } from "@/lib/seven/draft";
import { emptySlotsFor } from "@/lib/seven/formations";
import { useSeven } from "@/lib/seven/store";
import { cn } from "@/lib/utils";
import { useDiceSpin } from "./use-dice-spin";

export function SquadPanel() {
  const phase = useSeven((s) => s.phase);
  const draw = useSeven((s) => s.draw);
  const slots = useSeven((s) => s.slots);
  const mode = useSeven((s) => s.mode);
  const rerolls = useSeven((s) => s.rerolls);
  const roll = useSeven((s) => s.roll);
  const reroll = useSeven((s) => s.reroll);
  const rerollYear = useSeven((s) => s.rerollYear);
  const pick = useSeven((s) => s.pick);
  const pool = useSeven((s) => s.pool);
  const history = useSeven((s) => s.history);
  const { busy, spin } = useDiceSpin();
  const filled = slots.filter((s) => s.player).length;
  const classic = mode === "classic";
  const canYear = draw ? canDrawSameTeam(draw.squad, history, pool) : false;

  const legalIds = draw
    ? new Set(
        draw.remaining
          .filter((player) => emptySlotsFor(slots, player.pos).length > 0)
          .map((player) => player.id),
      )
    : new Set<string>();

  const bestId =
    classic && draw
      ? draw.remaining
          .filter((player) => legalIds.has(player.id))
          .sort((a, b) => b.ovr - a.ovr)[0]?.id
      : undefined;

  return (
    <div className="card-ink flex flex-col overflow-hidden rounded-lg">
      <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Drawn</p>
          {draw ? (
            <>
              <h3 className="mt-1 font-display text-2xl leading-none normal-case tracking-tight text-ink">
                {draw.squad.nation}
              </h3>
              <p className="mt-1 text-sm font-semibold text-accent">
                {draw.squad.league ?? "Cup"} {draw.squad.year}
              </p>
            </>
          ) : (
            <>
              <h3 className="mt-1 font-display text-2xl leading-none normal-case tracking-tight text-ink">
                {filled >= 11 ? "XI locked" : "No squad yet"}
              </h3>
              <p className="mt-1 text-sm text-muted">
                {filled >= 11
                  ? pool === "club"
                    ? "Simulate Europe."
                    : "Simulate the tournament."
                  : pool === "club"
                    ? "Roll a club and a season."
                    : "Roll a nation and a year."}
              </p>
            </>
          )}
        </div>
        <span className="font-numeral text-sm font-extrabold tabular-nums text-muted">
          {filled}/11
        </span>
      </div>

      {phase === "picking" && draw ? (
        <div className="flex flex-col gap-2 border-b border-line px-4 py-3">
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1 text-sm"
              disabled={rerolls <= 0 || busy}
              onClick={() => spin(reroll)}
            >
              <RotateCcw className="size-4" strokeWidth={2} />
              Another {pool === "club" ? "club" : "team"}
            </Button>
            <Button
              variant="secondary"
              className="flex-1 text-sm"
              data-action="same-year"
              disabled={rerolls <= 0 || busy || !canYear}
              aria-label={pool === "club" ? "Same club, another season" : "Same team, another year"}
              onClick={() => spin(rerollYear)}
            >
              <CalendarRange className="size-4" strokeWidth={2} />
              Another {pool === "club" ? "season" : "year"}
            </Button>
          </div>
          <p className="text-xs font-semibold text-muted">{rerolls} left</p>
        </div>
      ) : (
        <div className="border-b border-line px-4 py-3">
          <Button
            className="w-full"
            data-action="roll"
            disabled={filled >= 11 || phase === "picking" || phase === "simulating" || busy}
            onClick={() => spin(roll)}
          >
            <Dices className="size-5" strokeWidth={2} />
            Roll
          </Button>
        </div>
      )}

      <div className="max-h-80 overflow-y-auto">
        {draw ? (
          draw.remaining.map((player) => {
            const legal = legalIds.has(player.id);
            return (
              <button
                key={player.id}
                type="button"
                className={cn("player-row", bestId === player.id && "bg-accent/10")}
                disabled={!legal}
                onClick={() => pick(player)}
              >
                <span className="num">#{player.num}</span>
                <span>
                  <span className="block text-sm font-extrabold text-ink">{player.name}</span>
                  <span className="block text-xs font-semibold text-muted">
                    {player.pos.join(" · ")}
                  </span>
                </span>
                <span className="text-xs font-semibold text-muted">
                  {bestId === player.id ? "Fit" : legal ? "In" : "Out"}
                </span>
                <span className="font-numeral text-base font-extrabold tabular-nums text-accent">
                  {classic ? player.ovr : "—"}
                </span>
              </button>
            );
          })
        ) : (
          <p className="px-4 py-6 text-sm text-muted">
            Each roll is one squad. You take one footballer, then you roll again.
          </p>
        )}
      </div>
    </div>
  );
}
