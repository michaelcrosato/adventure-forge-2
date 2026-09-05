/**
 * tinyforge validator — the only door between authored content and the runtime.
 *
 * Static: every reference resolves, every DSL op is whitelisted, menus stay
 * within the cap. Dynamic: the authored walkthrough must replay to a WIN with
 * score === maxScore — the ending witness and the score-economy proof in one.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import {
  actionByLabel,
  condOk,
  legalActions,
  newState,
  step,
} from "./engine.ts";
import type { Cond, Fx, State, World } from "./types.ts";

export const MENU_CAP = 12;

const COND_OPS = new Set(["has", "!has", "flag", "!flag", "npcDead", "!npcDead", "var"]);
const FX_OPS = new Set([
  "say", "set", "clear", "score", "hp", "move", "goto", "npcgo", "setvar", "addvar", "check", "end",
]);

const name = z.string().min(1);
// Zod omits this key while assembling parsed records. Reject it before parsing
// can make the proof see different content from the original runtime world.
const recordKey = name.refine((key) => key !== "__proto__", "reserved record key __proto__");
const finite = z.number().finite();
const condSchema: z.ZodType<Cond> = z.union([
  z.tuple([z.enum(["has", "!has", "flag", "!flag", "npcDead", "!npcDead"]), name]),
  z.tuple([z.literal("var"), name, z.enum(["<", ">", "=", ">="]), finite]),
], {
  errorMap: (_issue, ctx) => ({ message: Array.isArray(ctx.data) && !COND_OPS.has(ctx.data[0])
    ? `unknown cond op ${String(ctx.data[0])}` : "invalid condition operands" }),
});
const fxSchema: z.ZodType<Fx> = z.lazy(() => z.union([
  z.tuple([z.enum(["say", "set", "clear", "goto"]), z.string()]),
  z.tuple([z.enum(["score", "hp"]), finite]),
  z.tuple([z.literal("move"), name, name]),
  z.tuple([z.literal("npcgo"), name, name.nullable()]),
  z.tuple([z.enum(["setvar", "addvar"]), name, finite]),
  z.tuple([z.literal("check"), name, finite, z.array(fxSchema), z.array(fxSchema)]),
  z.tuple([z.literal("end"), z.enum(["win", "lose"]), name, z.string()]),
], {
  errorMap: (_issue, ctx) => ({ message: Array.isArray(ctx.data) && !FX_OPS.has(ctx.data[0])
    ? `unknown fx op ${String(ctx.data[0])}` : "invalid effect operands" }),
}));
const conds = z.array(condSchema).optional();
const effects = z.array(fxSchema);
const worldSchema: z.ZodType<World> = z.object({
  id: name, title: name, intro: z.string(), start: name,
  hp: finite.positive(), maxScore: finite.nonnegative(),
  skills: z.record(recordKey, finite).optional(),
  rooms: z.record(recordKey, z.object({
    name, desc: z.string(), brief: z.string().optional(), dark: z.boolean().optional(),
    exits: z.record(recordKey, z.object({
      to: name, if: conds, lockedMsg: z.string().optional(),
    }).strict()).optional(),
    onEnter: effects.optional(), onEnterOnce: effects.optional(),
    actions: z.array(z.object({
      id: name, label: name, if: conds, once: z.boolean().optional(), fx: effects,
    }).strict()).optional(),
  }).strict()),
  items: z.record(recordKey, z.object({
    name, loc: name, takeable: z.boolean().optional(), light: z.boolean().optional(),
    hit: finite.optional(), dmg: finite.nonnegative().optional(),
    use: z.array(z.object({ target: name.optional(), if: conds, fx: effects }).strict()).optional(),
  }).strict()),
  npcs: z.record(recordKey, z.object({
    name, room: name.nullable(), desc: z.string().optional(), hostile: z.boolean().optional(),
    hp: finite.nonnegative().optional(), atk: finite.nonnegative().optional(), df: finite.optional(),
    onDeath: effects.optional(),
    topics: z.array(z.object({
      id: name, label: name, if: conds, once: z.boolean().optional(),
      say: z.string(), fx: effects.optional(),
    }).strict()).optional(),
  }).strict()),
  walkthrough: z.array(z.union([
    name,
    z.object({ repeat: name, until: condSchema, max: finite.int().nonnegative() }).strict(),
  ])),
}).strict();

export function loadWorld(path: string): World {
  return JSON.parse(readFileSync(path, "utf8")) as World;
}

/** Load a world from an import.meta.url-relative file: URL (Windows-safe). */
export function loadWorldUrl(url: URL): World {
  return loadWorld(fileURLToPath(url));
}

