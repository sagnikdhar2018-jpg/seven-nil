import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { AuctionPlayer, AuctionSlot } from "@/data/auctionPlayers";
import { SiteFooter } from "@/components/seven/site-footer";
import { Button } from "@/components/ui/button";
import {
  STARTING_BUDGET,
  aiChoice,
  buildPool,
  canBidOn,
  emptySlots,
  flagEmoji,
  maxAllowedBid,
  reduceAuction,
  scoreline,
  slotsLeft,
  squadRating,
  startAuction,
  type AuctionAction,
  type AuctionState,
  type Manager,
  type Signed,
} from "@/lib/seven/auction";
import { playDiceRoll, playTimerExpire, playTimerWarn } from "@/lib/seven/sound";

const POSITIONS: AuctionSlot[] = ["GK", "DEF", "MID", "ATT"];

export function AuctionApp() {
  const [mode, setMode] = useState<"ai" | "local">("ai");
  const [you, setYou] = useState("");
  const [them, setThem] = useState("");
  const [showRatings, setShowRatings] = useState(false);
  const [live, setLive] = useState<AuctionState | null>(null);
  const liveRef = useRef<AuctionState | null>(null);
  liveRef.current = live;

  useEffect(() => {
    const saved = localStorage.getItem("seven-nil-name");
    if (saved) setYou(saved);
  }, []);

  useEffect(() => {
    if (!live || live.phase !== "bidding") return;
    const timer = window.setInterval(() => {
      const current = liveRef.current;
      if (!current || current.phase !== "bidding") return;
      if (current.clock === 1) playTimerExpire();
      dispatchMatch({ type: "tick" });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [live?.phase, live?.index, live?.turn, live?.bid]);

  useEffect(() => {
    if (!live || live.mode !== "ai" || live.phase !== "bidding" || live.turn !== 1) return;
    const snapshot = { index: live.index, bid: live.bid };
    const timer = window.setTimeout(() => {
      const current = liveRef.current;
      if (!current || current.phase !== "bidding" || current.turn !== 1 || current.index !== snapshot.index || current.bid !== snapshot.bid) return;
      const action = aiChoice(current, 1);
      if (action) dispatchMatch(action);
    }, 800 + Math.floor(Math.random() * 900));
    return () => window.clearTimeout(timer);
  }, [live?.phase, live?.index, live?.turn, live?.bid, live?.mode]);

  useEffect(() => {
    if (live?.phase !== "toast") return;
    const timer = window.setTimeout(() => dispatchMatch({ type: "next" }), 1300);
    return () => window.clearTimeout(timer);
  }, [live?.phase, live?.banner, live?.index]);

  useEffect(() => {
    if (live?.phase === "bidding" && live.clock === 3) playTimerWarn(3);
  }, [live?.clock, live?.phase, live?.index]);

  function dispatchMatch(action: AuctionAction) {
    const current = liveRef.current;
    if (!current) return;
    const next = reduceAuction(current, action);
    if (next.log.length > current.log.length) playDiceRoll("short");
    liveRef.current = next;
    setLive(next);
  }

  function begin() {
    const name = you.trim().slice(0, 18) || "Manager 1";
    localStorage.setItem("seven-nil-name", name);
    const rival = mode === "local" ? them.trim().slice(0, 18) || "Manager 2" : "AI Scout";
    const next = startAuction({ names: [name, rival], mode, pool: buildPool() });
    liveRef.current = next;
    setLive(next);
  }

  return (
    <main id="main-content" className="relative min-h-dvh bg-paper text-ink">
      <div className="paper-grain" aria-hidden="true" />
      <div className="relative z-10">
        <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5">
          <Link to="/" className="home-brand">
            7-0
          </Link>
          <div className="flex gap-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            <Link to="/play" className="hover:text-ink">
              Arcade
            </Link>
            <Link to="/" className="hover:text-ink">
              Draft
            </Link>
          </div>
        </header>
        <section className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-5 pb-8">
          {!live ? (
            <Lobby
              mode={mode}
              you={you}
              them={them}
              showRatings={showRatings}
              onMode={setMode}
              onYou={setYou}
              onThem={setThem}
              onRatings={setShowRatings}
              onStart={begin}
            />
          ) : (
            <Board match={live} showRatings={showRatings} onRatings={setShowRatings} onAction={dispatchMatch} onAgain={() => setLive(null)} />
          )}
        </section>
        <SiteFooter />
      </div>
    </main>
  );
}

function Lobby({
  mode,
  you,
  them,
  showRatings,
  onMode,
  onYou,
  onThem,
  onRatings,
  onStart,
}: {
  mode: "ai" | "local";
  you: string;
  them: string;
  showRatings: boolean;
  onMode: (mode: "ai" | "local") => void;
  onYou: (value: string) => void;
  onThem: (value: string) => void;
  onRatings: (value: boolean) => void;
  onStart: () => void;
}) {
  return (
    <>
      <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">5-a-side</p>
      <h1 className="home-headline">Blind auction</h1>
      <p className="max-w-xl text-sm leading-relaxed">
        Ten players come out one at a time. Each manager has ${STARTING_BUDGET}. You need a goalkeeper, a defender, two midfielders and an attacker, and you must keep $1 for every slot still empty.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" className={`rounded-2xl border p-4 text-left ${mode === "ai" ? "border-pitch bg-pitch text-white" : "border-line bg-surface"}`} onClick={() => onMode("ai")}>
          <span className="block font-display text-2xl">Vs AI Scout</span>
          <span className={`mt-1 block text-sm ${mode === "ai" ? "text-white/80" : "text-muted"}`}>The scout bids from the other desk.</span>
        </button>
        <button type="button" className={`rounded-2xl border p-4 text-left ${mode === "local" ? "border-pitch bg-pitch text-white" : "border-line bg-surface"}`} onClick={() => onMode("local")}>
          <span className="block font-display text-2xl">Pass and play</span>
          <span className={`mt-1 block text-sm ${mode === "local" ? "text-white/80" : "text-muted"}`}>Two people, one phone. Hand it over on the turn.</span>
        </button>
      </div>
      <label className="text-sm font-semibold">
        Your name
        <input className="mt-1 w-full rounded-2xl border border-line bg-surface px-4 py-3" maxLength={18} value={you} placeholder="Manager 1" onChange={(event) => onYou(event.target.value)} />
      </label>
      {mode === "local" ? (
        <label className="text-sm font-semibold">
          Opponent
          <input className="mt-1 w-full rounded-2xl border border-line bg-surface px-4 py-3" maxLength={18} value={them} placeholder="Manager 2" onChange={(event) => onThem(event.target.value)} />
        </label>
      ) : null}
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" checked={showRatings} onChange={(event) => onRatings(event.target.checked)} />
        Show ratings on the card
      </label>
      <Button type="button" onClick={onStart}>
        Start the auction
      </Button>
    </>
  );
}

function Board({
  match,
  showRatings,
  onRatings,
  onAction,
  onAgain,
}: {
  match: AuctionState;
  showRatings: boolean;
  onRatings: (value: boolean) => void;
  onAction: (action: AuctionAction) => void;
  onAgain: () => void;
}) {
  const player = match.pool[match.index];
  const done = match.phase === "done";
  const yours = match.turn === 0 || match.mode === "local";
  const canAct = match.phase === "bidding" && (match.mode === "local" ? true : match.turn === 0);
  const actor = match.managers[match.turn];
  const line = done ? scoreline(squadRating(match.managers[0]), squadRating(match.managers[1]), match.pool.reduce((sum, item) => sum + item.overallRating, 0)) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{done ? "Full time" : `Player ${Math.min(match.index + 1, 10)} of 10`}</p>
          <h1 className="home-headline">{done ? "Squads locked" : "On the block"}</h1>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold">
          <input type="checkbox" checked={showRatings} onChange={(event) => onRatings(event.target.checked)} />
          Ratings
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {match.managers.map((manager, index) => (
          <BudgetCard key={manager.name} manager={manager} active={!done && match.phase === "bidding" && match.turn === index} />
        ))}
      </div>
      {match.banner ? <p className="auction-in rounded-2xl bg-pitch px-4 py-3 text-sm font-semibold text-white">{match.banner}</p> : null}
      {!done && player ? (
        <>
          <article className="auction-in overflow-hidden rounded-3xl border border-line bg-surface">
            <ActionShot key={player.id} player={player} live={match.phase === "bidding"} />
            <div className="flex items-end justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">
                  {flagEmoji(player.nationality)} {player.position} · {player.club}
                </p>
                <h2 className="truncate text-3xl">{player.name}</h2>
                <p className="text-sm text-muted">{player.funFactOrForm}</p>
              </div>
              <p className="font-display text-3xl tabular-nums">{showRatings ? player.overallRating : "??"}</p>
            </div>
            {match.phase === "bidding" ? (
              <div className="px-4 pb-4">
                <div className="mb-1 flex justify-between text-xs font-semibold">
                  <span className={match.clock <= 3 ? "text-accent" : ""}>
                    {actor?.name} · {match.bid === null ? "open the bidding" : `bid is $${match.bid}`}
                  </span>
                  <span className={`tabular-nums ${match.clock <= 3 ? "text-accent" : ""}`}>{match.clock}s</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={match.clock} aria-valuemin={0} aria-valuemax={match.clockMax}>
                  <div className={`h-full ${match.clock <= 3 ? "bg-accent" : "bg-pitch"}`} style={{ width: `${(match.clock / match.clockMax) * 100}%` }} />
                </div>
              </div>
            ) : null}
          </article>
          {canAct && player ? <BidPad match={match} player={player} onAction={onAction} /> : null}
          {!yours && match.mode === "ai" && match.phase === "bidding" ? <p className="text-sm font-semibold text-muted">AI Scout is on the clock.</p> : null}
        </>
      ) : null}
      {done && line ? (
        <div className="rounded-3xl bg-field px-5 py-6 text-white">
          <p className="text-xs font-semibold tracking-[0.16em] uppercase text-white/70">5-a-side</p>
          <p className="font-display text-5xl tabular-nums">
            {line[0]}<span className="mx-2 text-white/50">–</span>
            {line[1]}
          </p>
          <p className="mt-1 text-sm text-white/80">
            {line[0] === line[1] ? "Drawn" : line[0] > line[1] ? `${match.managers[0].name} won` : `${match.managers[1].name} won`}
          </p>
          <Button className="mt-4" type="button" variant="secondary" onClick={onAgain}>
            New auction
          </Button>
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {match.managers.map((manager) => (
          <SquadColumn key={manager.name} manager={manager} showRatings={showRatings || done} />
        ))}
      </div>
    </div>
  );
}

function BudgetCard({ manager, active }: { manager: Manager; active: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${active ? "border-pitch" : "border-line"} bg-surface`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{manager.name}</p>
      <p className="font-display text-4xl tabular-nums">${manager.budget}</p>
      <p className="text-sm font-semibold">Max this round ${maxAllowedBid(manager)}</p>
      <p className="text-xs text-muted">{emptySlots(manager)} slots left</p>
    </div>
  );
}

function BidPad({ match, player, onAction }: { match: AuctionState; player: AuctionPlayer; onAction: (action: AuctionAction) => void }) {
  const side = match.turn;
  const max = maxAllowedBid(match.managers[side] as Manager);
  const opening = match.bid === null;
  const amounts = [1, 2, 3, 4, 5];
  return (
    <div className="grid grid-cols-3 gap-2">
      {opening
        ? amounts.map((amount) => (
            <Button key={amount} type="button" variant="secondary" disabled={amount > max} onClick={() => onAction({ type: "open", side, amount })}>
              ${amount}
            </Button>
          ))
        : ([1, 2, 3] as const).map((by) => (
            <Button key={by} type="button" variant="secondary" disabled={(match.bid ?? 0) + by > max} onClick={() => onAction({ type: "raise", side, by })}>
              +${by}
            </Button>
          ))}
      <Button type="button" disabled={opening ? max < 1 : max <= (match.bid ?? 0)} onClick={() => (opening ? onAction({ type: "open", side, amount: max }) : onAction({ type: "raise", side, max: true }))}>
        Max ${max}
      </Button>
      {!opening ? (
        <Button type="button" variant="ghost" onClick={() => onAction({ type: "fold", side })}>
          You can have him
        </Button>
      ) : null}
      {!canBidOn(match.managers[side] as Manager, player.position) ? <p className="col-span-3 text-sm">Position is full.</p> : null}
    </div>
  );
}

function SquadColumn({ manager, showRatings }: { manager: Manager; showRatings: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-3">
      <p className="mb-2 text-sm font-semibold">{manager.name}</p>
      <ul className="flex flex-col gap-2">
        {POSITIONS.flatMap((position) => {
          const signed = manager.squad[position];
          const blanks = Math.max(0, slotsLeft(manager, position));
          return [
            ...signed.map((item) => <SlotRow key={item.player.id} signed={item} showRatings={showRatings} />),
            ...Array.from({ length: blanks }, (_, index) => <EmptySlot key={`${position}-${index}`} position={position} />),
          ];
        })}
      </ul>
    </div>
  );
}

function ActionShot({ player, live }: { player: AuctionPlayer; live: boolean }) {
  const [failed, setFailed] = useState(false);
  if (!player.imageUrl || failed) {
    return (
      <div className="grid h-48 place-items-center bg-field font-display text-5xl text-white" aria-hidden>
        {initials(player.name)}
      </div>
    );
  }
  return (
    <div className="relative h-72 overflow-hidden bg-field sm:h-96">
      <img
        src={player.imageUrl}
        alt={`${player.name} in action`}
        className={`h-full w-full object-cover object-[center_22%] ${live ? "auction-photo" : ""}`}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function SlotRow({ signed, showRatings }: { signed: Signed; showRatings: boolean }) {
  return (
    <li className="flex items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2 text-sm">
      <span>
        <span className="mr-2 text-xs font-semibold text-muted">{signed.player.position}</span>
        {signed.player.name}
        {showRatings ? <span className="ml-2 tabular-nums text-muted">{signed.player.overallRating}</span> : null}
      </span>
      <span className="font-semibold tabular-nums">${signed.price}</span>
    </li>
  );
}

function EmptySlot({ position }: { position: AuctionSlot }) {
  return <li className="rounded-xl border border-dashed border-line px-3 py-2 text-xs font-semibold text-muted">{position}</li>;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}
