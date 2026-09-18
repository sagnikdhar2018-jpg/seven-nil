import { useCallback, useEffect, useRef, useState } from "react";
import { defaultIceServers, type PeerInfo } from "./p2p";

export interface UseP2PRoomOptions {
  room?: string;
  name?: string;
  selfId?: string;
}

export interface P2PRoomHandle {
  selfId: string;
  room: string;
  peers: PeerInfo[];
  joined: boolean;
  broadcast: (data: unknown) => void;
  send: (data: unknown, peerId?: string) => void;
  onMessage: (
    fn: (from: string, data: unknown, channel: "state" | "reliable") => void,
  ) => () => void;
}

function defaultRoom(): string {
  if (typeof window === "undefined") return "room-ssr";
  return `room-${window.location.hostname.split(".")[0]}`.slice(0, 64);
}

type Sender = (data: unknown, target?: string | string[] | null) => Promise<unknown>;

export function useP2PRoom(options: UseP2PRoomOptions = {}): P2PRoomHandle {
  const [selfId] = useState(() => options.selfId ?? `p-${Math.random().toString(36).slice(2, 10)}`);
  const [room] = useState(() => options.room ?? defaultRoom());
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [joined, setJoined] = useState(false);
  const sendRef = useRef<Sender | null>(null);
  const listeners = useRef(
    new Set<(from: string, data: unknown, channel: "state" | "reliable") => void>(),
  );

  useEffect(() => {
    let cancelled = false;
    let leave: (() => void) | undefined;

    void (async () => {
      const { joinRoom } = await import("trystero/mqtt");
      if (cancelled) return;
      const handle = joinRoom(
        {
          appId: "seven-nil",
          rtcConfig: { iceServers: defaultIceServers() },
        },
        room,
      );
      leave = () => {
        void handle.leave();
      };
      const [send, recv] = handle.makeAction("sn");
      sendRef.current = (data, target) => send(data as never, target);
      recv((data, peerId) => {
        for (const fn of listeners.current) fn(peerId, data, "reliable");
      });
      const sync = () => {
        const map = handle.getPeers();
        setPeers(
          Object.entries(map).map(([id, pc]) => ({
            id,
            name: id,
            connectionState: pc.connectionState,
            candidateType: null,
            rttMs: null,
          })),
        );
      };
      handle.onPeerJoin(() => sync());
      handle.onPeerLeave(() => sync());
      sync();
      if (!cancelled) setJoined(true);
    })();

    return () => {
      cancelled = true;
      sendRef.current = null;
      leave?.();
    };
  }, [room]);

  const send = useCallback((data: unknown, peerId?: string) => {
    void sendRef.current?.(data, peerId ?? null);
  }, []);

  const onMessage = useCallback(
    (fn: (from: string, data: unknown, channel: "state" | "reliable") => void) => {
      listeners.current.add(fn);
      return () => {
        listeners.current.delete(fn);
      };
    },
    [],
  );

  return { selfId, room, peers, joined, broadcast: send, send, onMessage };
}