/** Runtime entrypoint: malformed or unproven content must not reach the engine. */
export function loadValidatedWorld(path: string | URL): World {
  const filename = typeof path === "string" ? path : fileURLToPath(path);
  const world = loadWorld(filename);
  const errors = validateWorld(world);
  if (errors.length) throw new Error(`Invalid world ${filename}:\n${errors.map((error) => `  - ${error}`).join("\n")}`);
  return world;
}

export function validateWorld(input: unknown): string[] {
  const parsed = worldSchema.safeParse(input);
  if (!parsed.success) {
    return parsed.error.issues.map((issue) => `${issue.path.join(".") || "world"}: ${issue.message}`);
  }
  const world = parsed.data;
  const errs: string[] = [];
  const err = (m: string) => errs.push(m);
  const roomOk = (id: string) => Object.hasOwn(world.rooms, id);
  const itemOk = (id: string) => Object.hasOwn(world.items, id);
  const npcOk = (id: string) => Object.hasOwn(world.npcs, id);
  const locOk = (l: string) => l === "inv" || l === "nowhere" || roomOk(l);
  const onceFlags = new Map<string, string>();
  const claimFlag = (flag: string, where: string) => {
    const previous = onceFlags.get(flag);
    if (previous) err(`${where}: once flag ${flag} collides with ${previous}`);
    else onceFlags.set(flag, where);
  };

  const checkConds = (where: string, cs?: Cond[]) => {
    for (const c of cs ?? []) {
      if ((c[0] === "flag" || c[0] === "!flag" || c[0] === "var") && Object.hasOwn(Object.prototype, c[1])) {
        err(`${where}: reserved state key ${c[1]}`);
      }
      if ((c[0] === "has" || c[0] === "!has") && !itemOk(c[1])) err(`${where}: unknown item ${c[1]}`);
      else if ((c[0] === "npcDead" || c[0] === "!npcDead") && !npcOk(c[1])) err(`${where}: unknown npc ${c[1]}`);
    }
  };
  const checkFx = (where: string, fxs?: Fx[]) => {
    for (const fx of fxs ?? []) {
      const op = fx[0];
      if ((op === "set" || op === "clear" || op === "setvar" || op === "addvar") && Object.hasOwn(Object.prototype, fx[1])) {
        err(`${where}: reserved state key ${fx[1]}`);
      }
      if (op === "move" && !itemOk(fx[1])) err(`${where}: unknown item ${fx[1]}`);
      if (op === "move" && !locOk(fx[2])) err(`${where}: bad location ${fx[2]}`);
      if (op === "goto" && !roomOk(fx[1])) err(`${where}: unknown room ${fx[1]}`);
      if (op === "npcgo" && !npcOk(fx[1])) err(`${where}: unknown npc ${fx[1]}`);
      if (op === "npcgo" && fx[2] !== null && !roomOk(fx[2])) err(`${where}: unknown room ${fx[2]}`);
      if (op === "check") {
        if (!Object.hasOwn(world.skills ?? {}, fx[1])) err(`${where}: unknown skill ${fx[1]}`);
        checkFx(`${where}.check.ok`, fx[3]);
        checkFx(`${where}.check.fail`, fx[4]);
      }
    }
  };

  if (!roomOk(world.start)) err(`start: unknown room ${world.start}`);
  for (const [rid, room] of Object.entries(world.rooms)) {
    if (rid === "inv" || rid === "nowhere") err(`room ${rid}: reserved item location`);
    for (const [dir, ex] of Object.entries(room.exits ?? {})) {
      if (!roomOk(ex.to)) err(`room ${rid} exit ${dir}: unknown room ${ex.to}`);
      checkConds(`room ${rid} exit ${dir}`, ex.if);
    }
    checkFx(`room ${rid} onEnter`, room.onEnter);
    checkFx(`room ${rid} onEnterOnce`, room.onEnterOnce);
    const actionIds = new Set<string>();
    for (const a of room.actions ?? []) {
      if (actionIds.has(a.id)) err(`room ${rid}: duplicate action id ${a.id}`);
      actionIds.add(a.id);
      if (a.once) claimFlag(`did_${a.id}`, `room ${rid} action ${a.id}`);
      checkConds(`room ${rid} action ${a.id}`, a.if);
      checkFx(`room ${rid} action ${a.id}`, a.fx);
    }
  }
  for (const [iid, item] of Object.entries(world.items)) {
    if (!locOk(item.loc)) err(`item ${iid}: bad loc ${item.loc}`);
    for (const u of item.use ?? []) {
      if (u.target && !itemOk(u.target) && !npcOk(u.target)) err(`item ${iid} use: unknown target ${u.target}`);
      if (u.target && itemOk(u.target) && npcOk(u.target)) err(`item ${iid} use: ambiguous target ${u.target} names both an item and an npc`);
      checkConds(`item ${iid} use`, u.if);
      checkFx(`item ${iid} use`, u.fx);
    }
  }
  for (const [nid, npc] of Object.entries(world.npcs)) {
    if (npc.room !== null && !roomOk(npc.room)) err(`npc ${nid}: unknown room ${npc.room}`);
    checkFx(`npc ${nid} onDeath`, npc.onDeath);
    const topicIds = new Set<string>();
    for (const t of npc.topics ?? []) {
      if (topicIds.has(t.id)) err(`npc ${nid}: duplicate topic id ${t.id}`);
      topicIds.add(t.id);
      if (t.once) claimFlag(`said_${nid}_${t.id}`, `npc ${nid} topic ${t.id}`);
      checkConds(`npc ${nid} topic ${t.id}`, t.if);
      checkFx(`npc ${nid} topic ${t.id}`, t.fx);
    }
  }
  for (const [index, entry] of world.walkthrough.entries()) {
    if (typeof entry !== "string") checkConds(`walkthrough ${index} until`, [entry.until]);
  }

  // Invalid references must not be executed during the dynamic proof.
  if (errs.length) return errs;

  // Dynamic proof: replay the walkthrough at seed 1.
  if (!world.walkthrough?.length) {
    err("walkthrough: missing — every world must carry its ending witness");
  } else {
    const result = replayWalkthrough(world, 1);
    if (result.error) err(`walkthrough: ${result.error}`);
    else {
      const s = result.state!;
      if (!s.ended || s.ended.kind !== "win") err(`walkthrough: did not end in a win (${s.ended?.id ?? "still open"})`);
      else if (s.score !== world.maxScore) err(`walkthrough: score ${s.score} !== maxScore ${world.maxScore} — score economy unsound`);
      // Menu cap along the proven path
      if (result.maxMenu > MENU_CAP) err(`walkthrough: menu hit ${result.maxMenu} > cap ${MENU_CAP}`);
    }
  }
  return errs;
}

