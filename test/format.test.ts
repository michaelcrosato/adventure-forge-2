import assert from "node:assert/strict";
import test from "node:test";
import { actionLabel, newState, step } from "../src/engine.ts";
import { render } from "../src/format.ts";
import type { World } from "../src/types.ts";

function fixture(): World {
  return {
    id: "combat-test", title: "Combat test", intro: "A guard bars the way.", start: "room", hp: 100, maxScore: 0,
    rooms: { room: { name: "Room", desc: "A room." } },
    items: {
      dull: { name: "dull sword", loc: "inv", dmg: 3, hit: 0 },
      sharp: { name: "sharp sword", loc: "inv", dmg: 3, hit: 2 },
    },
    npcs: { guard: { name: "guard", room: "room", hostile: true, hp: 6, df: 8, atk: 2, desc: "It watches your blade." } },
    walkthrough: [],
  };
}

test("combat odds use the equipped weapon and match every possible engine roll", () => {
  for (const [defense, hp, attack] of [[8, 6, 2], [2, 3, 2], [22, 6, 2], [23, 6, 2], [8.5, 3.5, 2], [8, 6, 0]]) {
    const world = fixture();
    Object.assign(world.npcs.guard!, { df: defense, hp, atk: attack });
    const { state } = newState(world, 7);
    const observation = render(world, state, []);
    const match = /hit(\d+)%, damage([^;]+); counter(\d+)%/.exec(observation.text);
    assert.ok(match, observation.text);
    assert.equal(actionLabel(world, observation.actions[0]!, state), "attack guard with sharp sword");
    assert.match(observation.text, /^1 attack guard with sharp sword$/m, "menu identity stays unchanged");

    // Drive the reducer over all d20 outcomes, measuring real hits, damage, and
    // retaliation instead of reimplementing its probability formula in the test.
    const rolls = new Map<number, { hit: boolean; counter: boolean; damage: number }>();
    for (let cursor = 0; cursor < 2000 && rolls.size < 20; cursor++) {
      const out = step(world, { ...state, rngA: cursor }, observation.actions[0]!);
      const roll = Number(/d20:(\d+)/.exec(out.events.join(" "))?.[1]);
      assert.ok(roll >= 1 && roll <= 20);
      rolls.set(roll, {
        hit: out.events.some((event) => event.startsWith("You hit")),
        counter: out.state.hp < state.hp,
        damage: state.npcHp.guard! - out.state.npcHp.guard!,
      });
    }
    assert.equal(rolls.size, 20, "all possible rolls were exercised");
    const outcomes = [...rolls.values()];
    assert.equal(Number(match[1]), outcomes.filter((out) => out.hit).length * 5);
    assert.equal(Number(match[3]), outcomes.filter((out) => out.counter).length * 5);
    const damages = [...new Set(outcomes.filter((out) => out.hit).map((out) => out.damage))].sort((a, b) => a - b);
    assert.deepEqual((match[2]!.match(/\d+(?:\.\d+)?/g) ?? []).map(Number), damages.length ? damages : [0]);
  }
});

test("combat details hide in darkness and disappear when the hostile is dead", () => {
  const world = fixture();
  const { state } = newState(world, 7);
  assert.doesNotMatch(render(world, state, []).text, /watches your blade/);
  assert.match(render(world, state, [], { full: true }).text, /watches your blade/);
  world.rooms.room!.dark = true;
  assert.doesNotMatch(render(world, state, [], { full: true }).text, /guard|hit\d|counter|watches your blade/);
  world.rooms.room!.dark = false;
  state.npcHp.guard = 0;
  assert.match(render(world, state, [], { full: true }).text, /guard \(dead\)/);
  assert.doesNotMatch(render(world, state, [], { full: true }).text, /hit\d|counter|watches your blade/);
});

test("unarmed odds and damage do not assume an inventory weapon", () => {
  const world = fixture();
  world.items = {};
  const { state } = newState(world, 7);
  const observation = render(world, state, []);
  assert.match(observation.text, /hit65%, damage1\/2crit; counter100%:-2hp/);
  assert.match(observation.text, /^1 attack guard with bare hands$/m);
});
