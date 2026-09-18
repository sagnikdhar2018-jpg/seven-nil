import { canFill, emptySlotsFor, makeSlots } from "./formations";
import { autoFillXi, drawLegal, drawSameTeam, filledCount } from "./draft";
import { personKey } from "./person";
import { simulateFinal, simulateKnockout, type BracketGame } from "./simulate";
import type { DrawnSquad, FormationId, ModeId, Player, Slot, StyleId } from "./types";

export type FriendKind = "local" | "final" | "cup";
export type TimerSec = 20 | 30 | 45;
export type BracketSize = 4 | 8 | 16 | 32;
export type FriendsPhase = "menu" | "setup" | "lobby" | "draft" | "simulating" | "result";

export type Seat = {
  id: string;
  name: string;
  kind: "human" | "cpu";
  formation: FormationId;
  style: StyleId;
  slots: Slot[];
  ready: boolean;
  confirmed: boolean;
  rerolls: number;
};

export type FriendsState = {
  kind: FriendKind;
  code: string;
  password: string;
  mode: ModeId;
  timer: TimerSec;
  bracketSize: BracketSize;
  hostId: string;
  phase: FriendsPhase;
  seats: Seat[];
  activeSeat: number;
  draw: DrawnSquad | null;
  history: string[];
  claimed: string[];
  selected: Player | null;
  turnStartedAt: number;
  resultMatch: { home: string; away: string; gf: number; ga: number; result: "W" | "L" | "D" } | null;
  bracket: BracketGame[];
  champion: string | null;
};

export type FriendsAction =
  | { type: "setName"; seatId: string; name: string }
  | { type: "setFormation"; seatId: string; formation: FormationId }
  | { type: "setStyle"; seatId: string; style: StyleId }
  | { type: "setMode"; mode: ModeId }
  | { type: "setTimer"; timer: TimerSec }
  | { type: "setPassword"; password: string }
  | { type: "setBracket"; size: BracketSize }
  | { type: "ready"; seatId: string }
  | { type: "join"; seat: Seat; password?: string }
  | { type: "start" }
  | { type: "roll" }
  | { type: "reroll" }
  | { type: "sameYear" }
  | { type: "pick"; player: Player }
  | { type: "place"; slotId: string }
  | { type: "confirm"; seatId: string }
  | { type: "simulate" }
  | { type: "simDone" };

export function shownName(name: string, fallback = "Player") {
  const n = name.trim();
  return n || fallback;
}

const NAME_KEY = "seven-nil-name";

export function loadPlayerName() {
  if (typeof window === "undefined") return "";
  try {
    return (window.localStorage.getItem(NAME_KEY) ?? "").slice(0, 18);
  } catch {
    return "";
  }
}

export function savePlayerName(name: string) {
  if (typeof window === "undefined") return;
  const n = name.trim().slice(0, 18);
  if (!n) return;
  try {
    window.localStorage.setItem(NAME_KEY, n);
  } catch {
    // ignore
  }
}

export function roomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export function makeSeat(id: string, name: string, kind: Seat["kind"] = "human"): Seat {
  return {
    id,
    name,
    kind,
    formation: "4-3-3",
    style: "balanced",
    slots: makeSlots("4-3-3"),
    ready: kind === "cpu",
    confirmed: false,
    rerolls: 3,
  };
}

export function freshFriends(kind: FriendKind, hostId: string, hostName = "Home"): FriendsState {
  const code = roomCode();
  const seats =
    kind === "local"
      ? [makeSeat("home", "Home"), makeSeat("away", "Away")]
      : [makeSeat(hostId, hostName)];
  return {
    kind,
    code,
    password: "",
    mode: "classic",
    timer: 30,
    bracketSize: 8,
    hostId,
    phase: kind === "local" ? "setup" : "lobby",
    seats,
    activeSeat: 0,
    draw: null,
    history: [],
    claimed: [],
    selected: null,
    turnStartedAt: 0,
    resultMatch: null,
    bracket: [],
    champion: null,
  };
}

export function pickState(s: FriendsState): FriendsState {
  return {
    kind: s.kind,
    code: s.code,
    password: s.password,
    mode: s.mode,
    timer: s.timer,
    bracketSize: s.bracketSize,
    hostId: s.hostId,
    phase: s.phase,
    seats: s.seats,
    activeSeat: s.activeSeat,
    draw: s.draw,
    history: s.history,
    claimed: s.claimed,
    selected: s.selected,
    turnStartedAt: s.turnStartedAt,
    resultMatch: s.resultMatch,
    bracket: s.bracket,
    champion: s.champion,
  };
}

function humans(state: FriendsState) {
  return state.seats.filter((s) => s.kind === "human");
}