export function replayWalkthrough(
  world: World,
  seed: number,
): { state?: State; error?: string; maxMenu: number; turns: number } {
  let state: State;
  try {
    state = newState(world, seed).state;
  } catch (error) {
    return { error: `initialization failed: ${String(error)}`, maxMenu: 0, turns: 0 };
  }
  let maxMenu = 0;
  const doLabel = (label: string): string | null => {
    try {
      maxMenu = Math.max(maxMenu, legalActions(world, state).length);
      const a = actionByLabel(world, state, label);
      if (!a) return `no legal action labeled "${label}" at ${state.room} (turn ${state.turn})`;
      state = step(world, state, a).state;
      return null;
    } catch (error) {
      return `action "${label}" failed at ${state.room} (turn ${state.turn}): ${String(error)}`;
    }
  };
  for (const w of world.walkthrough) {
    if (typeof w === "string") {
      const e = doLabel(w);
      if (e) return { error: e, maxMenu, turns: state.turn };
    } else {
      let n = 0;
      while (!condOk(world, state, w.until)) {
        if (n++ >= w.max) return { error: `repeat "${w.repeat}" exceeded max ${w.max}`, maxMenu, turns: state.turn };
        if (state.ended) return { error: `ended inside repeat "${w.repeat}" before its condition was met`, maxMenu, turns: state.turn };
        const e = doLabel(w.repeat);
        if (e) return { error: e, maxMenu, turns: state.turn };
      }
    }
    if (state.ended) break;
  }
  return { state, maxMenu, turns: state.turn };
}

// ---------- CLI ----------
if (process.argv[1]?.endsWith("validate.ts")) {
  const paths = process.argv.slice(2);
  if (!paths.length) {
    console.error("usage: tsx src/validate.ts world/<file>.json ...");
    process.exit(2);
  }
  let bad = 0;
  for (const p of paths) {
    const world = loadWorld(p);
    const errs = validateWorld(world);
    if (errs.length) {
      bad++;
      console.error(`✗ ${p}`);
      for (const e of errs) console.error(`  - ${e}`);
    } else {
      const r = replayWalkthrough(world, 1);
      console.log(`✓ ${p} — win proven in ${r.turns} turns, max menu ${r.maxMenu}/${MENU_CAP}`);
    }
  }
  process.exit(bad ? 1 : 0);
}
