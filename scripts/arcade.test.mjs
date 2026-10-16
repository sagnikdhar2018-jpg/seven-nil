import assert from "node:assert/strict";
import test from "node:test";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const arcade = await jiti.import("../src/lib/seven/arcade.ts");

test("two people in the same queue are paired", () => {
  const now = 1_000_000;
  const first = { id: "player-one-aaaa", name: "Ana", game: "penalties", at: now };
  const waiting = arcade.pairQueue([], first, now);
  assert.equal(waiting.pair, null);
  assert.equal(waiting.queue.length, 1);
  const second = { id: "player-two-bbbb", name: "Ben", game: "penalties", at: now + 1000 };
  const paired = arcade.pairQueue(waiting.queue, second, now + 1000);
  assert.equal(paired.pair[0].id, first.id);
  assert.equal(paired.pair[1].id, second.id);
  assert.equal(paired.queue.length, 0);
});

test("a different game does not steal the waiting player", () => {
  const now = 1_000_000;
  const waiting = arcade.pairQueue([], { id: "player-one-aaaa", name: "Ana", game: "penalties", at: now }, now);
  const other = arcade.pairQueue(waiting.queue, { id: "player-two-bbbb", name: "Ben", game: "reflex", at: now + 10 }, now + 10);
  assert.equal(other.pair, null);
  assert.equal(other.queue.length, 2);
});

test("a stale ticket is not a rival", () => {
  const now = 1_000_000;
  const waiting = arcade.pairQueue([], { id: "player-one-aaaa", name: "Ana", game: "penalties", at: now }, now);
  const later = arcade.pairQueue(
    waiting.queue,
    { id: "player-two-bbbb", name: "Ben", game: "penalties", at: now + 61_000 },
    now + 61_000,
  );
  assert.equal(later.pair, null);
  assert.equal(later.queue.length, 1);
  assert.equal(later.queue[0].id, "player-two-bbbb");
});

test("penalties distinguish a goal, a save, and a miss", () => {
  assert.equal(arcade.penaltyResult(70, "L", "R"), "goal");
  assert.equal(arcade.penaltyResult(70, "L", "L"), "save");
  assert.equal(arcade.penaltyResult(20, "L", "R"), "miss");
  assert.equal(arcade.penaltyResult(97, "C", "L"), "miss");
});

test("a penalty lead that cannot be caught ends the duel", () => {
  let state = arcade.startDuel("penalties", "Ana", "Ben", 3);
  const goal = { dir: "L", power: 70 };
  const wrong = { dir: "R" };
  for (let i = 0; i < 3; i += 1) {
    state = arcade.applySide(state, 0, goal);
    state = arcade.applySide(state, 1, wrong);
    state = arcade.applySide(state, 1, { dir: "C", power: 20 });
    state = arcade.applySide(state, 0, wrong);
  }
  assert.equal(state.done, true);
  assert.equal(state.scores[0], 3);
  assert.equal(state.winner, 0);
  const view = arcade.viewDuel(state, 0);
  assert.equal(view.winner, "you");
  assert.equal(view.opponent, "Ben");
  assert.equal(JSON.stringify(view).includes("bot"), false);
});

test("free kicks and reflex score the sweet spot", () => {
  assert.equal(arcade.freeKickPoints(50), 3);
  assert.equal(arcade.freeKickPoints(70), 1);
  assert.equal(arcade.freeKickPoints(0), 0);
  assert.equal(arcade.reflexPoint("L", "L", 300), 2);
  assert.equal(arcade.reflexPoint("L", "R", 300), 0);
  assert.equal(arcade.reflexPoint("L", "L", 1000), 0);
});
