import type { FormationId, Pos, Slot, StyleId } from "./types";

export const FORMATIONS: FormationId[] = [
  "4-3-3",
  "4-4-2",
  "4-2-3-1",
  "4-1-4-1",
  "4-3-1-2",
  "4-4-1-1",
  "4-2-2-2",
  "4-2-4",
  "4-5-1",
  "3-4-3",
  "3-4-2-1",
  "3-5-2",
  "5-3-2",
  "5-4-1",
];

export const STYLES: { id: StyleId; label: string }[] = [
  { id: "defensive", label: "Defensive" },
  { id: "counter", label: "Counter" },
  { id: "balanced", label: "Balanced" },
  { id: "press", label: "Press" },
  { id: "attacking", label: "Attacking" },
];

type SlotDef = { pos: Pos; x: number; y: number };

const SHAPES: Record<FormationId, SlotDef[]> = {
  "4-3-3": [
    { pos: "GK", x: 50, y: 90 },
    { pos: "RB", x: 82, y: 70 },
    { pos: "CB", x: 62, y: 76 },
    { pos: "CB", x: 38, y: 76 },
    { pos: "LB", x: 18, y: 70 },
    { pos: "CM", x: 70, y: 48 },
    { pos: "CM", x: 50, y: 54 },
    { pos: "CM", x: 30, y: 48 },
    { pos: "RW", x: 80, y: 22 },
    { pos: "ST", x: 50, y: 14 },
    { pos: "LW", x: 20, y: 22 },
  ],
  "4-4-2": [
    { pos: "GK", x: 50, y: 90 },
    { pos: "RB", x: 82, y: 70 },
    { pos: "CB", x: 62, y: 76 },
    { pos: "CB", x: 38, y: 76 },
    { pos: "LB", x: 18, y: 70 },
    { pos: "RM", x: 82, y: 44 },
    { pos: "CM", x: 60, y: 50 },
    { pos: "CM", x: 40, y: 50 },
    { pos: "LM", x: 18, y: 44 },
    { pos: "ST", x: 62, y: 16 },
    { pos: "ST", x: 38, y: 16 },
  ],
  "4-2-3-1": [
    { pos: "GK", x: 50, y: 90 },
    { pos: "RB", x: 82, y: 70 },
    { pos: "CB", x: 62, y: 76 },
    { pos: "CB", x: 38, y: 76 },
    { pos: "LB", x: 18, y: 70 },
    { pos: "DM", x: 62, y: 58 },
    { pos: "DM", x: 38, y: 58 },
    { pos: "RW", x: 80, y: 32 },
    { pos: "AM", x: 50, y: 36 },
    { pos: "LW", x: 20, y: 32 },
    { pos: "ST", x: 50, y: 14 },
  ],
  "4-2-4": [
    { pos: "GK", x: 50, y: 90 },
    { pos: "RB", x: 82, y: 70 },
    { pos: "CB", x: 62, y: 76 },
    { pos: "CB", x: 38, y: 76 },
    { pos: "LB", x: 18, y: 70 },
    { pos: "CM", x: 62, y: 50 },
    { pos: "CM", x: 38, y: 50 },
    { pos: "RW", x: 82, y: 22 },
    { pos: "ST", x: 62, y: 14 },
    { pos: "ST", x: 38, y: 14 },
    { pos: "LW", x: 18, y: 22 },
  ],
  "4-1-4-1": [
    { pos: "GK", x: 50, y: 90 },
    { pos: "RB", x: 82, y: 72 },
    { pos: "CB", x: 62, y: 78 },
    { pos: "CB", x: 38, y: 78 },
    { pos: "LB", x: 18, y: 72 },
    { pos: "DM", x: 50, y: 58 },
    { pos: "RM", x: 84, y: 40 },
    { pos: "CM", x: 64, y: 46 },
    { pos: "CM", x: 36, y: 46 },
    { pos: "LM", x: 16, y: 40 },
    { pos: "ST", x: 50, y: 14 },
  ],
  "4-3-1-2": [
    { pos: "GK", x: 50, y: 90 },
    { pos: "RB", x: 82, y: 72 },
    { pos: "CB", x: 62, y: 78 },
    { pos: "CB", x: 38, y: 78 },
    { pos: "LB", x: 18, y: 72 },
    { pos: "CM", x: 28, y: 52 },
    { pos: "CM", x: 50, y: 58 },
    { pos: "CM", x: 72, y: 52 },
    { pos: "AM", x: 50, y: 32 },
    { pos: "ST", x: 36, y: 14 },
    { pos: "ST", x: 64, y: 14 },
  ],
  "4-4-1-1": [
    { pos: "GK", x: 50, y: 90 },
    { pos: "RB", x: 82, y: 72 },
    { pos: "CB", x: 62, y: 78 },
    { pos: "CB", x: 38, y: 78 },
    { pos: "LB", x: 18, y: 72 },
    { pos: "RM", x: 84, y: 46 },
    { pos: "CM", x: 62, y: 52 },
    { pos: "CM", x: 38, y: 52 },
    { pos: "LM", x: 16, y: 46 },
    { pos: "AM", x: 50, y: 30 },
    { pos: "ST", x: 50, y: 14 },
  ],
  "4-2-2-2": [
    { pos: "GK", x: 50, y: 90 },
    { pos: "RB", x: 82, y: 72 },
    { pos: "CB", x: 62, y: 78 },
    { pos: "CB", x: 38, y: 78 },
    { pos: "LB", x: 18, y: 72 },
    { pos: "DM", x: 38, y: 56 },
    { pos: "DM", x: 62, y: 56 },
    { pos: "AM", x: 30, y: 34 },
    { pos: "AM", x: 70, y: 34 },
    { pos: "ST", x: 38, y: 14 },
    { pos: "ST", x: 62, y: 14 },
  ],
  "3-5-2": [
    { pos: "GK", x: 50, y: 90 },
    { pos: "CB", x: 72, y: 74 },
    { pos: "CB", x: 50, y: 78 },
    { pos: "CB", x: 28, y: 74 },
    { pos: "RWB", x: 88, y: 48 },
    { pos: "CM", x: 66, y: 50 },
    { pos: "CM", x: 50, y: 56 },
    { pos: "CM", x: 34, y: 50 },
    { pos: "LWB", x: 12, y: 48 },
    { pos: "ST", x: 62, y: 16 },
    { pos: "ST", x: 38, y: 16 },
  ],
  "5-3-2": [
    { pos: "GK", x: 50, y: 90 },
    { pos: "RWB", x: 88, y: 62 },
    { pos: "CB", x: 68, y: 76 },
    { pos: "CB", x: 50, y: 80 },
    { pos: "CB", x: 32, y: 76 },
    { pos: "LWB", x: 12, y: 62 },
    { pos: "CM", x: 68, y: 44 },
    { pos: "CM", x: 50, y: 48 },
    { pos: "CM", x: 32, y: 44 },
    { pos: "ST", x: 62, y: 16 },
    { pos: "ST", x: 38, y: 16 },
  ],
  "4-5-1": [
    { pos: "GK", x: 50, y: 90 },
    { pos: "RB", x: 82, y: 70 },
    { pos: "CB", x: 62, y: 76 },
    { pos: "CB", x: 38, y: 76 },
    { pos: "LB", x: 18, y: 70 },
    { pos: "RM", x: 84, y: 42 },
    { pos: "CM", x: 64, y: 50 },
    { pos: "CM", x: 50, y: 56 },
    { pos: "CM", x: 36, y: 50 },
    { pos: "LM", x: 16, y: 42 },
    { pos: "ST", x: 50, y: 14 },
  ],
  "3-4-3": [
    { pos: "GK", x: 50, y: 90 },
    { pos: "CB", x: 72, y: 74 },
    { pos: "CB", x: 50, y: 78 },
    { pos: "CB", x: 28, y: 74 },
    { pos: "RM", x: 84, y: 46 },
    { pos: "CM", x: 62, y: 52 },
    { pos: "CM", x: 38, y: 52 },
    { pos: "LM", x: 16, y: 46 },
    { pos: "RW", x: 78, y: 20 },
    { pos: "ST", x: 50, y: 14 },
    { pos: "LW", x: 22, y: 20 },
  ],
  "3-4-2-1": [
    { pos: "GK", x: 50, y: 90 },
    { pos: "CB", x: 72, y: 76 },
    { pos: "CB", x: 50, y: 80 },
    { pos: "CB", x: 28, y: 76 },
    { pos: "RM", x: 86, y: 50 },
    { pos: "CM", x: 62, y: 56 },
    { pos: "CM", x: 38, y: 56 },
    { pos: "LM", x: 14, y: 50 },
    { pos: "AM", x: 64, y: 30 },
    { pos: "AM", x: 36, y: 30 },
    { pos: "ST", x: 50, y: 14 },
  ],
  "5-4-1": [
    { pos: "GK", x: 50, y: 90 },
    { pos: "RWB", x: 88, y: 64 },
    { pos: "CB", x: 68, y: 76 },
    { pos: "CB", x: 50, y: 80 },
    { pos: "CB", x: 32, y: 76 },
    { pos: "LWB", x: 12, y: 64 },
    { pos: "RM", x: 80, y: 42 },
    { pos: "CM", x: 60, y: 48 },
    { pos: "CM", x: 40, y: 48 },
    { pos: "LM", x: 20, y: 42 },
    { pos: "ST", x: 50, y: 14 },
  ],
};

