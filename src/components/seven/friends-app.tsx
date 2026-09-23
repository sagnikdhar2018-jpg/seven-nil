import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { CalendarRange, Check, Copy, Dices, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useP2PRoom } from "@/lib/multiplayer";
import { canDrawSameTeam, filledCount } from "@/lib/seven/draft";
import { emptySlotsFor, FORMATIONS } from "@/lib/seven/formations";
import {
  apply,
  friendsPath,
  loadPlayerName,
  makeSeat,
  pickState,
  savePlayerName,
  shownName,
  type BracketSize,
  type FriendKind,
  type FriendsAction,
  type FriendsState,
  type TimerSec,
} from "@/lib/seven/friends";
import { useFriends } from "@/lib/seven/friends-store";
import { isPersonTaken } from "@/lib/seven/person";
import { playTimerExpire, playTimerWarn } from "@/lib/seven/sound";
import { useSeven } from "@/lib/seven/store";
import type { FormationId, ModeId, PoolId, StyleId } from "@/lib/seven/types";
import { cn } from "@/lib/utils";
import { BracketBoard } from "./bracket-board";
import { ChipGroup } from "./chips";
import { LineupBox } from "./box-score";
import { LiveCup } from "./live-match";
import { Pitch } from "./pitch";
import { PlayerPickRow } from "./player-pick";
import { SfxRoot } from "./sfx";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { useDiceSpin } from "./use-dice-spin";

type Wire =
  | { t: "hello"; id: string; name: string; password: string }
  | { t: "state"; state: FriendsState }
  | { t: "act"; action: FriendsAction; actorId: string }
  | { t: "need" };

function modeList(pool: PoolId): { id: FriendKind; n: string; name: string; desc: string }[] {
  if (pool === "club") {
    return [
      { id: "local", n: "01", name: "Friend vs friend", desc: "Two club XIs on this device, then one European night" },
      { id: "final", n: "02", name: "Rivalry", desc: "Online 1v1. Draft historic clubs, play a final" },
      { id: "cup", n: "03", name: "UCL", desc: "Knockout of 4 to 32. Real clubs fill the bracket" },
    ];
  }
  return [
    { id: "local", n: "01", name: "Local", desc: "Two players on the same device, taking turns" },
    { id: "final", n: "02", name: "Cup Final", desc: "Each player builds their team and plays the Final" },
    { id: "cup", n: "03", name: "Full Cup", desc: "Bracket of 4 to 32. Empty seats become real nations" },
  ];
}

function NameField({
  label = "Your name",
  value,
  onChange,
  placeholder = "Your name",
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-xs font-semibold tracking-[0.14em] text-muted uppercase">
      {label}
      <input
        className="field-input normal-case tracking-normal"
        value={value}
        maxLength={18}
        placeholder={placeholder}
        autoComplete="nickname"
        data-action="player-name"
        onChange={(e) => {
          const next = e.target.value.slice(0, 18);
          onChange(next);
          savePlayerName(next);
        }}
      />
    </label>
  );
}

function ConnectingNote() {
  const [waited, setWaited] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setWaited(true), 8000);
    return () => window.clearTimeout(id);
  }, []);
  return (
    <p className="text-sm text-muted">
      {waited
        ? "Still connecting. Keep the host lobby open on another phone or laptop, then refresh this page."
        : "Connecting to the room…"}
    </p>
  );
}

export function FriendsApp({
  pool = "world",
  roomFromUrl,
}: {
  pool?: PoolId;
  roomFromUrl?: string;
}) {
  const hydrate = useSeven((s) => s.hydrate);
  const phase = useFriends((s) => s.phase);
  const kind = useFriends((s) => s.kind);
  const backToMenu = useFriends((s) => s.backToMenu);

  useEffect(() => {
    hydrate(pool);
  }, [hydrate, pool]);

  useEffect(() => {
    const s = useFriends.getState();
    if (s.pool !== pool) backToMenu(pool);
  }, [pool, backToMenu]);

  useEffect(() => {
    bootFromUrl(roomFromUrl, pool);
  }, [roomFromUrl, pool]);

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-paper text-ink" data-pool={pool}>
      <SfxRoot />
      <div className="paper-grain" aria-hidden="true" />
      <div className="relative z-10">
        <SiteHeader
          playLabel={pool === "club" ? "Clubs" : "World Cup"}
          playHref={pool === "club" ? "/club" : "/"}
        />
        {phase === "menu" ? <Selector pool={pool} /> : null}
        {phase === "setup" ? <LocalSetup pool={pool} /> : null}
        {phase === "lobby" ? <Lobby pool={pool} /> : null}
        {phase === "draft" ? <DraftTable /> : null}
        {phase === "simulating" ? <SimView /> : null}
        {phase === "result" ? <ResultView /> : null}
        {phase === "menu" || phase === "setup" ? <SiteFooter /> : null}
      </div>
      {kind !== "local" &&
      (phase === "lobby" || phase === "draft" || phase === "simulating" || phase === "result") ? (
        <NetBridge />
      ) : null}
    </main>
  );
}

