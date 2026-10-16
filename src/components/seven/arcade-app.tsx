import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/seven/site-footer";
import { Button } from "@/components/ui/button";
import {
  ARCADE_GAMES,
  QUEUE_MS,
  applySide,
  cleanName,
  rivalChoice,
  rivalName,
  startDuel,
  viewDuel,
  type ArcadeGame,
  type Dir,
  type DuelState,
  type DuelView,
} from "@/lib/seven/arcade";
import { playDiceRoll, playTimerWarn } from "@/lib/seven/sound";

type Phase = "pick" | "queue" | "duel";

function playerId(): string {
  const key = "sn-arcade-id";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID().replace(/-/g, "");
  sessionStorage.setItem(key, id);
  return id;
}

export function ArcadeApp() {
  const [name, setName] = useState("");
  const [game, setGame] = useState<ArcadeGame>("penalties");
  const [phase, setPhase] = useState<Phase>("pick");
  const [left, setLeft] = useState(60);
  const [view, setView] = useState<DuelView | null>(null);
  const [dir, setDir] = useState<Dir>("L");
  const [power, setPower] = useState(8);
  const localRef = useRef<DuelState | null>(null);
  const liveRef = useRef(false);
  const idRef = useRef("");
  const barRef = useRef(8);
  const diveAt = useRef(0);

  useEffect(() => {
    idRef.current = playerId();
    const saved = localStorage.getItem("seven-nil-name") ?? "";
    setName(saved);
  }, []);

  useEffect(() => {
    if (view?.role !== "shoot") return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      barRef.current += dt * 0.08;
      const cycle = barRef.current % 200;
      const shown = cycle <= 100 ? cycle : 200 - cycle;
      setPower(Math.round(shown));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [view?.role, view?.log.length]);

  useEffect(() => {
    if (view?.role === "dive") diveAt.current = performance.now();
  }, [view?.role, view?.log.length]);

  useEffect(() => {
    if (phase !== "duel" || liveRef.current || !localRef.current || view?.role !== "wait" || view.done) return;
    const wait = 800 + Math.floor(Math.random() * 900);
    const timer = window.setTimeout(() => {
      const state = localRef.current;
      if (!state || state.done) return;
      const choice = rivalChoice(state);
      const side = 1 as const;
      const next = applySide(state, side, choice);
      localRef.current = next;
      setView(viewDuel(next, 0));
    }, wait);
    return () => window.clearTimeout(timer);
  }, [phase, view?.role, view?.log.length, view?.done]);

  useEffect(() => {
    if (!liveRef.current || phase !== "duel") return;
    const pull = async () => {
      const res = await fetch(`/api/play?id=${idRef.current}`);
      if (!res.ok) return;
      const body = (await res.json()) as { status?: string; view?: DuelView };
      if (body.status === "live" && body.view) setView(body.view);
    };
    const timer = window.setInterval(() => void pull(), 1000);
    return () => window.clearInterval(timer);
  }, [phase, view?.done]);

  const [queuedGame, setQueuedGame] = useState<ArcadeGame>("penalties");

  useEffect(() => {
    if (phase !== "queue") return;
    let dead = false;
    const started = Date.now();
    const id = idRef.current;
    const pull = async () => {
      const res = await fetch(`/api/play?id=${id}`);
      if (!res.ok || dead) return false;
      const body = (await res.json()) as { status?: string; view?: DuelView };
      if (body.status === "live" && body.view) {
        liveRef.current = true;
        setView(body.view);
        setPhase("duel");
        playDiceRoll("short");
        return true;
      }
      return false;
    };
    void pull();
    const timer = window.setInterval(() => {
      const remain = Math.max(0, Math.ceil((QUEUE_MS - (Date.now() - started)) / 1000));
      setLeft(remain);
      if (remain === 10 || remain === 5) playTimerWarn(remain);
      if (Date.now() - started < QUEUE_MS) {
        void pull();
        return;
      }
      window.clearInterval(timer);
      void (async () => {
        const found = await pull();
        if (found || dead) return;
        await fetch("/api/play", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ op: "leave", id }),
        });
        if (dead) return;
        liveRef.current = false;
        const state = startDuel(queuedGame, cleanName(name), rivalName(cleanName(name)));
        localRef.current = state;
        setView(viewDuel(state, 0));
        setPhase("duel");
        playDiceRoll("short");
      })();
    }, 1000);
    return () => {
      dead = true;
      window.clearInterval(timer);
      void fetch("/api/play", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ op: "leave", id }),
      });
    };
  }, [phase, queuedGame, name]);

  async function send(action: { dir?: Dir; power?: number; ms?: number }) {
    if (!view || view.done || view.role === "wait" || view.role === "done") return;
    if (liveRef.current) {
      const res = await fetch("/api/play", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ op: "act", id: idRef.current, ...action }),
      });
      if (!res.ok) return;
      const body = (await res.json()) as { view?: DuelView };
      if (body.view) {
        if ((body.view.log.at(-1)?.points ?? 0) > 0) playDiceRoll("short");
        setView(body.view);
      }
      return;
    }
    const state = localRef.current;
    if (!state) return;
    const next = applySide(state, 0, action);
    localRef.current = next;
    if ((next.log.at(-1)?.points ?? 0) > (state.log.at(-1)?.points ?? 0)) playDiceRoll("short");
    setView(viewDuel(next, 0));
  }

  const youName = cleanName(name);

  async function startSearch() {
    const id = idRef.current || playerId();
    idRef.current = id;
    const label = cleanName(name);
    localStorage.setItem("seven-nil-name", label);
    liveRef.current = false;
    localRef.current = null;
    setView(null);
    setQueuedGame(game);
    setLeft(60);
    const res = await fetch("/api/play", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ op: "join", id, name: label, game }),
    });
    const body = (await res.json()) as { status?: string; view?: DuelView };
    if (body.status === "live" && body.view) {
      liveRef.current = true;
      setView(body.view);
      setPhase("duel");
      playDiceRoll("short");
      return;
    }
    setPhase("queue");
  }

  return (
    <main id="main-content" className="relative min-h-dvh bg-paper text-ink">
      <div className="paper-grain" aria-hidden="true" />
      <div className="relative z-10">
        <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-5">
          <Link to="/" className="home-brand">
            7-0
          </Link>
          <Link to="/" className="text-xs font-semibold uppercase tracking-[0.14em] text-muted hover:text-ink">
            Draft
          </Link>
        </header>
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-5 pb-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">Arcade</p>
          <h1 className="home-headline">Find a rival</h1>
          {phase === "pick" ? (
            <>
              <label className="text-sm font-semibold">
                Your name
                <input
                  className="mt-1 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-base"
                  maxLength={18}
                  value={name}
                  placeholder="Name on the scoreboard"
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                {ARCADE_GAMES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`rounded-2xl border p-4 text-left ${game === item.id ? "border-pitch bg-pitch text-white" : "border-line bg-surface"}`}
                    onClick={() => setGame(item.id)}
                  >
                    <span className="block font-display text-2xl tracking-wide">{item.name}</span>
                    <span className={`mt-2 block text-sm ${game === item.id ? "text-white/80" : "text-muted"}`}>{item.blurb}</span>
                  </button>
                ))}
              </div>
              <Button type="button" onClick={() => void startSearch()}>
                Find a rival
              </Button>
              <Link to="/auction" className="rounded-2xl border border-line bg-surface p-4">
                <span className="block font-display text-2xl tracking-wide">5-a-side auction</span>
                <span className="mt-2 block text-sm text-muted">Blind bids. $16. You against the scout, or pass-and-play.</span>
              </Link>
            </>
          ) : null}
          {phase === "queue" ? (
            <div className="rounded-3xl border border-line bg-surface p-6">
              <p className="font-display text-5xl tabular-nums">{left}</p>
              <p className="mt-2 text-sm font-semibold">Looking for a rival on {ARCADE_GAMES.find((item) => item.id === game)?.name}.</p>
              <p className="mt-1 text-sm text-muted">Stay on this page. The whistle goes as soon as someone else is in.</p>
            </div>
          ) : null}
          {phase === "duel" && view ? (
            <Duel
              you={youName}
              view={view}
              dir={dir}
              power={power}
              onDir={setDir}
              onStrike={() =>
                void send(
                  view.role === "dive"
                    ? { dir, ms: Math.max(0, Math.round(performance.now() - diveAt.current)) }
                    : view.role === "keep"
                      ? { dir }
                      : { dir, power },
                )
              }
              onAgain={() => {
                liveRef.current = false;
                localRef.current = null;
                setView(null);
                setPhase("pick");
              }}
            />
          ) : null}
        </section>
        <SiteFooter />
      </div>
    </main>
  );
}