const COMPAT: Record<Pos, Pos[]> = {
  GK: ["GK"],
  CB: ["CB"],
  RB: ["RB", "RWB", "CB"],
  LB: ["LB", "LWB", "CB"],
  RWB: ["RWB", "RB", "RM"],
  LWB: ["LWB", "LB", "LM"],
  DM: ["DM", "CM"],
  CM: ["CM", "DM", "AM"],
  AM: ["AM", "CM", "ST"],
  RM: ["RM", "RW", "RWB"],
  LM: ["LM", "LW", "LWB"],
  RW: ["RW", "RM", "AM"],
  LW: ["LW", "LM", "AM"],
  ST: ["ST", "AM"],
};

export function styledSpot(x: number, y: number, pos: Pos, style: StyleId): { x: number; y: number } {
  const clampN = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
  if (style === "balanced" || pos === "GK") return { x, y };
  if (style === "defensive") {
    const drop = y < 36 ? 11 : y < 62 ? 7 : 3;
    return { x, y: clampN(y + drop, 8, 92) };
  }
  if (style === "attacking") {
    const push = y > 68 ? 7 : 11;
    return { x, y: clampN(y - push, 8, 92) };
  }
  if (style === "press") {
    const push = y > 64 ? 11 : 5;
    return { x, y: clampN(y - push, 8, 92) };
  }
  const tuck = x < 48 ? 7 : x > 52 ? -7 : 0;
  const drop = y < 28 ? -4 : 8;
  return { x: clampN(x + tuck, 8, 92), y: clampN(y + drop, 8, 92) };
}

