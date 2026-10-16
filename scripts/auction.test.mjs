import assert from "node:assert/strict";
import test from "node:test";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const auction = await jiti.import("../src/lib/seven/auction.ts");
const data = await jiti.import("../src/data/auctionPlayers.ts");

test("the master list can fill a 10-player pool", () => {
  assert.ok(data.AUCTION_PLAYERS.length >= 40);
  const pool = auction.buildPool(7);
  assert.equal(pool.length, 10);
  const count = (position) => pool.filter((player) => player.position === position).length;
  assert.deepEqual([count("GK"), count("DEF"), count("MID"), count("ATT")], [2, 2, 4, 2]);
});

test("max bid keeps a dollar for every later slot", () => {
  const manager = auction.makeManager("A", 5);
  manager.squad.GK.push({ player: data.AUCTION_PLAYERS[0], price: 1 });
  manager.squad.DEF.push({ player: data.AUCTION_PLAYERS[10], price: 1 });
  assert.equal(auction.emptySlots(manager), 3);
  assert.equal(auction.maxAllowedBid(manager), 3);
  const fullBudget = auction.makeManager("B");
  assert.equal(auction.maxAllowedBid(fullBudget), 12);
});

test("a filled position is uncontested at $1", () => {
  const gk = data.AUCTION_PLAYERS.find((player) => player.position === "GK");
  const pool = [gk, gk];
  let state = auction.startAuction({ names: ["Ana", "Ben"], mode: "local", pool });
  state = auction.reduceAuction(state, { type: "open", side: 0, amount: 4 });
  state = auction.reduceAuction(state, { type: "fold", side: 1 });
  state = auction.reduceAuction(state, { type: "next" });
  assert.match(state.banner, /Uncontested/);
  assert.equal(state.managers[1].squad.GK[0].price, 1);
  state = auction.reduceAuction(state, { type: "next" });
  assert.equal(state.phase, "done");
});

test("a bid the other side cannot match ends the round", () => {
  const att = data.AUCTION_PLAYERS.find((player) => player.id === "mbappe");
  const filler = data.AUCTION_PLAYERS.filter((player) => player.id !== "mbappe").slice(0, 1);
  let state = auction.startAuction({ names: ["Ana", "Ben"], mode: "local", pool: [att, ...filler] });
  state.managers[1].budget = 1;
  state = auction.reduceAuction(state, { type: "open", side: 0, amount: 2 });
  assert.equal(state.managers[0].squad.ATT[0].player.id, "mbappe");
  assert.equal(state.managers[0].squad.ATT[0].price, 2);
  assert.equal(state.phase === "bidding", false);
});

test("a finished squad hands the rest over at $1", () => {
  const players = data.AUCTION_PLAYERS;
  const gk = players.find((player) => player.position === "GK");
  const def = players.find((player) => player.position === "DEF");
  const mids = players.filter((player) => player.position === "MID").slice(0, 3);
  const atts = players.filter((player) => player.position === "ATT").slice(0, 2);
  const pool = [atts[0], gk, def, mids[0], mids[1], atts[1], mids[2]];
  let state = auction.startAuction({ names: ["Ana", "Ben"], mode: "local", pool });
  state.managers[0].squad.GK.push({ player: gk, price: 1 });
  state.managers[0].squad.DEF.push({ player: def, price: 1 });
  state.managers[0].squad.MID.push({ player: mids[0], price: 1 }, { player: mids[1], price: 1 });
  state.managers[0].budget = 8;
  state = auction.reduceAuction(state, { type: "open", side: 0, amount: 3 });
  state = auction.reduceAuction(state, { type: "fold", side: 1 });
  assert.equal(state.phase, "done");
  assert.equal(auction.emptySlots(state.managers[0]), 0);
  assert.equal(state.managers[0].squad.ATT[0].price, 3);
  assert.ok(state.managers[1].squad.GK.length + state.managers[1].squad.DEF.length + state.managers[1].squad.MID.length + state.managers[1].squad.ATT.length >= 1);
  assert.ok(state.log.some((row) => row.name === "Ben" && row.price === 1));
});

test("an opening timeout bids $1 and a war timeout folds", () => {
  const pool = auction.buildPool(3);
  let state = auction.startAuction({ names: ["Ana", "Ben"], mode: "local", pool });
  for (let i = 0; i < 9; i += 1) state = auction.reduceAuction(state, { type: "tick" });
  state = auction.reduceAuction(state, { type: "tick" });
  assert.equal(state.bid, 1);
  assert.equal(state.leader, 0);
  for (let i = 0; i < 9; i += 1) state = auction.reduceAuction(state, { type: "tick" });
  state = auction.reduceAuction(state, { type: "tick" });
  assert.equal(state.managers[0].squad[pool[0].position][0].price, 1);
});

test("two scouts can complete legal squads inside the budget", () => {
  let state = auction.startAuction({ names: ["Ana", "Ben"], mode: "ai", seed: 11 });
  let guard = 0;
  while (state.phase !== "done" && guard < 400) {
    guard += 1;
    if (state.phase === "toast") state = auction.reduceAuction(state, { type: "next" });
    else state = auction.reduceAuction(state, auction.aiChoice(state, state.turn, () => 0.5));
  }
  assert.equal(state.phase, "done");
  for (const manager of state.managers) {
    assert.equal(auction.emptySlots(manager), 0);
    assert.ok(manager.budget >= 0);
    assert.equal(manager.budget + manager.squad.GK.concat(manager.squad.DEF, manager.squad.MID, manager.squad.ATT).reduce((sum, signed) => sum + signed.price, 0), 16);
  }
});
