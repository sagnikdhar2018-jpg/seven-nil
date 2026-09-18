import { Button } from "@/components/ui/button";
import { useSeven } from "@/lib/seven/store";
import { LiveMatchBoard } from "./live-match";

export function ResultCard() {
  const phase = useSeven((s) => s.phase);
  const campaign = useSeven((s) => s.campaign);
  const revealTo = useSeven((s) => s.revealTo);
  const revealNext = useSeven((s) => s.revealNext);
  const skipReveal = useSeven((s) => s.skipReveal);
  const resetDraft = useSeven((s) => s.resetDraft);
  const slots = useSeven((s) => s.slots);
  const pool = useSeven((s) => s.pool);

  if (!campaign || (phase !== "simulating" && phase !== "result")) return null;

  const done = phase === "result";
  const current = !done ? campaign.matches[revealTo] : null;
  const shown = campaign.matches.slice(0, done ? campaign.matches.length : revealTo);

  return (
    <div className="card-ink rounded-lg px-5 py-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">
            {pool === "club" ? "Europe" : "Knockout"}
          </p>
          <p className="result-stamp mt-2">{done ? campaign.exit : current?.round ?? "Live"}</p>
        </div>
        {done ? (
          <div className="text-right">
            <p className="font-numeral text-3xl font-extrabold tabular-nums text-ink">
              {campaign.gf}–{campaign.ga}
            </p>
            <p className="text-xs font-semibold text-muted">goals for / against</p>
          </div>
        ) : (
          <Button variant="secondary" size="md" onClick={skipReveal}>
            Skip
          </Button>
        )}
      </div>

      {current && !done ? (
        <div className="mt-4">
          <LiveMatchBoard
            key={`${current.round}-${current.opponent}-${revealTo}`}
            match={{
              round: current.round,
              home: current.home ?? "Your XI",
              away: current.opponent,
              gf: current.gf,
              ga: current.ga,
              goals: current.goals ?? [],
              pens: current.pens,
              homeRatings: current.homeRatings,
              awayRatings: current.awayRatings,
            }}
            onDone={revealNext}
          />
        </div>
      ) : null}

      <div className="mt-4">
        {shown.map((match, index) => (
          <div key={`${match.round}-${match.opponent}-${index}`} className="match-row">
            <span className="text-xs font-semibold tracking-wide text-muted uppercase">
              {match.round}
            </span>
            <span className="truncate text-sm font-extrabold text-ink">{match.opponent}</span>
            <span className="font-numeral text-base font-extrabold tabular-nums">
              {match.gf}–{match.ga}
              {match.pens ? ` P ${match.pens.home}–${match.pens.away}` : ""}
              <span className="ml-2 text-accent">{match.result}</span>
            </span>
          </div>
        ))}
      </div>

      {done ? (
        <div className="mt-5 flex flex-col gap-3">
          <ul className="flex flex-wrap gap-2 text-xs font-extrabold uppercase tracking-wide">
            {campaign.champion ? <Stamp>Champions</Stamp> : null}
            {campaign.unbeaten ? <Stamp>Unbeaten</Stamp> : null}
            {campaign.cleanSheetRun ? <Stamp>No goals against</Stamp> : null}
            {campaign.sevenNilMatch ? <Stamp>Seven-nil</Stamp> : null}
            {campaign.dream ? <Stamp>Dream run</Stamp> : null}
          </ul>
          <p className="text-sm leading-relaxed text-muted">
            {campaign.dream
              ? pool === "club"
                ? "Champions of Europe, unbeaten, nothing conceded. That is the seven-nil."
                : "Champion, unbeaten, nothing conceded. That is the seven-nil."
              : campaign.champion
                ? pool === "club"
                  ? "Europe is yours. The clean sheet was not."
                  : "The cup is yours. The clean sheet was not."
                : "The draw asked a hard question. Roll again and answer it better."}
          </p>
          <p className="text-xs text-muted">
            XI: {slots.filter((s) => s.player).map((s) => s.player?.name).join(" · ")}
          </p>
          <Button className="w-full" data-action="new-draft" onClick={resetDraft}>
            New draft
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function Stamp({ children }: { children: string }) {
  return (
    <li className="rounded-sm border border-ink bg-paper px-2 py-1 text-ink">{children}</li>
  );
}
