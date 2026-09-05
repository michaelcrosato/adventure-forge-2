#!/usr/bin/env node
/** Zero-token wiring check over the real MCP stdio transport. --measure proves a full win. */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport, getDefaultEnvironment } from "@modelcontextprotocol/sdk/client/stdio.js";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tsImport } from "tsx/esm/api";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { mockProvider, walkthroughTurnLimit } = await tsImport("../src/player.ts", import.meta.url);
const { loadWorld } = await tsImport("../src/validate.ts", import.meta.url);
const args = process.argv.slice(2);
const measure = args.includes("--measure");
const opt = (flag, fallback) => args.includes(flag) ? args[args.indexOf(flag) + 1] : fallback;
const seed = Number(opt("--seed", 7));
const worldPath = resolve(process.env.TF_WORLD ?? join(ROOT, "world", "lighthouse.json"));
const world = loadWorld(worldPath);
const maxSteps = Number(opt("--max-steps", measure ? walkthroughTurnLimit(world) : 200));
const client = new Client({ name: "tinyforge-mock", version: "0.1.0" });
const menuOf = (text) => [...text.matchAll(/^(\d+) (.+)$/gm)].map((m) => ({ n: Number(m[1]), label: m[2] }));

async function main() {
  if (!Number.isSafeInteger(seed)) throw new Error("--seed must be a safe integer");
  if (!Number.isSafeInteger(maxSteps) || maxSteps < 1) throw new Error("--max-steps must be a positive safe integer");
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--measure") continue;
    if (args[i] === "--seed" || args[i] === "--max-steps") { i++; continue; }
    throw new Error(`unknown argument: ${args[i]}`);
  }
  const env = { ...getDefaultEnvironment(), TF_WORLD: worldPath };
  if (process.env.TF_RUNS) env.TF_RUNS = resolve(process.env.TF_RUNS);
  await client.connect(new StdioClientTransport({
    command: process.execPath,
    args: ["--import", "tsx", join(ROOT, "src", "mcp.ts")],
    cwd: ROOT, env, stderr: "inherit",
  }));
  const tools = await client.listTools();
  const names = tools.tools.map((t) => t.name).sort();
  if (JSON.stringify(names) !== JSON.stringify(["act", "look", "new_game"]))
    throw new Error(`unexpected tool surface: ${names.join(",")}`);
  const callTool = async (name, args) => {
    const result = await client.callTool({ name, arguments: args }, undefined, { timeout: 15000 });
    const text = result.content?.filter((c) => c.type === "text").map((c) => c.text).join("\n") ?? "";
    if (result.isError) throw new Error(`${name}: ${text}`);
    return text;
  };
  let text = await callTool("new_game", { seed });
  const sid = /^s=(\S+)/.exec(text)?.[1];
  if (!sid) throw new Error("no session id in new_game response");
  const sizes = [text.length];
  const actSizes = [];
  let turns = 0;
  let rngA = seed | 0;
  const rnd = () => {
    rngA = (rngA + 0x6d2b79f5) | 0;
    let t = Math.imul(rngA ^ (rngA >>> 15), 1 | rngA);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const policy = measure ? mockProvider(world) : null;
  while (turns < maxSteps && !/\*\*\* (WIN|LOSE):/.test(text)) {
    const menu = menuOf(text);
    if (!menu.length) throw new Error(`no menu and no ending at turn ${turns}`);
    const pick = policy
      ? Number((await policy("", [{ role: "user", content: text }], 60)).text)
      : menu[Math.floor(rnd() * menu.length)].n;
    if (!menu.some((m) => m.n === pick)) throw new Error(`invalid policy choice ${pick} at turn ${turns}`);
    text = await callTool("act", { s: sid, a: pick });
    sizes.push(text.length);
    actSizes.push(text.length);
    turns++;
  }
  const ended = /\*\*\* (WIN|LOSE): (\S+) \*\*\*/.exec(text);
  const receipt = /receipt:(\S+)/.exec(text)?.[1];
  if (measure && (ended?.[1] !== "WIN" || !receipt || !text.includes(`score:${world.maxScore}/${world.maxScore} `)))
    throw new Error(`walkthrough did not reach a full-score win within ${maxSteps} turns`);
  const avg = actSizes.length ? actSizes.reduce((a, b) => a + b, 0) / actSizes.length : 0;
  console.log([
    `mock-player: ${ended ? `ended ${ended[2]}` : `stopped after ${turns} turns`} (seed ${seed})`,
    `  turns: ${turns}  tool calls: ${turns + 1}  (1 call per turn)`,
    `  act response size: avg ${avg.toFixed(0)} chars, max ${Math.max(0, ...actSizes)}`,
    `  intro: ${sizes[0]} chars; whole session: ${sizes.reduce((a, b) => a + b, 0)} chars`,
    `  receipt: ${receipt ?? "-"}`,
  ].join("\n"));
}

try { await main(); }
catch (e) { console.error(`mock-player FAILED: ${e.message}`); process.exitCode = 1; }
finally { await client.close(); }
