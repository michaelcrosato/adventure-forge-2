/**
 * tinyforge crawler — Tier 1: mechanical, deterministic, zero LLM.
 *
 * Seeded random walks over the real engine, checking invariants every step:
 *   CRASH     step() threw
 *   EMPTYMENU no legal actions while the game is still open
 *   DESYNC    stepping the same state twice gave different hashes (impurity)
 *   BOUNDS    hp/score/turn outside their contracts
 * Also replays the walkthrough and prints coverage (rooms seen, endings seen).
 * Exit 0 = green. `--replay <trace.json>` re-runs a recorded session and
 * prints its receipt (used to verify playtest reports).
 */
import { readFileSync } from "node:fs";
import { z } from "zod";
import { hashState, legalActions, newState, receipt, step } from "./engine.ts";
import { loadValidatedWorld, replayWalkthrough } from "./validate.ts";
import type { State, Trace, World } from "./types.ts";

const id = z.string().min(1);
const traceSchema: z.ZodType<Trace> = z.object({
  world: id,
  seed: z.number().int().safe(),
  actions: z.array(z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("go"), dir: id }).strict(),
    z.object({ kind: z.literal("take"), item: id }).strict(),
    z.object({ kind: z.literal("use"), item: id, target: id.optional() }).strict(),
    z.object({ kind: z.literal("talk"), npc: id, topic: id }).strict(),
    z.object({ kind: z.literal("attack"), npc: id }).strict(),
    z.object({ kind: z.literal("custom"), room: id, id }).strict(),
  ])),
  receipt: z.string().optional(),
}).strict();

function parseTrace(input: unknown): Trace {
  const result = traceSchema.safeParse(input);
  if (!result.success) {
    throw new Error(`Invalid trace: ${result.error.issues.map((issue) => `${issue.path.join(".") || "trace"}: ${issue.message}`).join("; ")}`);
  }
  return result.data;
}

function walkRng(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function crawl(world: World, walks: number, maxSteps: number): {
  findings: string[];
  roomsSeen: Set<string>;
  endingsSeen: Set<string>;
  steps: number;
} {
  const findings: string[] = [];
  const roomsSeen = new Set<string>();
  const endingsSeen = new Set<string>();
  let steps = 0;

  const observe = (state: State, walk: number) => {
    roomsSeen.add(state.room);
    if (state.ended) endingsSeen.add(state.ended.id);
    if (!Number.isFinite(state.hp) || state.hp < 0 || state.hp > world.hp) findings.push(`BOUNDS hp=${state.hp} walk ${walk}`);
    if (!Number.isFinite(state.score) || state.score < 0 || state.score > world.maxScore) findings.push(`BOUNDS score=${state.score} walk ${walk}`);
    if (!Number.isSafeInteger(state.turn) || state.turn < 0) findings.push(`BOUNDS turn=${state.turn} walk ${walk}`);
  };

  for (let w = 0; w < walks && findings.length < 20; w++) {
    const rnd = walkRng(1000 + w);
    let state: State;
    try {
      state = newState(world, w + 1).state;
    } catch (e) {
      findings.push(`CRASH walk ${w} initializing: ${String(e)}`);
      continue;
    }
    observe(state, w);
    for (let i = 0; i < maxSteps; i++) {
      if (state.ended) break;
      let legal;
      try {
        legal = legalActions(world, state);
      } catch (e) {
        findings.push(`CRASH walk ${w} turn ${state.turn} menu: ${String(e)}`);
        break;
      }
      if (!legal.length) { findings.push(`EMPTYMENU walk ${w} turn ${state.turn} room ${state.room}`); break; }
      const a = legal[Math.floor(rnd() * legal.length)]!;
      let out;
      try {
        const before = hashState(state);
        out = step(world, state, a);
        // purity check: same state + same action twice must be identical
        const again = step(world, state, a);
        if (before !== hashState(state) || hashState(out.state) !== hashState(again.state)
          || JSON.stringify(out.events) !== JSON.stringify(again.events)) {
          findings.push(`DESYNC walk ${w} turn ${state.turn} action ${JSON.stringify(a)}`);
          break;
        }
      } catch (e) {
        findings.push(`CRASH walk ${w} turn ${state.turn} action ${JSON.stringify(a)}: ${String(e)}`);
        break;
      }
      if (out.state.turn !== state.turn + 1) findings.push(`BOUNDS turn=${out.state.turn} expected ${state.turn + 1} walk ${w}`);
      state = out.state;
      steps++;
      observe(state, w);
    }
  }
  return { findings, roomsSeen, endingsSeen, steps };
}

/** Replay validated actions and expose the authoritative terminal/open state. */
export function replayTraceState(world: World, input: unknown): State {
  const trace = parseTrace(input);
  if (trace.world !== world.id) throw new Error(`Trace world ${trace.world} does not match ${world.id}`);
  let { state } = newState(world, trace.seed);
  for (const [index, action] of trace.actions.entries()) {
    const next = step(world, state, action).state;
    if (next === state) throw new Error(`Illegal trace action ${index + 1} at turn ${state.turn}: ${JSON.stringify(action)}`);
    state = next;
  }
  const actual = receipt(world, state);
  if (trace.receipt !== undefined && trace.receipt !== actual) {
    throw new Error(`Trace receipt mismatch: expected ${trace.receipt}, replayed ${actual}`);
  }
  return state;
}

export function replayTrace(world: World, input: unknown): string {
  return receipt(world, replayTraceState(world, input));
}

// ---------- CLI ----------
if (process.argv[1]?.endsWith("crawl.ts")) {
  const args = process.argv.slice(2);
  const replayIndex = args.indexOf("--replay");
  const worldPath = args.find((arg, index) => arg.endsWith(".json") && !(replayIndex >= 0 && index === replayIndex + 1)) ?? process.env.TF_WORLD;

  if (args.includes("--replay")) {
    try {
      const tracePath = args[args.indexOf("--replay") + 1];
      if (!tracePath || tracePath.startsWith("--")) throw new Error("--replay requires a trace file");
      const trace = parseTrace(JSON.parse(readFileSync(tracePath, "utf8")));
      if (!worldPath && !/^[a-zA-Z0-9_-]+$/.test(trace.world)) throw new Error("Trace world must be a world filename stem; set TF_WORLD for a custom world path");
      const world = loadValidatedWorld(worldPath ?? `world/${trace.world}.json`);
      console.log(replayTrace(world, trace));
      process.exit(0);
    } catch (error) {
      console.error(`  ✗ REPLAY ${String(error)}`);
      process.exit(1);
    }
  }

  let world: World;
  try {
    world = loadValidatedWorld(worldPath ?? "world/lighthouse.json");
  } catch (error) {
    console.error(`  ✗ WORLD ${String(error)}`);
    process.exit(1);
  }
  const walks = args.includes("--deep") ? 400 : 60;
  const maxSteps = args.includes("--deep") ? 300 : 120;
  const t0 = Date.now();
  const r = crawl(world, walks, maxSteps);
  const wt = replayWalkthrough(world, 1);
  if (wt.error) r.findings.push(`WALKTHROUGH ${wt.error}`);
  const rooms = Object.keys(world.rooms).length;
  console.log(
    `crawl: ${walks} walks, ${r.steps} steps, ${Date.now() - t0}ms | rooms ${r.roomsSeen.size}/${rooms} | endings seen: ${[...r.endingsSeen].join(",") || "none"} | walkthrough: ${wt.error ?? `win in ${wt.turns}t`}`,
  );
  if (r.findings.length) {
    for (const f of r.findings) console.error(`  ✗ ${f}`);
    process.exit(1);
  }
  process.exit(0);
}
