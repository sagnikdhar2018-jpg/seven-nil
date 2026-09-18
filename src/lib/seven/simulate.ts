import { ATT_POS, DEF_POS, MID_POS } from "./formations";
import type { Campaign, Match, Player, PoolId, Slot, StyleId } from "./types";

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

export function teamAxes(slots: Slot[], style: StyleId): Axis {
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
  } else if (style === "defensive") {
    def += 3.4;
    att -= 2.2;
  }
  return {
    attack: att,
    midfield,
    defence: def,
    gk,
  };
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

function playMatch(
  us: Axis,
  them: { name: string; att: number; mid: number; def: number; gk: number },
  round: string,
): Match {
  const ourChance = (us.attack + us.midfield * 0.35 - them.def * 0.7 - them.gk * 0.25) / 18;
  const theirChance = (them.att + them.mid * 0.3 - us.defence * 0.7 - us.gk * 0.25) / 18;
  const gf = clamp(poisson(clamp(1.15 + ourChance, 0.15, 4.4)), 0, 8);
  const ga = clamp(poisson(clamp(1.05 + theirChance, 0.1, 4.1)), 0, 8);
  const result: Match["result"] = gf > ga ? "W" : gf === ga ? "D" : "L";
  return { round, opponent: them.name, gf, ga, result };
}

function pickOpponents(count: number, pool: PoolId = "world") {
  const copy = [...(pool === "club" ? CLUB_OPPONENTS : OPPONENTS)];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy.slice(0, count);
}

export function simulateCampaign(slots: Slot[], style: StyleId, pool: PoolId = "world"): Campaign {
  const axes = teamAxes(slots, style);
  const foes = pickOpponents(8, pool);
  const matches: Match[] = [];
  const groupLabel = pool === "club" ? "League phase" : "Group";

  const group = foes.slice(0, 3);
  for (const opp of group) {
    matches.push(playMatch(axes, opp, groupLabel));
  }

  let pts = 0;
  let gf = 0;
  let ga = 0;
  let won = 0;
  let drawn = 0;
  let lost = 0;
  for (const m of matches) {
    gf += m.gf;
    ga += m.ga;
    if (m.result === "W") {
      pts += 3;
      won += 1;
    } else if (m.result === "D") {
      pts += 1;
      drawn += 1;
    } else lost += 1;
  }

  let exit = pool === "club" ? "League phase" : "Group stage";
  let champion = false;
  const qualify = pts >= 5 || (pts >= 4 && gf - ga >= 0);
  const knock = [
    { round: "Round of 16", opp: foes[3]! },
    { round: "Quarter-final", opp: foes[4]! },
    { round: "Semi-final", opp: foes[5]! },
    { round: "Final", opp: foes[6]! },
  ];

  if (qualify) {
    for (const step of knock) {
      const match = playMatch(axes, step.opp, step.round);
      matches.push(match);
      gf += match.gf;
      ga += match.ga;
      if (match.result === "W") {
        won += 1;
        pts += 3;
        exit = step.round;
        if (step.round === "Final") {
          champion = true;
          exit = "Champions";
        }
      } else if (match.result === "D") {
        drawn += 1;
        const pens = Math.random() < 0.5 + (axes.gk - 80) / 80;
        if (!pens) {
          lost += 1;
          exit = `${step.round} (pens)`;
          break;
        }
        won += 1;
        match.result = "W";
        exit = step.round;
        if (step.round === "Final") {
          champion = true;
          exit = "Champions (pens)";
        }
      } else {
        lost += 1;
        exit = step.round;
        break;
      }
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
    drawn,
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
): Match {
  const their = teamAxes(them, styleThem);
  const match = playMatch(
    teamAxes(us, styleUs),
    { name: themName, att: their.attack, mid: their.midfield, def: their.defence, gk: their.gk },
    "Cup Final",
  );
  if (match.result === "D") {
    const edge = teamAxes(us, styleUs).gk - their.gk;
    match.result = Math.random() < 0.5 + edge / 80 ? "W" : "L";
  }
  return match;
}

export type BracketGame = {
  round: string;
  home: string;
  away: string;
  gf: number;
  ga: number;
  winner: string;
};

export function simulateKnockout(
  teams: { name: string; slots: Slot[]; style: StyleId }[],
): { games: BracketGame[]; champion: string } {
  const roundName = (n: number) =>
    n === 2 ? "Final" : n === 4 ? "Semi-final" : n === 8 ? "Quarter-final" : "Round of 16";
  let live = [...teams];
  const games: BracketGame[] = [];
  while (live.length >= 2) {
    const next: typeof live = [];
    const label = roundName(live.length);
    for (let i = 0; i < live.length; i += 2) {
      const home = live[i]!;
      const away = live[i + 1]!;
      const match = simulateFinal(home.slots, away.slots, home.style, away.style, away.name);
      match.round = label;
      const homeWins = match.result === "W";
      games.push({
        round: label,
        home: home.name,
        away: away.name,
        gf: match.gf,
        ga: match.ga,
        winner: homeWins ? home.name : away.name,
      });
      next.push(homeWins ? home : away);
    }
    live = next;
  }
  return { games, champion: live[0]?.name ?? teams[0]!.name };
}
