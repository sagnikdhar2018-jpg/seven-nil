import type {
  Campaign,
  DrawnSquad,
  FormationId,
  ModeId,
  Phase,
  Player,
  PoolId,
  Slot,
  StyleId,
} from "./types";

export type BoardSave = {
  formation: FormationId;
  phase: Phase;
  slots: Slot[];
  draw: DrawnSquad | null;
  rerolls: number;
  history: string[];
  selected: Player | null;
  campaign: Campaign | null;
  revealTo: number;
  coachId?: string | null;
};

export type SevenSave = {
  version: number;
  formation: FormationId;
  style: StyleId;
  mode: ModeId;
  theme: "panini" | "terrace";
  lastDreams: number;
  lastRuns: number;
  clubDreams: number;
  clubRuns: number;
  boards: Partial<Record<PoolId, BoardSave>>;
};

const KEY = "seven-nil-save";
const VERSION = 3;

const defaults: SevenSave = {
  version: VERSION,
  formation: "4-3-3",
  style: "balanced",
  mode: "classic",
  theme: "panini",
  lastDreams: 0,
  lastRuns: 0,
  clubDreams: 0,
  clubRuns: 0,
  boards: {},
};

export function loadSave(): SevenSave {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<SevenSave>;
    return {
      ...defaults,
      ...parsed,
      version: VERSION,
      boards: parsed.boards ?? {},
    };
  } catch {
    return defaults;
  }
}

export function writeSave(save: SevenSave) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...save, version: VERSION }));
  } catch {
    // ignore
  }
}