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
import type { ModeId } from "./types";

type HostOpts = {
  mode?: ModeId;
  timer?: TimerSec;
  password?: string;
  bracketSize?: BracketSize;
};

type FriendsStore = FriendsState & {
  actorId: string;
  hydrateLocal: (kind: FriendKind) => void;
  becomeHost: (kind: FriendKind, hostId: string, hostName: string, opts?: HostOpts) => void;
  becomeGuest: (state: FriendsState, actorId: string) => void;
  replace: (state: FriendsState) => void;
  backToMenu: () => void;
  act: (action: FriendsAction) => FriendsState;
  lastAction: { action: FriendsAction; actorId: string } | null;
};

function menuState(): FriendsState {
  return { ...freshFriends("final", "home"), phase: "menu", seats: [], code: "" };
}

export const useFriends = create<FriendsStore>((set, get) => ({
  ...menuState(),
  actorId: "home",
  lastAction: null,

  hydrateLocal: (kind) => {
    const state = freshFriends(kind, "home", "Home");
    set({ ...state, actorId: "home" });
  },

  becomeHost: (kind, hostId, hostName, opts) => {
    let state = freshFriends(kind, hostId, hostName);
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

  backToMenu: () => set({ ...menuState(), actorId: "home" }),

  act: (action) => {
    const cur = get();
    const next = apply(cur, action, cur.actorId);
    set({ ...next, lastAction: { action, actorId: cur.actorId } });
    return next;
  },
}));