function Duel({
  you,
  view,
  dir,
  power,
  onDir,
  onStrike,
  onAgain,
}: {
  you: string;
  view: DuelView;
  dir: Dir;
  power: number;
  onDir: (dir: Dir) => void;
  onStrike: () => void;
  onAgain: () => void;
}) {
  const yours = view.role === "shoot" || view.role === "keep" || view.role === "dive";
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{view.headline}</p>
          <p className="font-display text-4xl tabular-nums">
            {view.scores[0]}<span className="mx-2 text-muted">–</span>{view.scores[1]}
          </p>
        </div>
        <p className="text-right text-sm font-semibold">
          {you}
          <span className="block text-muted">vs {view.opponent}</span>
        </p>
      </div>
      <div className="relative h-40 overflow-hidden rounded-3xl bg-field">
        <div className="absolute inset-x-8 top-4 h-24 rounded-t-2xl border-4 border-b-0 border-white/80" />
        {view.ball ? <span className={`absolute top-10 size-4 rounded-full bg-white ${view.ball === "L" ? "left-12" : view.ball === "R" ? "right-12" : "left-1/2 -ml-2"}`} /> : null}
        {view.role === "shoot" ? (
          <span className="absolute bottom-4 h-3 rounded-full bg-gold" style={{ left: `${8 + power * 0.84}%`, width: "0.7rem" }} />
        ) : null}
      </div>
      {yours && !view.done ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            {(["L", "C", "R"] as Dir[]).map((item) => (
              <Button key={item} type="button" variant={dir === item ? "primary" : "secondary"} onClick={() => onDir(item)}>
                {item === "L" ? "Left" : item === "R" ? "Right" : "Centre"}
              </Button>
            ))}
          </div>
          {view.role === "shoot" ? (
            <Button type="button" onClick={onStrike}>
              Strike
            </Button>
          ) : (
            <Button type="button" onClick={onStrike}>
              {view.role === "keep" ? "Dive" : "Save"}
            </Button>
          )}
        </>
      ) : null}
      {view.done ? (
        <Button type="button" onClick={onAgain}>
          Play again
        </Button>
      ) : null}
      <ul className="flex flex-col gap-1 text-sm">
        {view.log.slice(-6).map((row) => (
          <li key={`${row.n}-${row.name}-${row.text}`}>
            <span className="font-semibold">{row.name}</span> {row.text}
            {row.points > 1 ? ` · ${row.points}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
