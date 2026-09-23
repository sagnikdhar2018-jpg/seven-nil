import { CalendarRange, Dices, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canDrawSameTeam } from "@/lib/seven/draft";
import { emptySlotsFor } from "@/lib/seven/formations";
import { isPersonTaken, takenKeysFromSlots } from "@/lib/seven/person";
import { useSeven } from "@/lib/seven/store";
import { PlayerPickRow } from "./player-pick";
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
  const taken = takenKeysFromSlots(slots);

  const roster = draw?.squad.players ?? [];
  const legalIds = new Set(
    roster
      .filter((player) => !isPersonTaken(player.name, taken) && emptySlotsFor(slots, player.pos).length > 0)
      .map((player) => player.id),
  );
  const bestId =
    classic
      ? roster.filter((player) => legalIds.has(player.id)).sort((a, b) => b.ovr - a.ovr)[0]?.id
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
          <Button
            variant="secondary"
            className="btn-choice"
            disabled={rerolls <= 0 || busy}
            onClick={() => spin(reroll)}
          >
            <RotateCcw className="size-4 shrink-0" strokeWidth={2} />
            Another {pool === "club" ? "club" : "team"}
          </Button>
          <Button
            variant="secondary"
            className="btn-choice"
            data-action="same-year"
            disabled={rerolls <= 0 || busy || !canYear}
            aria-label={pool === "club" ? "Same club, another season" : "Same team, another year"}
            title={canYear ? "Uses one chance" : "No other season for this side"}
            onClick={() => spin(rerollYear)}
          >
            <CalendarRange className="size-4 shrink-0" strokeWidth={2} />
            Another {pool === "club" ? "season" : "year"}
          </Button>
          <p className="text-xs font-semibold text-muted">{rerolls} chances left · team or year</p>
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
          roster.map((player) => (
            <PlayerPickRow
              key={player.id}
              player={player}
              legal={legalIds.has(player.id)}
              taken={isPersonTaken(player.name, taken)}
              best={bestId === player.id}
              classic={classic}
              onPick={pick}
            />
          ))
        ) : (
          <p className="px-4 py-6 text-sm text-muted">
            Each roll is one squad. You take one footballer, then you roll again. A name taken once is gone for every year.
          </p>
        )}
      </div>
    </div>
  );
}
