#!/usr/bin/env node
/** Validate a player report, replay its receipt, and retain it as raw evidence. */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { tsImport } from "tsx/esm/api";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { reportSchema, buildId } = await tsImport("../src/player.ts", import.meta.url);
const { replayTraceState } = await tsImport("../src/crawl.ts", import.meta.url);
const { loadValidatedWorld } = await tsImport("../src/validate.ts", import.meta.url);

async function main() {
  const args = process.argv.slice(2);
  const outFile = args[0];
  if (!outFile || (args.length !== 1 && (args.length !== 3 || args[1] !== "--seed")))
    throw new Error("usage: node loop/report-check.mjs <claude-output.json> [--seed <n>]");
  const seed = args.length === 3 ? Number(args[2]) : null;
  if (seed !== null && !Number.isSafeInteger(seed)) throw new Error("--seed must be a safe integer");
  const raw = readFileSync(outFile, "utf8");
  let resultText = raw;
  let costUsd = null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.result === "string") resultText = parsed.result;
    if (typeof parsed?.total_cost_usd === "number" && Number.isFinite(parsed.total_cost_usd) && parsed.total_cost_usd >= 0)
      costUsd = parsed.total_cost_usd;
  } catch { /* plain text output is also accepted */ }
  const fence = /```json\s*([\s\S]*?)```/.exec(resultText);
  if (!fence) throw new Error("no fenced json report in player output");
  const report = reportSchema.parse(JSON.parse(fence[1]));
  const worldPath = process.env.TF_WORLD ?? join(ROOT, "world", "lighthouse.json");
  const world = loadValidatedWorld(worldPath);
  const runsDir = process.env.TF_RUNS ?? join(ROOT, "runs");
  let verified = false;
  let replayedState = null;
  let traces = [];
  try { traces = readdirSync(runsDir, { withFileTypes: true }).filter((f) => f.isFile() && f.name.endsWith(".json")); }
  catch (e) { if (e.code !== "ENOENT") throw e; }
  for (const file of traces) {
    try {
      const trace = JSON.parse(readFileSync(join(runsDir, file.name), "utf8"));
      if (!report.receipt || trace.receipt !== report.receipt || (seed !== null && trace.seed !== seed)) continue;
      const state = replayTraceState(world, trace);
      if (!state.ended) continue;
      verified = true;
      replayedState = state;
      break;
    } catch { /* one damaged or unrelated trace must not hide valid evidence */ }
  }
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const reportsDir = process.env.TF_REPORTS ?? join(ROOT, "reports");
  mkdirSync(reportsDir, { recursive: true });
  const item = {
    ...report,
    schema: 1, kind: "playtest", lane: "mcp", ts, seed: seed ?? replayedState?.seed ?? null,
    turns: replayedState?.turn ?? report.turns,
    verdict: replayedState ? (replayedState.ended.kind === "win" ? "won" : "lost") : report.verdict,
    build: buildId(worldPath), cost_usd: costUsd, verified,
  };
  const file = join(reportsDir, `playtest-${ts}-${process.pid}${item.seed !== null ? `-s${item.seed}` : ""}.json`);
  writeFileSync(file, JSON.stringify(item, null, 2), { flag: "wx" });
  console.log(`filed ${relative(ROOT, file)} verdict:${report.verdict} fun:${report.fun} clarity:${report.clarity} bugs:${report.bugs.length} verified:${verified}${costUsd !== null ? ` cost:$${costUsd.toFixed(4)}` : ""}`);
}

try { await main(); }
catch (e) { console.error(`REJECT: ${e.message}`); process.exitCode = 1; }
