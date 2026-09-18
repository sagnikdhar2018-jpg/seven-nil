import type { Player, Slot } from "./types";

/** Same footballer across years/clubs: "Pelé" 1970 === "Pele" 1958. */
export function personKey(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

export function takenKeysFromSlots(slots: Slot[]) {
  return slots.filter((s) => s.player).map((s) => personKey(s.player!.name));
}

export function takenKeysFromPlayers(players: Player[]) {
  return players.map((p) => personKey(p.name));
}

export function isPersonTaken(name: string, taken: Iterable<string>) {
  const key = personKey(name);
  if (!key) return false;
  const set = taken instanceof Set ? taken : new Set(taken);
  return set.has(key);
}
