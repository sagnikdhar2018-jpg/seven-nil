import { ATT_POS, DEF_POS, MID_POS } from "./formations";
import { autoFillFrom } from "./draft";
import { takenKeysFromSlots } from "./person";
import { playersForSide } from "./squads";
import { bracketSeeds, teamRank } from "./rankings";
import type { Campaign, Match, MatchGoal, PenKick, Player, PlayerRating, PoolId, Slot, StyleId, TeamRatings } from "./types";

const OPPONENTS = [
  { name: "Brazil", att: 91, mid: 88, def: 86, gk: 88 },
  { name: "Argentina", att: 90, mid: 87, def: 84, gk: 88 },
  { name: "France", att: 89, mid: 88, def: 86, gk: 87 },
  { name: "Germany", att: 86, mid: 88, def: 88, gk: 90 },
  { name: "Spain", att: 86, mid: 92, def: 84, gk: 86 },
  { name: "Italy", att: 82, mid: 86, def: 90, gk: 92 },
  { name: "England", att: 86, mid: 84, def: 84, gk: 84 },
  { name: "Netherlands", att: 88, mid: 87, def: 82, gk: 82 },
  { name: "Portugal", att: 88, mid: 85, def: 83, gk: 84 },
  { name: "Croatia", att: 82, mid: 90, def: 82, gk: 83 },
  { name: "Uruguay", att: 86, mid: 80, def: 84, gk: 84 },
  { name: "Belgium", att: 88, mid: 88, def: 82, gk: 90 },
  { name: "Morocco", att: 80, mid: 82, def: 84, gk: 85 },
  { name: "Japan", att: 80, mid: 82, def: 80, gk: 80 },
  { name: "USA", att: 80, mid: 81, def: 80, gk: 83 },
  { name: "Colombia", att: 84, mid: 82, def: 80, gk: 82 },
  { name: "Mexico", att: 80, mid: 80, def: 81, gk: 82 },
  { name: "Senegal", att: 82, mid: 80, def: 80, gk: 81 },
];

const CLUB_OPPONENTS = [
  { name: "Real Madrid", att: 90, mid: 88, def: 86, gk: 88 },
  { name: "Barcelona", att: 90, mid: 90, def: 84, gk: 86 },
  { name: "Bayern Munich", att: 88, mid: 86, def: 86, gk: 90 },
  { name: "Liverpool", att: 88, mid: 86, def: 84, gk: 86 },
  { name: "AC Milan", att: 86, mid: 86, def: 90, gk: 86 },
  { name: "Inter", att: 86, mid: 86, def: 88, gk: 86 },
  { name: "Juventus", att: 84, mid: 86, def: 88, gk: 88 },
  { name: "Manchester City", att: 90, mid: 88, def: 84, gk: 86 },
  { name: "Manchester United", att: 86, mid: 84, def: 84, gk: 86 },
  { name: "Chelsea", att: 86, mid: 84, def: 86, gk: 88 },
  { name: "Arsenal", att: 86, mid: 86, def: 82, gk: 84 },
  { name: "Dortmund", att: 86, mid: 84, def: 82, gk: 82 },
  { name: "Atlético Madrid", att: 82, mid: 84, def: 88, gk: 86 },
  { name: "PSG", att: 90, mid: 84, def: 80, gk: 84 },
  { name: "Napoli", att: 86, mid: 84, def: 82, gk: 82 },
  { name: "Ajax", att: 84, mid: 86, def: 80, gk: 80 },
];

export type Axis = { attack: number; midfield: number; defence: number; gk: number };

