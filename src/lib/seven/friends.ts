import { canFill, emptySlotsFor, makeSlots, reshapeXi } from "./formations";
import { autoFillFrom, drawLegal, drawOtherSide, drawSameTeam, filledCount } from "./draft";
import { coachBoost, coachById, drawCoaches, styleForCoach } from "./coaches";
import { personKey } from "./person";
import { playersForSide } from "./squads";
import { simulateFinal, simulateKnockout, type BracketGame } from "./simulate";
import type { DrawnSquad, FormationId, ModeId, Player, PoolId, Slot, StyleId } from "./types";

export type FriendKind = "local" | "final" | "cup";
export type TimerSec = 20 | 30 | 45;
export type BracketSize = 4 | 8 | 16 | 32;
export type FriendsPhase = "menu" | "setup" | "lobby" | "draft" | "simulating" | "result";

export type Seat = {
  id: string;
  name: string;
  kind: "human" | "cpu" | "organizer" | "partner";
  formation: FormationId;
  style: StyleId;
  slots: Slot[];
  ready: boolean;
  confirmed: boolean;
  rerolls: number;
  coachId: string | null;
  coachOffer: string[] | null;
  coachRerolls: number;
  draw: DrawnSquad | null;
  selected: Player | null;
  since: number;
};

export type FriendsState = {
  kind: FriendKind;
  pool: PoolId;
  code: string;
  password: string;
  mode: ModeId;
  timer: TimerSec;
  bracketSize: BracketSize;
  hostId: string;
  organizer: boolean;
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
  | { type: "join"; seat: Seat; password?: string; partner?: boolean }
  | { type: "kick"; seatId: string }
  | { type: "start" }
  | { type: "roll"; seatId: string }
  | { type: "reroll"; seatId: string }
  | { type: "sameYear"; seatId: string }
  | { type: "pick"; seatId: string; player: Player }
  | { type: "place"; seatId: string; slotId: string }
  | { type: "autoPick"; seatId: string }
  | { type: "rollCoach"; seatId: string }
  | { type: "rerollCoach"; seatId: string }
  | { type: "setCoach"; seatId: string; coachId: string }
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
    rerolls: 5,
    coachId: null,
    coachOffer: null,
    coachRerolls: 3,
    draw: null,
    selected: null,
    since: 0,
  };
}

export function friendsPath(pool: PoolId): "/friends" | "/club/friends" {
  return pool === "club" ? "/club/friends" : "/friends";
}

