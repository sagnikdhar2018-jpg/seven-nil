import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Check, Copy, Dices, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useP2PRoom } from "@/lib/multiplayer";
import { canDrawSameTeam, filledCount } from "@/lib/seven/draft";
import { PLAY_LABEL, coachById } from "@/lib/seven/coaches";
import { emptySlotsFor, FORMATIONS, STYLES } from "@/lib/seven/formations";
import {
  apply,
  freshFriends,
  friendsPath,
  loadPlayerName,
  makeSeat,
  savePlayerName,
  shownName,
  viewFor,
  type BracketSize,
  type FriendKind,
  type FriendsAction,
  type FriendsState,
  type TimerSec,
} from "@/lib/seven/friends";
import { rankedSides } from "@/lib/seven/rankings";
import { loadSavedRoom, useFriends } from "@/lib/seven/friends-store";
import { isPersonTaken } from "@/lib/seven/person";
import { RerollChoices } from "./reroll-choices";
import { playTimerExpire, playTimerWarn } from "@/lib/seven/sound";
import { useSeven } from "@/lib/seven/store";
import type { FormationId, ModeId, PoolId, StyleId } from "@/lib/seven/types";
import { cn } from "@/lib/utils";
import { BracketBoard, ChampionPop } from "./bracket-board";
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
  | { t: "hello"; id: string; name: string; password: string; partner?: boolean }
  | { t: "state"; state: FriendsState }
  | { t: "act"; action: FriendsAction; actorId: string }
  | { t: "need" }
  | { t: "kicked" }
  | { t: "need-password" }
  | { t: "refused"; reason: string };

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
  placeholder = "Enter your name",
  autoFocus = false,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
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
        autoFocus={autoFocus}
        onChange={(e) => {
          const next = e.target.value.slice(0, 18);
          onChange(next);
          savePlayerName(next);
        }}
      />
    </label>
  );
}

