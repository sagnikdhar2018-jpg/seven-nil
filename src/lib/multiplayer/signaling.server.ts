/**
 * In-process WebRTC signaling relay. Same /api/rtc contract as the kit
 * (roster + SDP/ICE). Game data stays peer-to-peer.
 *
 * Kept in-memory so the production preview does not boot PGLite. Rooms live
 * for the life of the server process — enough for a lobby + draft.
 */
import { z } from "zod";
import type { PeerRow, RtcPollResponse, SignalRow } from "./p2p";

const ID = z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/);
const signalSchema = z.object({
  op: z.literal("signal"),
  room: ID,
  from: ID,
  to: ID,
  kind: z.enum(["offer", "answer", "ice"]),
  payload: z.unknown().refine((v) => v !== undefined && JSON.stringify(v).length <= 32_768, {
    message: "payload too large",
  }),
});
const leaveSchema = z.object({ op: z.literal("leave"), room: ID, peer: ID });
const postSchema = z.discriminatedUnion("op", [signalSchema, leaveSchema]);

const PEER_TTL_MS = 30_000;
const SIGNAL_TTL_MS = 60_000;

type PeerRec = { id: string; name: string; lastSeen: number };
type SigRec = SignalRow & { to: string; createdAt: number };
type RoomRec = { peers: Map<string, PeerRec>; signals: SigRec[]; nextId: number };

const g = globalThis as typeof globalThis & { __snRtcRooms__?: Map<string, RoomRec> };
g.__snRtcRooms__ ??= new Map();
const rooms = g.__snRtcRooms__;

function roomOf(id: string): RoomRec {
  let rec = rooms.get(id);
  if (!rec) {
    rec = { peers: new Map(), signals: [], nextId: 1 };
    rooms.set(id, rec);
  }
  return rec;
}

function prune(rec: RoomRec) {
  const now = Date.now();
  for (const [id, peer] of rec.peers) {
    if (now - peer.lastSeen > PEER_TTL_MS) rec.peers.delete(id);
  }
  rec.signals = rec.signals.filter((s) => now - s.createdAt < SIGNAL_TTL_MS);
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

function handleGet(url: URL): Response {
  const parsed = z
    .object({
      room: ID,
      peer: ID,
      name: z.string().max(64).default(""),
      since: z.coerce.number().int().min(0).default(0),
    })
    .safeParse({
      room: url.searchParams.get("room"),
      peer: url.searchParams.get("peer"),
      name: url.searchParams.get("name") ?? "",
      since: url.searchParams.get("since") ?? 0,
    });
  if (!parsed.success) return json({ error: "invalid query" }, 400);
  const { room, peer, name, since } = parsed.data;
  const rec = roomOf(room);
  prune(rec);
  rec.peers.set(peer, { id: peer, name, lastSeen: Date.now() });
  const body: RtcPollResponse = {
    peers: [...rec.peers.values()].map((p) => ({ id: p.id, name: p.name } satisfies PeerRow)),
    signals: rec.signals
      .filter((s) => s.to === peer && s.id > since)
      .slice(0, 200)
      .map((s) => ({ id: s.id, from: s.from, kind: s.kind, payload: s.payload })),
  };
  return json(body);
}

async function handlePost(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid JSON" }, 400);
  }
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return json({ error: "invalid request" }, 400);
  const msg = parsed.data;
  const rec = roomOf(msg.room);
  prune(rec);
  if (msg.op === "signal") {
    rec.signals.push({
      id: rec.nextId++,
      from: msg.from,
      to: msg.to,
      kind: msg.kind,
      payload: msg.payload,
      createdAt: Date.now(),
    });
  } else {
    rec.peers.delete(msg.peer);
  }
  return json({ ok: true });
}

export async function handleSignaling(request: Request): Promise<Response> {
  try {
    if (request.method === "GET") return handleGet(new URL(request.url));
    if (request.method === "POST") return await handlePost(request);
    return json({ error: "method not allowed" }, 405);
  } catch (error) {
    console.error("[rtc] signaling error:", error);
    return json({ error: "signaling failed" }, 500);
  }
}
