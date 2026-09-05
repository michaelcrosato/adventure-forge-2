import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { buildId, fileReport, mockProvider, playOne, walkthroughTurnLimit } from "../src/player.ts";
import type { Provider } from "../src/player.ts";
import type { World } from "../src/types.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const usage = { in: 0, out: 0, cacheRead: 0, cacheWrite: 0 };
const validReport = {
  verdict: "quit", fun: 3, clarity: 3, turns: 0, receipt: "", bugs: [], confusions: [], suggestions: [],
};

function fixture(): World {
  return {
    id: "player-test", title: "Player test", intro: "A pump and a door.", start: "room", hp: 10, maxScore: 1,
    items: {}, npcs: {}, rooms: { room: { name: "Room", desc: "Pump twice to open the door.", actions: [
      { id: "pump", label: "pump", fx: [["addvar", "pumps", 1]] },
      { id: "finish", label: "finish", if: [["var", "pumps", ">=", 2]], fx: [["score", 1], ["end", "win", "done", "Done."]] },
    ] } },
    walkthrough: [{ repeat: "pump", until: ["var", "pumps", ">=", 2], max: 3 }, "finish"],
  };
}

test("reports reject invalid JSON shapes and finding types before filing", async () => {
  for (const report of [null, [], 3, { receipt: "" }, { ...validReport, bugs: [null] },
    { ...validReport, confusions: [{}] }, { ...validReport, fun: 8 }]) {
    const provider: Provider = async () => ({ text: `\`\`\`json\n${JSON.stringify(report)}\n\`\`\``, usage });
    const result = await playOne(fixture(), 7, provider, 0);
    assert.equal(result.report, null, JSON.stringify(report));
    assert.equal(result.verified, false);
    assert.ok(result.reportError);
  }
});