function nextNeedyIndex(state: FriendsState, from: number) {
  const n = state.seats.length;
  for (let i = 1; i <= n; i++) {
    const idx = (from + i) % n;
    const seat = state.seats[idx]!;
    if (seat.kind === "human" && filledCount(seat.slots) < 11 && !seat.confirmed) return idx;
  }
  return from;
}

function allHumansFull(state: FriendsState) {
  return humans(state).every((s) => filledCount(s.slots) >= 11);
}

function passTurn(state: FriendsState): FriendsState {
  if (allHumansFull(state)) {
    return { ...state, draw: null, selected: null, phase: "draft" };
  }
  const activeSeat = nextNeedyIndex(state, state.activeSeat);
  return {
    ...state,
    activeSeat,
    draw: null,
    selected: null,
    turnStartedAt: Date.now(),
  };
}

function placePlayer(state: FriendsState, player: Player, slotId: string): FriendsState {
  const seat = state.seats[state.activeSeat];
  if (!seat) return state;
  const slot = seat.slots.find((s) => s.id === slotId);
  if (!slot || slot.player || !canFill(slot.pos, player.pos)) return state;
  if (state.claimed.includes(personKey(player.name))) return state;
  const slots = seat.slots.map((s) => (s.id === slotId ? { ...s, player } : s));
  const seats = state.seats.map((s, i) => (i === state.activeSeat ? { ...s, slots } : s));
  const next = passTurn({
    ...state,
    seats,
    claimed: [...state.claimed, personKey(player.name)],
    selected: null,
    draw: null,
  });
  if (humans(next).every((s) => s.confirmed)) return runSimulate(next);
  return next;
}

function fillCpu(state: FriendsState): FriendsState {
  let claimed = [...state.claimed];
  const seats = state.seats.map((seat) => {
    if (seat.kind !== "cpu") return seat;
    const filled = autoFillXi(seat.formation, claimed);
    claimed = filled.claimed;
    return { ...seat, slots: filled.slots, confirmed: true };
  });
  return { ...state, seats, claimed };
}

function runSimulate(state: FriendsState): FriendsState {
  const filled = fillCpu(state);
  if (filled.kind === "cup") {
    const { games, champion } = simulateKnockout(
      filled.seats.map((s) => ({ name: shownName(s.name, s.kind === "cpu" ? s.name : "Player"), slots: s.slots, style: s.style })),
    );
    return { ...filled, phase: "simulating", bracket: games, champion, resultMatch: null };
  }
  const home = filled.seats[0]!;
  const away = filled.seats[1]!;
  const match = simulateFinal(home.slots, away.slots, home.style, away.style, shownName(away.name, "Away"), "Cup Final", shownName(home.name, "Home"));
  return {
    ...filled,
    phase: "simulating",
    resultMatch: {
      home: shownName(home.name, "Home"),
      away: shownName(away.name, "Away"),
      gf: match.gf,
      ga: match.ga,
      result: match.result,
    },
    champion: match.result === "W" ? shownName(home.name, "Home") : shownName(away.name, "Away"),
    bracket: [
      {
        round: "Cup Final",
        home: shownName(home.name, "Home"),
        away: shownName(away.name, "Away"),
        gf: match.gf,
        ga: match.ga,
        winner: match.result === "W" ? shownName(home.name, "Home") : shownName(away.name, "Away"),
        goals: match.goals,
        pens: match.pens,
      },
    ],
  };
}

function configPhase(state: FriendsState) {
  return state.phase === "menu" || state.phase === "setup" || state.phase === "lobby";
}

