import assert from "node:assert/strict";
import test from "node:test";
import { actionLabel, hashState, newState, step } from "../src/engine.ts";
import { loadWorldUrl } from "../src/validate.ts";
import type { World } from "../src/types.ts";

function arena(): World {
  return {
    id: "arena", title: "Arena", intro: "", start: "arena", hp: 10, maxScore: 0,
    rooms: { arena: { name: "Arena", desc: "" } },
    items: { knife: { name: "knife", loc: "inv", dmg: 1, hit: 20 } },
    npcs: { guard: { name: "guard", room: "arena", hp: 10, hostile: true, df: 21 } },
    walkthrough: [],
  };
}

test("a one-damage weapon can improve on bare hands with its hit bonus", () => {
  const world = arena();
  const { state } = newState(world, 1);
  const before = hashState(state);
  const action = { kind: "attack", npc: "guard" } as const;
  assert.equal(actionLabel(world, action, state), "attack guard with knife");
  const out = step(world, state, action);
  assert.ok(out.state.npcHp.guard! < 10);
  assert.match(out.events.join(" "), /You hit/);
  assert.equal(hashState(state), before, "combat must not mutate its input");
});

test("equal-damage weapons choose the better hit bonus regardless of inventory order", () => {
  const world = arena();
  world.items.club = { name: "club", loc: "inv", dmg: 2, hit: 0 };
  world.items.sword = { name: "sword", loc: "inv", dmg: 2, hit: 3 };
  const { state } = newState(world, 1);
  const attack = { kind: "attack", npc: "guard" } as const;
  assert.equal(actionLabel(world, attack, state), "attack guard with sword");
  state.inv.reverse();
  assert.equal(actionLabel(world, attack, state), "attack guard with sword");
});

test("oiling risk is disclosed before acting and matches the authored check", () => {
  const world = loadWorldUrl(new URL("../world/lighthouse.json", import.meta.url));
  const room = world.rooms.lamp_room!;
  const action = room.actions!.find((a) => a.id === "oil_mechanism")!;
  const check = action.fx.find((fx) => fx[0] === "check")!;
  assert.equal(check[0], "check");
  const wins = Array.from({ length: 20 }, (_, i) => i + 1)
    .filter((roll) => roll + (world.skills?.[check[1]] ?? 0) >= check[2]).length;
  const damage = check[4].find((fx) => fx[0] === "hp")!;
  assert.equal(damage[0], "hp");
  for (const text of [room.desc, room.brief!]) {
    assert.ok(text.includes(`${wins * 5}% success`), "odds available on first sight and revisit");
    assert.ok(text.includes(`${-damage[1]}hp`), "failure cost available before choosing");
  }
});
