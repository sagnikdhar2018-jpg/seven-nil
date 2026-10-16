export type ArcadeGame = "penalties" | "freekicks" | "reflex";
export type Dir = "L" | "C" | "R";

export const ARCADE_GAMES: { id: ArcadeGame; name: string; blurb: string }[] = [
  {
    id: "penalties",
    name: "Penalties",
    blurb: "Pick a corner, time the strike. Five each, then sudden death.",
  },
  {
    id: "freekicks",
    name: "Free kicks",
    blurb: "Stop the bar over the goal. Closer to the centre scores more.",
  },
  {
    id: "reflex",
    name: "Keeper",
    blurb: "The ball flashes to a corner. Dive before it passes you.",
  },
];

export const QUEUE_MS = 60_000;

const RIVAL_NAMES = [
  "Luka V",
  "Noor 10",
  "Samir.k",
  "Jules M",
  "Rico 9",
  "Amina F",
  "Theo.b",
  "Kenji",
  "Iker.s",
  "Nia 7",
  "Omar.d",
  "Leah K",
  "Yusuf",
  "Marta.p",
  "Ellis 4",
  "Hana.r",
  "Diego S",
  "Priya 8",
  "Noah.t",
  "Farid",
];

export function cleanName(raw: string): string {
  const name = raw.replace(/\s+/g, " ").trim().slice(0, 18);
  return name || "Guest";
}

export function rivalName(avoid: string, roll = Math.random()): string {
  const pool = RIVAL_NAMES.filter((n) => n.toLowerCase() !== avoid.toLowerCase());
  return pool[Math.floor(roll * pool.length) % pool.length] ?? "Luka V";
}

export function penaltyResult(power: number, shot: Dir, save: Dir): "goal" | "save" | "miss" {
  if (power < 42 || power > 94) return "miss";
  if (shot === save) return "save";
  return "goal";
}

export function freeKickPoints(aim: number): number {
  const d = Math.abs(aim - 50);
  if (d <= 6) return 3;
  if (d <= 16) return 2;
  if (d <= 28) return 1;
  return 0;
}

export function reflexPoint(ball: Dir, dive: Dir, ms: number): number {
  if (dive !== ball || ms > 900) return 0;
  return ms < 420 ? 2 : 1;
}

export type Ticket = { id: string; name: string; game: ArcadeGame; at: number };

export function pairQueue(queue: Ticket[], incoming: Ticket, now: number): { queue: Ticket[]; pair: [Ticket, Ticket] | null } {
  const rest = queue.filter((t) => t.id !== incoming.id && now - t.at < QUEUE_MS);
  const other = rest.find((t) => t.game === incoming.game);
  if (!other) return { queue: [...rest, incoming], pair: null };
  return { queue: rest.filter((t) => t.id !== other.id), pair: [other, incoming] };
}

export type KickLog = { n: number; name: string; text: string; points: number };

export type DuelView = {
  game: ArcadeGame;
  you: 0 | 1;
  opponent: string;
  scores: [number, number];
  log: KickLog[];
  role: "shoot" | "keep" | "dive" | "wait" | "done";
  ball: Dir | null;
  done: boolean;
  winner: "you" | "them" | "draw" | null;
  headline: string;
};

type OpenPen = { n: number; shooter: 0 | 1; shot?: { dir: Dir; power: number }; save?: Dir };
type OpenKick = { n: number; taker: 0 | 1 };
type OpenDive = { n: number; taker: 0 | 1; ball: Dir };

export type DuelState = {
  game: ArcadeGame;
  names: [string, string];
  scores: [number, number];
  taken: [number, number];
  log: KickLog[];
  pen: OpenPen | null;
  kick: OpenKick | null;
  dive: OpenDive | null;
  done: boolean;
  winner: 0 | 1 | "draw" | null;
  seed: number;
};

const DIRS: Dir[] = ["L", "C", "R"];

function dirFrom(seed: number): Dir {
  return DIRS[Math.abs(seed) % 3] ?? "C";
}

export function startDuel(game: ArcadeGame, you: string, opponent: string, seed = 1): DuelState {
  const base: DuelState = {
    game,
    names: [cleanName(you), cleanName(opponent)],
    scores: [0, 0],
    taken: [0, 0],
    log: [],
    pen: null,
    kick: null,
    dive: null,
    done: false,
    winner: null,
    seed,
  };
  if (game === "penalties") base.pen = { n: 1, shooter: 0 };
  if (game === "freekicks") base.kick = { n: 1, taker: 0 };
  if (game === "reflex") base.dive = { n: 1, taker: 0, ball: dirFrom(seed) };
  return base;
}

function kicksLeft(mine: number, theirs: number): number {
  if (mine < 5) return 5 - mine;
  if (mine < theirs) return 1;
  return 0;
}

function finishIfNeeded(state: DuelState): void {
  const [a, b] = state.scores;
  const [ta, tb] = state.taken;
  if (state.game === "penalties") {
    const aLeft = kicksLeft(ta, tb);
    const bLeft = kicksLeft(tb, ta);
    const decided = a > b + bLeft || b > a + aLeft;
    const capped = ta > 12 && tb > 12;
    if (decided || capped) {
      state.done = true;
      state.pen = null;
      state.winner = a === b ? "draw" : a > b ? 0 : 1;
    }
    return;
  }
  const cap = state.game === "reflex" ? 6 : 5;
  if (ta >= cap && tb >= cap) {
    state.done = true;
    state.kick = null;
    state.dive = null;
    state.winner = a === b ? "draw" : a > b ? 0 : 1;
  }
}

