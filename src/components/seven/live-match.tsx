import { useEffect, useRef, useState } from "react";
import type { MatchGoal, TeamRatings } from "@/lib/seven/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type BoardMatch = {
  round: string;
  home: string;
  away: string;
  gf: number;
  ga: number;
  goals: MatchGoal[];
  pens?: { home: number; away: number };
  homeRatings?: TeamRatings;
  awayRatings?: TeamRatings;
};

function scoreAt(goals: MatchGoal[], minute: number) {
  let home = 0;
  let away = 0;
  for (const g of goals) {
    if (g.minute <= minute) {
      if (g.side === "home") home += 1;
      else away += 1;
    }
  }
  return { home, away };
}

function clockLabel(minute: number) {
  if (minute < 0) return "00:00";
  if (minute >= 90) return "90:00";
  const m = Math.floor(minute);
  const s = Math.floor((minute - m) * 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function RatingsToggle({ ratings }: { ratings?: TeamRatings }) {
  const [open, setOpen] = useState(false);
  if (!ratings) return null;
  return (
    <div className="mt-3">
      <Button
        variant={open ? "ink" : "secondary"}
        className="w-full text-xs"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Hide ratings" : "Ratings"}
      </Button>
      {open ? (
        <div className="mt-2 grid grid-cols-4 gap-1 text-center">
          <RateChip n="OVR" v={ratings.ovr} />
          <RateChip n="ATK" v={ratings.atk} />
          <RateChip n="MID" v={ratings.mid} />
          <RateChip n="DEF" v={ratings.def} />
        </div>
      ) : null}
    </div>
  );
}

function RateChip({ n, v }: { n: string; v: number }) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-[0.12em] text-muted uppercase">{n}</p>
      <p className="font-numeral text-lg font-extrabold tabular-nums">{v}</p>
    </div>
  );
}

function SideBox({
  name,
  score,
  goals,
  ratings,
  away,
}: {
  name: string;
  score: number;
  goals: MatchGoal[];
  ratings?: TeamRatings;
  away?: boolean;
}) {
  return (
    <div className={cn("live-sidebox", away && "is-away")}>
      <p className="live-side">{name}</p>
      <p className="font-numeral mt-1 text-2xl font-extrabold tabular-nums">{score}</p>
      <ul className="live-scorers">
        {goals.length === 0 ? (
          <li className="text-muted">—</li>
        ) : (
          goals.map((g, i) => (
            <li key={`${g.minute}-${g.scorer}-${i}`}>
              <span className="font-numeral tabular-nums">{g.minute}'</span>
              <span>{g.scorer}</span>
            </li>
          ))
        )}
      </ul>
      <RatingsToggle ratings={ratings} />
    </div>
  );
}

export function LiveMatchBoard({
  match,
  onDone,
  pace = 1,
}: {
  match: BoardMatch;
  onDone: () => void;
  pace?: number;
}) {
  const [minute, setMinute] = useState(0);
  const [phase, setPhase] = useState<"run" | "ht" | "ft" | "pens">("run");
  const [flash, setFlash] = useState<MatchGoal | null>(null);
  const done = useRef(false);
  const lastGoal = useRef(-1);
  const holdUntil = useRef(0);

  useEffect(() => {
    done.current = false;
    lastGoal.current = -1;
    holdUntil.current = 0;
    setMinute(0);
    setPhase("run");
    setFlash(null);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || match.goals.length === 0) {
      setMinute(90);
      setPhase(match.pens ? "pens" : "ft");
      const t = window.setTimeout(() => {
        if (!done.current) {
          done.current = true;
          onDone();
        }
      }, reduced ? 200 : 900);
      return () => window.clearTimeout(t);
    }

    let raf = 0;
    let last = performance.now();
    let current = 0;
    let htHeld = false;
    const minutesPerSec = 7.5 * pace;

    const tick = (now: number) => {
      const dt = Math.min(0.08, (now - last) / 1000);
      last = now;
      if (now < holdUntil.current) {
        raf = requestAnimationFrame(tick);
        return;
      }
      current = Math.min(90, current + dt * minutesPerSec);
      const m = Math.min(90, Math.floor(current));
      setMinute(m);
      const hit = match.goals.find((g) => g.minute <= m && g.minute > lastGoal.current);
      if (hit) {
        lastGoal.current = hit.minute;
        setFlash(hit);
        holdUntil.current = now + 700;
      }
      if (!htHeld && m >= 45 && m < 90) {
        htHeld = true;
        setPhase("ht");
        holdUntil.current = now + 600;
        setTimeout(() => setPhase("run"), 600);
      }
      if (current >= 90) {
        setMinute(90);
        setPhase(match.pens ? "pens" : "ft");
        window.setTimeout(() => {
          if (!done.current) {
            done.current = true;
            onDone();
          }
        }, match.pens ? 1400 : 900);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [match, onDone, pace]);

  const live = scoreAt(match.goals, minute);
  const ticker = match.goals.filter((g) => g.minute <= minute);
  const clock =
    phase === "ht" ? "HT" : phase === "pens" ? "PENS" : phase === "ft" ? "FT" : clockLabel(minute);

  return (
    <div className="live-board">
      <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">{match.round}</p>
      <div className="live-duel mt-3">
        <SideBox
          name={match.home}
          score={live.home}
          goals={ticker.filter((g) => g.side === "home")}
          ratings={match.homeRatings}
        />
        <div className="live-mid">
          <p className={cn("live-clock font-numeral text-sm font-extrabold tabular-nums", flash && "is-flash")}>
            {clock}
          </p>
          <p className={cn("live-nums", flash && "is-flash")}>
            {live.home}–{live.away}
          </p>
          {phase === "pens" && match.pens ? (
            <p className="mt-1 text-xs font-extrabold text-accent">
              {match.pens.home}–{match.pens.away}
            </p>
          ) : null}
          {flash ? (
            <p className="live-goal mt-2">
              {flash.minute}' {flash.scorer}
            </p>
          ) : null}
        </div>
        <SideBox
          name={match.away}
          score={live.away}
          goals={ticker.filter((g) => g.side === "away")}
          ratings={match.awayRatings}
          away
        />
      </div>
    </div>
  );
}

export function LiveCup({
  games,
  onDone,
}: {
  games: BoardMatch[];
  onDone: () => void;
}) {
  const [index, setIndex] = useState(0);
  const match = games[index];
  const round = match?.round;
  const played = games.slice(0, index);

  if (!match) return null;

  return (
    <div className="flex flex-col gap-5">
      <LiveMatchBoard
        key={`${match.round}-${match.home}-${match.away}-${index}`}
        match={match}
        onDone={() => {
          if (index + 1 >= games.length) onDone();
          else setIndex(index + 1);
        }}
      />
      {played.length ? (
        <div className="card-ink rounded-lg px-4 py-3">
          {games
            .filter((g) => g.round === round)
            .map((g, i) => {
              const done = i < played.filter((p) => p.round === round).length || g === match;
              const shown = games.indexOf(g) < index;
              return (
                <div key={`${g.home}-${g.away}`} className="match-row">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">{g.round}</span>
                  <span className="truncate text-sm font-extrabold">
                    {g.home} vs {g.away}
                  </span>
                  <span className="font-numeral text-base font-extrabold tabular-nums">
                    {shown || (done && games.indexOf(g) <= index) ? `${g.gf}–${g.ga}` : "vs"}
                  </span>
                </div>
              );
            })}
        </div>
      ) : null}
    </div>
  );
}