export function apply(state: FriendsState, action: FriendsAction, actorId: string): FriendsState {
  const isHost = actorId === state.hostId || state.kind === "local";
  const active = state.seats[state.activeSeat];
  const isActive = Boolean(active && active.id === actorId) || state.kind === "local";

  switch (action.type) {
    case "setName": {
      if (action.seatId !== actorId && !isHost) return state;
      if (state.phase === "result" || state.phase === "simulating") return state;
      const nextName = action.name.slice(0, 18);
      return {
        ...state,
        seats: state.seats.map((s) => (s.id === action.seatId ? { ...s, name: nextName } : s)),
      };
    }
    case "setFormation": {
      if (action.seatId !== actorId && !isHost) return state;
      if (!configPhase(state)) return state;
      return {
        ...state,
        seats: state.seats.map((s) =>
          s.id === action.seatId
            ? { ...s, formation: action.formation, slots: makeSlots(action.formation) }
            : s,
        ),
      };
    }
    case "setStyle": {
      if (action.seatId !== actorId && !isHost) return state;
      return {
        ...state,
        seats: state.seats.map((s) => (s.id === action.seatId ? { ...s, style: action.style } : s)),
      };
    }
    case "setMode":
      if (!isHost || !configPhase(state)) return state;
      return { ...state, mode: action.mode };
    case "setTimer":
      if (!isHost || !configPhase(state)) return state;
      return { ...state, timer: action.timer };
    case "setPassword":
      if (!isHost || !configPhase(state)) return state;
      return { ...state, password: action.password.slice(0, 24) };
    case "setBracket":
      if (!isHost || state.kind !== "cup" || !configPhase(state)) return state;
      return { ...state, bracketSize: action.size };
    case "ready": {
      if (action.seatId !== actorId && !isHost) return state;
      if (!configPhase(state)) return state;
      return {
        ...state,
        seats: state.seats.map((s) => (s.id === action.seatId ? { ...s, ready: !s.ready } : s)),
      };
    }
    case "join": {
      if (state.phase !== "lobby") return state;
      if (state.password && action.password !== state.password) return state;
      if (state.seats.some((s) => s.id === action.seat.id)) return state;
      const cap = state.kind === "final" ? 2 : Math.min(8, state.bracketSize);
      if (humans(state).length >= cap) return state;
      return { ...state, seats: [...state.seats, { ...action.seat, ready: false }] };
    }
    case "start": {
      if (!isHost) return state;
      const readyHumans = humans(state).filter((s) => s.ready || state.kind === "local");
      if (state.kind === "final" && readyHumans.length < 2) return state;
      if (state.kind === "cup" && readyHumans.length < 1) return state;
      if (state.kind === "local" && state.seats.length < 2) return state;
      let seats = state.seats;
      if (state.kind === "cup") {
        const need = state.bracketSize - seats.length;
        const extras: Seat[] = [];
        for (let i = 0; i < need; i++) {
          extras.push(makeSeat(`cpu-${i + 1}`, `CPU ${i + 1}`, "cpu"));
        }
        seats = [...seats, ...extras];
      }
      const first = seats.findIndex((s) => s.kind === "human");
      return {
        ...state,
        seats,
        phase: "draft",
        activeSeat: first < 0 ? 0 : first,
        draw: null,
        selected: null,
        turnStartedAt: Date.now(),
      };
    }
    case "roll": {
      if (state.phase !== "draft" || !isActive || !active) return state;
      if (active.kind !== "human") return state;
      if (state.draw) return state;
      if (filledCount(active.slots) >= 11) return state;
      const next = drawLegal(active.slots, state.history, state.claimed);
      return {
        ...state,
        draw: { squad: next.squad, remaining: next.remaining },
        history: next.history,
        selected: null,
      };
    }
    case "reroll": {
      if (state.phase !== "draft" || !isActive || !active || !state.draw) return state;
      if (active.rerolls <= 0) return state;
      const next = drawLegal(active.slots, state.history, state.claimed);
      const seats = state.seats.map((s, i) =>
        i === state.activeSeat ? { ...s, rerolls: s.rerolls - 1 } : s,
      );
      return {
        ...state,
        seats,
        draw: { squad: next.squad, remaining: next.remaining },
        history: next.history,
        selected: null,
      };
    }
    case "sameYear": {
      if (state.phase !== "draft" || !isActive || !active || !state.draw) return state;
      if (active.rerolls <= 0) return state;
      const next = drawSameTeam(active.slots, state.history, state.draw.squad, state.claimed);
      if (!next) return state;
      const seats = state.seats.map((s, i) =>
        i === state.activeSeat ? { ...s, rerolls: s.rerolls - 1 } : s,
      );
      return {
        ...state,
        seats,
        draw: { squad: next.squad, remaining: next.remaining },
        history: next.history,
        selected: null,
      };
    }
    case "pick": {
      if (state.phase !== "draft" || !isActive || !active || !state.draw) return state;
      if (state.claimed.includes(personKey(action.player.name))) return state;
      const options = emptySlotsFor(active.slots, action.player.pos);
      if (options.length === 0) return state;
      if (options.length > 1) return { ...state, selected: action.player };
      return placePlayer(state, action.player, options[0]!.id);
    }
    case "place": {
      if (state.phase !== "draft" || !isActive || !state.selected) return state;
      return placePlayer(state, state.selected, action.slotId);
    }
    case "confirm": {
      if (action.seatId !== actorId && !isHost) return state;
      if (state.phase !== "draft") return state;
      const seats = state.seats.map((s) =>
        s.id === action.seatId && filledCount(s.slots) >= 11 ? { ...s, confirmed: true } : s,
      );
      const next = { ...state, seats };
      if (humans(next).every((s) => s.confirmed)) return runSimulate(next);
      return next;
    }
    case "simulate":
      if (!isHost) return state;
      if (!allHumansFull(state)) return state;
      return runSimulate(state);
    case "simDone":
      if (state.phase !== "simulating") return state;
      return { ...state, phase: "result" };
    default:
      return state;
  }
}

export { filledCount };
