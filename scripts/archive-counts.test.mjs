import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);

test("archive counts are one source of truth", async () => {
  const { archiveCounts, SQUADS, ALL_PLAYERS } = await jiti.import("../src/lib/seven/squads.ts");
  const { CLUB_SQUADS, CLUB_PLAYERS } = await jiti.import("../src/lib/seven/club-squads.ts");
  const counts = archiveCounts();
  assert.equal(counts.nations, SQUADS.length);
  assert.equal(counts.clubs, CLUB_SQUADS.length);
  assert.equal(counts.ratings, ALL_PLAYERS.length + CLUB_PLAYERS.length);
  assert.equal(counts.ratings, SQUADS.reduce((n, s) => n + s.players.length, 0) + CLUB_SQUADS.reduce((n, s) => n + s.players.length, 0));
  assert.ok(counts.nations > 0 && counts.clubs > 0 && counts.ratings > counts.nations);
});

test("every squad record is usable", async () => {
  const { SQUADS } = await jiti.import("../src/lib/seven/squads.ts");
  const { CLUB_SQUADS } = await jiti.import("../src/lib/seven/club-squads.ts");
  const squadIds = new Set();
  const playerIds = new Set();
  for (const squad of [...SQUADS, ...CLUB_SQUADS]) {
    assert.equal(squadIds.has(squad.id), false, squad.id);
    squadIds.add(squad.id);
    assert.ok(squad.nation.trim());
    assert.ok(squad.year >= 1950 && squad.year <= 2030);
    assert.ok(squad.players.length >= 11, squad.id);
    for (const player of squad.players) {
      assert.equal(playerIds.has(player.id), false, player.id);
      playerIds.add(player.id);
      assert.ok(player.name.trim(), player.id);
      assert.ok(player.pos.length > 0, player.id);
      assert.ok(player.ovr >= 40 && player.ovr <= 99, player.id);
    }
  }
});

test("ads.txt matches the single publisher id and the loader is not duplicated", () => {
  const site = readFileSync(new URL("../src/lib/seven/site.ts", import.meta.url), "utf8");
  const id = site.match(/ADSENSE_CLIENT = "(ca-pub-\d+)"/)?.[1];
  assert.ok(id);
  const ads = readFileSync(new URL("../public/ads.txt", import.meta.url), "utf8").trim();
  assert.equal(ads, `google.com, pub-${id.slice("ca-pub-".length)}, DIRECT, f08c47fec0942fa0`);
  const root = readFileSync(new URL("../src/routes/__root.tsx", import.meta.url), "utf8");
  assert.equal(root.includes("ca-pub-"), false);
  assert.equal(root.includes("ADSENSE_CLIENT"), true);
  assert.equal(root.split("adsbygoogle.js").length - 1, 1);
});
