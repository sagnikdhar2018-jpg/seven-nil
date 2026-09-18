import { bestSlot, emptySlotsFor, makeSlots } from "./formations";
import { ALL_PLAYERS, otherYears, randomSquad } from "./squads";
import type { FormationId, PoolId, Slot, Squad } from "./types";

export function filledCount(slots: Slot[]) {
  return slots.filter((s) => s.player).length;
}

export function drawLegal(
  slots: Slot[],
  history: string[],
  claimed: string[] = [],
  pool: PoolId = "world",
) {
  const taken = new Set(claimed);
  for (let i = 0; i < 48; i++) {
    const squad = randomSquad(history, pool);
    const remaining = squad.players.filter(
      (p) => !taken.has(p.id) && emptySlotsFor(slots, p.pos).length > 0,
    );
    if (remaining.length > 0) {
      return { squad, remaining, history: [...history, squad.id] };
    }
  }
  const squad = randomSquad(history, pool);
  return {
    squad,
    remaining: squad.players.filter((p) => !taken.has(p.id)),
    history: [...history, squad.id],
  };
}

export function canDrawSameTeam(squad: Squad, history: string[], pool: PoolId = "world") {
  return otherYears(squad, history, pool).length > 0;
}

export function drawSameTeam(
  slots: Slot[],
  history: string[],
  current: Squad,
  claimed: string[] = [],
  pool: PoolId = "world",
) {
  const options = otherYears(current, history, pool);
  if (options.length === 0) return null;
  const taken = new Set(claimed);
  const shuffled = options.slice().sort(() => Math.random() - 0.5);
  for (const squad of shuffled) {
    const remaining = squad.players.filter(
      (p) => !taken.has(p.id) && emptySlotsFor(slots, p.pos).length > 0,
    );
    if (remaining.length > 0) {
      return { squad, remaining, history: [...history, squad.id] };
    }
  }
  const squad = shuffled[0]!;
  return {
    squad,
    remaining: squad.players.filter((p) => !taken.has(p.id)),
    history: [...history, squad.id],
  };
}

export function autoFillXi(formation: FormationId, claimed: string[]): { slots: Slot[]; claimed: string[] } {
  const taken = new Set(claimed);
  const slots = makeSlots(formation);
  const pool = [...ALL_PLAYERS].sort((a, b) => b.ovr - a.ovr);
  for (const slot of slots) {
    const pick = pool.find((p) => !taken.has(p.id) && emptySlotsFor([slot], p.pos).length > 0);
    if (!pick) continue;
    slot.player = pick;
    taken.add(pick.id);
  }
  return { slots, claimed: [...taken] };
}

export function cpuPickOne(slots: Slot[], claimed: string[], history: string[]): {
  slots: Slot[];
  claimed: string[];
  history: string[];
} {
  const next = drawLegal(slots, history, claimed);
  const best = next.remaining.slice().sort((a, b) => b.ovr - a.ovr)[0];
  if (!best) return { slots, claimed, history: next.history };
  const slot = bestSlot(slots, best.pos);
  if (!slot) return { slots, claimed, history: next.history };
  return {
    slots: slots.map((s) => (s.id === slot.id ? { ...s, player: best } : s)),
    claimed: [...claimed, best.id],
    history: next.history,
  };
}
