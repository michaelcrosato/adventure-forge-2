/**
 * tinyforge direct-API player — the fleet lane. No MCP, no agent harness.
 *
 * The engine is a LIBRARY, so the player links it in-process and the model sees
 * only rendered game text over the raw Messages API. What that buys vs a
 * harnessed player (measured against the Claude Code lane):
 *   - prefix is ~0.5k tokens (player charter), not ~43k (harness prompt + tools)
 *   - blindness by construction: the model receives exactly the text we render
 *   - exact per-session token accounting from API usage fields
 *   - pinned model, owned retries, easy 100-way parallelism, Batch-API-able
 * The MCP server stays for interop (humans, any agent harness); this lane is
 * for volume. Same report schema, same queue, same replay-verified receipts.
 *
 *   tsx src/player.ts --count 3 --seed-base 100 --parallel 4      (needs ANTHROPIC_API_KEY)
 *   tsx src/player.ts --mock --count 2                            (zero tokens, proves the driver)
 */
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { z } from "zod";
import { actionByLabel, condOk, newState, receipt as receiptOf, roomIsDark, step } from "./engine.ts";
import { render, renderIntro } from "./format.ts";
import { replayTrace } from "./crawl.ts";
import { loadValidatedWorld } from "./validate.ts";
import { triage } from "./triage.ts";
import type { Action, State, World } from "./types.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Build identity a report is bound to: git rev + content hash of the world file. */
export function buildId(worldPath: string): { rev: string; world: string } {
  let rev = "nogit";
  try {
    rev = execSync("git rev-parse --short HEAD", { cwd: ROOT, encoding: "utf8" }).trim();
  } catch {
    /* not a repo yet */
  }
  const world = createHash("sha256").update(readFileSync(worldPath)).digest("hex").slice(0, 8);
  return { rev, world };
}

// ---------- provider seam ----------
export type Msg = { role: "user" | "assistant"; content: string };
export type Usage = { in: number; out: number; cacheRead: number; cacheWrite: number };
export type Provider = (system: string, msgs: Msg[], maxTokens: number) => Promise<{ text: string; usage: Usage }>;

