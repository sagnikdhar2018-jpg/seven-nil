import { useEffect, useRef, useState } from "react";
import type { MatchGoal, PenKick, PlayerRating, TeamRatings } from "@/lib/seven/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BracketBoard } from "./bracket-board";

type BoardMatch = {
  round: string;
  home: string;
  away: string;
  gf: number;
  ga: number;
  goals: MatchGoal[];
  pens?: { home: number; away: number; kicks?: PenKick[] };
  homeRatings?: TeamRatings;
  awayRatings?: TeamRatings;
  ratings?: PlayerRating[];
  potm?: { name: string; rating: number; side: "home" | "away" };
  instant?: boolean;
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
    <div>
      <Button
        variant={open ? "ink" : "secondary"}
        className="btn-mini w-full"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Hide" : "Ratings"}
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

function Scorers({ goals, away }: { goals: MatchGoal[]; away?: boolean }) {
  return (
    <ul className={cn("live-scorers", away && "is-away")}>
      {goals.length === 0 ? (
        <li className="text-muted">—</li>
      ) : (
        goals.map((g, i) => (
          <li key={`${g.minute}-${g.scorer}-${i}`}>
            <span className="font-numeral tabular-nums">{g.minute}'</span>
            <span className="truncate">{g.scorer}</span>
          </li>
        ))
      )}
    </ul>
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
  const [penShown, setPenShown] = useState(0);
  const [sheet, setSheet] = useState(false);
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
    setPenShown(0);
    setSheet(false);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setMinute(90);
      setPenShown(match.pens?.kicks?.length ?? 0);
      setPhase(match.pens ? "pens" : "ft");
      setSheet(true);
      return;
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
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [match, pace]);

  useEffect(() => {
    if (phase !== "pens") return;
    const total = match.pens?.kicks?.length ?? 0;
    if (penShown < total) {
      const t = window.setTimeout(() => setPenShown((n) => n + 1), 680);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setSheet(true), 420);
    return () => window.clearTimeout(t);
  }, [phase, penShown, match.pens]);

  useEffect(() => {
    if (phase !== "ft") return;
    const t = window.setTimeout(() => setSheet(true), 700);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (!sheet) return;
    const t = window.setTimeout(() => {
      if (!done.current) {
        done.current = true;
        onDone();
      }
    }, 1700);
    return () => window.clearTimeout(t);
  }, [sheet, onDone]);

  const live = scoreAt(match.goals, minute);
  const ticker = match.goals.filter((g) => g.minute <= minute);
  const kicks = match.pens?.kicks ?? [];
  const shownKicks = kicks.slice(0, penShown);
  const penScore = shownKicks.reduce(
    (acc, k) => {
      if (!k.scored) return acc;
      if (k.side === "home") acc.home += 1;
      else acc.away += 1;
      return acc;
    },
    { home: 0, away: 0 },
  );
  const clock =
    phase === "ht" ? "HT" : phase === "pens" ? "PENS" : phase === "ft" || sheet ? "FT" : clockLabel(minute);

  return (
    <div className="live-board">
      <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">{match.round}</p>
      <div className="live-scoreline mt-3">
        <p className="live-name">{match.home}</p>
        <div className="live-mid">
          <p className={cn("live-clock font-numeral", flash && "is-flash")}>{clock}</p>
          <p className={cn("live-nums", flash && "is-flash")}>
            {live.home}–{live.away}
          </p>
          {phase === "pens" && match.pens ? (
            <p className="text-xs font-extrabold text-accent">
              {kicks.length ? `${penScore.home}–${penScore.away}` : `${match.pens.home}–${match.pens.away}`}
            </p>
          ) : null}
        </div>
        <p className="live-name is-away">{match.away}</p>
      </div>
      {flash && phase !== "pens" ? (
        <p className="live-goal">
          {flash.minute}' {flash.scorer}
        </p>
      ) : null}
      <div className="live-split">
        <Scorers goals={ticker.filter((g) => g.side === "home")} />
        <Scorers goals={ticker.filter((g) => g.side === "away")} away />
      </div>
      <div className="live-split">
        <RatingsToggle ratings={match.homeRatings} />
        <RatingsToggle ratings={match.awayRatings} />
      </div>
      {phase === "pens" && shownKicks.length ? (
        <ol className="pen-list mt-4">
          {shownKicks.map((kick, i) => (
            <li key={`${kick.taker}-${i}`} className={kick.scored ? "is-scored" : "is-miss"}>
              <span className="font-numeral tabular-nums">{i + 1}</span>
              <span className="truncate">
                {kick.taker}
                <span className="text-muted"> · {kick.side === "home" ? match.home : match.away}</span>
              </span>
              <span>{kick.scored ? "Scores" : "Misses"}</span>
            </li>
          ))}
        </ol>
      ) : null}
      {sheet && match.potm ? (
        <div className="potm mt-4">
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Player of the match</p>
          <div className="mt-1 flex items-end justify-between gap-3">
            <p className="font-display text-3xl leading-none">{match.potm.name}</p>
            <p className="font-numeral text-3xl font-extrabold tabular-nums text-accent">{match.potm.rating.toFixed(1)}</p>
          </div>
          {match.ratings?.length ? (
            <ul className="rate-list mt-3">
              {match.ratings.map((row) => (
                <li key={`${row.side}-${row.name}`}>
                  <span className="w-8 text-xs font-extrabold text-muted">{row.pos}</span>
                  <span className="min-w-0 flex-1 truncate">{row.name}</span>
                  <span className="text-xs text-muted">{row.side === "home" ? match.home : match.away}</span>
                  <span className="font-numeral w-8 text-right font-extrabold tabular-nums">{row.rating.toFixed(1)}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
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
  const liveGames = games.filter((g) => !g.instant);
  const [liveIndex, setLiveIndex] = useState(0);
  const finished = useRef(false);
  const match = liveGames[liveIndex];

  useEffect(() => {
    if (liveIndex < liveGames.length) return;
    if (finished.current) return;
    finished.current = true;
    onDone();
  }, [liveIndex, liveGames.length, onDone]);

  if (!games.length) return null;

  return (
    <div className="flex flex-col gap-5">
      <BracketBoard games={games} liveIndex={liveIndex} />
      {match ? (
        <LiveMatchBoard
          key={`${match.round}-${match.home}-${match.away}-${liveIndex}`}
          match={match}
          onDone={() => setLiveIndex(liveIndex + 1)}
        />
      ) : null}
    </div>
  );
}
