import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { newState, receipt as receiptOf } from "../src/engine.ts";
import type { World } from "../src/types.ts";

test("real MCP mock proves the last allowed turn and checker protects replay evidence", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "tinyforge-mcp-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const world: World = {
    id: "test_world", title: "Test world", intro: "", start: "start", hp: 1, maxScore: 1,
    rooms: { start: { name: "Start", desc: "A test room.", actions: [
      { id: "win", label: "win now", fx: [["score", 1], ["end", "win", "success", "Done."]] },
    ] } }, items: {}, npcs: {}, walkthrough: ["win now"],
  };
  const worldPath = join(dir, "custom-filename.json");
  writeFileSync(worldPath, JSON.stringify(world));
  const runs = join(dir, "runs");
  const reports = join(dir, "reports");
  mkdirSync(runs);
  const env = { ...process.env, TF_WORLD: worldPath, TF_RUNS: runs, TF_REPORTS: reports };
  const mockPath = fileURLToPath(new URL("../loop/mock-player.mjs", import.meta.url));
  const output = execFileSync(process.execPath, [mockPath, "--measure", "--seed", "7", "--max-steps", "1"], {
    cwd: dir, env: { ...env, TF_WORLD: "custom-filename.json", TF_RUNS: "runs" }, encoding: "utf8", timeout: 20000,
  });
  assert.match(output, /ended success/);
  assert.match(output, /turns: 1/);
  const receipt = /receipt: (\S+)/.exec(output)![1];
  assert.equal(readdirSync(runs).length, 1);
  writeFileSync(join(runs, "000-corrupt.json"), "{");
  const report = {
    verdict: "lost", fun: 3, clarity: 3, turns: 999, receipt,
    bugs: [], confusions: [], suggestions: [],
    verified: false, schema: 999, kind: "forged", lane: "forged", seed: 999, build: "forged",
  };
  const reportPath = join(dir, "output.json");
  const fileReport = () => {
    writeFileSync(reportPath, JSON.stringify({ result: "```json\n" + JSON.stringify(report) + "\n```" }));
    return execFileSync(process.execPath, ["loop/report-check.mjs", reportPath, "--seed", "7"], {
      env, encoding: "utf8", timeout: 20000,
    });
  };
  assert.match(fileReport(), /verified:true/);
  const filed = JSON.parse(readFileSync(join(reports, readdirSync(reports)[0]!), "utf8"));
  assert.equal(filed.verified, true);
  assert.equal(filed.schema, 1);
  assert.equal(filed.kind, "playtest");
  assert.equal(filed.lane, "mcp");
  assert.equal(filed.seed, 7);
  assert.equal(filed.turns, 1);
  assert.equal(filed.verdict, "won");
  assert.equal(typeof filed.build.world, "string");
  report.receipt = "forged";
  report.verified = true;
  assert.match(fileReport(), /verified:false/);
  report.receipt = receiptOf(world, newState(world, 7).state);
  writeFileSync(join(runs, "open.json"), JSON.stringify({ world: world.id, seed: 7, actions: [], receipt: report.receipt }));
  assert.match(fileReport(), /verified:false/, "a replayable unfinished trace is not a verified ending");
  writeFileSync(reportPath, "```json\nnull\n```");
  const malformed = spawnSync(process.execPath, ["loop/report-check.mjs", reportPath], { env, encoding: "utf8", timeout: 20000 });
  assert.equal(malformed.status, 1);
  assert.match(malformed.stderr, /REJECT:/);
  assert.equal(readdirSync(reports).length, 3, "malformed report must not be filed");
});
