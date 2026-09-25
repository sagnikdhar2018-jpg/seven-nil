import { create } from "zustand";
import {
  apply,
  freshFriends,
  pickState,
  type FriendKind,
  type FriendsAction,
  type FriendsState,
  type TimerSec,
  type BracketSize,
} from "./friends";
import type { ModeId, PoolId } from "./types";

type HostOpts = {
  mode?: ModeId;
  timer?: TimerSec;
  password?: string;
  bracketSize?: BracketSize;
  pool?: PoolId;
  organize?: boolean;
};

type FriendsStore = FriendsState & {
  actorId: string;
  hydrateLocal: (kind: FriendKind, pool?: PoolId) => void;
  becomeHost: (kind: FriendKind, hostId: string, hostName: string, opts?: HostOpts) => void;
  becomeGuest: (state: FriendsState, actorId: string) => void;
  replace: (state: FriendsState) => void;
  backToMenu: (pool?: PoolId) => void;
  act: (action: FriendsAction) => FriendsState;
  lastAction: { action: FriendsAction; actorId: string } | null;
  passwordPrompt: 0 | 1 | 2;
  joinSecret: string;
  setPasswordPrompt: (value: 0 | 1 | 2) => void;
  setJoinSecret: (value: string) => void;
};

function menuState(pool: PoolId = "world"): FriendsState {
  return { ...freshFriends("final", "home", "Home", pool), phase: "menu", seats: [], code: "" };
}

export const useFriends = create<FriendsStore>((set, get) => ({
  ...menuState(),
  actorId: "home",
  lastAction: null,
  passwordPrompt: 0,
  joinSecret: "",
  setPasswordPrompt: (value) => set({ passwordPrompt: value }),
  setJoinSecret: (value) => set({ joinSecret: value }),

  hydrateLocal: (kind, pool = "world") => {
    const state = freshFriends(kind, "home", "Home", pool);
    set({ ...state, actorId: "home" });
  },

  becomeHost: (kind, hostId, hostName, opts) => {
    let state = freshFriends(kind, hostId, hostName, opts?.pool ?? "world");
    if (opts?.mode) state = apply(state, { type: "setMode", mode: opts.mode }, hostId);
    if (opts?.timer) state = apply(state, { type: "setTimer", timer: opts.timer }, hostId);
    if (opts?.password) state = apply(state, { type: "setPassword", password: opts.password }, hostId);
    if (opts?.bracketSize) state = apply(state, { type: "setBracket", size: opts.bracketSize }, hostId);
    if (opts?.organize && kind === "cup") {
      state = {
        ...state,
        organizer: true,
        seats: state.seats.map((seat) =>
          seat.id === hostId ? { ...seat, kind: "organizer", ready: true, confirmed: true } : seat,
        ),
      };
    }
    set({ ...state, actorId: hostId });
  },

  becomeGuest: (state, actorId) => {
    set({ ...state, actorId });
  },

  replace: (state) =>
    set((cur) => {
      const seated = state.seats?.some((seat) => seat.id === cur.actorId) ?? false;
      return { ...cur, ...state, passwordPrompt: seated ? 0 : cur.passwordPrompt };
    }),

  backToMenu: (pool) => {
    const code = get().code;
    if (code && typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(`sn-room-${code}`);
      sessionStorage.removeItem(`sn-host-${code}`);
    }
    set({
      ...menuState(pool ?? get().pool ?? "world"),
      actorId: "home",
      lastAction: null,
      passwordPrompt: 0,
      joinSecret: "",
    });
  },

  act: (action) => {
    const cur = get();
    const next = apply(cur, action, cur.actorId);
    set({ ...next, lastAction: { action, actorId: cur.actorId } });
    return next;
  },
}));

function roomKey(code: string) {
  return `sn-room-${code}`;
}

export function loadSavedRoom(code: string): (FriendsState & { actorId: string }) | null {
  if (typeof sessionStorage === "undefined" || !code) return null;
  try {
    const raw = sessionStorage.getItem(roomKey(code));
    if (!raw) return null;
    const data = JSON.parse(raw) as FriendsState & { actorId?: string };
    if (!data || data.code !== code || !Array.isArray(data.seats) || !data.hostId || !data.actorId) return null;
    if (data.phase === "menu" || data.phase === "setup" || data.kind === "local") return null;
    return data as FriendsState & { actorId: string };
  } catch {
    return null;
  }
}

useFriends.subscribe((state) => {
  if (typeof sessionStorage === "undefined") return;
  if (!state.code || state.kind === "local" || state.phase === "menu" || state.phase === "setup") return;
  try {
    sessionStorage.setItem(roomKey(state.code), JSON.stringify({ ...pickState(state), actorId: state.actorId }));
  } catch {
    // ignore quota
  }
});