export function freshFriends(
  kind: FriendKind,
  hostId: string,
  hostName = "Home",
  pool: PoolId = "world",
): FriendsState {
  const code = roomCode();
  const seats =
    kind === "local"
      ? [makeSeat("home", "Home"), makeSeat("away", "Away")]
      : [makeSeat(hostId, hostName)];
  return {
    kind,
    pool,
    code,
    password: "",
    mode: "classic",
    timer: 30,
    bracketSize: 8,
    hostId,
    organizer: false,
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

function concealSeat(seat: Seat): Seat {
  return {
    ...seat,
    slots: seat.slots.map((slot) =>
      slot.player
        ? {
            ...slot,
            player: { id: "hidden", name: "", nation: "", year: 0, num: 0, pos: [slot.pos], ovr: 0 },
          }
        : slot,
    ),
    draw: null,
    selected: null,
    coachId: null,
    coachOffer: null,
  };
}

function concealGame(game: BracketGame, viewerName: string): BracketGame {
  if (viewerName && (game.home === viewerName || game.away === viewerName)) return game;
  return {
    ...game,
    goals: [],
    pens: game.pens ? { home: game.pens.home, away: game.pens.away } : undefined,
    homeRatings: undefined,
    awayRatings: undefined,
    ratings: undefined,
    potm: undefined,
    instant: true,
  };
}

/** Players receive their own XI only. The organizer and the host's partner see every team. */
export function viewFor(state: FriendsState, viewerId: string): FriendsState {
  const snap = pickState(state);
  if (state.kind === "local") return snap;
  const me = state.seats.find((seat) => seat.id === viewerId);
  if ((state.organizer && viewerId === state.hostId) || me?.kind === "partner") return snap;
  const myName = me && me.kind === "human" ? shownName(me.name) : "";
  return {
    ...snap,
    seats: snap.seats.map((seat) =>
      seat.id === viewerId || seat.kind === "organizer" || seat.kind === "partner" ? seat : concealSeat(seat),
    ),
    bracket: snap.bracket.map((game) => concealGame(game, myName)),
  };
}

export function pickState(s: FriendsState): FriendsState {
  return {
    kind: s.kind,
    pool: s.pool,
    code: s.code,
    password: s.password,
    mode: s.mode,
    timer: s.timer,
    bracketSize: s.bracketSize,
    hostId: s.hostId,
    organizer: s.organizer,
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

const CLUB_CPU = [
  "Real Madrid 2017",
  "Real Madrid 2016",
  "Real Madrid 2015",
  "Real Madrid 2014",
  "Barcelona 2015",
  "Barcelona 2011",
  "Barcelona 2009",
  "Bayern 2020",
  "Bayern 2013",
  "Liverpool 2019",
  "Manchester City 2023",
  "Manchester City 2019",
  "Juventus 2017",
  "Juventus 2015",
  "Milan 2007",
  "Milan 1994",
  "Inter 2010",
  "Chelsea 2021",
  "Chelsea 2012",
  "Arsenal 2004",
  "United 1999",
  "United 2008",
  "Dortmund 2013",
  "Atlético 2014",
  "Atlético 2016",
  "PSG 2021",
  "Napoli 2023",
  "Porto",
  "Benfica",
  "Ajax",
  "Celtic",
  "Marseille",
  "Leverkusen",
  "Roma",
  "Sevilla",
  "Monaco",
  "Lyon",
];

const WORLD_CPU = [
  "Brazil",
  "Argentina",
  "France",
  "Germany",
  "Spain",
  "Italy",
  "England",
  "Netherlands",
  "Portugal",
  "Croatia",
  "Uruguay",
  "Belgium",
  "Morocco",
  "Japan",
  "Colombia",
  "Mexico",
  "Senegal",
  "USA",
  "Denmark",
  "Switzerland",
  "Poland",
  "Sweden",
  "Nigeria",
  "Ghana",
  "Cameroon",
  "Korea",
  "Australia",
  "Ecuador",
  "Chile",
  "Serbia",
  "Turkey",
];

function cpuName(index: number, pool: PoolId, taken: Set<string>) {
  const list = pool === "club" ? CLUB_CPU : WORLD_CPU;
  for (let step = 0; step < list.length; step++) {
    const name = list[(index + step) % list.length]!;
    const key = name.toLowerCase();
    if (taken.has(key)) continue;
    taken.add(key);
    return name;
  }
  const spare = `${list[index % list.length]} ${index + 2}`;
  taken.add(spare.toLowerCase());
  return spare;
}

function humans(state: FriendsState) {
  return state.seats.filter((s) => s.kind === "human");
}

function needsTurn(seat: Seat) {
  if (seat.kind !== "human" || seat.confirmed) return false;
  if (filledCount(seat.slots) < 11) return true;
  return !seat.coachId;
}

function allHumansFull(state: FriendsState) {
  return humans(state).every((s) => !needsTurn(s));
}

function seatAt(state: FriendsState, seatId: string) {
  return state.seats.find((seat) => seat.id === seatId);
}

function writeSeat(state: FriendsState, seatId: string, seat: Seat): FriendsState {
  return { ...state, seats: state.seats.map((current) => (current.id === seatId ? seat : current)) };
}

function controls(state: FriendsState, actorId: string, seatId: string) {
  return state.kind === "local" || actorId === seatId;
}

function placePlayer(state: FriendsState, seatId: string, player: Player, slotId: string): FriendsState {
  const seat = seatAt(state, seatId);
  if (!seat) return state;
  const slot = seat.slots.find((s) => s.id === slotId);
  if (!slot || slot.player || !canFill(slot.pos, player.pos)) return state;
  if (state.claimed.includes(personKey(player.name))) return state;
  const slots = seat.slots.map((s) => (s.id === slotId ? { ...s, player } : s));
  const next = writeSeat(
    { ...state, claimed: [...state.claimed, personKey(player.name)] },
    seatId,
    { ...seat, slots, selected: null, draw: null, since: Date.now() },
  );
  if (humans(next).every((s) => s.confirmed)) return runSimulate(next);
  return next;
}

function autoPickPlayer(state: FriendsState, seatId: string): FriendsState {
  const seat = seatAt(state, seatId);
  if (!seat || seat.kind !== "human" || seat.confirmed) return state;
  if (filledCount(seat.slots) >= 11) {
    if (seat.coachId) return state;
    let cur = state;
    if (!seat.coachOffer?.length) {
      const offer = drawCoaches(3).map((coach) => coach.id);
      cur = writeSeat(state, seatId, { ...seat, coachOffer: offer });
    }
    const offer = seatAt(cur, seatId)?.coachOffer ?? [];
    const id = offer[Math.floor(Math.random() * offer.length)];
    return id ? assignCoach(cur, seatId, id) : cur;
  }

  if (seat.selected) {
    const options = emptySlotsFor(seat.slots, seat.selected.pos);
    if (options[0]) return placePlayer(state, seatId, seat.selected, options[0].id);
  }

  let cur = state;
  for (let i = 0; i < 8; i++) {
    const current = seatAt(cur, seatId);
    if (!current) return cur;
    if (!current.draw || current.draw.remaining.length === 0) {
      const next = drawLegal(current.slots, cur.history, cur.claimed, cur.pool);
      cur = writeSeat(
        { ...cur, history: next.history },
        seatId,
        { ...current, draw: { squad: next.squad, remaining: next.remaining }, selected: null },
      );
    }
    const live = seatAt(cur, seatId);
    const remaining = live?.draw?.remaining ?? [];
    if (!live || remaining.length === 0) continue;
    const player = remaining[Math.floor(Math.random() * remaining.length)]!;
    const options = emptySlotsFor(live.slots, player.pos);
    if (!options[0]) continue;
    return placePlayer(cur, seatId, player, options[0].id);
  }
  return cur;
}

function assignCoach(state: FriendsState, seatId: string, coachId: string): FriendsState {
  const seat = seatAt(state, seatId);
  const coach = coachById(coachId);
  if (!seat || !coach || !seat.coachOffer?.includes(coachId)) return state;
  const players = seat.slots.map((slot) => slot.player).filter((player): player is Player => Boolean(player));
  const slots = reshapeXi(players, coach.formation);
  return writeSeat(state, seatId, {
    ...seat,
    slots,
    coachId: coach.id,
    coachOffer: null,
    formation: coach.formation,
    style: styleForCoach(coach.play),
    draw: null,
    selected: null,
    since: Date.now(),
  });
}

function withCoach(seat: Seat, claimed: string[], pool: PoolId): { seat: Seat; claimed: string[] } {
  const own = playersForSide(seat.name, pool);
  const filled = autoFillFrom(seat.formation, claimed, own);
  const coach = drawCoaches(1)[0];
  if (!coach) return { seat: { ...seat, slots: filled.slots, confirmed: true }, claimed: filled.claimed };
  const players = filled.slots.map((slot) => slot.player).filter((player): player is Player => Boolean(player));
  return {
    seat: {
      ...seat,
      slots: reshapeXi(players, coach.formation),
      confirmed: true,
      coachId: coach.id,
      coachOffer: null,
      formation: coach.formation,
      style: styleForCoach(coach.play),
    },
    claimed: filled.claimed,
  };
}

function fillCpu(state: FriendsState): FriendsState {
  let claimed = [...state.claimed];
  const seats = state.seats.map((seat) => {
    if (seat.kind !== "cpu" || seat.coachId) return seat;
    const next = withCoach(seat, claimed, state.pool);
    claimed = next.claimed;
    return next.seat;
  });
  return { ...state, seats, claimed };
}

function boostOf(seat: Seat) {
  const coach = coachById(seat.coachId);
  return coach ? coachBoost(coach) : undefined;
}

function runSimulate(state: FriendsState): FriendsState {
  const filled = fillCpu(state);
  if (filled.kind === "cup") {
    const playing = filled.seats.filter((s) => s.kind !== "organizer" && s.kind !== "partner");
    const { games, champion } = simulateKnockout(
      playing.map((s) => ({
        name: shownName(s.name, s.kind === "cpu" ? s.name : "Player"),
        slots: s.slots,
        style: s.style,
        human: s.kind === "human",
        boost: boostOf(s),
      })),
    );
    return { ...filled, phase: "simulating", bracket: games, champion, resultMatch: null };
  }
  const home = filled.seats.find((s) => s.kind === "human" || s.kind === "cpu");
  const away = filled.seats.filter((s) => s.kind === "human" || s.kind === "cpu")[1];
  if (!home || !away) return { ...filled, phase: "draft" };
  const label = filled.pool === "club" ? "European night" : "Cup Final";
  const match = simulateFinal(
    home.slots,
    away.slots,
    home.style,
    away.style,
    shownName(away.name, "Away"),
    label,
    shownName(home.name, "Home"),
    boostOf(home),
    boostOf(away),
  );
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
        round: label,
        home: shownName(home.name, "Home"),
        away: shownName(away.name, "Away"),
        gf: match.gf,
        ga: match.ga,
        winner: match.result === "W" ? shownName(home.name, "Home") : shownName(away.name, "Away"),
        goals: match.goals,
        pens: match.pens,
        homeRatings: match.homeRatings,
        awayRatings: match.awayRatings,
        ratings: match.ratings,
        potm: match.potm,
      },
    ],
  };
}

function configPhase(state: FriendsState) {
  return state.phase === "menu" || state.phase === "setup" || state.phase === "lobby";
}

export function apply(state: FriendsState, action: FriendsAction, actorId: string): FriendsState {
  const isHost = actorId === state.hostId || state.kind === "local";

  switch (action.type) {
    case "setName": {
      if (action.seatId !== actorId && !isHost) return state;
      if (!configPhase(state)) return state;
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
        seats: state.seats.map((s) =>
          s.id === action.seatId && !s.coachId ? { ...s, style: action.style } : s,
        ),
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
      const seat = state.seats.find((s) => s.id === action.seatId);
      if (!seat?.name.trim()) return state;
      return {
        ...state,
        seats: state.seats.map((s) => (s.id === action.seatId ? { ...s, ready: !s.ready } : s)),
      };
    }
    case "join": {
      if (state.phase !== "lobby") return state;
      if (!action.seat.name.trim()) return state;
      if (state.password && state.password.trim().toLowerCase() !== (action.password ?? "").trim().toLowerCase()) return state;
      if (state.seats.some((s) => s.id === action.seat.id)) return state;
      const cap = state.kind === "final" ? 2 : Math.min(8, state.bracketSize);
      if (humans(state).length >= cap) return state;
      if (action.partner) {
        if (state.seats.some((s) => s.kind === "partner")) return state;
        return {
          ...state,
          seats: [
            ...state.seats,
            {
              ...makeSeat(action.seat.id, action.seat.name),
              ...action.seat,
              kind: "partner",
              ready: true,
              confirmed: true,
            },
          ],
        };
      }
      return {
        ...state,
        seats: [
          ...state.seats,
          { ...makeSeat(action.seat.id, action.seat.name), ...action.seat, kind: "human", ready: false },
        ],
      };
    }
    case "kick": {
      if (!isHost || state.kind === "local") return state;
      if (action.seatId === state.hostId) return state;
      if (state.phase === "simulating" || state.phase === "result" || state.phase === "menu") return state;
      const seat = state.seats.find((s) => s.id === action.seatId);
      if (!seat || (seat.kind !== "human" && seat.kind !== "partner")) return state;
      const theirs = new Set(
        seat.slots.flatMap((slot) => (slot.player ? [personKey(slot.player.name)] : [])),
      );
      return {
        ...state,
        claimed: state.claimed.filter((key) => !theirs.has(key)),
        seats: state.seats.filter((s) => s.id !== action.seatId),
      };
    }
    case "start": {
      if (!isHost) return state;
      if (state.kind !== "local") {
        const players = humans(state);
        if (players.length === 0 || players.some((s) => !s.ready || !s.name.trim())) return state;
        if (state.kind === "final" && players.length < 2) return state;
        if (state.kind === "cup" && players.length < (state.organizer ? 2 : 1)) return state;
      }
      if (state.kind === "local" && state.seats.length < 2) return state;
      let seats = state.seats;
      if (state.kind === "cup") {
        const playing = seats.filter((s) => s.kind !== "organizer" && s.kind !== "partner");
        const need = state.bracketSize - playing.length;
        const taken = new Set(seats.map((s) => s.name.trim().toLowerCase()).filter(Boolean));
        const extras: Seat[] = [];
        for (let i = 0; i < need; i++) {
          extras.push(makeSeat(`cpu-${i + 1}`, cpuName(i, state.pool, taken), "cpu"));
        }
        seats = [...seats, ...extras];
      }
      const started = Date.now();
      return {
        ...state,
        seats: seats.map((seat) => (seat.kind === "human" ? { ...seat, since: started, draw: null, selected: null } : seat)),
        phase: "draft",
        activeSeat: 0,
        draw: null,
        selected: null,
        turnStartedAt: started,
      };
    }
    case "roll": {
      const seat = seatAt(state, action.seatId);
      if (state.phase !== "draft" || !seat || !controls(state, actorId, action.seatId)) return state;
      if (seat.kind !== "human" || seat.draw || seat.confirmed) return state;
      if (filledCount(seat.slots) >= 11) return state;
      const next = drawLegal(seat.slots, state.history, state.claimed, state.pool);
      return writeSeat({ ...state, history: next.history }, action.seatId, {
        ...seat,
        draw: { squad: next.squad, remaining: next.remaining },
        selected: null,
        since: Date.now(),
      });
    }
    case "reroll": {
      const seat = seatAt(state, action.seatId);
      if (state.phase !== "draft" || !seat?.draw || !controls(state, actorId, action.seatId)) return state;
      if (seat.rerolls <= 0) return state;
      const next = drawOtherSide(seat.slots, state.history, state.claimed, state.pool, seat.draw.squad.nation);
      return writeSeat({ ...state, history: next.history }, action.seatId, {
        ...seat,
        rerolls: seat.rerolls - 1,
        draw: { squad: next.squad, remaining: next.remaining },
        selected: null,
        since: Date.now(),
      });
    }
    case "sameYear": {
      const seat = seatAt(state, action.seatId);
      if (state.phase !== "draft" || !seat?.draw || !controls(state, actorId, action.seatId)) return state;
      if (seat.rerolls <= 0) return state;
      const next = drawSameTeam(seat.slots, state.history, seat.draw.squad, state.claimed, state.pool);
      if (!next) return state;
      return writeSeat({ ...state, history: next.history }, action.seatId, {
        ...seat,
        rerolls: seat.rerolls - 1,
        draw: { squad: next.squad, remaining: next.remaining },
        selected: null,
        since: Date.now(),
      });
    }
    case "pick": {
      const seat = seatAt(state, action.seatId);
      if (state.phase !== "draft" || !seat?.draw || !controls(state, actorId, action.seatId)) return state;
      if (state.claimed.includes(personKey(action.player.name))) return state;
      const options = emptySlotsFor(seat.slots, action.player.pos);
      if (options.length === 0) return state;
      if (options.length > 1) return writeSeat(state, action.seatId, { ...seat, selected: action.player });
      return placePlayer(state, action.seatId, action.player, options[0]!.id);
    }
    case "place": {
      const seat = seatAt(state, action.seatId);
      if (state.phase !== "draft" || !seat?.selected || !controls(state, actorId, action.seatId)) return state;
      return placePlayer(state, action.seatId, seat.selected, action.slotId);
    }
    case "autoPick": {
      if (state.phase !== "draft") return state;
      if (!controls(state, actorId, action.seatId) && !isHost) return state;
      return autoPickPlayer(state, action.seatId);
    }
    case "rollCoach": {
      const seat = seatAt(state, action.seatId);
      if (state.phase !== "draft" || !seat || !controls(state, actorId, action.seatId)) return state;
      if (filledCount(seat.slots) < 11 || seat.coachId || seat.coachOffer) return state;
      const offer = drawCoaches(3).map((coach) => coach.id);
      return writeSeat(state, action.seatId, { ...seat, coachOffer: offer, draw: null, selected: null, since: Date.now() });
    }
    case "rerollCoach": {
      const seat = seatAt(state, action.seatId);
      if (state.phase !== "draft" || !seat?.coachOffer || !controls(state, actorId, action.seatId)) return state;
      if (seat.coachRerolls <= 0 || seat.coachId) return state;
      const offer = drawCoaches(3, seat.coachOffer).map((coach) => coach.id);
      return writeSeat(state, action.seatId, {
        ...seat,
        coachRerolls: seat.coachRerolls - 1,
        coachOffer: offer,
        since: Date.now(),
      });
    }
    case "setCoach": {
      const seat = seatAt(state, action.seatId);
      if (state.phase !== "draft" || !seat || !controls(state, actorId, action.seatId)) return state;
      return assignCoach(state, action.seatId, action.coachId);
    }
    case "confirm": {
      if (action.seatId !== actorId && !isHost) return state;
      if (state.phase !== "draft") return state;
      const seats = state.seats.map((s) =>
        s.id === action.seatId && filledCount(s.slots) >= 11 && s.coachId ? { ...s, confirmed: true } : s,
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