export function applyYou(state: DuelState, action: { dir?: Dir; power?: number; ms?: number }): DuelState {
  return applySide(state, 0, action);
}

export function applySide(state: DuelState, side: 0 | 1, action: { dir?: Dir; power?: number; ms?: number }): DuelState {
  if (state.done) return state;
  const next: DuelState = {
    ...state,
    scores: [...state.scores],
    taken: [...state.taken],
    log: [...state.log],
    pen: state.pen ? { ...state.pen, shot: state.pen.shot ? { ...state.pen.shot } : undefined } : null,
    kick: state.kick ? { ...state.kick } : null,
    dive: state.dive ? { ...state.dive } : null,
  };
  if (next.game === "penalties" && next.pen) {
    const shooter = next.pen.shooter;
    const keeper = (1 - shooter) as 0 | 1;
    if (side === shooter && action.dir && typeof action.power === "number" && !next.pen.shot) {
      next.pen.shot = { dir: action.dir, power: action.power };
    } else if (side === keeper && action.dir && !next.pen.save) {
      next.pen.save = action.dir;
    }
    if (next.pen.shot && next.pen.save) {
      const result = penaltyResult(next.pen.shot.power, next.pen.shot.dir, next.pen.save);
      const points = result === "goal" ? 1 : 0;
      next.scores[shooter] += points;
      next.taken[shooter] += 1;
      const verb = result === "goal" ? "scored" : result === "save" ? "was saved" : "missed";
      next.log.push({ n: next.pen.n, name: next.names[shooter], text: verb, points });
      const nxt = next.taken[0] <= next.taken[1] ? 0 : 1;
      next.pen = { n: next.log.length + 1, shooter: nxt as 0 | 1 };
      finishIfNeeded(next);
    }
    return next;
  }
  if (next.game === "freekicks" && next.kick && side === next.kick.taker && typeof action.power === "number") {
    const points = freeKickPoints(action.power);
    next.scores[side] += points;
    next.taken[side] += 1;
    next.log.push({
      n: next.kick.n,
      name: next.names[side],
      text: points === 0 ? "missed the target" : points === 3 ? "hit the postage stamp" : points === 2 ? "beat the wall" : "found the goal",
      points,
    });
    const other = (1 - side) as 0 | 1;
    next.kick = { n: next.log.length + 1, taker: next.taken[other] < 5 ? other : side };
    finishIfNeeded(next);
    return next;
  }
  if (next.game === "reflex" && next.dive && side === next.dive.taker && action.dir && typeof action.ms === "number") {
    const points = reflexPoint(next.dive.ball, action.dir, action.ms);
    next.scores[side] += points;
    next.taken[side] += 1;
    next.log.push({
      n: next.dive.n,
      name: next.names[side],
      text: points === 0 ? "let it past" : points === 2 ? "got a strong hand to it" : "saved it",
      points,
    });
    const other = (1 - side) as 0 | 1;
    next.seed = (next.seed * 1103515245 + 12345) % 2147483647;
    next.dive = { n: next.log.length + 1, taker: next.taken[other] < 6 ? other : side, ball: dirFrom(next.seed + next.log.length) };
    finishIfNeeded(next);
  }
  return next;
}

export function rivalChoice(state: DuelState, roll = Math.random()): { dir: Dir; power: number; ms: number } {
  const dir = DIRS[Math.floor(roll * 3) % 3] ?? "C";
  const power = 48 + Math.floor(roll * 42);
  const ms = 280 + Math.floor(roll * 500);
  if (state.game === "freekicks") return { dir, power: 36 + Math.floor(roll * 32), ms };
  return { dir, power, ms };
}

export function viewDuel(state: DuelState, you: 0 | 1 = 0): DuelView {
  let role: DuelView["role"] = "wait";
  let ball: Dir | null = null;
  if (state.done) role = "done";
  else if (state.pen) role = state.pen.shooter === you ? (state.pen.shot ? "wait" : "shoot") : state.pen.save ? "wait" : "keep";
  else if (state.kick) role = state.kick.taker === you ? "shoot" : "wait";
  else if (state.dive) {
    role = state.dive.taker === you ? "dive" : "wait";
    if (state.dive.taker === you) ball = state.dive.ball;
  }
  const winner = state.winner === "draw" ? "draw" : state.winner === you ? "you" : state.winner === null ? null : "them";
  const headline = state.done
    ? winner === "you"
      ? "You won"
      : winner === "them"
        ? `${state.names[1 - you]} won`
        : "Drawn"
    : role === "shoot"
      ? "Your strike"
      : role === "keep"
        ? "Pick a dive"
        : role === "dive"
          ? "Dive"
          : `${state.names[state.pen?.shooter ?? state.kick?.taker ?? state.dive?.taker ?? (1 - you)]} is playing`;
  return {
    game: state.game,
    you,
    opponent: state.names[1 - you],
    scores: you === 0 ? state.scores : [state.scores[1], state.scores[0]],
    log: state.log,
    role,
    ball,
    done: state.done,
    winner,
    headline,
  };
}