export function apiProvider(model: string): Provider {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY not set — use --mock, or export a key");
  return async (system, msgs, maxTokens) => {
    for (let attempt = 0; ; attempt++) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        signal: AbortSignal.timeout(30_000), // bounds both connection and response-body reads
        headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
          messages: msgs,
        }),
      });
      if (res.status === 429 || res.status >= 500) {
        await res.body?.cancel(); // release the connection before retrying or giving up
        if (attempt >= 4) throw new Error(`API ${res.status} after retries`);
        await new Promise((r) => setTimeout(r, 1500 * 2 ** attempt));
        continue;
      }
      if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).slice(0, 300)}`);
      const j = (await res.json()) as {
        content: { type: string; text?: string }[];
        usage: { input_tokens: number; output_tokens: number; cache_read_input_tokens?: number; cache_creation_input_tokens?: number };
      };
      return {
        text: j.content.filter((c) => c.type === "text").map((c) => c.text).join(""),
        usage: {
          in: j.usage.input_tokens,
          out: j.usage.output_tokens,
          cacheRead: j.usage.cache_read_input_tokens ?? 0,
          cacheWrite: j.usage.cache_creation_input_tokens ?? 0,
        },
      };
    }
  };
}

/** Scripted stand-in: follows the world's walkthrough by menu label, then quotes
 * the observed receipt. A deterministic shadow state evaluates repeat conditions;
 * only this mock has world access, never the live API provider. */
export function mockProvider(world: World): Provider {
  let state: State | undefined;
  let index = 0;
  let repeats = 0;
  return async (_system, msgs, _maxTokens) => {
    const usage: Usage = { in: 0, out: 0, cacheRead: 0, cacheWrite: 0 };
    const last = msgs[msgs.length - 1]!.content;
    if (/output ONLY.*json report/is.test(last)) {
      const transcript = msgs.map((m) => m.content).join("\n");
      const receipt = /receipt:(\S+)/.exec(transcript)?.[1] ?? "";
      const verdict = /\*\*\* WIN/.test(transcript) ? "won" : /\*\*\* LOSE/.test(transcript) ? "lost" : "quit";
      const turns = Number(/"turns":(\d+)/.exec(last)?.[1] ?? 0);
      return {
        text: "```json\n" + JSON.stringify({ verdict, fun: 3, clarity: 3, turns, receipt, bugs: [], confusions: [], suggestions: [] }) + "\n```",
        usage,
      };
    }
    if (!state) {
      const seed = /\(seed (-?\d+)\)\r?\n/.exec(msgs[0]!.content)?.[1];
      if (seed === undefined) throw new Error("Mock player could not read the session seed");
      state = newState(world, Number(seed)).state;
    }
    const menu = [...last.matchAll(/^(\d+) (.+)$/gm)].map((m) => ({ n: m[1]!, label: m[2]! }));
    while (index < world.walkthrough.length) {
      const entry = world.walkthrough[index]!;
      if (typeof entry !== "string" && condOk(world, state, entry.until)) {
        index++;
        repeats = 0;
        continue;
      }
      const label = typeof entry === "string" ? entry : entry.repeat;
      if (typeof entry !== "string" && repeats >= entry.max)
        throw new Error(`Mock walkthrough repeat "${label}" exceeded max ${entry.max}`);
      const hit = menu.find((m) => m.label.toLowerCase() === label.trim().toLowerCase());
      const action = actionByLabel(world, state, label);
      if (!hit || !action) throw new Error(`Mock walkthrough label "${label}" missing at turn ${state.turn}`);
      state = step(world, state, action).state;
      if (typeof entry === "string") index++;
      else repeats++;
      return { text: hit.n, usage };
    }
    throw new Error("Mock walkthrough exhausted before an ending");
  };
}

/** Upper bound for a complete scripted run, including every allowed retry. */
export function walkthroughTurnLimit(world: World): number {
  return Math.max(1, world.walkthrough.reduce((n, entry) => n + (typeof entry === "string" ? 1 : entry.max), 0));
}

// ---------- one blind session, in-process ----------
const SYSTEM = (maxGameTurns: number) => `You are a blind playtester of a text RPG. You see ONLY what the game prints.
Each message is one turn: status, events, scene, then a NUMBERED menu.
Reply with ONE menu number (optionally followed by ":" and 5 words of intent).
Play with intent: explore, talk, take, try to reach a real ending (*** WIN or *** LOSE) within ${maxGameTurns} turns. Getting stuck is a finding — remember where and why.
When asked for your report, output ONLY a fenced \`\`\`json block, no prose.`;

export type SessionResult = {
  seed: number;
  turns: number;
  score: number;
  won: boolean;
  ended: string | null;
  stalled: boolean;
  report: Record<string, unknown> | null;
  reportError?: string;
  verified: boolean;
  usage: Usage;
  apiCalls: number; // completed provider exchanges; internal HTTP retries are not counted
  receipt: string | null;
};

/** End a live session early when nothing is happening — no new room, no score —
 * for this many consecutive turns. A stall is cheaper to stop than to fund, and
 * "stalled at X" is itself a finding. */
export const STALL_AFTER = 12;