test("filed reports preserve host identity, verification, usage, and actual turns", async (t) => {
  const dir = mkdtempSync(join(tmpdir(), "tinyforge-report-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const worldPath = join(dir, "world.json");
  writeFileSync(worldPath, JSON.stringify(fixture()));
  const forged = { ...validReport, schema: 9, kind: "issue", lane: "fake", model: "fake", ts: "fake", seed: 99,
    stalled: true, turns: 999, build: "fake", usage: "fake", api_calls: 999, verified: true };
  const provider: Provider = async () => ({ text: `\`\`\`json\n${JSON.stringify(forged)}\n\`\`\``, usage });
  const result = await playOne(fixture(), 7, provider, 0);
  assert.ok(result.report);
  assert.equal(result.report.verified, undefined, "provider cannot supply trusted metadata");
  // Even callers that construct SessionResult directly cannot override its envelope.
  result.report = forged;
  const path = fileReport(result, "mock", worldPath, dir);
  assert.ok(path);
  const filed = JSON.parse(readFileSync(path, "utf8"));
  assert.equal(filed.schema, 1);
  assert.equal(filed.kind, "playtest");
  assert.equal(filed.lane, "api");
  assert.equal(filed.model, "mock");
  assert.notEqual(filed.ts, "fake");
  assert.equal(filed.seed, 7);
  assert.equal(filed.stalled, false);
  assert.equal(filed.turns, 0);
  assert.deepEqual(filed.build, buildId(worldPath));
  assert.deepEqual(filed.usage, usage);
  assert.equal(filed.api_calls, 1);
  assert.equal(filed.verified, false);
});

test("mock honors repeat conditions even when the action remains in the menu", async () => {
  const world = fixture();
  const result = await playOne(world, 7, mockProvider(world), walkthroughTurnLimit(world));
  assert.equal(result.ended, "done");
  assert.equal(result.won, true);
  assert.equal(result.score, 1);
  assert.equal(result.turns, 3);
  assert.equal(result.report?.turns, 3);
  assert.equal(result.verified, true);
  assert.deepEqual(result.report?.suggestions, []);
});

test("mock accepts surrounding whitespace in walkthrough and repeat labels", async () => {
  const world = fixture();
  world.walkthrough = [{ repeat: " PUMP ", until: ["var", "pumps", ">=", 2], max: 3 }, " finish "];
  const result = await playOne(world, 7, mockProvider(world), walkthroughTurnLimit(world));
  assert.equal(result.verified, true);
  assert.equal(result.turns, 3);
  assert.equal(result.won, true);
});

test("a verified loss remains a loss in the host session result", async () => {
  const world = fixture();
  world.rooms.room!.actions![0]!.fx = [["end", "lose", "lost", "Lost."]];
  world.walkthrough = ["pump"];
  const result = await playOne(world, 7, mockProvider(world));
  assert.equal(result.verified, true);
  assert.equal(result.won, false);
  assert.equal(result.score, 0);
  assert.equal(result.report?.verdict, "lost");
});

test("mock rejects an exhausted repeat budget or missing walkthrough label", async () => {
  const exhausted = fixture();
  exhausted.walkthrough[0] = { repeat: "pump", until: ["var", "pumps", ">=", 2], max: 1 };
  await assert.rejects(playOne(exhausted, 7, mockProvider(exhausted)), /exceeded max 1/);
  const missing = fixture();
  missing.walkthrough[0] = "missing action";
  await assert.rejects(playOne(missing, 7, mockProvider(missing)), /missing at turn 0/);
});

test("rooms entered in darkness receive full prose on their first lit visit", async () => {
  const world: World = {
    id: "dark-test", title: "Dark test", intro: "Light the lantern.", start: "hall", hp: 10, maxScore: 0,
    items: { lamp: { name: "lamp", loc: "inv", light: true } }, npcs: {},
    rooms: {
      hall: { name: "Hall", desc: "Hall.", exits: { in: { to: "dark" } },
        actions: [{ id: "light", label: "light", fx: [["set", "lamp_lit"]] }] },
      dark: { name: "Dark", desc: "A hidden mural covers the wall.", dark: true, exits: { out: { to: "hall" } },
        actions: [{ id: "finish", label: "finish", fx: [["end", "win", "done", "Done."]] }] },
    },
    walkthrough: ["go in", "go out", "light", "go in", "finish"],
  };
  const mock = mockProvider(world);
  const observations: string[] = [];
  const provider: Provider = async (system, messages, maxTokens) => {
    observations.push(messages.at(-1)!.content);
    return mock(system, messages, maxTokens);
  };
  const result = await playOne(world, 7, provider);
  assert.equal(result.verified, true);
  assert.match(observations[1]!, /Pitch dark/);
  assert.doesNotMatch(observations[1]!, /hidden mural/);
  assert.match(observations[4]!, /hidden mural/);
});

test("fleet rejects invalid arguments before any sessions run", () => {
  for (const args of [["--count", "0"], ["--count", "1.5"], ["--parallel", "0"], ["--parallel", "NaN"],
    ["--seed-base", "Infinity"], ["--seed-base", String(Number.MAX_SAFE_INTEGER), "--count", "2"],
    ["--max-game-turns", "0"], ["--count"], ["--unknown"]]) {
    const child = spawnSync(process.execPath, ["--import", "tsx", "src/player.ts", "--mock", ...args],
      { cwd: root, encoding: "utf8", timeout: 20_000 });
    assert.equal(child.status, 1, `${args.join(" ")}: ${child.stderr}`);
    assert.doesNotMatch(child.stdout, /fleet done/);
  }
});

test("human CLI rejects invalid seeds", () => {
  const child = spawnSync(process.execPath, ["--import", "tsx", "src/play.ts", "NaN"],
    { cwd: root, encoding: "utf8", timeout: 20_000 });
  assert.equal(child.status, 1);
  assert.match(child.stderr, /Seed must be a safe integer/);
});

test("mock fleet defaults to the full walkthrough budget and persists a verified report", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "tinyforge-fleet-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const world = fixture();
  world.maxScore = 81;
  world.rooms.room!.actions![1]!.if = [["var", "pumps", ">=", 81]];
  world.rooms.room!.actions![1]!.fx = [["score", 81], ["end", "win", "done", "Done."]];
  world.walkthrough = [...Array<string>(81).fill("pump"), "finish"];
  const worldPath = join(dir, "world.json");
  writeFileSync(worldPath, JSON.stringify(world));
  const env = { ...process.env, TF_WORLD: worldPath, TF_REPORTS: join(dir, "reports"), ANTHROPIC_API_KEY: "" };
  const args = ["--import", "tsx", "src/player.ts", "--seed-base", "7"];
  const child = spawnSync(process.execPath, [...args, "--mock"], { cwd: root, env, encoding: "utf8", timeout: 20_000 });
  assert.equal(child.status, 0, child.stderr);
  assert.match(child.stdout, /fleet done: 1\/1 ok, 1 verified/);
  const reports = readdirSync(join(dir, "reports", "triaged"));
  assert.equal(reports.length, 1);
  const report = JSON.parse(readFileSync(join(dir, "reports", "triaged", reports[0]!), "utf8"));
  assert.equal(report.turns, 82);
  assert.equal(report.verdict, "won");
  assert.equal(report.verified, true);
  const truncated = spawnSync(process.execPath, [...args, "--mock", "--max-game-turns", "1"],
    { cwd: root, env, encoding: "utf8", timeout: 20_000 });
  assert.equal(truncated.status, 1, truncated.stderr);
  assert.match(truncated.stdout, /0 verified/);
  const missingKey = spawnSync(process.execPath, args, { cwd: root, env, encoding: "utf8", timeout: 20_000 });
  assert.equal(missingKey.status, 1);
  assert.match(missingKey.stderr, /ANTHROPIC_API_KEY not set/);
});
