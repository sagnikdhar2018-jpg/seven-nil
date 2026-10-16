import { AUCTION_PLAYERS, type AuctionPlayer, type AuctionSlot } from "../../data/auctionPlayers";

export const STARTING_BUDGET = 16;
export const MIN_BID = 1;

export const SLOT_CAPS: Record<AuctionSlot, number> = { GK: 1, DEF: 1, MID: 2, ATT: 1 };

export type Signed = { player: AuctionPlayer; price: number };

export type Manager = {
  name: string;
  budget: number;
  squad: Record<AuctionSlot, Signed[]>;
};

export type AuctionPhase = "bidding" | "toast" | "done";

export type AuctionState = {
  phase: AuctionPhase;
  mode: "ai" | "local";
  pool: AuctionPlayer[];
  index: number;
  managers: [Manager, Manager];
  bid: number | null;
  leader: 0 | 1 | null;
  turn: 0 | 1;
  clock: number;
  clockMax: number;
  banner: string | null;
  log: { name: string; player: string; price: number }[];
};

export type AuctionAction =
  | { type: "open"; side: 0 | 1; amount: number }
  | { type: "raise"; side: 0 | 1; by?: 1 | 2 | 3; max?: boolean }
  | { type: "fold"; side: 0 | 1 }
  | { type: "tick" }
  | { type: "next" };

export function emptySquad(): Record<AuctionSlot, Signed[]> {
  return { GK: [], DEF: [], MID: [], ATT: [] };
}

export function makeManager(name: string, budget = STARTING_BUDGET): Manager {
  return { name, budget, squad: emptySquad() };
}

export function slotsLeft(manager: Manager, position: AuctionSlot): number {
  return SLOT_CAPS[position] - manager.squad[position].length;
}

export function emptySlots(manager: Manager): number {
  return (Object.keys(SLOT_CAPS) as AuctionSlot[]).reduce((sum, position) => sum + slotsLeft(manager, position), 0);
}

/** Keep $1 aside for every later empty slot, including the player currently up. */
export function maxAllowedBid(manager: Manager): number {
  const empty = emptySlots(manager);
  if (empty <= 0) return 0;
  return Math.max(0, manager.budget - (empty - 1));
}

export function canBidOn(manager: Manager, position: AuctionSlot): boolean {
  return slotsLeft(manager, position) > 0 && maxAllowedBid(manager) >= MIN_BID;
}

export function flagEmoji(code: string): string {
  const iso = code.toUpperCase();
  if (iso === "EN" || iso === "ENG") return "🏴󠁧󠁢󠁥󠁮󠁧󠁿";
  if (iso === "SQ") return "🏴󠁧󠁢󠁳󠁣󠁴󠁿";
  if (iso.length !== 2) return "🏳";
  return String.fromCodePoint(...[...iso].map((char) => 127397 + char.charCodeAt(0)));
}

function mulberry32(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(list: T[], rng: () => number): T[] {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const swap = next[i];
    next[i] = next[j] as T;
    next[j] = swap as T;
  }
  return next;
}

export function buildPool(seed = Date.now(), source = AUCTION_PLAYERS): AuctionPlayer[] {
  const rng = mulberry32(seed);
  const take = (position: AuctionSlot, count: number) => shuffle(source.filter((player) => player.position === position), rng).slice(0, count);
  const pool = [...take("GK", 2), ...take("DEF", 2), ...take("MID", 4), ...take("ATT", 2)];
  if (pool.length !== 10) throw new Error("auction pool needs 2 GK, 2 DEF, 4 MID, 2 ATT");
  return shuffle(pool, rng);
}

function cloneManagers(managers: [Manager, Manager]): [Manager, Manager] {
  return managers.map((manager) => ({
    ...manager,
    squad: {
      GK: [...manager.squad.GK],
      DEF: [...manager.squad.DEF],
      MID: [...manager.squad.MID],
      ATT: [...manager.squad.ATT],
    },
  })) as [Manager, Manager];
}

function nominate(state: AuctionState): AuctionState {
  if (state.index >= state.pool.length) return { ...state, phase: "done", banner: state.banner };
  const player = state.pool[state.index] as AuctionPlayer;
  const open = [0, 1].map((side) => canBidOn(state.managers[side] as Manager, player.position));
  if (open[0] && open[1]) {
    return {
      ...state,
      phase: "bidding",
      bid: null,
      leader: null,
      turn: (state.index % 2) as 0 | 1,
      clock: 10,
      clockMax: 10,
      banner: null,
    };
  }
  if (open[0] !== open[1]) {
    const winner = (open[0] ? 0 : 1) as 0 | 1;
    return give(state, winner, MIN_BID, `Uncontested. ${state.managers[winner]?.name} picks up ${player.name} for $1.`);
  }
  return nominate({ ...state, index: state.index + 1 });
}

function give(state: AuctionState, winner: 0 | 1, price: number, banner: string): AuctionState {
  const managers = cloneManagers(state.managers);
  const player = state.pool[state.index] as AuctionPlayer;
  const manager = managers[winner];
  manager.budget -= price;
  manager.squad[player.position].push({ player, price });
  const log = [...state.log, { name: manager.name, player: player.name, price }];
  let next: AuctionState = {
    ...state,
    managers,
    log,
    index: state.index + 1,
    phase: "toast",
    banner,
    bid: null,
    leader: winner,
  };
  if (emptySlots(manager) === 0) next = assignRest(next, (1 - winner) as 0 | 1);
  return next;
}

