import assert from "node:assert/strict";
import { mkdtempSync, rmSync, rmdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import type { Cond, Fx, World } from "../src/types.ts";
import { loadValidatedWorld, loadWorldUrl, MENU_CAP, replayWalkthrough, validateWorld } from "../src/validate.ts";

const world = (): World => ({
  id: "schema", title: "Schema fixture", intro: "", start: "room", hp: 5, maxScore: 0,
  rooms: { room: { name: "Room", desc: "", actions: [
    { id: "win", label: "win", fx: [["end", "win", "won", "Done."]] },
  ] } },
  items: {}, npcs: {}, walkthrough: ["win"],
});

test("validates an authored world before trying to execute it", () => {
  for (const input of [null, [], {}, { ...world(), rooms: null }]) {
    assert.ok(validateWorld(input).length > 0);
  }
  assert.deepEqual(validateWorld(world()), []);
});

test("rejects malformed nested effects even outside the walkthrough", () => {
  const cases = [
    [["score", "1"]],
    [["hp"]],
    [["end", "victory", "won", "Done."]],
    [["move", "item", "inv", "extra"]],
    [["check", "luck", 1, [["score", null]], []]],
    [null],
    "not an effect list",
  ];
  for (const fx of cases) {
    const input = world();
    Object.assign(input.rooms, { unreachable: { name: "Elsewhere", desc: "", onEnter: fx } });
    assert.ok(validateWorld(input).some((error) => error.startsWith("rooms.unreachable.onEnter")), JSON.stringify(fx));
  }
});

test("rejects invalid numeric bounds and nonfinite effect values", () => {
  for (const input of [
    { ...world(), hp: 0 },
    { ...world(), maxScore: -1 },
    { ...world(), skills: { luck: Infinity } },
    { ...world(), items: { sword: { name: "Sword", loc: "inv", dmg: -1 } } },
    { ...world(), npcs: { guard: { name: "Guard", room: "room", atk: -1 } } },
  ]) assert.ok(validateWorld(input).length > 0);

  const input = world();
  input.rooms.room!.onEnter = [["score", NaN]];
  assert.ok(validateWorld(input).some((error) => error.startsWith("rooms.room.onEnter")));
});

test("validates repeat conditions and limits before running the witness", () => {
  for (const until of [["var", "x", "!=", 1], ["flag"], ["mystery", "x"]]) {
    assert.ok(validateWorld({ ...world(), walkthrough: [{ repeat: "win", until, max: 1 }] }).length > 0);
  }
  for (const max of [undefined, "2", -1, 1.5, Infinity]) {
    assert.ok(validateWorld({ ...world(), walkthrough: [{ repeat: "win", until: ["flag", "done"], max }] }).length > 0);
  }
  const input = world();
  input.walkthrough = [{ repeat: "win", until: ["!has", "missing"], max: 1 }, "win"];
  assert.ok(validateWorld(input).some((error) => error.includes("walkthrough 0 until: unknown item missing")));
});

test("rejects inherited properties masquerading as authored references", () => {
  const input = world();
  input.rooms.room!.exits = { north: { to: "toString", if: [["has", "constructor"]] } };
  input.rooms.room!.onEnter = [["check", "valueOf", 1, [], []]];
  const errors = validateWorld(input);
  assert.ok(errors.some((error) => error.includes("unknown room toString")));
  assert.ok(errors.some((error) => error.includes("unknown item constructor")));
  assert.ok(errors.some((error) => error.includes("unknown skill valueOf")));
});

test("rejects misspelled authoring fields instead of silently ignoring them", () => {
  assert.ok(validateWorld({ ...world(), maxscore: 10 }).some((error) => error.includes("maxscore")));
});

test("reports runtime failures during initialization and witness actions", () => {
  const input = world();
  input.rooms.room!.onEnter = [["goto", "room"]];
  assert.ok(validateWorld(input).some((error) => error.startsWith("walkthrough: initialization failed:")));

  delete input.rooms.room!.onEnter;
  input.rooms.room!.exits = { north: { to: "loop" } };
  input.rooms.loop = { name: "Loop", desc: "", onEnter: [["goto", "loop"]] };
  input.walkthrough = ["go north", "win"];
  assert.ok(validateWorld(input).some((error) => error.startsWith('walkthrough: action "go north" failed')));
});

test("rejects duplicate action IDs and shared global once flags", () => {
  const input = world();
  input.rooms.room!.actions!.push({ id: "win", label: "other", fx: [] });
  assert.ok(validateWorld(input).some((error) => error.includes("duplicate action id win")));

  input.rooms.room!.actions!.pop();
  input.rooms.other = { name: "Other", desc: "", actions: [{ id: "win", label: "win", fx: [] }] };
  assert.deepEqual(validateWorld(input), [], "non-once IDs may repeat across rooms");
  input.rooms.room!.actions![0]!.once = true;
  input.rooms.other.actions![0]!.once = true;
  assert.ok(validateWorld(input).some((error) => error.includes("once flag did_win collides")));
});

test("rejects duplicate topics and underscore collisions in generated topic flags", () => {
  const input = world();
  const topic = { id: "c", label: "question", say: "answer", once: true };
  input.npcs.a_b = { name: "First", room: null, topics: [topic, { ...topic }] };
  assert.ok(validateWorld(input).some((error) => error.includes("duplicate topic id c")));

  input.npcs.a_b.topics!.pop();
  input.npcs.a = { name: "Second", room: null, topics: [{ ...topic, id: "b_c" }] };
  assert.ok(validateWorld(input).some((error) => error.includes("once flag said_a_b_c collides")));
  input.npcs.a.topics![0]!.id = "c";
  assert.deepEqual(validateWorld(input), [], "different NPCs may reuse ordinary topic IDs");
});

test("reserves inventory/location sentinels only in the room namespace", () => {
  const input = world();
  input.items.inv = { name: "Inv", loc: "inv" };
  input.npcs.nowhere = { name: "Nowhere", room: null };
  assert.deepEqual(validateWorld(input), []);
  for (const reserved of ["inv", "nowhere"]) {
    input.rooms[reserved] = { name: "Reserved", desc: "" };
    assert.ok(validateWorld(input).some((error) => error.includes(`room ${reserved}: reserved item location`)));
    delete input.rooms[reserved];
  }
});

test("rejects ambiguous use targets without prohibiting unrelated namespace reuse", () => {
  const input = world();
  input.items.room = { name: "Room token", loc: "nowhere" };
  input.npcs.room = { name: "Room spirit", room: null };
  assert.deepEqual(validateWorld(input), []);
  input.items.wand = { name: "Wand", loc: "inv", use: [{ target: "room", fx: [] }] };
  assert.ok(validateWorld(input).some((error) => error.includes("ambiguous target room")));
});

test("validated runtime loader supports paths and URLs while raw fixture loaders remain available", () => {
  const valid = new URL("../world/lighthouse.json", import.meta.url);
  assert.equal(loadValidatedWorld(valid).id, "lighthouse");
  assert.equal(loadValidatedWorld(fileURLToPath(valid)).id, "lighthouse");
  const invalid = new URL("./fixtures/bad_ref.json", import.meta.url);
  assert.equal(loadWorldUrl(invalid).id, "bad_ref");
  assert.throws(() => loadValidatedWorld(invalid), /Invalid world .*bad_ref\.json:[\s\S]*unknown room no_such_room/);
});

test("rejects inherited names in flag and variable state operations", () => {
  for (const key of ["constructor", "toString", "__proto__"]) {
    for (const condition of [["flag", key], ["!flag", key], ["var", key, "=", 0]] as Cond[]) {
      const input = world();
      input.rooms.room!.actions![0]!.if = [condition];
      assert.ok(validateWorld(input).some((error) => error.includes(`reserved state key ${key}`)));
    }
    for (const effect of [["set", key], ["clear", key], ["setvar", key, 1], ["addvar", key, 1]] as Fx[]) {
      const input = world();
      input.rooms.room!.onEnter = [effect];
      assert.ok(validateWorld(input).some((error) => error.includes(`reserved state key ${key}`)));
    }
  }
});

test("rejects record keys that the schema parser would silently omit", () => {
  const cases: [string, (input: World) => Record<string, unknown>, unknown][] = [
    ["rooms", (input) => input.rooms, { name: "Room", desc: "" }],
    ["items", (input) => input.items, { name: "Item", loc: "room" }],
    ["npcs", (input) => input.npcs, { name: "NPC", room: "room" }],
    ["skills", (input) => input.skills ??= {}, 1],
    ["rooms.room.exits", (input) => input.rooms.room!.exits ??= {}, { to: "room" }],
  ];
  for (const [path, record, value] of cases) {
    const input = world();
    Object.defineProperty(record(input), "__proto__", { value, enumerable: true });
    const fromJson = JSON.parse(JSON.stringify(input));
    assert.ok(validateWorld(fromJson).some((error) => error === `${path}.__proto__: reserved record key __proto__`), path);
  }
});

test("runtime loading cannot bypass the menu cap through a parser-omitted NPC", (t) => {
  const input = world();
  Object.defineProperty(input.npcs, "__proto__", { enumerable: true, value: {
    name: "Guard", room: "room",
    topics: Array.from({ length: 13 }, (_, index) => ({ id: `q${index}`, label: `question ${index}`, say: "Answer." })),
  } });
  assert.ok(replayWalkthrough(input, 1).maxMenu > MENU_CAP, "the original world exceeds the actual menu limit");
  const dir = mkdtempSync(join(tmpdir(), "tinyforge-schema-"));
  const path = join(dir, "world.json");
  t.after(() => { rmSync(path, { force: true }); rmdirSync(dir); });
  writeFileSync(path, JSON.stringify(input));
  assert.throws(() => loadValidatedWorld(path), /npcs\.__proto__: reserved record key __proto__/);
});