function avg(nums: number[], fallback: number) {
  if (!nums.length) return fallback;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function teamAxes(slots: Slot[], style: StyleId, boost?: { att: number; def: number }): Axis {
  const filled = slots.filter((s) => s.player) as (Slot & { player: Player })[];
  const attack = avg(
    filled.filter((s) => ATT_POS.includes(s.pos)).map((s) => s.player.ovr),
    78,
  );
  const midfield = avg(
    filled.filter((s) => MID_POS.includes(s.pos)).map((s) => s.player.ovr),
    78,
  );
  const defence = avg(
    filled.filter((s) => DEF_POS.includes(s.pos) && s.pos !== "GK").map((s) => s.player.ovr),
    78,
  );
  const gk = filled.find((s) => s.pos === "GK")?.player.ovr ?? 78;
  const balancePenalty = filled.length < 11 ? (11 - filled.length) * 2.5 : 0;
  let att = attack + midfield * 0.28 - balancePenalty;
  let def = defence + gk * 0.35 + midfield * 0.18 - balancePenalty;
  if (style === "attacking") {
    att += 3.4;
    def -= 2.2;
  } else if (style === "press") {
    att += 2.6;
    def -= 1.5;
  } else if (style === "defensive") {
    def += 3.4;
    att -= 2.2;
  } else if (style === "counter") {
    def += 2.2;
    att += 1.4;
  }
  if (boost) {
    att += boost.att;
    def += boost.def;
  }
  return {
    attack: att,
    midfield,
    defence: def,
    gk,
  };
}

export function chemistry(slots: Slot[]): number {
  const filled = slots.filter((slot): slot is Slot & { player: Player } => Boolean(slot.player));
  if (filled.length < 2) return 62;
  let link = 0;
  let pairs = 0;
  for (let i = 0; i < filled.length; i++) {
    for (let j = i + 1; j < filled.length; j++) {
      pairs += 1;
      const a = filled[i]!.player;
      const b = filled[j]!.player;
      let bond = 0;
      if (a.nation === b.nation) bond += 0.6;
      if (a.nation === b.nation && Math.abs(a.year - b.year) <= 2) bond += 0.4;
      link += Math.min(1, bond);
    }
  }
  const together = pairs ? link / pairs : 0;
  const fit =
    filled.reduce((sum, slot) => sum + (slot.player.pos.includes(slot.pos) ? 1 : 0.4), 0) / filled.length;
  return Math.round(together * 70 + fit * 30);
}

function sideQuality(
  slots: Slot[],
  style: StyleId,
  fallback?: { att: number; mid: number; def: number; gk: number },
  name?: string,
) {
  const hasPlayers = slots.some((slot) => slot.player);
  const ovr = hasPlayers
    ? displayRatings(slots, style).ovr
    : fallback
      ? (fallback.att + fallback.mid + fallback.def + fallback.gk) / 4
      : 78;
  const chem = hasPlayers ? chemistry(slots) : 76;
  let quality = ovr * 0.74 + chem * 0.26;
  const rank = name ? teamRank(name) : null;
  if (rank) quality += Math.max(0, (18 - rank) * 0.12);
  if (style === "attacking") quality += 1.1;
  else if (style === "press") quality += 0.7;
  else if (style === "counter") quality += 0.8;
  else if (style === "defensive") quality += 0.4;
  return quality;
}

function swing(gap: number) {
  const room = Math.max(0.22, 0.72 - Math.abs(gap) * 0.28);
  return (Math.random() + Math.random() + Math.random() - 1.5) * room;
}

export function displayRatings(slots: Slot[], _style: StyleId): TeamRatings {
  const filled = slots.filter((s): s is Slot & { player: Player } => Boolean(s.player));
  const mean = (rows: typeof filled) =>
    rows.length ? rows.reduce((sum, slot) => sum + slot.player.ovr, 0) / rows.length : null;
  const all = mean(filled);
  const atk = mean(filled.filter((slot) => ATT_POS.includes(slot.pos)));
  const mid = mean(filled.filter((slot) => MID_POS.includes(slot.pos)));
  const def = mean(filled.filter((slot) => DEF_POS.includes(slot.pos) && slot.pos !== "GK"));
  const show = (n: number | null) => Math.max(1, Math.min(99, Math.round(n ?? all ?? 1)));
  return { ovr: show(all), atk: show(atk), mid: show(mid), def: show(def) };
}

export function clampRatings(atk: number, mid: number, def: number): TeamRatings {
  const cap = (n: number) => Math.max(1, Math.min(99, Math.round(n)));
  const A = cap(atk);
  const M = cap(mid);
  const D = cap(def);
  return { ovr: cap((A + M + D) / 3), atk: A, mid: M, def: D };
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function poisson(lambda: number) {
  const L = Math.exp(-Math.max(lambda, 0.05));
  let k = 0;
  let p = 1;
  do {
    k += 1;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

function lastName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] ?? name;
}

function scorers(slots: Slot[], fallback: string) {
  const weighted: string[] = [];
  for (const slot of slots) {
    if (!slot.player || slot.pos === "GK") continue;
    const weight =
      (slot.pos === "ST" ? 6 : slot.pos === "RW" || slot.pos === "LW" ? 4 : slot.pos === "AM" ? 3 : MID_POS.includes(slot.pos) ? 2 : 1) *
      Math.max(1, Math.round((slot.player.ovr - 68) / 10));
    const name = lastName(slot.player.name);
    for (let i = 0; i < weight; i++) weighted.push(name);
  }
  return weighted.length ? weighted : [fallback];
}

function uniqueMinutes(count: number) {
  const mins: number[] = [];
  let guard = 0;
  while (mins.length < count && guard < 80) {
    guard += 1;
    const m = 7 + Math.floor(Math.random() * 83);
    if (!mins.includes(m)) mins.push(m);
  }
  return mins.sort((a, b) => a - b);
}

function scriptGoals(gf: number, ga: number, homeSlots: Slot[], awaySlots: Slot[], awayName = "Away"): MatchGoal[] {
  const home = scorers(homeSlots, "Home");
  const away = scorers(awaySlots, awayName);
  const goals: MatchGoal[] = [];
  for (const minute of uniqueMinutes(gf)) {
    goals.push({ minute, side: "home", scorer: home[Math.floor(Math.random() * home.length)]! });
  }
  for (const minute of uniqueMinutes(ga)) {
    goals.push({ minute, side: "away", scorer: away[Math.floor(Math.random() * away.length)]! });
  }
  return goals.sort((a, b) => a.minute - b.minute);
}

function takers(slots: Slot[], fallback: string) {
  const out = slots
    .filter((s) => s.player && s.pos !== "GK")
    .map((s) => ({ name: lastName(s.player!.name), ovr: s.player!.ovr }));
  if (!out.length) return [{ name: fallback, ovr: 78 }];
  out.sort((a, b) => b.ovr - a.ovr);
  for (let i = 0; i < out.length - 1; i++) {
    if (Math.random() < 0.22) {
      const swap = out[i]!;
      out[i] = out[i + 1]!;
      out[i + 1] = swap;
    }
  }
  return out;
}

export function scriptPens(homeSlots: Slot[], awaySlots: Slot[], homeBias = 0) {
  const homeT = takers(homeSlots, "Home");
  const awayT = takers(awaySlots, "Away");
  const kicks: PenKick[] = [];
  let home = 0;
  let away = 0;
  let hi = 0;
  let ai = 0;

  const kick = (side: "home" | "away") => {
    const list = side === "home" ? homeT : awayT;
    const idx = side === "home" ? hi++ : ai++;
    const taker = list[idx % list.length]!;
    const bias = side === "home" ? homeBias : -homeBias;
    const p = clamp(0.68 + (taker.ovr - 78) / 140 + bias / 160, 0.4, 0.9);
    const scored = Math.random() < p;
    kicks.push({ side, taker: taker.name, scored });
    if (scored) {
      if (side === "home") home += 1;
      else away += 1;
    }
  };

  for (let round = 0; round < 5; round++) {
    kick("home");
    if (home > away + (5 - round)) break;
    kick("away");
    const left = 5 - (round + 1);
    if (home > away + left || away > home + left) break;
  }
  let guard = 0;
  while (home === away && guard < 10) {
    kick("home");
    kick("away");
    guard += 1;
  }
  return { home, away, kicks };
}

function ratePlayers(homeSlots: Slot[], awaySlots: Slot[], goals: MatchGoal[], kicks: PenKick[], ga: number, gf: number): PlayerRating[] {
  const goalsFor = (side: "home" | "away", name: string) =>
    goals.filter((g) => g.side === side && g.scorer === lastName(name)).length;

  const sideRows = (slots: Slot[], side: "home" | "away", conceded: number) =>
    slots
      .filter((s) => s.player)
      .map((s) => {
        const player = s.player!;
        const scored = goalsFor(side, player.name);
        const pen = kicks.find((k) => k.side === side && k.taker === lastName(player.name));
        let rating = 6.15 + (player.ovr - 75) * 0.04 + (Math.random() - 0.45) * 0.55;
        rating += scored * 0.85;
        if (pen?.scored) rating += 0.35;
        if (pen && !pen.scored) rating -= 0.6;
        if (s.pos === "GK") rating += conceded === 0 ? 0.75 : conceded >= 3 ? -0.45 : 0;
        rating = clamp(rating, 4.2, 10);
        return {
          name: player.name,
          side,
          pos: s.pos,
          rating: Math.round(rating * 10) / 10,
          goals: scored,
        };
      });

  return [...sideRows(homeSlots, "home", ga), ...sideRows(awaySlots, "away", gf)].sort((a, b) => b.rating - a.rating);
}

function playMatch(
  us: Axis,
  them: { name: string; att: number; mid: number; def: number; gk: number },
  round: string,
  homeSlots: Slot[] = [],
  awaySlots: Slot[] = [],
  homeName = "You",
  homeStyle: StyleId = "balanced",
  awayStyle: StyleId = "balanced",
): Match {
  const usQ = sideQuality(
    homeSlots,
    homeStyle,
    { att: us.attack, mid: us.midfield, def: us.defence, gk: us.gk },
    homeName,
  );
  const themQ = sideQuality(awaySlots, awayStyle, them, them.name);
  const gap = (usQ - themQ) / 11;
  const gf = clamp(poisson(clamp(1.05 + gap * 0.85 + swing(gap), 0.2, 4.2)), 0, 7);
  const ga = clamp(poisson(clamp(0.95 - gap * 0.85 + swing(gap), 0.15, 4.0)), 0, 7);
  const result: Match["result"] = gf > ga ? "W" : gf === ga ? "D" : "L";
  return {
    round,
    opponent: them.name,
    home: homeName,
    away: them.name,
    gf,
    ga,
    result,
    goals: scriptGoals(gf, ga, homeSlots, awaySlots, them.name),
    homeRatings: homeSlots.some((slot) => slot.player)
      ? displayRatings(homeSlots, "balanced")
      : clampRatings(us.attack, us.midfield, us.defence),
    awayRatings: clampRatings(them.att, them.mid, them.def),
  };
}

function pickOpponents(count: number, pool: PoolId = "world") {
  const copy = [...(pool === "club" ? CLUB_OPPONENTS : OPPONENTS)];
  const strength = (row: (typeof copy)[number]) => {
    const rank = teamRank(row.name, pool);
    const rated = (row.att + row.mid + row.def + row.gk) / 4;
    return rated + (rank ? (24 - rank) * 0.35 : 0) + Math.random() * 1.6;
  };
  copy.sort((a, b) => strength(a) - strength(b));
  if (copy.length <= count) return copy;
  const picked: typeof copy = [];
  const used = new Set<number>();
  for (let i = 0; i < count; i++) {
    let at = Math.round((i * (copy.length - 1)) / Math.max(1, count - 1));
    while (used.has(at) && at < copy.length - 1) at += 1;
    used.add(at);
    picked.push(copy[at]!);
  }
  return picked;
}

const KNOCKOUT = [
  "Round of 32",
  "Round of 16",
  "Quarter-final",
  "Semi-final",
  "Final",
] as const;

export function simulateCampaign(
  slots: Slot[],
  style: StyleId,
  pool: PoolId = "world",
  boost?: { att: number; def: number },
): Campaign {
  const axes = teamAxes(slots, style, boost);
  const foes = pickOpponents(5, pool);
  const matches: Match[] = [];
  const homeName = pool === "club" ? "Your XI" : "Your XI";

  let pts = 0;
  let gf = 0;
  let ga = 0;
  let won = 0;
  let lost = 0;
  let exit = "Round of 32";
  let champion = false;

  for (let i = 0; i < KNOCKOUT.length; i++) {
    const round = KNOCKOUT[i]!;
    const opp = foes[i]!;
    const nation = playersForSide(opp.name, pool);
    const oppXi = autoFillFrom("4-3-3", takenKeysFromSlots(slots), nation);
    const match = playMatch(axes, opp, round, slots, oppXi.slots, homeName, style, "balanced");
    if (oppXi.slots.some((slot) => slot.player)) {
      match.awayRatings = displayRatings(oppXi.slots, "balanced");
    }
    if (match.result === "D") {
      const edge = (sideQuality(slots, style) - sideQuality(oppXi.slots, "balanced", opp, opp.name)) / 22;
      const pens = Math.random() < clamp(0.5 + edge, 0.3, 0.74);
      match.result = pens ? "W" : "L";
      match.pens = pens ? { home: 5, away: 4 } : { home: 3, away: 4 };
    }
    matches.push(match);
    gf += match.gf;
    ga += match.ga;
    if (match.result === "W") {
      won += 1;
      pts += 3;
      exit = round;
      if (round === "Final") {
        champion = true;
        exit = match.pens ? "Champions (pens)" : "Champions";
      }
    } else {
      lost += 1;
      exit = match.pens ? `${round} (pens)` : round;
      break;
    }
  }

  const unbeaten = lost === 0;
  const cleanSheetRun = ga === 0;
  const sevenNilMatch = matches.some((m) => m.gf >= 7 && m.ga === 0);
  const dream = champion && unbeaten && cleanSheetRun;

  return {
    matches,
    played: matches.length,
    gf,
    ga,
    pts,
    won,
    drawn: 0,
    lost,
    champion,
    unbeaten,
    cleanSheetRun,
    sevenNilMatch,
    dream,
    exit,
    attack: Math.round(axes.attack),
    midfield: Math.round(axes.midfield),
    defence: Math.round(axes.defence),
  };
}

export function simulateFinal(
  us: Slot[],
  them: Slot[],
  styleUs: StyleId,
  styleThem: StyleId,
  themName = "Them",
  round = "Cup Final",
  usName = "Home",
  boostUs?: { att: number; def: number },
  boostThem?: { att: number; def: number },
): Match {
  const their = teamAxes(them, styleThem, boostThem);
  const match = playMatch(
    teamAxes(us, styleUs, boostUs),
    { name: themName, att: their.attack, mid: their.midfield, def: their.defence, gk: their.gk },
    round,
    us,
    them,
    usName,
    styleUs,
    styleThem,
  );
  if (match.result === "D") {
    const shot = scriptPens(us, them, sideQuality(us, styleUs) - sideQuality(them, styleThem));
    match.result = shot.home >= shot.away ? "W" : "L";
    match.pens = shot;
  }
  const ratings = ratePlayers(us, them, match.goals, match.pens?.kicks ?? [], match.ga, match.gf);
  match.ratings = ratings;
  const top = ratings[0];
  if (top) match.potm = { name: top.name, rating: top.rating, side: top.side };
  return match;
}

export type BracketGame = {
  round: string;
  home: string;
  away: string;
  gf: number;
  ga: number;
  winner: string;
  goals: MatchGoal[];
  pens?: { home: number; away: number; kicks?: PenKick[] };
  homeRatings?: TeamRatings;
  awayRatings?: TeamRatings;
  ratings?: PlayerRating[];
  potm?: { name: string; rating: number; side: "home" | "away" };
  instant?: boolean;
};

export function roundNameFor(size: number) {
  if (size <= 2) return "Final";
  if (size <= 4) return "Semi-final";
  if (size <= 8) return "Quarter-final";
  if (size <= 16) return "Round of 16";
  return "Round of 32";
}

export function simulateKnockout(
  teams: { name: string; slots: Slot[]; style: StyleId; human?: boolean; boost?: { att: number; def: number } }[],
): { games: BracketGame[]; champion: string } {
  let live = seedBracket(teams);
  const games: BracketGame[] = [];
  while (live.length >= 2) {
    const next: typeof live = [];
    const label = roundNameFor(live.length);
    for (let i = 0; i < live.length; i += 2) {
      const home = live[i]!;
      const away = live[i + 1]!;
      const match = simulateFinal(
        home.slots,
        away.slots,
        home.style,
        away.style,
        away.name,
        label,
        home.name,
        home.boost,
        away.boost,
      );
      const homeWins = match.result === "W";
      const winner = homeWins ? home : away;
      games.push({
        round: label,
        home: home.name,
        away: away.name,
        gf: match.gf,
        ga: match.ga,
        winner: winner.name,
        goals: match.goals,
        pens: match.pens,
        homeRatings: displayRatings(home.slots, home.style),
        awayRatings: displayRatings(away.slots, away.style),
        ratings: match.ratings,
        potm: match.potm,
        instant: !home.human && !away.human,
      });
      next.push({ ...winner, human: winner.human });
    }
    live = next;
  }
  return { games, champion: live[0]?.name ?? teams[0]!.name };
}

function seedBracket<T extends { name: string; slots: Slot[]; human?: boolean }>(teams: T[]) {
  const score = (team: T) => {
    if (team.human) {
      const filled = team.slots.filter((slot) => slot.player);
      const ovr = filled.length
        ? filled.reduce((sum, slot) => sum + slot.player!.ovr, 0) / filled.length
        : 80;
      return Math.round(Math.max(1, Math.min(40, 2 + (92 - ovr) * 1.15)));
    }
    return teamRank(team.name) ?? 36;
  };
  const sorted = [...teams].sort((a, b) => score(a) - score(b) || a.name.localeCompare(b.name));
  return bracketSeeds(sorted.length).map((seed) => ({
    ...sorted[seed - 1] ?? sorted[sorted.length - 1]!,
    human: Boolean((sorted[seed - 1] ?? sorted[sorted.length - 1]!).human),
  }));
}
