import { create } from "zustand";
import {
  apply,
  freshFriends,
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
};

function menuState(pool: PoolId = "world"): FriendsState {
  return { ...freshFriends("final", "home", "Home", pool), phase: "menu", seats: [], code: "" };
}

export const useFriends = create<FriendsStore>((set, get) => ({
  ...menuState(),
  actorId: "home",
  lastAction: null,

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
    set({ ...state, actorId: hostId });
  },

  becomeGuest: (state, actorId) => {
    set({ ...state, actorId });
  },

  replace: (state) => set((cur) => ({ ...cur, ...state })),

  backToMenu: (pool) => set({ ...menuState(pool ?? get().pool ?? "world"), actorId: "home" }),

  act: (action) => {
    const cur = get();
    const next = apply(cur, action, cur.actorId);
    set({ ...next, lastAction: { action, actorId: cur.actorId } });
    return next;
  },
}));
