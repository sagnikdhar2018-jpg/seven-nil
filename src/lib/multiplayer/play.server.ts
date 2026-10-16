import { z } from "zod";
import {
  applySide,
  cleanName,
  pairQueue,
  startDuel,
  viewDuel,
  type ArcadeGame,
  type Dir,
  type DuelState,
  type Ticket,
} from "@/lib/seven/arcade";

const ID = z.string().regex(/^[a-zA-Z0-9_-]{8,64}$/);
const GAME = z.enum(["penalties", "freekicks", "reflex"]);
const DIR = z.enum(["L", "C", "R"]);

type MatchRec = { id: string; state: DuelState; players: [string, string]; seen: [number, number] };

const g = globalThis as typeof globalThis & {
  __snPlay__?: { queue: Ticket[]; matches: Map<string, MatchRec>; byPlayer: Map<string, string> };
};
g.__snPlay__ ??= { queue: [], matches: new Map(), byPlayer: new Map() };
const bag = g.__snPlay__;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

function matchOf(player: string): MatchRec | null {
  const id = bag.byPlayer.get(player);
  if (!id) return null;
  return bag.matches.get(id) ?? null;
}

function touch(rec: MatchRec, player: string) {
  const side = rec.players[0] === player ? 0 : 1;
  rec.seen[side] = Date.now();
}

export async function handlePlay(request: Request): Promise<Response> {
  try {
    if (request.method === "GET") return handleGet(new URL(request.url));
    if (request.method === "POST") return handlePost(request);
    return json({ error: "method not allowed" }, 405);
  } catch (error) {
    console.error("[play]", error);
    return json({ error: "play failed" }, 500);
  }
}

function handleGet(url: URL): Response {
  const id = url.searchParams.get("id") ?? "";
  if (!ID.safeParse(id).success) return json({ error: "invalid id" }, 400);
  const rec = matchOf(id);
  if (!rec) {
    const ticket = bag.queue.find((t) => t.id === id);
    if (!ticket) return json({ status: "idle" });
    return json({ status: "wait", game: ticket.game, since: ticket.at });
  }
  touch(rec, id);
  const you = (rec.players[0] === id ? 0 : 1) as 0 | 1;
  return json({ status: "live", match: rec.id, view: viewDuel(rec.state, you) });
}

async function handlePost(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid JSON" }, 400);
  }
  const parsed = z
    .discriminatedUnion("op", [
      z.object({ op: z.literal("join"), id: ID, name: z.string().max(32), game: GAME }),
      z.object({ op: z.literal("leave"), id: ID }),
      z.object({
        op: z.literal("act"),
        id: ID,
        dir: DIR.optional(),
        power: z.number().min(0).max(100).optional(),
        ms: z.number().min(0).max(5000).optional(),
      }),
    ])
    .safeParse(body);
  if (!parsed.success) return json({ error: "invalid request" }, 400);
  const msg = parsed.data;
  if (msg.op === "leave") {
    bag.queue = bag.queue.filter((t) => t.id !== msg.id);
    return json({ ok: true });
  }
  if (msg.op === "join") {
    const existing = matchOf(msg.id);
    if (existing) {
      if (!existing.state.done) {
        touch(existing, msg.id);
        const you = (existing.players[0] === msg.id ? 0 : 1) as 0 | 1;
        return json({ status: "live", match: existing.id, view: viewDuel(existing.state, you) });
      }
      bag.matches.delete(existing.id);
      for (const pid of existing.players) bag.byPlayer.delete(pid);
    }
    const incoming: Ticket = { id: msg.id, name: cleanName(msg.name), game: msg.game as ArcadeGame, at: Date.now() };
    const paired = pairQueue(bag.queue, incoming, Date.now());
    bag.queue = paired.queue;
    if (!paired.pair) return json({ status: "wait", game: incoming.game, since: incoming.at });
    const [first, second] = paired.pair;
    const rec: MatchRec = {
      id: `${first.id.slice(0, 8)}${second.id.slice(0, 8)}`,
      state: startDuel(first.game, first.name, second.name, Date.now() % 100000),
      players: [first.id, second.id],
      seen: [Date.now(), Date.now()],
    };
    bag.matches.set(rec.id, rec);
    bag.byPlayer.set(first.id, rec.id);
    bag.byPlayer.set(second.id, rec.id);
    const you = (msg.id === first.id ? 0 : 1) as 0 | 1;
    return json({ status: "live", match: rec.id, view: viewDuel(rec.state, you) });
  }
  const rec = matchOf(msg.id);
  if (!rec) return json({ error: "no match" }, 404);
  touch(rec, msg.id);
  const you = (rec.players[0] === msg.id ? 0 : 1) as 0 | 1;
  rec.state = applySide(rec.state, you, { dir: msg.dir as Dir | undefined, power: msg.power, ms: msg.ms });
  return json({ status: "live", match: rec.id, view: viewDuel(rec.state, you) });
}
