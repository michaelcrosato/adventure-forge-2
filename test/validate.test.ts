import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadWorld, loadWorldUrl, validateWorld } from "../src/validate.ts";

const fixture = (name: string) =>
  loadWorldUrl(new URL(`./fixtures/${name}.json`, import.meta.url));

test("world files resolve without a doubled Windows drive", () => {
  const p = fileURLToPath(new URL("../world/lighthouse.json", import.meta.url));
  assert.ok(!/^[A-Za-z]:\\[A-Za-z]:/.test(p), `doubled drive: ${p}`);
  assert.ok(existsSync(p), p);
  assert.equal(loadWorld(p).id, "lighthouse");
});

test("shipped world validates clean", () => {
  const world = loadWorldUrl(new URL("../world/lighthouse.json", import.meta.url));
  assert.deepEqual(validateWorld(world), []);
});

test("rejects unknown room and item references", () => {
  const errs = validateWorld(fixture("bad_ref"));
  assert.ok(errs.some((e) => e.includes("no_such_room")));
  assert.ok(errs.some((e) => e.includes("no_such_item")));
});

test("rejects a world whose walkthrough does not prove a win", () => {
  const errs = validateWorld(fixture("unwinnable"));
  assert.ok(errs.some((e) => e.includes("walkthrough")));
});

test("rejects unknown effect ops (closed DSL)", () => {
  const errs = validateWorld(fixture("bad_fx"));
  assert.ok(errs.some((e) => e.includes("unknown fx op")));
});