function PasswordGate({ wrong, onSubmit }: { wrong: boolean; onSubmit: (value: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <form
      className="card-ink flex flex-col gap-3 rounded-lg px-4 py-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(value);
      }}
    >
      <p className="font-display text-2xl leading-none">Room password</p>
      <p className="text-sm text-muted">
        {wrong
          ? "That password is wrong. Ask the host and try again."
          : "The host locked this room. Enter the password to join."}
      </p>
      <input
        className="field-input normal-case tracking-normal"
        value={value}
        maxLength={24}
        placeholder="Password"
        type="text"
        autoComplete="off"
        autoFocus
        onChange={(event) => setValue(event.target.value)}
      />
      <Button type="submit" disabled={!value.trim()}>
        Confirm password
      </Button>
    </form>
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
  const actorId = useFriends((s) => s.actorId);
  const hostId = useFriends((s) => s.hostId);
  const seats = useFriends((s) => s.seats);
  const backToMenu = useFriends((s) => s.backToMenu);
  const wasHere = useRef(false);

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

  useEffect(() => {
    if (phase === "menu") wasHere.current = false;
  }, [phase]);

  useEffect(() => {
    if (seats.some((seat) => seat.id === actorId)) wasHere.current = true;
  }, [seats, actorId]);

  useEffect(() => {
    if (!wasHere.current || kind === "local" || actorId === hostId) return;
    if (phase === "menu" || phase === "setup") return;
    if (seats.some((seat) => seat.id === actorId)) return;
    wasHere.current = false;
    try {
      sessionStorage.setItem("sn-kicked", "1");
    } catch {
      // ignore
    }
    backToMenu(pool);
  }, [seats, actorId, hostId, kind, phase, backToMenu, pool]);

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-paper text-ink" data-pool={pool}>
      <SfxRoot />
      <div className="paper-grain" aria-hidden="true" />
      <div className="relative z-10">
        <SiteHeader pool={pool} friends />
        {phase === "menu" ? <Selector pool={pool} roomFromUrl={roomFromUrl} /> : null}
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
  const saved = loadSavedRoom(room);
  const hostKey = sessionStorage.getItem(`sn-host-${room}`);
  if (saved && (saved.pool === pool || !saved.pool)) {
    const seated = saved.seats.some((seat) => seat.id === saved.actorId);
    const iAmHost = Boolean(hostKey && (hostKey === saved.hostId || hostKey === saved.actorId));
    if (iAmHost || seated) {
      useFriends.setState({
        ...saved,
        pool,
        actorId: iAmHost ? saved.hostId : saved.actorId,
        lastAction: null,
        passwordPrompt: 0,
        joinSecret: sessionStorage.getItem("sn-join-password") ?? "",
      });
      return;
    }
  }
  if (hostKey) {
    const name = loadPlayerName() || "Host";
    const kind = saved?.kind === "final" ? "final" : "cup";
    let state = freshFriends(kind, hostKey, name, pool);
    state = {
      ...state,
      code: room,
      password: saved?.password ?? "",
      mode: saved?.mode ?? state.mode,
      timer: saved?.timer ?? state.timer,
      bracketSize: saved?.bracketSize ?? state.bracketSize,
      organizer: Boolean(saved?.organizer),
    };
    if (state.organizer) {
      state = {
        ...state,
        seats: state.seats.map((seat) =>
          seat.id === hostKey ? { ...seat, kind: "organizer", ready: true, confirmed: true } : seat,
        ),
      };
    }
    useFriends.setState({ ...state, actorId: hostKey, lastAction: null, passwordPrompt: 0, joinSecret: "" });
    return;
  }
  const id = `p-${Math.random().toString(36).slice(2, 10)}`;
  const joinName =
    (typeof sessionStorage !== "undefined" && sessionStorage.getItem("sn-join-name")) ||
    loadPlayerName() ||
    "";
  if (!joinName.trim()) return;
  if (sessionStorage.getItem(`sn-door-${room}`) !== "1") return;
  const partner = new URLSearchParams(window.location.search).get("partner") === "1";
  if (partner) sessionStorage.setItem("sn-join-partner", "1");
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

function Selector({ pool, roomFromUrl }: { pool: PoolId; roomFromUrl?: string }) {
  const [open, setOpen] = useState<FriendKind | null>(null);
  const [join, setJoin] = useState(() => (roomFromUrl ?? "").replace(/[^A-Za-z0-9]/g, "").slice(0, 6).toUpperCase());
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState(() => loadPlayerName());
  const [mode, setMode] = useState<ModeId>("classic");
  const [timer, setTimer] = useState<TimerSec>(30);
  const [bracketSize, setBracketSize] = useState<BracketSize>(8);
  const [organize, setOrganize] = useState(false);
  const [kicked, setKicked] = useState(false);
  const [notice, setNotice] = useState("");
  const hydrateLocal = useFriends((s) => s.hydrateLocal);
  const becomeHost = useFriends((s) => s.becomeHost);
  const navigate = useNavigate();
  const kinds = modeList(pool);
  const path = friendsPath(pool);
  const nameReady = displayName.trim().length > 0;
  const passwordOk =
    !password.trim() || password.trim().toLowerCase() === confirmPassword.trim().toLowerCase();

  useEffect(() => {
    try {
      if (sessionStorage.getItem("sn-kicked") === "1") {
        sessionStorage.removeItem("sn-kicked");
        setKicked(true);
      }
      const note = sessionStorage.getItem("sn-notice");
      if (note) {
        sessionStorage.removeItem("sn-notice");
        setNotice(note);
      }
    } catch {
      // ignore
    }
  }, []);

  const startHost = (kind: FriendKind) => {
    const name = displayName.trim().slice(0, 18);
    if (!name) return;
    if (password.trim() && password.trim().toLowerCase() !== confirmPassword.trim().toLowerCase()) return;
    const id = `p-${Math.random().toString(36).slice(2, 10)}`;
    savePlayerName(name);
    becomeHost(kind, id, name, { mode, timer, password, bracketSize, pool, organize: kind === "cup" && organize });
    const code = useFriends.getState().code;
    sessionStorage.setItem(`sn-host-${code}`, id);
    void navigate({ to: path, search: { room: code }, replace: true });
  };

  const joinRoom = () => {
    const code = join.replace(/[^A-Za-z0-9]/g, "").slice(0, 6).toUpperCase();
    const name = displayName.trim().slice(0, 18);
    if (!name || code.length < 4) return;
    savePlayerName(name);
    sessionStorage.setItem("sn-join-name", name);
    sessionStorage.setItem(`sn-door-${code}`, "1");
    sessionStorage.removeItem("sn-join-password");
    useFriends.getState().setJoinSecret("");
    useFriends.getState().setPasswordPrompt(0);
    const partner = new URLSearchParams(window.location.search).get("partner") === "1";
    if (partner) sessionStorage.setItem("sn-join-partner", "1");
    else sessionStorage.removeItem("sn-join-partner");
    sessionStorage.setItem("sn-join-password", password);
    if ((roomFromUrl ?? "").toUpperCase() === code) {
      bootFromUrl(code, pool);
      return;
    }
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

        {roomFromUrl ? (
          <div className="card-ink flex flex-col gap-3 rounded-lg px-4 py-4">
            <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Room {roomFromUrl}</p>
            <p className="text-sm text-muted">
              Confirm your name before the lobby opens. If this room has a password, you confirm that next.
            </p>
            <Button disabled={!nameReady || roomFromUrl.length < 4} onClick={joinRoom}>
              Confirm name
            </Button>
          </div>
        ) : null}

        {kicked ? (
          <p className="text-sm font-semibold text-accent">The host removed you from the room.</p>
        ) : null}
        {notice ? <p className="text-sm font-semibold text-accent">{notice}</p> : null}

        <NameField value={displayName} onChange={setDisplayName} autoFocus={!nameReady} />
        {!nameReady ? (
          <p className="text-xs font-semibold text-accent">Enter your name before you create or join a room.</p>
        ) : null}

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
                    {item.id === "local" ? (
                      <p className="text-xs leading-relaxed text-muted">
                        Set both names on the next screen — you can still change them while you play.
                      </p>
                    ) : null}
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
                          Password
                          <input
                            className="field-input normal-case tracking-normal"
                            value={password}
                            maxLength={24}
                            placeholder="Players must enter this"
                            type="text"
                            autoComplete="off"
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </label>
                        {password.trim() ? (
                          <label className="flex flex-col gap-2 text-xs font-semibold tracking-[0.14em] text-muted uppercase">
                            Confirm password
                            <input
                              className="field-input normal-case tracking-normal"
                              value={confirmPassword}
                              maxLength={24}
                              placeholder="Type it again"
                              type="text"
                              autoComplete="off"
                              onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                          </label>
                        ) : null}
                      </>
                    ) : null}
                    {item.id === "cup" ? (
                      <ChipGroup<"play" | "watch">
                        label="Your role"
                        value={organize ? "watch" : "play"}
                        onChange={(id) => setOrganize(id === "watch")}
                        options={[
                          { id: "play", label: "I'll play" },
                          { id: "watch", label: "Organize only" },
                        ]}
                      />
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
                      disabled={item.id !== "local" && (!nameReady || !passwordOk)}
                      onClick={() => (item.id === "local" ? hydrateLocal("local", pool) : startHost(item.id))}
                    >
                      {item.id === "local" ? "Start on this device" : "Create room"}
                    </Button>
                    <p className="text-xs leading-relaxed text-muted">
                      {item.id === "local"
                        ? "Pass the device. Each person drafts their own XI."
                        : item.id === "cup" && organize
                          ? "You run the tournament and watch every XI. Players cannot see each other's teams."
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
          <p className="text-sm text-muted">Confirm your name first. The password is asked only if the host set one, and only before the room opens.</p>
          <div className="flex gap-2">
            <input
              className="field-input"
              maxLength={6}
              placeholder="room code"
              aria-label="Join with a code"
              value={join}
              onChange={(e) => setJoin(e.target.value.toUpperCase())}
            />
            <Button variant="ink" className="shrink-0" disabled={!nameReady || join.length < 4} onClick={joinRoom}>
              Confirm
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted">
          {pool === "club" ? (
            <>
              This room is UCL.{" "}
              <Link className="font-extrabold text-ink underline-offset-2 hover:underline" to="/friends">
                Switch to World Cup
              </Link>
            </>
          ) : (
            <>
              This room is the World Cup.{" "}
              <Link className="font-extrabold text-ink underline-offset-2 hover:underline" to="/club/friends">
                Switch to UCL
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
              options={STYLES}
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
  const organizer = useFriends((s) => s.organizer);
  const act = useFriends((s) => s.act);
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(copiedTimer.current), []);
  const me = seats.find((s) => s.id === actorId);
  const players = seats.filter((s) => s.kind === "human");
  const readyHumans = players.filter((s) => s.ready).length;
  const isHost = actorId === hostId;
  const passwordPrompt = useFriends((s) => s.passwordPrompt);
  const setJoinSecret = useFriends((s) => s.setJoinSecret);
  const share =
    typeof window !== "undefined" ? `${window.location.origin}${friendsPath(pool)}?room=${code}` : code;
  const partnerShare = `${share}&partner=1`;
  const enough = kind === "final" ? players.length >= 2 : players.length >= (organizer ? 2 : 1);
  const allReady = players.length > 0 && readyHumans === players.length && enough;
  const [copiedPartner, setCopiedPartner] = useState(false);
  const lobbyLabel =
    kind === "cup"
      ? pool === "club"
        ? "UCL lobby"
        : "Full Cup lobby"
      : pool === "club"
        ? "Rivalry lobby"
        : "Cup Final lobby";

  const inside = Boolean(me) || isHost;
  if (!inside) {
    return (
      <section className="mx-auto flex w-full max-w-xl flex-col gap-6 px-5 pb-24 pt-2">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">{lobbyLabel}</p>
          <p className="room-code mt-2">{code}</p>
          <p className="mt-2 text-sm text-muted">
            {passwordPrompt > 0
              ? "Your name is confirmed. Confirm the password to open the lobby."
              : "Your name is confirmed. Opening the room…"}
          </p>
        </div>
        {passwordPrompt > 0 ? (
          <PasswordGate
            wrong={passwordPrompt === 2}
            onSubmit={(value) => {
              const next = value.trim().slice(0, 24);
              if (!next) return;
              try {
                sessionStorage.setItem("sn-join-password", next);
              } catch {
                // ignore
              }
              setJoinSecret(next);
            }}
          />
        ) : (
          <ConnectingNote />
        )}
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-xl flex-col gap-6 px-5 pb-24 pt-2">
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">{lobbyLabel}</p>
        <p className="room-code mt-2">{code}</p>
        <p className="mt-2 text-sm text-muted">
          {organizer && actorId === hostId
            ? "You are the organizer. You will not play. Players cannot see each other's teams."
            : organizer
              ? "An organizer is watching. You will not see the other teams."
              : "Share the code or the invite link. Names are set before anyone joins."}
        </p>
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
      {isHost ? (
        <Button
          variant={copiedPartner ? "ink" : "secondary"}
          aria-label={copiedPartner ? "Partner link copied" : "Copy partner link"}
          onClick={() => {
            void navigator.clipboard
              ?.writeText(partnerShare)
              .then(() => {
                setCopiedPartner(true);
                window.clearTimeout(copiedTimer.current);
                copiedTimer.current = window.setTimeout(() => setCopiedPartner(false), 2500);
              })
              .catch(() => {});
          }}
        >
          {copiedPartner ? <Check className="size-4" strokeWidth={2.5} /> : <Copy className="size-4" strokeWidth={2} />}
          {copiedPartner ? "Copied" : "Invite a partner"}
        </Button>
      ) : null}
      {me?.kind === "organizer" ? (
        <div className="card-ink rounded-lg px-4 py-4">
          <p className="font-display text-2xl leading-none">Spectating</p>
          <p className="mt-2 text-sm text-muted">
            The draw, every XI, and every match stay on your screen. You are not in the tournament.
          </p>
        </div>
      ) : me?.kind === "partner" ? (
        <div className="card-ink rounded-lg px-4 py-4">
          <p className="font-display text-2xl leading-none">Partner</p>
          <p className="mt-2 text-sm text-muted">
            You can watch every XI and every match. Only the host can start, kick, or invite.
          </p>
        </div>
      ) : me ? (
        <div className="card-ink flex flex-col gap-4 rounded-lg px-4 py-4">
          <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">Your name</p>
          <p className="font-display text-3xl leading-none">{shownName(me.name)}</p>
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
            options={STYLES}
          />
          <Button
            variant={me.ready ? "ink" : "primary"}
            disabled={!me.name.trim()}
            onClick={() => act({ type: "ready", seatId: me.id })}
          >
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
              {seat.kind === "organizer" ? " · organizer" : ""}
              {seat.kind === "partner" ? " · partner" : ""}
              {seat.id === hostId && seat.kind !== "organizer" ? " · host" : ""}
              {seat.id === actorId ? " · you" : ""}
            </span>
            <span className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                {seat.kind === "organizer" || seat.kind === "partner"
                  ? "Watching"
                  : seat.ready
                    ? "Ready"
                    : "Waiting"}
              </span>
              {isHost && (seat.kind === "human" || seat.kind === "partner") && seat.id !== actorId ? (
                <Button
                  variant="secondary"
                  className="btn-mini"
                  data-action={`kick-${seat.id}`}
                  onClick={() => act({ type: "kick", seatId: seat.id })}
                >
                  Kick
                </Button>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted">
        {readyHumans}/{players.length} ready · the match starts only when every player is ready and the host presses start
      </p>
      {isHost ? (
        <Button data-action="host-start" disabled={!allReady} onClick={() => act({ type: "start" })}>
          Start
        </Button>
      ) : (
        <p className="text-sm text-muted">Waiting for the host to start.</p>
      )}
    </section>
  );
}

const MANAGER_BARS = [
  ["possession", "Possession"],
  ["quickCounter", "Quick counter"],
  ["longBall", "Long ball"],
  ["overload", "Overload"],
  ["pressing", "Pressing"],
  ["compactness", "Compactness"],
] as const;

function DraftTable() {
  const seats = useFriends((s) => s.seats);
  const kind = useFriends((s) => s.kind);
  const actorId = useFriends((s) => s.actorId);
  const hostId = useFriends((s) => s.hostId);
  const organizer = useFriends((s) => s.organizer);
  const pool = useFriends((s) => s.pool);
  const mode = useFriends((s) => s.mode);
  const act = useFriends((s) => s.act);
  const backToMenu = useFriends((s) => s.backToMenu);
  const spectating = (organizer && actorId === hostId) || seats.some((seat) => seat.id === actorId && seat.kind === "partner");
  const boards = seats.filter(
    (seat) => seat.kind === "human" && (kind === "local" || spectating || seat.id === actorId),
  );
  const viewing = seats.find((seat) => seat.id === actorId) ?? boards[0];

  return (
    <section className={cn("draft-board mx-auto w-full max-w-6xl px-5 pb-24 pt-2", boards.length > 1 ? "is-simultaneous" : "is-live")}>
      {boards.map((seat) => (
        <SeatDraft key={seat.id} seatId={seat.id} />
      ))}
      <div className="draft-col flex flex-col gap-3">
        <p className="text-sm text-muted">
          {spectating
            ? "You can see every XI. The players cannot."
            : "Everyone drafts at once. Other teams stay hidden."}
        </p>
        {seats
          .filter((s) => s.kind === "human" || s.kind === "partner")
          .map((seat) => {
            const reveal = kind === "local" || spectating || seat.id === actorId;
            const full = filledCount(seat.slots) >= 11;
            const coach = reveal ? coachById(seat.coachId) : undefined;
            return (
              <div key={seat.id} className="card-ink flex flex-col gap-3 rounded-lg px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {reveal ? seat.formation : "Hidden"}
                </p>
                <p className="font-display text-2xl leading-none">{shownName(seat.name)}</p>
                <p className="font-numeral text-sm font-extrabold tabular-nums">
                  {filledCount(seat.slots)}/11
                  {coach ? ` · ${coach.name}` : ""}
                  {seat.confirmed ? " · confirmed" : ""}
                </p>
                {seat.kind === "partner" ? (
                  <p className="text-xs font-semibold text-muted">Watching with the host</p>
                ) : null}
                {reveal && full && seat.id === actorId && seat.kind === "human" ? (
                  <Button
                    variant={seat.confirmed ? "ink" : "primary"}
                    data-action={`confirm-${seat.id}`}
                    disabled={seat.confirmed || !seat.coachId}
                    onClick={() => act({ type: "confirm", seatId: seat.id })}
                  >
                    {seat.confirmed ? "XI locked" : seat.coachId ? "Confirm XI" : "Pick a manager first"}
                  </Button>
                ) : null}
                {actorId === hostId && seat.id !== actorId ? (
                  <Button
                    variant="secondary"
                    className="btn-mini"
                    data-action={`kick-${seat.id}`}
                    onClick={() => act({ type: "kick", seatId: seat.id })}
                  >
                    Kick
                  </Button>
                ) : null}
              </div>
            );
          })}
        {viewing && viewing.kind !== "organizer" ? (
          <LineupBox
            slots={viewing.slots}
            style={viewing.style}
            classic={mode === "classic"}
            title={`${shownName(viewing.name)} XI`}
          />
        ) : null}
        <Button variant="ghost" data-action="leave-draft" onClick={() => backToMenu(pool)}>
          Leave
        </Button>
      </div>
    </section>
  );
}

function SeatDraft({ seatId }: { seatId: string }) {
  const seats = useFriends((s) => s.seats);
  const mode = useFriends((s) => s.mode);
  const claimed = useFriends((s) => s.claimed);
  const act = useFriends((s) => s.act);
  const kind = useFriends((s) => s.kind);
  const timer = useFriends((s) => s.timer);
  const actorId = useFriends((s) => s.actorId);
  const history = useFriends((s) => s.history);
  const pool = useFriends((s) => s.pool);
  const { busy, spin } = useDiceSpin();
  const active = seats.find((seat) => seat.id === seatId);
  if (!active) return null;
  const draw = active.draw;
  const selected = active.selected;
  const myTurn = kind === "local" || actorId === active.id;
  const classic = mode === "classic";
  const filled = filledCount(active.slots);
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
  const managerTurn = filledCount(active.slots) >= 11 && !active.coachId;

  return (
    <div className="draft-col flex flex-col gap-4">
        <div className="card-ink rounded-lg px-4 py-4">
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Drafting together</p>
          <p className="mt-1 font-display text-3xl leading-none">{shownName(active.name)}</p>
          <p className="mt-2 text-sm text-muted">
            {filledCount(active.slots)}/11 · {active.formation}
            {active.coachId ? ` · ${coachById(active.coachId)?.name ?? "Manager"}` : ""}
          </p>
          <TurnClock
            startedAt={active.since}
            seconds={timer}
            onExpire={myTurn && !active.confirmed ? () => act({ type: "autoPick", seatId: active.id }) : undefined}
          />
        </div>
        <div className="card-ink flex flex-col overflow-hidden rounded-lg">
          <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">
                {managerTurn ? "12th pick" : "Drawn"}
              </p>
              {managerTurn ? (
                <h3 className="mt-1 font-display text-2xl leading-none">Manager</h3>
              ) : draw ? (
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
          {managerTurn ? (
            active.coachOffer ? (
              <div className="flex flex-col gap-2 border-b border-line px-4 py-3">
                <Button
                  variant="secondary"
                  className="btn-choice"
                  disabled={!myTurn || (active.coachRerolls ?? 0) <= 0 || busy}
                  onClick={() => spin(() => act({ type: "rerollCoach", seatId: active.id }))}
                >
                  <RotateCcw className="size-4 shrink-0" strokeWidth={2} />
                  Change managers
                </Button>
                <p className="text-xs font-semibold text-muted">{active.coachRerolls ?? 0} chances left</p>
              </div>
            ) : (
              <div className="border-b border-line px-4 py-3">
                <Button className="w-full" disabled={!myTurn || busy} onClick={() => spin(() => act({ type: "rollCoach", seatId: active.id }))}>
                  <Dices className="size-5" strokeWidth={2} />
                  Roll a manager
                </Button>
              </div>
            )
          ) : draw ? (
            <RerollChoices
              left={active.rerolls}
              pool={pool}
              canYear={canYear}
              busy={busy}
              locked={!myTurn}
              onTeam={() => spin(() => act({ type: "reroll", seatId: active.id }))}
              onYear={() => spin(() => act({ type: "sameYear", seatId: active.id }))}
            />
          ) : (
            <div className="border-b border-line px-4 py-3">
              <Button
                className="w-full"
                data-action="roll"
                disabled={!myTurn || filledCount(active.slots) >= 11 || busy}
                onClick={() => spin(() => act({ type: "roll", seatId: active.id }))}
              >
                <Dices className="size-5" strokeWidth={2} />
                Roll
              </Button>
            </div>
          )}
          <div className="max-h-80 overflow-y-auto">
            {managerTurn && active.coachOffer
              ? active.coachOffer.map((id) => {
                  const coach = coachById(id);
                  if (!coach) return null;
                  return (
                    <button
                      key={coach.id}
                      type="button"
                      className="flex w-full flex-col gap-2 border-b border-line px-4 py-3 text-left last:border-b-0 hover:bg-paper disabled:opacity-50"
                      disabled={!myTurn}
                      onClick={() => act({ type: "setCoach", seatId: active.id, coachId: coach.id })}
                    >
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="font-extrabold text-ink">{coach.name}</span>
                        <span className="text-xs font-semibold text-muted">
                          {coach.formation} · {PLAY_LABEL[coach.play]}
                        </span>
                      </span>
                      <span className="text-xs font-semibold text-accent">
                        {coach.known} · {coach.years}
                      </span>
                      {classic ? (
                        <span className="grid grid-cols-2 gap-x-3 gap-y-1">
                          {MANAGER_BARS.map(([key, label]) => (
                            <span key={key} className="flex items-center justify-between text-[11px] font-bold text-muted">
                              <span>{label}</span>
                              <span className="tabular-nums text-ink">{coach.stats[key]}</span>
                            </span>
                          ))}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-muted">Stats hidden. Almanac.</span>
                      )}
                    </button>
                  );
                })
              : draw && !managerTurn ? (
              roster.map((player) => (
                <PlayerPickRow
                  key={player.id}
                  player={player}
                  legal={legalIds.has(player.id)}
                  taken={isPersonTaken(player.name, claimed)}
                  best={bestId === player.id}
                  classic={classic}
                  disabled={!myTurn}
                  onPick={(p) => act({ type: "pick", seatId: active.id, player: p })}
                />
              ))
            ) : (
              <p className="px-4 py-6 text-sm text-muted">
                {managerTurn
                  ? "Roll three managers. You get three chances to change them."
                  : "If someone claims a footballer, every other year of that name is locked. Can't select."}
              </p>
            )}
          </div>
        </div>
        <Pitch
          slots={active.slots}
          selected={selected}
          style={active.style}
          onPlace={(id) => act({ type: "place", seatId: active.id, slotId: id })}
        />
        {selected ? (
          <p className="text-center text-sm font-semibold text-accent">
            Place {selected.name} on a highlighted role
          </p>
        ) : (
          <p className="text-center text-sm text-muted">
            {managerTurn ? "Your 12th pick is the manager." : "Pick when you are ready. The others are drafting too."}
          </p>
        )}
      </div>
  );
}

function SimView() {
  const bracket = useFriends((s) => s.bracket);
  const champion = useFriends((s) => s.champion);
  const seats = useFriends((s) => s.seats);
  const pool = useFriends((s) => s.pool);
  const kind = useFriends((s) => s.kind);
  const actorId = useFriends((s) => s.actorId);
  const hostId = useFriends((s) => s.hostId);
  const organizer = useFriends((s) => s.organizer);
  const act = useFriends((s) => s.act);
  const backToMenu = useFriends((s) => s.backToMenu);
  const spectating = (organizer && actorId === hostId) || seats.some((seat) => seat.id === actorId && seat.kind === "partner");
  const myName = shownName(seats.find((seat) => seat.id === actorId)?.name ?? "");
  const games = bracket.map((g) => {
    const mine = g.home === myName || g.away === myName;
    const show = kind === "local" || spectating || mine;
    return {
      round: g.round,
      home: g.home,
      away: g.away,
      gf: g.gf,
      ga: g.ga,
      goals: show ? (g.goals ?? []) : [],
      pens: show ? g.pens : g.pens ? { home: g.pens.home, away: g.pens.away } : undefined,
      homeRatings: show ? g.homeRatings : undefined,
      awayRatings: show ? g.awayRatings : undefined,
      ratings: show ? g.ratings : undefined,
      potm: show ? g.potm : undefined,
      instant: g.instant,
      winner: g.winner,
    };
  });

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
          Computer ties in this round are already settled. The next round stays blank until your match is played.
        </p>
      </div>
      {games.length ? (
        <LiveCup
          key={bracket.find((game) => !game.instant)?.round ?? "done"}
          games={games}
          onDone={() => act({ type: "simDone", round: bracket.find((game) => !game.instant)?.round })}
        />
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
  const kind = useFriends((s) => s.kind);
  const actorId = useFriends((s) => s.actorId);
  const hostId = useFriends((s) => s.hostId);
  const organizer = useFriends((s) => s.organizer);
  const backToMenu = useFriends((s) => s.backToMenu);
  const spectating = (organizer && actorId === hostId) || seats.some((seat) => seat.id === actorId && seat.kind === "partner");
  const [pop, setPop] = useState(true);
  const winner = shownName(champion ?? "");
  const youWon = seats.some((seat) => {
    if (seat.kind !== "human" || shownName(seat.name) !== winner) return false;
    return kind === "local" || seat.id === actorId;
  });

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
          .filter((s) => s.kind === "human" && (spectating || kind === "local" || s.id === actorId))
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
      {youWon ? (
        <ChampionPop
          open={pop}
          name={winner}
          detail="You won the tournament."
          onClose={() => setPop(false)}
        />
      ) : null}
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
    <section className="below-fold mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 pb-24 pt-4">
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
            : "Join with a code, put your name on the shirt, choose a formation and style, mark ready, and build separate XIs at the same time. You can rename yourself in the lobby and during the draft. Each player draws their own nation and year, then claims one valid footballer. That footballer is locked for everyone else. The 12th pick is a manager. When the XI is full, confirm it."}
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
              ? "Knockout of 4, 8, 16, or 32. Empty seats become other European clubs, seeded by ranking. Only a tie between two friends is played in full, with penalties kick by kick if it is level."
              : "Bracket of 4, 8, 16, or 32. Empty seats become real nations, seeded by ranking. Only a tie between two friends is played in full, with penalties kick by kick if it is level."}
          </p>
        </article>
      </div>
      <div>
        <h3 className="font-display text-2xl leading-none">{club ? "Club ranking" : "Nation ranking"}</h3>
        <ol className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
          {rankedSides(pool).slice(0, 12).map((side) => (
            <li key={side.name} className="flex items-baseline gap-2 text-sm font-extrabold">
              <span className="w-5 font-numeral tabular-nums text-muted">{side.rank}</span>
              <span className="truncate">{side.name}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function NetBridge() {
  const code = useFriends((s) => s.code);
  const actorId = useFriends((s) => s.actorId);
  const hostId = useFriends((s) => s.hostId);
  const storePassword = useFriends((s) => s.password);
  const joinSecret = useFriends((s) => s.joinSecret);
  const seatName = useFriends((s) => s.seats.find((s) => s.id === actorId)?.name ?? "");
  const password =
    joinSecret ||
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
  const peerSeats = useRef(new Map<string, string>());
  const peersRef = useRef(p2p.peers);
  peersRef.current = p2p.peers;

  useEffect(() => {
    return p2p.onMessage((from, data) => {
      const msg = data as Wire;
      if (!msg || typeof msg !== "object" || !("t" in msg)) return;
      if (msg.t === "need-password") {
        const had = useFriends.getState().joinSecret.trim().length > 0;
        useFriends.getState().setPasswordPrompt(had ? 2 : 1);
        return;
      }
      if (msg.t === "refused") {
        try {
          sessionStorage.setItem("sn-notice", msg.reason);
        } catch {
          // ignore
        }
        useFriends.getState().backToMenu(pool);
        return;
      }
      if (msg.t === "kicked") {
        try {
          sessionStorage.setItem("sn-kicked", "1");
        } catch {
          // ignore
        }
        useFriends.getState().backToMenu(pool);
        return;
      }
      if (msg.t === "state") {
        replace(msg.state);
        return;
      }
      if (msg.t === "hello" && isHost) {
        const room = useFriends.getState();
        const given = (msg.password ?? "").trim().toLowerCase();
        const expected = room.password.trim().toLowerCase();
        if (expected && given !== expected) {
          p2p.send({ t: "need-password" }, from);
          return;
        }
        peerSeats.current.set(from, msg.id);
        const next = apply(
          useFriends.getState(),
          {
            type: "join",
            seat: makeSeat(msg.id, msg.name),
            password: msg.password,
            partner: msg.partner,
          },
          useFriends.getState().hostId,
        );
        replace(next);
        if (!next.seats.some((seat) => seat.id === msg.id)) {
          peerSeats.current.delete(from);
          p2p.send(
            { t: "refused", reason: msg.partner ? "This room already has a partner." : "The room is full." },
            from,
          );
          return;
        }
        p2p.send({ t: "state", state: viewFor(next, msg.id) }, from);
        return;
      }
      if (msg.t === "act" && isHost) {
        const next = apply(useFriends.getState(), msg.action, msg.actorId);
        replace(next);
        return;
      }
      if (msg.t === "need" && isHost) {
        const seatId = peerSeats.current.get(from);
        if (!seatId) return;
        p2p.send({ t: "state", state: viewFor(useFriends.getState(), seatId) }, from);
      }
    });
  }, [p2p.onMessage, p2p.send, isHost, replace, pool]);

  useEffect(() => {
    if (isHost || !p2p.joined) return;
    becomeGuest(useFriends.getState(), p2p.selfId);
    p2p.send({
      t: "hello",
      id: p2p.selfId,
      name: selfName,
      password,
      partner: sessionStorage.getItem("sn-join-partner") === "1",
    });
    p2p.send({ t: "need" });
  }, [isHost, p2p.joined, p2p.peers.length, p2p.selfId, p2p.send, selfName, password, becomeGuest]);

  useEffect(() => {
    if (!isHost || !p2p.joined || p2p.peers.length === 0) return;
    const state = useFriends.getState();
    for (const peer of p2p.peers) {
      const seatId = peerSeats.current.get(peer.id);
      if (!seatId) continue;
      p2p.send({ t: "state", state: viewFor(state, seatId) }, peer.id);
    }
  }, [isHost, p2p.joined, p2p.peers, p2p.send]);

  useEffect(() => {
    if (!isHost) {
      return useFriends.subscribe((state, prev) => {
        if (!state.lastAction || state.lastAction === prev.lastAction) return;
        if (state.actorId === state.hostId) return;
        p2p.send({ t: "act", action: state.lastAction.action, actorId: state.lastAction.actorId });
      });
    }
    return useFriends.subscribe((state, prev) => {
      if (state.phase === "menu" || state.phase === "setup") return;
      const action = state.lastAction;
      const kicked =
        action && action !== prev.lastAction && action.action.type === "kick" ? action.action.seatId : "";
      for (const peer of peersRef.current) {
        const seatId = peerSeats.current.get(peer.id);
        if (!seatId) continue;
        if (kicked && seatId === kicked) {
          p2p.send({ t: "kicked" }, peer.id);
          peerSeats.current.delete(peer.id);
          continue;
        }
        p2p.send({ t: "state", state: viewFor(state, seatId) }, peer.id);
      }
    });
  }, [isHost, p2p.joined, p2p.send, p2p.onMessage, p2p.selfId]);

  return null;
}