export function makeSlots(formation: FormationId): Slot[] {
  return SHAPES[formation].map((slot, index) => ({
    id: `${formation}-${index}`,
    pos: slot.pos,
    x: slot.x,
    y: slot.y,
    player: null,
  }));
}

export function canFill(slotPos: Pos, playerPos: Pos[]): boolean {
  return playerPos.some((pos) => COMPAT[slotPos].includes(pos));
}

export function emptySlotsFor(slots: Slot[], playerPos: Pos[]): Slot[] {
  return slots.filter((slot) => !slot.player && canFill(slot.pos, playerPos));
}

const SCARCITY: Pos[] = ["GK", "RB", "LB", "RWB", "LWB", "CB", "DM", "CM", "AM", "RM", "LM", "RW", "LW", "ST"];

export function bestSlot(slots: Slot[], playerPos: Pos[]): Slot | null {
  const open = emptySlotsFor(slots, playerPos);
  if (open.length === 0) return null;
  return [...open].sort((a, b) => SCARCITY.indexOf(a.pos) - SCARCITY.indexOf(b.pos))[0] ?? null;
}

export const DEF_POS: Pos[] = ["GK", "RB", "CB", "LB", "RWB", "LWB"];
export const MID_POS: Pos[] = ["DM", "CM", "AM", "RM", "LM"];
export const ATT_POS: Pos[] = ["RW", "LW", "ST"];
