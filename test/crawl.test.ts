import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, rmdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { crawl, replayTrace } from "../src/crawl.ts";
import { newState, receipt, step } from "../src/engine.ts";
import type { World } from "../src/types.ts";

const world = (): World => ({
  id: "crawler", title: "Crawler fixture", intro: "", start: "room", hp: 5, maxScore: 0,
  rooms: { room: { name: "Room", desc: "", actions: [
    { id: "win", label: "win", fx: [["end", "win", "won", "Done."]] },
  ] } },
  items: {}, npcs: {}, walkthrough: ["win"],
});

test("counts endings reached on the last allowed step", () => {
  const result = crawl(world(), 1, 1);
  assert.deepEqual(result.findings, []);
  assert.equal(result.steps, 1);
  assert.deepEqual([...result.endingsSeen], ["won"]);
});

test("observes starting endings and bounds without taking a step", () => {
  const input = world();
  input.rooms.room!.onEnter = [["end", "win", "immediate", "Done."]];
  assert.deepEqual([...crawl(input, 1, 0).endingsSeen], ["immediate"]);
  input.hp = Infinity;
  assert.ok(crawl(input, 1, 0).findings.some((finding) => finding.includes("BOUNDS hp=Infinity")));
});

test("reports nonfinite numbers produced by effects", () => {
  const input = world();
  input.rooms.room!.onEnter = [["score", NaN]];
  assert.ok(crawl(input, 1, 1).findings.some((finding) => finding.includes("BOUNDS score=NaN")));
});

test("captures crashes during initialization", () => {
  const input = world();
  input.rooms.room!.onEnter = [["goto", "room"]];
  assert.ok(crawl(input, 1, 1).findings.some((finding) => finding.startsWith("CRASH walk 0 initializing:")));
});

test("crawl CLI fails an incomplete witness instead of reporting it as a win", () => {
  const result = spawnSync(process.execPath, [
    "--import", "tsx", "src/crawl.ts", "test/fixtures/unwinnable.json", "--smoke",
  ], { cwd: fileURLToPath(new URL("..", import.meta.url)), encoding: "utf8" });
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, /walkthrough: did not end in a win/);
  assert.doesNotMatch(result.stdout, /win in/);
});

test("trace replay preserves valid receipts and verifies recorded receipts", () => {
  const input = world();
  const action = { kind: "custom" as const, room: "room", id: "win" };
  const state = step(input, newState(input, 1).state, action).state;
  const expected = receipt(input, state);
  const trace = { world: input.id, seed: 1, actions: [action] };
  assert.equal(replayTrace(input, trace), expected);
  assert.equal(replayTrace(input, { ...trace, receipt: expected }), expected);
  assert.throws(() => replayTrace(input, { ...trace, receipt: "forged" }), /Trace receipt mismatch/);
});

test("trace replay rejects mismatched worlds and illegal or post-ending actions", () => {
  const input = world();
  const trace = { world: input.id, seed: 1, actions: [] };
  assert.throws(() => replayTrace(input, { ...trace, world: "other" }), /Trace world other does not match crawler/);
  assert.throws(() => replayTrace(input, { ...trace, actions: [{ kind: "go", dir: "missing" }] }), /Illegal trace action 1/);
  const win = { kind: "custom", room: "room", id: "win" };
  assert.throws(() => replayTrace(input, { ...trace, actions: [win, win] }), /Illegal trace action 2/);
});

test("trace replay rejects malformed records before executing actions", () => {
  const input = world();
  for (const trace of [
    null,
    { world: input.id, seed: "1", actions: [] },
    { world: input.id, seed: NaN, actions: [] },
    { world: input.id, seed: 1.5, actions: [] },
    { world: input.id, seed: 1 },
    { world: input.id, seed: 1, actions: [null] },
    { world: input.id, seed: 1, actions: [{ kind: "go" }] },
    { world: input.id, seed: 1, actions: [{ kind: "custom", room: "room", id: "win", extra: true }] },
  ]) assert.throws(() => replayTrace(input, trace), /Invalid trace/);
});

test("replay CLI reports a missing trace argument", () => {
  const result = spawnSync(process.execPath, ["--import", "tsx", "src/crawl.ts", "--replay"], {
    cwd: fileURLToPath(new URL("..", import.meta.url)), encoding: "utf8",
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /--replay requires a trace file/);
});

test("replay CLI uses TF_WORLD for custom world filenames", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "tinyforge-replay-"));
  const worldPath = join(dir, "custom-filename.json");
  const tracePath = join(dir, "trace.json");
  t.after(() => {
    rmSync(worldPath, { force: true });
    rmSync(tracePath, { force: true });
    rmdirSync(dir);
  });
  const input = world();
  const trace = { world: input.id, seed: 1, actions: [{ kind: "custom", room: "room", id: "win" }] };
  writeFileSync(worldPath, JSON.stringify(input));
  writeFileSync(tracePath, JSON.stringify(trace));
  const result = spawnSync(process.execPath, ["--import", "tsx", "src/crawl.ts", "--replay", tracePath], {
    cwd: fileURLToPath(new URL("..", import.meta.url)), encoding: "utf8", env: { ...process.env, TF_WORLD: worldPath },
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), replayTrace(input, trace));
});