function bootFromUrl(roomFromUrl: string | undefined, pool: PoolId) {
  if (typeof window === "undefined") return;
  const room = (roomFromUrl ?? new URLSearchParams(window.location.search).get("room") ?? "").toUpperCase();
  if (!room) return;
  const existing = useFriends.getState();
  if (existing.code === room && existing.phase !== "menu") return;
  const hostKey = sessionStorage.getItem(`sn-host-${room}`);
  if (hostKey && existing.hostId === hostKey) return;
  const id = `p-${Math.random().toString(36).slice(2, 10)}`;
  const joinName =
    (typeof sessionStorage !== "undefined" && sessionStorage.getItem("sn-join-name")) ||
    loadPlayerName() ||
    "Player";
  const guest = {
    ...existing,
    kind: "final" as const,
    pool,
    code: room,
    phase: "lobby" as const,
    hostId: "pending",
    seats: [],
  };
  useFriends.getState().becomeGuest(guest, id);
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem("sn-join-name", joinName);
  }
}

function Selector({ pool }: { pool: PoolId }) {
  const [open, setOpen] = useState<FriendKind | null>(null);
  const [join, setJoin] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState(() => loadPlayerName() || "Host");
  const [mode, setMode] = useState<ModeId>("classic");
  const [timer, setTimer] = useState<TimerSec>(30);
  const [bracketSize, setBracketSize] = useState<BracketSize>(8);
  const hydrateLocal = useFriends((s) => s.hydrateLocal);
  const becomeHost = useFriends((s) => s.becomeHost);
  const navigate = useNavigate();
  const kinds = modeList(pool);
  const path = friendsPath(pool);

  const startHost = (kind: FriendKind) => {
    const id = `p-${Math.random().toString(36).slice(2, 10)}`;
    const name = shownName(displayName, "Host");
    savePlayerName(name);
    becomeHost(kind, id, name, { mode, timer, password, bracketSize, pool });
    const code = useFriends.getState().code;
    sessionStorage.setItem(`sn-host-${code}`, id);
    void navigate({ to: path, search: { room: code }, replace: true });
  };

  const joinRoom = () => {
    const code = join.replace(/[^A-Za-z0-9]/g, "").slice(0, 6).toUpperCase();
    if (code.length < 4) return;
    const name = shownName(displayName, "Player");
    savePlayerName(name);
    sessionStorage.setItem("sn-join-name", name);
    sessionStorage.setItem("sn-join-password", password);
    void navigate({ to: path, search: { room: code } });
  };

  return (
    <>
      <section className="mx-auto flex w-full max-w-xl flex-col gap-8 px-5 pb-10 pt-2">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">
            {pool === "club" ? "Club friends" : "With friends"}
          </p>
          <h1 className="home-headline mt-2">
            {pool === "club" ? "Rivalries and UCL nights" : "Pick your tournament"}
          </h1>
          <p className="mt-3 text-sm font-semibold text-muted">
            {pool === "club" ? "Friend vs friend · UCL knockout" : "3 modes · local and online"}
          </p>
        </div>

        <div className="ms-list">
          {kinds.map((item) => {
            const expanded = open === item.id;
            return (
              <div key={item.id} className="flex flex-col gap-2">
                <button
                  type="button"
                  className={cn("ms-row", expanded && "is-open")}
                  aria-expanded={expanded}
                  data-action={`open-${item.id}`}
                  onClick={() => setOpen(expanded ? null : item.id)}
                >
                  <span className="ms-n">{item.n}</span>
                  <span>
                    <span className="ms-name">{item.name}</span>
                    <span className="ms-desc">{item.desc}</span>
                  </span>
                </button>
                {expanded ? (
                  <div className="card-ink flex flex-col gap-4 rounded-lg px-4 py-4">
                    {item.id !== "local" ? (
                      <NameField value={displayName} onChange={setDisplayName} placeholder="Host" />
                    ) : (
                      <p className="text-xs leading-relaxed text-muted">
                        Set both names on the next screen — you can still change them while you play.
                      </p>
                    )}
                    <ChipGroup<ModeId>
                      label="Mode"
                      value={mode}
                      onChange={setMode}
                      options={[
                        { id: "classic", label: "Classic" },
                        { id: "almanac", label: "Almanac" },
                      ]}
                    />
                    {item.id !== "local" ? (
                      <>
                        <ChipGroup<TimerSec>
                          label="Turn indicator"
                          value={timer}
                          onChange={setTimer}
                          options={[
                            { id: 20, label: "20s" },
                            { id: 30, label: "30s" },
                            { id: 45, label: "45s" },
                          ]}
                        />
                        <label className="flex flex-col gap-2 text-xs font-semibold tracking-[0.14em] text-muted uppercase">
                          Password optional
                          <input
                            className="field-input normal-case tracking-normal"
                            value={password}
                            maxLength={24}
                            placeholder="leave blank"
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </label>
                      </>
                    ) : null}
                    {item.id === "cup" ? (
                      <ChipGroup<BracketSize>
                        label="Teams"
                        value={bracketSize}
                        onChange={setBracketSize}
                        options={[
                          { id: 4, label: "4" },
                          { id: 8, label: "8" },
                          { id: 16, label: "16" },
                          { id: 32, label: "32" },
                        ]}
                      />
                    ) : null}
                    <Button
                      data-action={item.id === "local" ? "start-local" : "create-room"}
                      onClick={() => (item.id === "local" ? hydrateLocal("local", pool) : startHost(item.id))}
                    >
                      {item.id === "local" ? "Start on this device" : "Create room"}
                    </Button>
                    <p className="text-xs leading-relaxed text-muted">
                      {item.id === "local"
                        ? "Pass the device. Each roll is one pick, then the other person goes."
                        : "When the timer hits zero, a legal footballer is picked for you."}
                    </p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Join with a code</p>
          <NameField value={displayName} onChange={setDisplayName} placeholder="Your name" />
          <label className="flex flex-col gap-2 text-xs font-semibold tracking-[0.14em] text-muted uppercase">
            Password if the room has one
            <input
              className="field-input normal-case tracking-normal"
              value={password}
              maxLength={24}
              placeholder="leave blank"
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <div className="flex gap-2">
            <input
              className="field-input"
              maxLength={6}
              placeholder="room code"
              aria-label="Join with a code"
              value={join}
              onChange={(e) => setJoin(e.target.value.toUpperCase())}
            />
            <Button variant="ink" disabled={join.length < 4} onClick={joinRoom}>
              Start →
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted">
          {pool === "club" ? (
            <>
              Looking for nations?{" "}
              <Link className="font-extrabold text-ink underline-offset-2 hover:underline" to="/friends">
                World Cup friends
              </Link>
            </>
          ) : (
            <>
              Historic clubs?{" "}
              <Link className="font-extrabold text-ink underline-offset-2 hover:underline" to="/club/friends">
                Club friends
              </Link>
            </>
          )}
        </p>
      </section>
      <FriendsGuide pool={pool} />
    </>
  );
}

function LocalSetup({ pool }: { pool: PoolId }) {
  const seats = useFriends((s) => s.seats);
  const act = useFriends((s) => s.act);
  const mode = useFriends((s) => s.mode);
  const backToMenu = useFriends((s) => s.backToMenu);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 pb-24 pt-2">
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">
          {pool === "club" ? "Friend vs friend" : "Local"}
        </p>
        <h1 className="home-headline mt-2">
          {pool === "club" ? "Two club XIs, one European night" : "Two XIs, one device"}
        </h1>
      </div>
      <ChipGroup<ModeId>
        label="Mode"
        value={mode}
        onChange={(id) => act({ type: "setMode", mode: id })}
        options={[
          { id: "classic", label: "Classic" },
          { id: "almanac", label: "Almanac" },
        ]}
      />
      <div className="grid gap-4 md:grid-cols-2">
        {seats.map((seat) => (
          <div key={seat.id} className="card-ink flex flex-col gap-4 rounded-lg px-4 py-4">
            <NameField
              label={seat.id === "home" ? "Player 1 name" : "Player 2 name"}
              value={seat.name}
              placeholder={seat.id === "home" ? "Home" : "Away"}
              onChange={(name) => act({ type: "setName", seatId: seat.id, name })}
            />
            <ChipGroup<FormationId>
              label="Formation"
              value={seat.formation}
              onChange={(id) => act({ type: "setFormation", seatId: seat.id, formation: id })}
              options={FORMATIONS.map((id) => ({ id, label: id }))}
            />
            <ChipGroup<StyleId>
              label="Style"
              value={seat.style}
              onChange={(id) => act({ type: "setStyle", seatId: seat.id, style: id })}
              options={[
                { id: "defensive", label: "Defensive" },
                { id: "balanced", label: "Balanced" },
                { id: "attacking", label: "Attacking" },
              ]}
            />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" onClick={() => backToMenu(pool)}>
          Back
        </Button>
        <Button className="ml-auto" data-action="start-draft" onClick={() => act({ type: "start" })}>
          Start draft
        </Button>
      </div>
    </section>
  );
}

function Lobby({ pool }: { pool: PoolId }) {
  const seats = useFriends((s) => s.seats);
  const code = useFriends((s) => s.code);
  const hostId = useFriends((s) => s.hostId);
  const actorId = useFriends((s) => s.actorId);
  const kind = useFriends((s) => s.kind);
  const act = useFriends((s) => s.act);
  const timer = useFriends((s) => s.timer);
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(copiedTimer.current), []);
  const me = seats.find((s) => s.id === actorId) ?? seats[0];
  const readyHumans = seats.filter((s) => s.kind === "human" && s.ready).length;
  const isHost = actorId === hostId;
  const share =
    typeof window !== "undefined" ? `${window.location.origin}${friendsPath(pool)}?room=${code}` : code;
  const needReady = kind === "cup" ? 1 : 2;
  const lobbyLabel =
    kind === "cup"
      ? pool === "club"
        ? "UCL lobby"
        : "Full Cup lobby"
      : pool === "club"
        ? "Rivalry lobby"
        : "Cup Final lobby";

  return (
    <section className="mx-auto flex w-full max-w-xl flex-col gap-6 px-5 pb-24 pt-2">
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">{lobbyLabel}</p>
        <p className="room-code mt-2">{code}</p>
        <p className="mt-2 text-sm text-muted">Share the code or the invite link. Set your name before you mark ready.</p>
      </div>
      <Button
        variant={copied ? "ink" : "secondary"}
        aria-label={copied ? "Link copied" : "Copy invite link"}
        onClick={() => {
          void navigator.clipboard
            ?.writeText(share)
            .then(() => {
              setCopied(true);
              window.clearTimeout(copiedTimer.current);
              copiedTimer.current = window.setTimeout(() => setCopied(false), 2500);
            })
            .catch(() => {});
        }}
      >
        {copied ? <Check className="size-4" strokeWidth={2.5} /> : <Copy className="size-4" strokeWidth={2} />}
        {copied ? "Copied" : "Copy link"}
      </Button>
      {me ? (
        <div className="card-ink flex flex-col gap-4 rounded-lg px-4 py-4">
          <NameField
            value={me.name}
            placeholder="Your name"
            onChange={(name) => act({ type: "setName", seatId: me.id, name })}
          />
          <ChipGroup<FormationId>
            label="Your formation"
            value={me.formation}
            onChange={(id) => act({ type: "setFormation", seatId: me.id, formation: id })}
            options={FORMATIONS.map((id) => ({ id, label: id }))}
          />
          <ChipGroup<StyleId>
            label="Your style"
            value={me.style}
            onChange={(id) => act({ type: "setStyle", seatId: me.id, style: id })}
            options={[
              { id: "defensive", label: "Defensive" },
              { id: "balanced", label: "Balanced" },
              { id: "attacking", label: "Attacking" },
            ]}
          />
          <Button variant={me.ready ? "ink" : "primary"} onClick={() => act({ type: "ready", seatId: me.id })}>
            {me.ready ? "Ready" : "Mark ready"}
          </Button>
        </div>
      ) : (
        <ConnectingNote />
      )}
      <ul className="card-ink rounded-lg px-4 py-3">
        {seats.map((seat) => (
          <li key={seat.id} className="flex items-center justify-between border-b border-line py-3 last:border-0">
            <span className="text-sm font-extrabold">
              {shownName(seat.name)}
              {seat.id === hostId ? " · host" : ""}
              {seat.id === actorId ? " · you" : ""}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              {seat.ready ? "Ready" : "Waiting"}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted">{timer}s turn · auto-pick at zero · {readyHumans} ready</p>
      {isHost ? (
        <Button data-action="host-start" disabled={readyHumans < needReady} onClick={() => act({ type: "start" })}>
          Start
        </Button>
      ) : (
        <p className="text-sm text-muted">Waiting for the host to start.</p>
      )}
    </section>
  );
}

function DraftTable() {
  const seats = useFriends((s) => s.seats);
  const activeSeat = useFriends((s) => s.activeSeat);
  const draw = useFriends((s) => s.draw);
  const selected = useFriends((s) => s.selected);
  const mode = useFriends((s) => s.mode);
  const claimed = useFriends((s) => s.claimed);
  const act = useFriends((s) => s.act);
  const kind = useFriends((s) => s.kind);
  const timer = useFriends((s) => s.timer);
  const turnStartedAt = useFriends((s) => s.turnStartedAt);
  const actorId = useFriends((s) => s.actorId);
  const hostId = useFriends((s) => s.hostId);
  const history = useFriends((s) => s.history);
  const pool = useFriends((s) => s.pool);
  const { busy, spin } = useDiceSpin();
  const backToMenu = useFriends((s) => s.backToMenu);
  const active = seats[activeSeat];
  if (!active) return null;
  const viewingId = kind === "local" ? active.id : actorId;
  const viewing = seats.find((s) => s.id === viewingId) ?? active;
  const myTurn = kind === "local" || actorId === active.id;
  const classic = mode === "classic";
  const filled = filledCount(viewing.slots);
  const canYear = draw ? canDrawSameTeam(draw.squad, history, pool) : false;
  const roster = draw?.squad.players ?? [];
  const legalIds = new Set(
    roster
      .filter(
        (p) => !isPersonTaken(p.name, claimed) && emptySlotsFor(active.slots, p.pos).length > 0,
      )
      .map((p) => p.id),
  );
  const bestId = classic
    ? roster.filter((p) => legalIds.has(p.id)).sort((a, b) => b.ovr - a.ovr)[0]?.id
    : undefined;

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-6 px-5 pb-24 pt-2 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)_minmax(0,18rem)]">
      <div className="flex flex-col gap-4">
        <div className="card-ink rounded-lg px-4 py-4">
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Turn</p>
          <p className="mt-1 font-display text-3xl leading-none">{shownName(active.name)}</p>
          <p className="mt-2 text-sm text-muted">
            {filledCount(active.slots)}/11 · {active.formation} · {active.style}
          </p>
          <TurnClock
            startedAt={turnStartedAt}
            seconds={timer}
            onExpire={kind === "local" || actorId === hostId ? () => act({ type: "autoPick" }) : undefined}
          />
        </div>
        <div className="card-ink flex flex-col overflow-hidden rounded-lg">
          <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Drawn</p>
              {draw ? (
                <>
                  <h3 className="mt-1 font-display text-2xl leading-none normal-case tracking-tight">
                    {draw.squad.nation}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-accent">{draw.squad.league ?? (pool === "club" ? "Europe" : "Cup")} {draw.squad.year}</p>
                </>
              ) : (
                <h3 className="mt-1 font-display text-2xl leading-none">
                  {myTurn ? "Your roll" : "Wait"}
                </h3>
              )}
            </div>
            <span className="font-numeral text-sm font-extrabold tabular-nums text-muted">{filled}/11</span>
          </div>
          {draw ? (
            <div className="flex flex-col gap-2 border-b border-line px-4 py-3">
              <Button
                variant="secondary"
                className="btn-choice"
                disabled={!myTurn || active.rerolls <= 0 || busy}
                onClick={() => spin(() => act({ type: "reroll" }))}
              >
                <RotateCcw className="size-4 shrink-0" strokeWidth={2} />
                Another {pool === "club" ? "club" : "team"}
              </Button>
              <Button
                variant="secondary"
                className="btn-choice"
                data-action="same-year"
                disabled={!myTurn || active.rerolls <= 0 || busy || !canYear}
                aria-label={pool === "club" ? "Same club, another season" : "Same team, another year"}
                title={canYear ? "Uses one chance" : "No other season for this side"}
                onClick={() => spin(() => act({ type: "sameYear" }))}
              >
                <CalendarRange className="size-4 shrink-0" strokeWidth={2} />
                Another {pool === "club" ? "season" : "year"}
              </Button>
              <p className="text-xs font-semibold text-muted">{active.rerolls} chances left · team or year</p>
            </div>
          ) : (
            <div className="border-b border-line px-4 py-3">
              <Button
                className="w-full"
                data-action="roll"
                disabled={!myTurn || filledCount(active.slots) >= 11 || busy}
                onClick={() => spin(() => act({ type: "roll" }))}
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
                  taken={isPersonTaken(player.name, claimed)}
                  best={bestId === player.id}
                  classic={classic}
                  disabled={!myTurn}
                  onPick={(p) => act({ type: "pick", player: p })}
                />
              ))
            ) : (
              <p className="px-4 py-6 text-sm text-muted">
                If someone claims a footballer, every other year of that name is locked. Can't select.
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <Pitch
          slots={kind === "local" ? active.slots : viewing.slots}
          selected={selected}
          onPlace={(id) => act({ type: "place", slotId: id })}
        />
        {selected ? (
          <p className="text-center text-sm font-semibold text-accent">
            Place {selected.name} on a highlighted role
          </p>
        ) : (
          <p className="text-center text-sm text-muted">
            {myTurn ? `${shownName(active.name)} to pick.` : `Waiting on ${shownName(active.name)}.`}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-3">
        {seats
          .filter((s) => s.kind === "human")
          .map((seat) => {
            const mine = kind === "local" || seat.id === actorId;
            const full = filledCount(seat.slots) >= 11;
            return (
              <div key={seat.id} className="card-ink flex flex-col gap-3 rounded-lg px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">{seat.formation}</p>
                <p className="font-display text-2xl leading-none">{shownName(seat.name)}</p>
                <p className="font-numeral text-sm font-extrabold tabular-nums">
                  {filledCount(seat.slots)}/11
                  {seat.confirmed ? " · confirmed" : ""}
                </p>
                {mine && full ? (
                  <Button
                    variant={seat.confirmed ? "ink" : "primary"}
                    data-action={`confirm-${seat.id}`}
                    disabled={seat.confirmed}
                    onClick={() => act({ type: "confirm", seatId: seat.id })}
                  >
                    {seat.confirmed ? "XI locked" : "Confirm XI"}
                  </Button>
                ) : null}
              </div>
            );
          })}
        <LineupBox
          slots={viewing.slots}
          style={viewing.style}
          classic={classic}
          title={`${shownName(viewing.name)} XI`}
        />
        <Button variant="ghost" data-action="leave-draft" onClick={() => backToMenu(pool)}>
          Leave
        </Button>
      </div>
    </section>
  );
}

function SimView() {
  const bracket = useFriends((s) => s.bracket);
  const champion = useFriends((s) => s.champion);
  const pool = useFriends((s) => s.pool);
  const kind = useFriends((s) => s.kind);
  const act = useFriends((s) => s.act);
  const backToMenu = useFriends((s) => s.backToMenu);
  const games = bracket.map((g) => ({
    round: g.round,
    home: g.home,
    away: g.away,
    gf: g.gf,
    ga: g.ga,
    goals: g.goals ?? [],
    pens: g.pens,
    homeRatings: g.homeRatings,
    awayRatings: g.awayRatings,
    ratings: g.ratings,
    potm: g.potm,
    instant: g.instant,
  }));

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 pb-24 pt-2">
      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">
          {pool === "club" ? (kind === "cup" ? "UCL live" : "European night") : "Live knockout"}
        </p>
        <h1 className="home-headline mt-2">
          {pool === "club" && kind === "cup" ? "Road to the final" : "The bracket"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          Only a match between two friends is played in full. Every other tie is already on the board.
        </p>
      </div>
      {games.length ? (
        <LiveCup games={games} onDone={() => act({ type: "simDone" })} />
      ) : (
        <p className="text-sm text-muted">Building the bracket…</p>
      )}
      <Button variant="ghost" onClick={() => backToMenu(pool)}>
        Leave
      </Button>
    </section>
  );
}

function ResultView() {
  const resultMatch = useFriends((s) => s.resultMatch);
  const bracket = useFriends((s) => s.bracket);
  const champion = useFriends((s) => s.champion);
  const seats = useFriends((s) => s.seats);
  const pool = useFriends((s) => s.pool);
  const backToMenu = useFriends((s) => s.backToMenu);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 pb-24 pt-2">
      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Campaign</p>
        <p className="result-stamp mt-2">{shownName(champion ?? "Champion")}</p>
      </div>
      {resultMatch ? (
        <div className="card-ink rounded-lg px-5 py-5">
          <p className="text-sm font-semibold text-muted">{pool === "club" ? "European night" : "Cup Final"}</p>
          <p className="mt-2 font-display text-4xl leading-none">
            {resultMatch.home} {resultMatch.gf}–{resultMatch.ga} {resultMatch.away}
          </p>
          <p className="mt-2 text-sm text-muted">
            {resultMatch.result === "W" ? `${resultMatch.home} win` : `${resultMatch.away} win`}
          </p>
        </div>
      ) : null}
      {bracket.length ? <BracketBoard games={bracket} liveIndex={bracket.length} /> : null}
      <div className="grid gap-3 md:grid-cols-2">
        {seats
          .filter((s) => s.kind === "human")
          .map((seat) => (
            <div key={seat.id} className="card-ink rounded-lg px-4 py-4">
              <p className="font-display text-2xl leading-none">{shownName(seat.name)}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                {seat.slots
                  .filter((s) => s.player)
                  .map((s) => s.player?.name)
                  .join(" · ")}
              </p>
            </div>
          ))}
      </div>
      <Button data-action="new-room" onClick={() => backToMenu(pool)}>
        New room
      </Button>
    </section>
  );
}

function TurnClock({
  startedAt,
  seconds,
  onExpire,
}: {
  startedAt: number;
  seconds: number;
  onExpire?: () => void;
}) {
  const [left, setLeft] = useState(seconds);
  const warned = useRef<number | null>(null);
  const live = useRef(false);
  const expire = useRef(onExpire);
  expire.current = onExpire;

  useEffect(() => {
    const elapsed = (Date.now() - startedAt) / 1000;
    live.current = elapsed < seconds - 0.35;
    warned.current = null;
    const tick = () => {
      const remain = Math.max(0, Math.ceil(seconds - (Date.now() - startedAt) / 1000));
      setLeft(remain);
    };
    tick();
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, [startedAt, seconds]);

  useEffect(() => {
    if (!live.current) return;
    if (left <= 5 && left > 0 && warned.current !== left) {
      warned.current = left;
      playTimerWarn(left);
    }
    if (left === 0 && warned.current !== 0) {
      warned.current = 0;
      playTimerExpire();
      expire.current?.();
    }
  }, [left]);

  const pct = seconds <= 0 ? 0 : (left / seconds) * 100;
  const urgent = left <= 5;
  return (
    <div className={cn("turn-clock mt-3", urgent && "is-urgent")}>
      <p className="turn-clock-time font-numeral text-sm font-extrabold tabular-nums text-muted">
        {left === 0 ? "Time up" : `${left}s ${urgent ? "left" : "pace"}`}
      </p>
      <div className="turn-meter mt-2" aria-hidden="true">
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function FriendsGuide({ pool }: { pool: PoolId }) {
  const club = pool === "club";
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 pb-24 pt-4">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">
          {club ? "Club friends guide" : "Friends guide"}
        </p>
        <h2 className="home-headline mt-2">
          {club ? "Rivalries, watch parties, UCL brackets" : "Quick drafts, watch parties, friend groups"}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted">
          {club
            ? "Join with a code, put your name on the shirt, and draft historic club sides from the top five leagues. Taken footballers are locked across every year. Confirm the XI, then play a European night or a full UCL knockout."
            : "Join with a code, put your name on the shirt, choose a formation and style, mark ready, and build separate XIs in turn order. You can rename yourself in the lobby and during the draft. On each turn the active player draws a nation and a World Cup year, then claims one valid footballer. That footballer is then locked for everyone else. When the XI is full, confirm it."}
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        <article className="flex flex-col gap-2">
          <h3 className="font-display text-2xl leading-none">{club ? "Friend vs friend" : "Local"}</h3>
          <p className="text-sm leading-relaxed text-muted">
            {club
              ? "Two people, one screen. Historic clubs only. Pass the device after every pick, then one European night."
              : "Two people, one screen. Set both names, pass the device after every pick, and rename whenever you like. Same shared pool, then one Cup Final."}
          </p>
        </article>
        <article className="flex flex-col gap-2">
          <h3 className="font-display text-2xl leading-none">{club ? "Rivalry" : "Cup Final"}</h3>
          <p className="text-sm leading-relaxed text-muted">
            {club
              ? "Online 1v1. Separate club XIs, one simulated European night. Balance beats a famous attack with a weak full-back."
              : "Fast head-to-head for two. Separate XIs, one simulated match. Balance beats a famous attack with a weak full-back."}
          </p>
        </article>
        <article className="flex flex-col gap-2">
          <h3 className="font-display text-2xl leading-none">{club ? "UCL" : "Full Cup"}</h3>
          <p className="text-sm leading-relaxed text-muted">
            {club
              ? "Knockout of 4, 8, 16, or 32. Empty seats become other European clubs. Only a tie between two friends is played in full, with penalties kick by kick if it is level."
              : "Bracket of 4, 8, 16, or 32. Empty seats become real nations. Only a tie between two friends is played in full, with penalties kick by kick if it is level."}
          </p>
        </article>
      </div>
    </section>
  );
}

function NetBridge() {
  const code = useFriends((s) => s.code);
  const actorId = useFriends((s) => s.actorId);
  const hostId = useFriends((s) => s.hostId);
  const storePassword = useFriends((s) => s.password);
  const seatName = useFriends((s) => s.seats.find((s) => s.id === actorId)?.name ?? "");
  const password =
    storePassword ||
    (typeof window !== "undefined" ? (sessionStorage.getItem("sn-join-password") ?? "") : "");
  const storedName =
    typeof window !== "undefined" ? sessionStorage.getItem("sn-join-name") || loadPlayerName() : "";
  const name = shownName(seatName || storedName, "Player");
  if (!code) return null;
  const isHost = actorId === hostId;
  return <NetInner code={code} selfName={name} isHost={isHost} password={password} selfIdHint={actorId} />;
}

function NetInner({
  code,
  selfName,
  isHost,
  password,
  selfIdHint,
}: {
  code: string;
  selfName: string;
  isHost: boolean;
  password: string;
  selfIdHint: string;
}) {
  const pool = useFriends((s) => s.pool);
  const room = `${pool === "club" ? "snc" : "sn"}-${code}`.slice(0, 64);
  const p2p = useP2PRoom({ room, name: selfName, selfId: selfIdHint });
  const replace = useFriends((s) => s.replace);
  const becomeGuest = useFriends((s) => s.becomeGuest);

  useEffect(() => {
    return p2p.onMessage((from, data) => {
      const msg = data as Wire;
      if (!msg || typeof msg !== "object" || !("t" in msg)) return;
      if (msg.t === "state") {
        replace(msg.state);
        return;
      }
      if (msg.t === "hello" && isHost) {
        const next = apply(
          useFriends.getState(),
          { type: "join", seat: makeSeat(msg.id, msg.name), password: msg.password },
          useFriends.getState().hostId,
        );
        replace(next);
        p2p.send({ t: "state", state: pickState(next) });
        return;
      }
      if (msg.t === "act" && isHost) {
        const next = apply(useFriends.getState(), msg.action, msg.actorId);
        replace(next);
        p2p.send({ t: "state", state: pickState(next) });
        return;
      }
      if (msg.t === "need" && isHost) {
        p2p.send({ t: "state", state: pickState(useFriends.getState()) });
      }
      void from;
    });
  }, [p2p.onMessage, p2p.send, isHost, replace]);

  useEffect(() => {
    if (isHost || !p2p.joined) return;
    becomeGuest(useFriends.getState(), p2p.selfId);
    p2p.send({ t: "hello", id: p2p.selfId, name: selfName, password });
    p2p.send({ t: "need" });
  }, [isHost, p2p.joined, p2p.peers.length, p2p.selfId, p2p.send, selfName, password, becomeGuest]);

  useEffect(() => {
    if (!isHost || !p2p.joined || p2p.peers.length === 0) return;
    p2p.send({ t: "state", state: pickState(useFriends.getState()) });
  }, [isHost, p2p.joined, p2p.peers.length, p2p.send]);

  useEffect(() => {
    if (!isHost) {
      return useFriends.subscribe((state, prev) => {
        if (!state.lastAction || state.lastAction === prev.lastAction) return;
        if (state.actorId === state.hostId) return;
        p2p.send({ t: "act", action: state.lastAction.action, actorId: state.lastAction.actorId });
      });
    }
    return useFriends.subscribe((state) => {
      if (state.phase === "menu" || state.phase === "setup") return;
      p2p.send({ t: "state", state: pickState(state) });
    });
  }, [isHost, p2p.joined, p2p.send, p2p.onMessage, p2p.selfId]);

  return null;
}
