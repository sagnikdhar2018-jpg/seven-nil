import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Dices, Moon, Sun } from "lucide-react";
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
      "Seven Nil is a free browser game for drafting a historic World Cup XI. You roll one real national team and one tournament year, then pick one player who fits an open role. According to FIFA, the men's World Cup has been played since 1930, and the 2022 edition had 32 teams and 64 matches.",
    play: "Play World Cup",
    footer: "A World Cup draft. Not affiliated with FIFA.",
  },
  club: {
    kicker: "Club draft · top five · 1980 — 2024",
    h1: ["Build your dream", "club XI"],
    blurb:
      "Roll a side from England, Spain, Italy, Germany, or France and a season since 1980. One footballer per draw. Then take the XI into Europe — or open Club friends for a rivalry or a UCL night.",
    play: "Play clubs",
    footer: "A club draft of the top five leagues. Not affiliated with UEFA or any league.",
  },
};

export function SevenApp({ pool = "world" }: { pool?: PoolId }) {
  const hydrate = useSeven((s) => s.hydrate);
  const theme = useSeven((s) => s.theme);
  const setTheme = useSeven((s) => s.setTheme);
  const phase = useSeven((s) => s.phase);
  const simulate = useSeven((s) => s.simulate);
  const slots = useSeven((s) => s.slots);
  const runs = useSeven((s) => s.runs);
  const dreams = useSeven((s) => s.dreams);
  const filled = slots.filter((s) => s.player).length;
  const selected = useSeven((s) => s.selected);
  const picking = phase !== "setup" || filled > 0 || Boolean(selected);
  const copy = COPY[pool];

  useEffect(() => {
    hydrate(pool);
  }, [hydrate, pool]);

  return (
    <main id="main-content" className="relative min-h-dvh overflow-x-hidden bg-paper text-ink" data-pool={pool}>
      <SfxRoot />
      <div className="paper-grain" aria-hidden="true" />
      <div className="relative z-10">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-5">
          <Link to="/" className="home-brand" id="top">
            7-0
          </Link>
          <div className="flex items-center gap-2">
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
            {pool === "world" ? (
              <Button variant="secondary" asChild>
                <Link to="/club">Clubs</Link>
              </Button>
            ) : (
              <Button variant="secondary" asChild>
                <Link to="/">World Cup</Link>
              </Button>
            )}
            <Button variant="ghost" asChild>
              <Link to={pool === "club" ? "/club/friends" : "/friends"}>
                {pool === "club" ? "Club friends" : "Friends"}
              </Link>
            </Button>
          </div>
        </header>

        <section className="mx-auto flex w-full max-w-6xl flex-col items-start gap-10 px-5 pb-10 pt-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p id="answer" className="mt-3 max-w-xl text-base leading-relaxed text-ink">
              {copy.blurb}
            </p>
            <p className="mt-3 text-xs font-semibold tracking-[0.18em] text-muted uppercase">{copy.kicker}</p>
            <p className="mark70 mt-3" aria-hidden="true">
              7<span className="sep sep-dash">–</span>
              <span className="sep sep-colon">:</span>0
            </p>
            <h1 className="home-headline">
              {copy.h1[0]}
              <br />
              {copy.h1[1]}
            </h1>
            <p className="mt-3 text-sm font-semibold text-ink">
              By{" "}
              <Link className="underline" to="/about">
                nik.peeps
              </Link>
              , independent maker of Seven Nil. The board holds 53 national squads, 73 club seasons, and 1,520 season
              ratings.
            </p>
            <p className="mt-2 text-xs font-semibold text-muted">Last updated: September 2026</p>
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
                  <Link to="/club">
                    Club mode
                    <span className="badge-new">New</span>
                  </Link>
                </Button>
              ) : (
                <Button variant="secondary" asChild>
                  <Link to="/club/friends">Club friends</Link>
                </Button>
              )}
              {pool === "world" ? (
                <Button variant="ghost" asChild>
                  <Link to="/friends">Friends</Link>
                </Button>
              ) : (
                <Button variant="ghost" asChild>
                  <Link to="/">World Cup</Link>
                </Button>
              )}
              <Button variant="ghost" asChild>
                <Link to="/how-to-play">How to play</Link>
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
          className={`draft-board mx-auto w-full max-w-6xl scroll-mt-6 px-5 pb-10${picking ? " is-picking" : ""}`}
        >
          {picking ? null : (
            <div className="draft-col flex flex-col gap-4">
              <Controls />
              <SquadPanel />
            </div>
          )}
          <div className="draft-col draft-pitch flex flex-col gap-4">
            <Pitch />
            {selected ? (
              <p className="text-center text-sm font-semibold text-accent">
                Place {selected.name} on a highlighted role
              </p>
            ) : null}
            <Button
              className="w-full"
              data-action="simulate"
              disabled={filled < 11 || phase === "simulating" || phase === "result"}
              onClick={() => {
                requestAnimationFrame(() => simulate());
              }}
            >
              Simulate
            </Button>
          </div>
          <div className="draft-col flex flex-col gap-4">
            {picking ? <SquadPanel /> : null}
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
