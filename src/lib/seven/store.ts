import { create } from "zustand";
import { canFill, emptySlotsFor, makeSlots } from "./formations";
import { drawLegal, drawSameTeam, filledCount } from "./draft";
import { personKey, takenKeysFromSlots } from "./person";
import { loadSave, writeSave, type BoardSave, type SevenSave } from "./persist";
import { simulateCampaign } from "./simulate";
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

type SevenState = {
  formation: FormationId;
  style: StyleId;
  mode: ModeId;
  pool: PoolId;
  theme: "panini" | "terrace";
  phase: Phase;
  slots: Slot[];
  draw: DrawnSquad | null;
  rerolls: number;
  history: string[];
  selected: Player | null;
  campaign: Campaign | null;
  revealTo: number;
  runs: number;
  dreams: number;
  hydrated: boolean;
  hydrate: (pool?: PoolId) => void;
  setFormation: (id: FormationId) => void;
  setStyle: (id: StyleId) => void;
  setMode: (id: ModeId) => void;
  setPool: (pool: PoolId) => void;
  setTheme: (theme: "panini" | "terrace") => void;
  roll: () => void;
  reroll: () => void;
  rerollYear: () => void;
  pick: (player: Player) => void;
  place: (slotId: string) => void;
  undoLast: () => void;
  resetDraft: () => void;
  simulate: () => void;
  revealNext: () => void;
  skipReveal: () => void;
};

function persist(partial: Partial<SevenSave>) {
  const cur = loadSave();
  writeSave({ ...cur, ...partial });
}

function snapFrom(state: {
  formation: FormationId;
  phase: Phase;
  slots: Slot[];
  draw: DrawnSquad | null;
  rerolls: number;
  history: string[];
  selected: Player | null;
  campaign: Campaign | null;
  revealTo: number;
}): BoardSave {
  return {
    formation: state.formation,
    phase: state.phase,
    slots: state.slots,
    draw: state.draw,
    rerolls: state.rerolls,
    history: state.history,
    selected: state.selected,
    campaign: state.campaign,
    revealTo: state.revealTo,
  };
}

function persistBoard(pool: PoolId, board: BoardSave) {
  const cur = loadSave();
  writeSave({ ...cur, boards: { ...cur.boards, [pool]: board } });
}

function boardToState(pool: PoolId) {
  const saved = loadSave();
  const board = saved.boards?.[pool];
  const formation = board?.formation ?? saved.formation;
  return {
    pool,
    formation,
    phase: board?.phase ?? ("setup" as Phase),
    slots: board?.slots?.length ? board.slots : makeSlots(formation),
    draw: board?.draw ?? null,
    rerolls: board?.rerolls ?? 3,
    history: board?.history ?? [],
    selected: board?.selected ?? null,
    campaign: board?.campaign ?? null,
    revealTo: board?.revealTo ?? 0,
    runs: pool === "club" ? saved.clubRuns : saved.lastRuns,
    dreams: pool === "club" ? saved.clubDreams : saved.lastDreams,
    style: saved.style,
    mode: saved.mode,
    theme: saved.theme,
  };
}

function afterPlace(slots: Slot[]) {
  const done = filledCount(slots) >= 11;
  return {
    slots,
    selected: null,
    draw: null,
    phase: (done ? "ready" : "setup") as Phase,
  };
}