function assignRest(state: AuctionState, side: 0 | 1): AuctionState {
  const managers = cloneManagers(state.managers);
  const log = [...state.log];
  const names: string[] = [];
  let index = state.index;
  while (index < state.pool.length) {
    const player = state.pool[index] as AuctionPlayer;
    if (canBidOn(managers[side], player.position)) {
      managers[side].budget -= MIN_BID;
      managers[side].squad[player.position].push({ player, price: MIN_BID });
      log.push({ name: managers[side].name, player: player.name, price: MIN_BID });
      names.push(player.name);
    }
    index += 1;
  }
  const extra = names.length ? ` Remaining names go to ${managers[side].name} for $1 each.` : "";
  return { ...state, managers, log, index, phase: "done", banner: `${state.banner ?? ""}${extra}`.trim() };
}

export function startAuction(opts: { seed?: number; names: [string, string]; mode: "ai" | "local"; pool?: AuctionPlayer[] }): AuctionState {
  const pool = opts.pool ?? buildPool(opts.seed ?? Date.now());
  return nominate({
    phase: "bidding",
    mode: opts.mode,
    pool,
    index: 0,
    managers: [makeManager(opts.names[0] || "Manager 1"), makeManager(opts.mode === "ai" ? "AI Scout" : opts.names[1] || "Manager 2")],
    bid: null,
    leader: null,
    turn: 0,
    clock: 10,
    clockMax: 10,
    banner: null,
    log: [],
  });
}

export function reduceAuction(state: AuctionState, action: AuctionAction): AuctionState {
  if (action.type === "next") {
    if (state.phase !== "toast") return state;
    return nominate(state);
  }
  if (action.type === "tick") {
    if (state.phase !== "bidding") return state;
    if (state.clock > 1) return { ...state, clock: state.clock - 1 };
    if (state.bid === null) return reduceAuction(state, { type: "open", side: state.turn, amount: MIN_BID });
    return reduceAuction(state, { type: "fold", side: state.turn });
  }
  if (state.phase !== "bidding") return state;
  const player = state.pool[state.index];
  if (!player) return state;
  if (action.type === "fold") {
    if (action.side !== state.turn || state.bid === null || state.leader === null) return state;
    const leader = state.managers[state.leader];
    return give(state, state.leader, state.bid, `${leader?.name} signs ${player.name} for $${state.bid}.`);
  }
  if (action.side !== state.turn) return state;
  const me = state.managers[state.turn];
  const max = maxAllowedBid(me);
  if (!canBidOn(me, player.position)) return state;
  if (action.type === "open") {
    if (state.bid !== null) return state;
    const amount = Math.round(action.amount);
    if (amount < MIN_BID || amount > max) return state;
    return place(state, state.turn, amount, true);
  }
  if (state.bid === null) return state;
  const nextBid = action.max ? max : state.bid + (action.by ?? 1);
  if (nextBid <= state.bid || nextBid > max) return state;
  return place(state, state.turn, nextBid, false);
}

function place(state: AuctionState, side: 0 | 1, amount: number, opening: boolean): AuctionState {
  const player = state.pool[state.index] as AuctionPlayer;
  const other = (1 - side) as 0 | 1;
  if (amount > maxAllowedBid(state.managers[other])) {
    return give(state, side, amount, `${state.managers[side]?.name} takes ${player.name} for $${amount}.`);
  }
  return {
    ...state,
    bid: amount,
    leader: side,
    turn: other,
    clock: opening ? 10 : 8,
    clockMax: opening ? 10 : 8,
  };
}

const TIER_TARGET: Record<AuctionPlayer["marketValueTier"], number> = { S: 6, A: 4, B: 2, C: 1 };

export function aiChoice(state: AuctionState, side: 0 | 1, rng: () => number = Math.random): AuctionAction | null {
  if (state.phase !== "bidding" || state.turn !== side) return null;
  const player = state.pool[state.index];
  const me = state.managers[side];
  if (!player || !me) return { type: "fold", side };
  const max = maxAllowedBid(me);
  if (!canBidOn(me, player.position)) return { type: "fold", side };
  const target = Math.min(max, TIER_TARGET[player.marketValueTier] + (rng() < 0.25 ? 1 : 0));
  if (state.bid === null) return { type: "open", side, amount: Math.max(MIN_BID, target) };
  if (state.bid >= target || state.bid + 1 > max) return { type: "fold", side };
  const by = player.marketValueTier === "S" && state.bid + 2 <= target && state.bid + 2 <= max ? 2 : 1;
  return { type: "raise", side, by };
}

export function squadRating(manager: Manager): number {
  const gk = manager.squad.GK[0]?.player.overallRating ?? 0;
  const def = manager.squad.DEF[0]?.player.overallRating ?? 0;
  const mids = manager.squad.MID;
  const mid = mids.length ? mids.reduce((sum, signed) => sum + signed.player.overallRating, 0) / mids.length : 0;
  const att = manager.squad.ATT[0]?.player.overallRating ?? 0;
  return att * 0.34 + mid * 0.3 + def * 0.2 + gk * 0.16;
}

export function scoreline(home: number, away: number, seed: number): [number, number] {
  const diff = home - away;
  if (Math.abs(diff) < 1.4) return seed % 2 === 0 ? [1, 1] : [0, 0];
  const goals = Math.min(4, 1 + Math.floor(Math.abs(diff) / 3));
  const concede = Math.max(0, Math.abs(diff) > 6 ? goals - 2 : goals - 1);
  return diff > 0 ? [goals, Math.max(0, concede)] : [Math.max(0, concede), goals];
}
