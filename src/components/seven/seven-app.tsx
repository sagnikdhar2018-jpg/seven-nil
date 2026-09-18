import { useEffect } from "react";
import { Dices, Moon, RotateCcw, Sun, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PoolId } from "@/lib/seven/types";
import { CLUB_SQUADS } from "@/lib/seven/club-squads";
import { useSeven } from "@/lib/seven/store";
import { BoxScore } from "./box-score";
import { Controls } from "./controls";
import { Guide } from "./guide";
import { Pitch } from "./pitch";
import { ResultCard } from "./result-card";
import { MuteButton, SfxRoot } from "./sfx";
import { SiteFooter } from "./site-footer";
import { SquadPanel } from "./squad-panel";

const COPY: Record<
  PoolId,
  { kicker: string; h1: string[]; blurb: string; play: string; footer: string }
> = {
  world: {
    kicker: "World Cup draft · 1958 — 2026",
    h1: ["Build your dream", "World Cup XI"],
    blurb:
      "Roll a national team and a tournament year. Draft one real player at a time. See whether the XI can turn memory into a seven-nil statement.",
    play: "Play World Cup",
    footer: "A World Cup draft. Not affiliated with FIFA.",
  },
  club: {
    kicker: "Club draft · top five · 1980 — 2024",
    h1: ["Build your dream", "club XI"],
    blurb:
      "Roll a side from England, Spain, Italy, Germany, or France and a season since 1980. One footballer per draw. Then take the XI into Europe.",
    play: "Play clubs",
    footer: "A club draft of the top five leagues. Not affiliated with UEFA or any league.",
  },
};

export function SevenApp({ pool = "world" }: { pool?: PoolId }) {
  const hydrate = useSeven((s) => s.hydrate);
  const theme = useSeven((s) => s.theme);
  const setTheme = useSeven((s) => s.setTheme);
  const phase = useSeven((s) => s.phase);
  const revealTo = useSeven((s) => s.revealTo);
  const revealNext = useSeven((s) => s.revealNext);
  const simulate = useSeven((s) => s.simulate);
  const undoLast = useSeven((s) => s.undoLast);
  const resetDraft = useSeven((s) => s.resetDraft);
  const slots = useSeven((s) => s.slots);
  const runs = useSeven((s) => s.runs);
  const dreams = useSeven((s) => s.dreams);
  const filled = slots.filter((s) => s.player).length;
  const selected = useSeven((s) => s.selected);
  const copy = COPY[pool];

  useEffect(() => {
    hydrate(pool);
  }, [hydrate, pool]);

  useEffect(() => {
    if (phase !== "simulating") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(revealNext, reduced ? 0 : 720);
    return () => window.clearTimeout(t);
  }, [phase, revealNext, revealTo]);

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-paper text-ink" data-pool={pool}>
      <SfxRoot />
      <div className="paper-grain" aria-hidden="true" />
      <div className="relative z-10">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-5">
          <a href="/" className="home-brand" id="top">
            Seven Nil
          </a>
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
            {pool === "world" ? (
              <Button variant="secondary" asChild>
                <a href="/club">Clubs</a>
              </Button>
            ) : (
              <Button variant="secondary" asChild>
                <a href="/">World Cup</a>
              </Button>
            )}
            <Button variant="ghost" asChild>
              <a href="/friends">Friends</a>
            </Button>
          </div>
        </header>

        <section className="mx-auto flex w-full max-w-6xl flex-col items-start gap-10 px-5 pb-10 pt-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">{copy.kicker}</p>
            <p className="mark70 mt-3" aria-hidden="true">
              7<span className="sep sep-dash">–</span>
              <span className="sep sep-colon">:</span>0
            </p>
            <h1 className="home-headline">
              {copy.h1[0]}
              <br />
              {copy.h1[1]}
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted">{copy.blurb}</p>
            {pool === "club" ? (
              <p className="mt-3 text-xs font-semibold tracking-[0.12em] text-muted uppercase">
                {CLUB_SQUADS.length} seasons · England · Spain · Italy · Germany · France
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <a href="#draft">
                  <Dices className="size-5" strokeWidth={2} />
                  {copy.play}
                </a>
              </Button>
              {pool === "world" ? (
                <Button variant="secondary" asChild>
                  <a href="/club">
                    Club mode
                    <span className="badge-new">New</span>
                  </a>
                </Button>
              ) : (
                <Button variant="secondary" asChild>
                  <a href="/">World Cup</a>
                </Button>
              )}
              <Button variant="ghost" asChild>
                <a href="/how-to-play">How to play</a>
              </Button>
            </div>
            {runs > 0 ? (
              <p className="mt-4 text-xs font-semibold tabular-nums text-muted">
                {runs} runs · {dreams} dream finishes
              </p>
            ) : null}
          </div>
        </section>

        <section
          id="draft"
          className="mx-auto grid w-full max-w-6xl scroll-mt-6 gap-6 px-5 pb-10 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)_minmax(0,18rem)]"
        >
          <div className="flex flex-col gap-4">
            <Controls />
            <SquadPanel />
          </div>
          <div className="flex flex-col gap-4">
            <Pitch />
            {selected ? (
              <p className="text-center text-sm font-semibold text-accent">
                Place {selected.name} on a highlighted role
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={filled === 0 || phase === "simulating"}
                onClick={undoLast}
              >
                <Undo2 className="size-4" strokeWidth={2} />
                Undo
              </Button>
              <Button
                variant="ghost"
                disabled={phase === "simulating"}
                onClick={resetDraft}
              >
                <RotateCcw className="size-4" strokeWidth={2} />
                Reset
              </Button>
              <Button
                className="ml-auto"
                data-action="simulate"
                disabled={filled < 11 || phase === "simulating" || phase === "result"}
                onClick={simulate}
              >
                Simulate
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <BoxScore />
            <ResultCard />
          </div>
        </section>

        <div id="guide">
          <Guide pool={pool} />
        </div>

        <SiteFooter note={copy.footer} />
      </div>
    </main>
  );
}