export const reportSchema = z.object({
  verdict: z.enum(["won", "lost", "quit", "stuck"]),
  fun: z.number().int().min(1).max(5),
  clarity: z.number().int().min(1).max(5),
  turns: z.number().int().nonnegative(),
  receipt: z.string(),
  bugs: z.array(z.object({ sev: z.enum(["P0", "P1", "P2"]), what: z.string(), where: z.string() })),
  confusions: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export async function playOne(
  world: World,
  seed: number,
  provider: Provider,
  maxGameTurns = 80,
  stallAfter = STALL_AFTER,
): Promise<SessionResult> {
  const usage: Usage = { in: 0, out: 0, cacheRead: 0, cacheWrite: 0 };
  let apiCalls = 0;
  const ask: Provider = async (sys, msgs, max) => {
    const r = await provider(sys, msgs, max);
    apiCalls++;
    usage.in += r.usage.in; usage.out += r.usage.out;
    usage.cacheRead += r.usage.cacheRead; usage.cacheWrite += r.usage.cacheWrite;
    return r;
  };
  const system = SYSTEM(maxGameTurns);
  const msgs: Msg[] = [];
  const actions: Action[] = [];
  const seen = new Set<string>();

  const out = newState(world, seed);
  let state: State = out.state;
  if (!roomIsDark(world, state)) seen.add(state.room);
  msgs.push({ role: "user", content: renderIntro(world, state, out.events).text });

  let stalled = false;
  let lastProgress = 0; // turn of last score gain or first-visit
  while (!state.ended && state.turn < maxGameTurns) {
    if (state.turn - lastProgress >= stallAfter) { stalled = true; break; }
    const reply = await ask(system, msgs, 60);
    msgs.push({ role: "assistant", content: reply.text.trim() });
    // accept "3", "3: go north", or structured {"a":3} (provider-compat)
    const parseN = (t: string) => Number(/^\s*(\d+)/.exec(t)?.[1] ?? /"a"\s*:\s*(\d+)/.exec(t)?.[1]);
    let n = parseN(reply.text);
    const menu = render(world, state, []).actions;
    if (!Number.isInteger(n) || n < 1 || n > menu.length) {
      msgs.push({ role: "user", content: `Reply with ONLY a menu number (1-${menu.length}).` });
      const retry = await ask(system, msgs, 20);
      msgs.push({ role: "assistant", content: retry.text.trim() });
      n = parseN(retry.text);
      if (!Number.isInteger(n) || n < 1 || n > menu.length) break; // stuck
    }
    const action = menu[n - 1]!;
    actions.push(action);
    const beforeVisited = state.visited.length;
    const beforeScore = state.score;
    const res = step(world, state, action);
    state = res.state;
    const first = !seen.has(state.room);
    if (state.visited.length > beforeVisited || state.score > beforeScore) lastProgress = state.turn;
    if (!roomIsDark(world, state)) seen.add(state.room);
    msgs.push({ role: "user", content: render(world, state, res.events, { full: first }).text });
  }

  msgs.push({
    role: "user",
    content: `The session is over. Now output ONLY the fenced json report:
\`\`\`json
{"verdict":"won|lost|quit|stuck","fun":1-5,"clarity":1-5,"turns":${state.turn},"receipt":"<the receipt:... value verbatim, or empty>","bugs":[{"sev":"P0|P1|P2","what":"...","where":"..."}],"confusions":["..."],"suggestions":["..."]}
\`\`\``,
  });
  const rep = await ask(system, msgs, 1000);
  let report: Record<string, unknown> | null = null;
  let reportError: string | undefined;
  try {
    const fence = /```json\s*([\s\S]*?)```/.exec(rep.text);
    if (!fence) throw new Error("no fenced json block");
    report = reportSchema.parse(JSON.parse(fence[1]!));
  } catch (e) {
    reportError = String(e);
  }

  // Honesty check: the quoted receipt must equal an in-process replay of the trace.
  const trueReceipt = state.ended ? receiptOf(world, state) : null;
  const replayed = replayTrace(world, { world: world.id, seed, actions });
  const verified =
    !!report && typeof report.receipt === "string" && report.receipt === trueReceipt && replayed === trueReceipt;

  return { seed, turns: state.turn, score: state.score, won: state.ended?.kind === "win", ended: state.ended?.id ?? null,
    stalled, report, reportError, verified, usage, apiCalls, receipt: trueReceipt };
}

// ---------- fleet CLI ----------
export function fileReport(r: SessionResult, model: string, worldPath: string, reportsDir = process.env.TF_REPORTS ?? join(ROOT, "reports")): string | null {
  if (!r.report) return null;
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const item = {
    ...r.report,
    schema: 1, kind: "playtest", lane: "api", model, ts, seed: r.seed, stalled: r.stalled,
    turns: r.turns, score: r.score, won: r.won, build: buildId(worldPath), usage: r.usage, api_calls: r.apiCalls, verified: r.verified,
  };
  mkdirSync(reportsDir, { recursive: true });
  const file = join(reportsDir, `playtest-${ts}-s${r.seed}.json`);
  writeFileSync(file, JSON.stringify(item, null, 2));
  return file;
}

if (process.argv[1]?.endsWith("player.ts")) {
  const run = async () => {
    const { values } = parseArgs({ options: {
      count: { type: "string", default: "1" },
      "seed-base": { type: "string", default: String(Math.floor(Date.now() / 1000) % 100000) },
      parallel: { type: "string", default: "4" },
      "max-game-turns": { type: "string" },
      model: { type: "string", default: process.env.TF_PLAYER_MODEL ?? "claude-haiku-4-5" },
      mock: { type: "boolean", default: false },
    } });
    const integer = (name: string, value: string, min = 1) => {
      const n = Number(value);
      if (!value.trim() || !Number.isSafeInteger(n) || n < min)
        throw new Error(`--${name} must be a safe integer >= ${min}`);
      return n;
    };
    const count = integer("count", values.count);
    const parallel = integer("parallel", values.parallel);
    const seedBase = integer("seed-base", values["seed-base"], Number.MIN_SAFE_INTEGER);
    if (seedBase > Number.MAX_SAFE_INTEGER - (count - 1)) throw new Error("Seed range exceeds safe integers");
    const model = values.model.trim();
    if (!model) throw new Error("--model must not be empty");
    const mock = values.mock;
    const worldPath = process.env.TF_WORLD ?? join(ROOT, "world", "lighthouse.json");
    const world = loadValidatedWorld(worldPath);
    const maxGameTurns = integer("max-game-turns", values["max-game-turns"] ?? String(mock ? walkthroughTurnLimit(world) : 80));
    const liveProvider = mock ? null : apiProvider(model);
    console.log(
      `fleet: ${count} player(s), seeds ${seedBase}+, ${mock ? "MOCK (zero tokens)" : `model ${model}`}, parallel ${parallel}`,
    );
    const results: SessionResult[] = [];
    let next = 0;
    const worker = async () => {
      while (next < count) {
        const seed = seedBase + next++;
        try {
          const provider = liveProvider ?? mockProvider(world);
          // Scripted runs already have a finite walkthrough bound; authored
          // repeats need not gain score or enter a new room every 12 turns.
          const r = await playOne(world, seed, provider, maxGameTurns, mock ? Infinity : STALL_AFTER);
          results.push(r);
          if (!r.report || (mock && (!r.verified || !r.won || r.score !== world.maxScore))) process.exitCode = 1;
          const filed = fileReport(r, mock ? "mock" : model, worldPath);
          console.log(
            `  seed ${seed}: ${r.ended ?? (r.stalled ? "stalled" : "no-ending")} in ${r.turns}t | api calls ${r.apiCalls} | tok in ${r.usage.in} out ${r.usage.out} cacheR ${r.usage.cacheRead} cacheW ${r.usage.cacheWrite} | verified:${r.verified}${filed ? ` | ${filed.replace(ROOT + "/", "")}` : ` | REPORT REJECTED (${r.reportError})`}`,
          );
        } catch (e) {
          process.exitCode = 1;
          console.error(`  seed ${seed}: FAILED ${String(e).slice(0, 200)}`);
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(parallel, count) }, worker));
    const tot = results.reduce(
      (a, r) => ({ in: a.in + r.usage.in, out: a.out + r.usage.out, cacheRead: a.cacheRead + r.usage.cacheRead, cacheWrite: a.cacheWrite + r.usage.cacheWrite }),
      { in: 0, out: 0, cacheRead: 0, cacheWrite: 0 },
    );
    console.log(
      `fleet done: ${results.length}/${count} ok, ${results.filter((r) => r.verified).length} verified | totals: in ${tot.in} out ${tot.out} cacheRead ${tot.cacheRead} cacheWrite ${tot.cacheWrite}`,
    );
    const t = triage({ reportsDir: process.env.TF_REPORTS });
    console.log(`triage: ${t.consumed} report(s) -> ${t.filed.length} new issue(s)${t.skipped ? `, ${t.skipped} already known` : ""}`);
    for (const i of t.filed)
      console.log(`  ${i.priority} ${i.unit_kind} x${i.corroboration}: ${i.title.slice(0, 90)}`);
  };
  run().catch((e) => { console.error(e); process.exit(1); });
}