export const useSeven = create<SevenState>((set, get) => ({
  formation: "4-3-3",
  style: "balanced",
  mode: "classic",
  pool: "world",
  theme: "panini",
  phase: "setup",
  slots: makeSlots("4-3-3"),
  draw: null,
  rerolls: 3,
  history: [],
  selected: null,
  campaign: null,
  revealTo: 0,
  runs: 0,
  dreams: 0,
  hydrated: false,

  hydrate: (pool) => {
    const target = pool ?? get().pool;
    const state = get();
    if (state.hydrated && state.pool === target) return;
    if (state.hydrated && state.pool !== target) {
      persistBoard(state.pool, snapFrom(state));
    }
    const next = boardToState(target);
    set({ hydrated: true, ...next });
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("theme-panini", "theme-terrace");
      document.documentElement.classList.add(`theme-${next.theme}`);
    }
  },

  setFormation: (id) => {
    const current = get();
    if (filledCount(current.slots) > 0) return;
    if (current.draw || current.phase === "picking" || current.phase === "simulating" || current.phase === "result") {
      return;
    }
    set({ formation: id, slots: makeSlots(id) });
    persist({ formation: id });
    persistBoard(get().pool, snapFrom(get()));
  },

  setStyle: (id) => {
    set({ style: id });
    persist({ style: id });
  },

  setMode: (id) => {
    set({ mode: id });
    persist({ mode: id });
  },

  setPool: (pool) => {
    get().hydrate(pool);
  },

  setTheme: (theme) => {
    set({ theme });
    persist({ theme });
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("theme-panini", "theme-terrace");
      document.documentElement.classList.add(`theme-${theme}`);
    }
  },

  roll: () => {
    const state = get();
    if (state.phase === "simulating" || state.phase === "result") return;
    if (filledCount(state.slots) >= 11) return;
    if (state.draw && state.phase === "picking") return;
    const next = drawLegal(state.slots, state.history, takenKeysFromSlots(state.slots), state.pool);
    set({
      phase: "picking",
      draw: { squad: next.squad, remaining: next.remaining },
      selected: null,
      history: next.history,
    });
    persistBoard(get().pool, snapFrom(get()));
  },

  reroll: () => {
    const state = get();
    if (state.rerolls <= 0) return;
    if (state.phase !== "picking") return;
    const next = drawLegal(state.slots, state.history, takenKeysFromSlots(state.slots), state.pool);
    set({
      rerolls: state.rerolls - 1,
      draw: { squad: next.squad, remaining: next.remaining },
      selected: null,
      history: next.history,
    });
    persistBoard(get().pool, snapFrom(get()));
  },

  rerollYear: () => {
    const state = get();
    if (state.rerolls <= 0) return;
    if (state.phase !== "picking" || !state.draw) return;
    const next = drawSameTeam(state.slots, state.history, state.draw.squad, takenKeysFromSlots(state.slots), state.pool);
    if (!next) return;
    set({
      rerolls: state.rerolls - 1,
      draw: { squad: next.squad, remaining: next.remaining },
      selected: null,
      history: next.history,
    });
    persistBoard(get().pool, snapFrom(get()));
  },

  pick: (player) => {
    const state = get();
    if (state.phase !== "picking" || !state.draw) return;
    if (takenKeysFromSlots(state.slots).includes(personKey(player.name))) return;
    const options = emptySlotsFor(state.slots, player.pos);
    if (options.length === 0) return;
    if (options.length > 1) {
      set({ selected: player });
      persistBoard(get().pool, snapFrom(get()));
      return;
    }
    const slots = state.slots.map((s) => (s.id === options[0]!.id ? { ...s, player } : s));
    set(afterPlace(slots));
    persistBoard(get().pool, snapFrom(get()));
  },

  place: (slotId) => {
    const state = get();
    const player = state.selected;
    if (!player) return;
    const slot = state.slots.find((s) => s.id === slotId);
    if (!slot || slot.player || !canFill(slot.pos, player.pos)) return;
    const slots = state.slots.map((s) => (s.id === slotId ? { ...s, player } : s));
    set(afterPlace(slots));
    persistBoard(get().pool, snapFrom(get()));
  },

  undoLast: () => {
    const state = get();
    const last = [...state.slots].reverse().find((s) => s.player);
    if (!last) return;
    set({
      slots: state.slots.map((s) => (s.id === last.id ? { ...s, player: null } : s)),
      phase: "setup",
      draw: null,
      selected: null,
      campaign: null,
    });
    persistBoard(get().pool, snapFrom(get()));
  },

  resetDraft: () => {
    const { formation } = get();
    set({
      slots: makeSlots(formation),
      phase: "setup",
      draw: null,
      selected: null,
      rerolls: 3,
      history: [],
      campaign: null,
      revealTo: 0,
    });
    persistBoard(get().pool, snapFrom(get()));
  },

  simulate: () => {
    const state = get();
    if (filledCount(state.slots) < 11) return;
    const campaign = simulateCampaign(state.slots, state.style, state.pool);
    const runs = state.runs + 1;
    const dreams = state.dreams + (campaign.dream ? 1 : 0);
    set({
      phase: "simulating",
      campaign,
      revealTo: 0,
      runs,
      dreams,
    });
    if (state.pool === "club") persist({ clubRuns: runs, clubDreams: dreams });
    else persist({ lastRuns: runs, lastDreams: dreams });
    persistBoard(get().pool, snapFrom(get()));
  },

  revealNext: () => {
    const state = get();
    if (!state.campaign) return;
    if (state.revealTo >= state.campaign.matches.length) {
      set({ phase: "result" });
      persistBoard(get().pool, snapFrom(get()));
      return;
    }
    const next = state.revealTo + 1;
    set({
      revealTo: next,
      phase: next >= state.campaign.matches.length ? "result" : "simulating",
    });
    persistBoard(get().pool, snapFrom(get()));
  },

  skipReveal: () => {
    const state = get();
    if (!state.campaign) return;
    set({ revealTo: state.campaign.matches.length, phase: "result" });
    persistBoard(get().pool, snapFrom(get()));
  },
}));
