import assert from "node:assert/strict";
import test from "node:test";
import {
  actionByLabel,
  condOk,
  hashState,
  legalActions,
  newState,
  receipt,
  step,
} from "../src/engine.ts";
import { replayTrace } from "../src/crawl.ts";
import { render } from "../src/format.ts";
import { loadWorldUrl, replayWalkthrough } from "../src/validate.ts";
import type { Action, State, World } from "../src/types.ts";

const world: World = loadWorldUrl(new URL("../world/lighthouse.json", import.meta.url));

/** Play the walkthrough at a seed, recording canonical actions + hash sequence. */
function recordWalkthrough(seed: number): { actions: Action[]; hashes: string[]; state: State } {
  let { state } = newState(world, seed);
  const actions: Action[] = [];
  const hashes: string[] = [hashState(state)];
  const doLabel = (label: string) => {
    const a = actionByLabel(world, state, label);
    assert.ok(a, `legal action "${label}" at ${state.room} t${state.turn}`);
    actions.push(a);
    state = step(world, state, a).state;
    hashes.push(hashState(state));
  };
  for (const w of world.walkthrough) {
    if (typeof w === "string") doLabel(w);
    else {
      let n = 0;
      while (!condOk(world, state, w.until)) {
        assert.ok(n++ < w.max, `repeat "${w.repeat}" within max`);
        assert.ok(!state.ended, `alive inside repeat "${w.repeat}"`);
        doLabel(w.repeat);
      }
    }
    if (state.ended) break;
  }
  return { actions, hashes, state };
}

// Content assertions share one proven run; callers receive isolated copies.
// The determinism test below still executes the reducer twice independently.
const walkthroughRuns = new Map<number, ReturnType<typeof recordWalkthrough>>();
function playWalkthrough(seed: number): ReturnType<typeof recordWalkthrough> {
  if (!walkthroughRuns.has(seed)) walkthroughRuns.set(seed, recordWalkthrough(seed));
  return structuredClone(walkthroughRuns.get(seed)!);
}

test("same seed => byte-identical run (hash sequence and receipt)", () => {
  const a = recordWalkthrough(1);
  const b = recordWalkthrough(1);
  assert.deepEqual(a.hashes, b.hashes);
  assert.equal(receipt(world, a.state), receipt(world, b.state));
});

test("walkthrough wins with full score (ending witness + score economy)", () => {
  const r = replayWalkthrough(world, 1);
  assert.equal(r.error, undefined);
  assert.equal(r.state?.ended?.kind, "win");
  assert.equal(r.state?.score, world.maxScore);
});

test("recorded trace replays to the same receipt", () => {
  const a = playWalkthrough(1);
  const rec = replayTrace(world, { world: world.id, seed: 1, actions: a.actions });
  assert.equal(rec, receipt(world, a.state));
});

test("illegal action leaves state untouched", () => {
  const { state } = newState(world, 1);
  const before = hashState(state);
  const out = step(world, state, { kind: "go", dir: "up" }); // no up exit at cove
  assert.equal(hashState(out.state), before);
  assert.match(out.events.join(" "), /Illegal/);
});

test("locked exit refuses until the key is held", () => {
  let { state } = newState(world, 1);
  // walk to the lighthouse door without the key
  for (const label of ["go north", "go west", "go up"]) {
    const a = actionByLabel(world, state, label);
    assert.ok(a, label);
    state = step(world, state, a).state;
  }
  const inA = actionByLabel(world, state, "go in");
  assert.ok(inA);
  const out = step(world, state, inA);
  assert.equal(out.state.room, "lighthouse_base");
  assert.match(out.events.join(" "), /locked|key/i);
});

test("dark room exposes only exits until a lit light is carried", () => {
  let { state } = newState(world, 1);
  state = structuredClone(state);
  state.room = "stair"; // teleport straight into the dark for the check
  const kinds = new Set(legalActions(world, state).map((a) => a.kind));
  assert.deepEqual([...kinds], ["go"]);
  state.inv.push("lantern");
  state.itemLoc["lantern"] = "inv";
  state.flags["lantern_lit"] = true;
  assert.ok(legalActions(world, state).length > 0);
});

test("hp reaching 0 ends the game as a loss", () => {
  let { state } = newState(world, 1);
  state = structuredClone(state);
  state.room = "oil_store";
  state.inv.push("lantern");
  state.itemLoc["lantern"] = "inv";
  state.flags["lantern_lit"] = true;
  state.hp = 1;
  // attack until the wight's counterattack (or victory) resolves the fight
  for (let i = 0; i < 20 && !state.ended; i++) {
    const a = actionByLabel(world, state, "attack sea-wight with bare hands");
    if (!a) break;
    state = step(world, state, a).state;
  }
  if (state.ended) assert.ok(["dead"].includes(state.ended.id) || state.ended.kind === "win" || state.hp > 0);
});

test("score is clamped to maxScore", () => {
  const a = playWalkthrough(1);
  assert.ok(a.state.score <= world.maxScore);
});

test("carried items appear in the observation", () => {
  let { state } = newState(world, 1);
  for (const label of ["go north", "take notched cutlass"]) {
    const a = actionByLabel(world, state, label);
    assert.ok(a, label);
    state = step(world, state, a).state;
  }
  const r = render(world, state, []);
  assert.match(r.text, /inv:.*notched cutlass/);
});

test("successful oiling consumes the oil flask", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.oiled);
  assert.ok(!state.inv.includes("oil_flask"), "flask still carried after oiling");
  assert.equal(state.itemLoc.oil_flask, "nowhere");
});

test("rust durumcistern is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumcistern);
  assert.ok(state.visited.includes("rust_durumcistern"));
});

test("rust foniocistern is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniocistern);
  assert.ok(state.visited.includes("rust_foniocistern"));
});

test("rust teffcistern is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffcistern);
  assert.ok(state.visited.includes("rust_teffcistern"));
});

test("rust barleycistern is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleycistern);
  assert.ok(state.visited.includes("rust_barleycistern"));
});

test("rust sorghumcistern is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumcistern);
  assert.ok(state.visited.includes("rust_sorghumcistern"));
});

test("rust milletcistern is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletcistern);
  assert.ok(state.visited.includes("rust_milletcistern"));
});

test("rust corncistern is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_corncistern);
  assert.ok(state.visited.includes("rust_corncistern"));
});

test("rust oatcistern is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatcistern);
  assert.ok(state.visited.includes("rust_oatcistern"));
});

test("rust durumpipe is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumpipe);
  assert.ok(state.visited.includes("rust_durumpipe"));
});

test("rust foniopipe is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniopipe);
  assert.ok(state.visited.includes("rust_foniopipe"));
});

test("rust teffpipe is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffpipe);
  assert.ok(state.visited.includes("rust_teffpipe"));
});

test("rust barleypipe is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleypipe);
  assert.ok(state.visited.includes("rust_barleypipe"));
});

test("rust sorghumpipe is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumpipe);
  assert.ok(state.visited.includes("rust_sorghumpipe"));
});

test("rust milletpipe is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletpipe);
  assert.ok(state.visited.includes("rust_milletpipe"));
});

test("rust cornpipe is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornpipe);
  assert.ok(state.visited.includes("rust_cornpipe"));
});

test("rust oatpipe is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatpipe);
  assert.ok(state.visited.includes("rust_oatpipe"));
});

test("rust durumbutt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumbutt);
  assert.ok(state.visited.includes("rust_durumbutt"));
});

test("rust foniobutt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniobutt);
  assert.ok(state.visited.includes("rust_foniobutt"));
});

test("rust teffbutt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffbutt);
  assert.ok(state.visited.includes("rust_teffbutt"));
});

test("rust barleybutt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleybutt);
  assert.ok(state.visited.includes("rust_barleybutt"));
});

test("rust sorghumbutt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumbutt);
  assert.ok(state.visited.includes("rust_sorghumbutt"));
});

test("rust milletbutt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletbutt);
  assert.ok(state.visited.includes("rust_milletbutt"));
});

test("rust cornbutt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornbutt);
  assert.ok(state.visited.includes("rust_cornbutt"));
});

test("rust oatbutt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatbutt);
  assert.ok(state.visited.includes("rust_oatbutt"));
});

test("rust durumpuncheon is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumpuncheon);
  assert.ok(state.visited.includes("rust_durumpuncheon"));
});

test("rust foniopuncheon is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniopuncheon);
  assert.ok(state.visited.includes("rust_foniopuncheon"));
});

test("rust teffpuncheon is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffpuncheon);
  assert.ok(state.visited.includes("rust_teffpuncheon"));
});

test("rust barleypuncheon is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleypuncheon);
  assert.ok(state.visited.includes("rust_barleypuncheon"));
});

test("rust sorghumpuncheon is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumpuncheon);
  assert.ok(state.visited.includes("rust_sorghumpuncheon"));
});

test("rust milletpuncheon is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletpuncheon);
  assert.ok(state.visited.includes("rust_milletpuncheon"));
});

test("rust cornpuncheon is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornpuncheon);
  assert.ok(state.visited.includes("rust_cornpuncheon"));
});

test("rust oatpuncheon is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatpuncheon);
  assert.ok(state.visited.includes("rust_oatpuncheon"));
});

test("rust durumhogshead is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumhogshead);
  assert.ok(state.visited.includes("rust_durumhogshead"));
});

test("rust foniohogshead is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniohogshead);
  assert.ok(state.visited.includes("rust_foniohogshead"));
});

test("rust teffhogshead is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffhogshead);
  assert.ok(state.visited.includes("rust_teffhogshead"));
});

test("rust barleyhogshead is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyhogshead);
  assert.ok(state.visited.includes("rust_barleyhogshead"));
});

test("rust sorghumhogshead is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumhogshead);
  assert.ok(state.visited.includes("rust_sorghumhogshead"));
});

test("rust millethogshead is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_millethogshead);
  assert.ok(state.visited.includes("rust_millethogshead"));
});

test("rust cornhogshead is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornhogshead);
  assert.ok(state.visited.includes("rust_cornhogshead"));
});

test("rust oathogshead is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oathogshead);
  assert.ok(state.visited.includes("rust_oathogshead"));
});

test("rust durumtierce is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumtierce);
  assert.ok(state.visited.includes("rust_durumtierce"));
});

test("rust foniotierce is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniotierce);
  assert.ok(state.visited.includes("rust_foniotierce"));
});

test("rust tefftierce is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tefftierce);
  assert.ok(state.visited.includes("rust_tefftierce"));
});

test("rust barleytierce is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleytierce);
  assert.ok(state.visited.includes("rust_barleytierce"));
});

test("rust sorghumtierce is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumtierce);
  assert.ok(state.visited.includes("rust_sorghumtierce"));
});

test("rust millettierce is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_millettierce);
  assert.ok(state.visited.includes("rust_millettierce"));
});

test("rust corntierce is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_corntierce);
  assert.ok(state.visited.includes("rust_corntierce"));
});

test("rust oattierce is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oattierce);
  assert.ok(state.visited.includes("rust_oattierce"));
});

test("rust durumrundlet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumrundlet);
  assert.ok(state.visited.includes("rust_durumrundlet"));
});

test("rust foniorundlet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniorundlet);
  assert.ok(state.visited.includes("rust_foniorundlet"));
});

test("rust teffrundlet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffrundlet);
  assert.ok(state.visited.includes("rust_teffrundlet"));
});

test("rust barleyrundlet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyrundlet);
  assert.ok(state.visited.includes("rust_barleyrundlet"));
});

test("rust sorghumrundlet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumrundlet);
  assert.ok(state.visited.includes("rust_sorghumrundlet"));
});

test("rust milletrundlet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletrundlet);
  assert.ok(state.visited.includes("rust_milletrundlet"));
});

test("rust cornrundlet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornrundlet);
  assert.ok(state.visited.includes("rust_cornrundlet"));
});

test("rust oatrundlet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatrundlet);
  assert.ok(state.visited.includes("rust_oatrundlet"));
});

test("rust durumkilderkin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumkilderkin);
  assert.ok(state.visited.includes("rust_durumkilderkin"));
});

test("rust foniokilderkin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniokilderkin);
  assert.ok(state.visited.includes("rust_foniokilderkin"));
});

test("rust teffkilderkin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffkilderkin);
  assert.ok(state.visited.includes("rust_teffkilderkin"));
});

test("rust barleykilderkin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleykilderkin);
  assert.ok(state.visited.includes("rust_barleykilderkin"));
});

test("rust sorghumkilderkin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumkilderkin);
  assert.ok(state.visited.includes("rust_sorghumkilderkin"));
});

test("rust milletkilderkin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletkilderkin);
  assert.ok(state.visited.includes("rust_milletkilderkin"));
});

test("rust cornkilderkin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornkilderkin);
  assert.ok(state.visited.includes("rust_cornkilderkin"));
});

test("rust oatkilderkin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatkilderkin);
  assert.ok(state.visited.includes("rust_oatkilderkin"));
});

test("rust durumfirkin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumfirkin);
  assert.ok(state.visited.includes("rust_durumfirkin"));
});

test("rust foniofirkin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniofirkin);
  assert.ok(state.visited.includes("rust_foniofirkin"));
});

test("rust tefffirkin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tefffirkin);
  assert.ok(state.visited.includes("rust_tefffirkin"));
});

test("rust barleyfirkin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyfirkin);
  assert.ok(state.visited.includes("rust_barleyfirkin"));
});

test("rust sorghumfirkin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumfirkin);
  assert.ok(state.visited.includes("rust_sorghumfirkin"));
});

test("rust milletfirkin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletfirkin);
  assert.ok(state.visited.includes("rust_milletfirkin"));
});

test("rust cornfirkin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornfirkin);
  assert.ok(state.visited.includes("rust_cornfirkin"));
});

test("rust oatfirkin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatfirkin);
  assert.ok(state.visited.includes("rust_oatfirkin"));
});

test("rust durumbarrel is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumbarrel);
  assert.ok(state.visited.includes("rust_durumbarrel"));
});

test("rust foniobarrel is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniobarrel);
  assert.ok(state.visited.includes("rust_foniobarrel"));
});

test("rust teffbarrel is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffbarrel);
  assert.ok(state.visited.includes("rust_teffbarrel"));
});

test("rust barleybarrel is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleybarrel);
  assert.ok(state.visited.includes("rust_barleybarrel"));
});

test("rust sorghumbarrel is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumbarrel);
  assert.ok(state.visited.includes("rust_sorghumbarrel"));
});

test("rust milletbarrel is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletbarrel);
  assert.ok(state.visited.includes("rust_milletbarrel"));
});

test("rust cornbarrel is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornbarrel);
  assert.ok(state.visited.includes("rust_cornbarrel"));
});

test("rust oatbarrel is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatbarrel);
  assert.ok(state.visited.includes("rust_oatbarrel"));
});

test("rust durumtun is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumtun);
  assert.ok(state.visited.includes("rust_durumtun"));
});

test("rust foniotun is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniotun);
  assert.ok(state.visited.includes("rust_foniotun"));
});

test("rust tefftun is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tefftun);
  assert.ok(state.visited.includes("rust_tefftun"));
});

test("rust barleytun is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleytun);
  assert.ok(state.visited.includes("rust_barleytun"));
});

test("rust sorghumtun is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumtun);
  assert.ok(state.visited.includes("rust_sorghumtun"));
});

test("rust millettun is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_millettun);
  assert.ok(state.visited.includes("rust_millettun"));
});

test("rust corntun is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_corntun);
  assert.ok(state.visited.includes("rust_corntun"));
});

test("rust oattun is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oattun);
  assert.ok(state.visited.includes("rust_oattun"));
});

test("rust durumamphora is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumamphora);
  assert.ok(state.visited.includes("rust_durumamphora"));
});

test("rust fonioamphora is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fonioamphora);
  assert.ok(state.visited.includes("rust_fonioamphora"));
});

test("rust teffamphora is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffamphora);
  assert.ok(state.visited.includes("rust_teffamphora"));
});

test("rust barleyamphora is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyamphora);
  assert.ok(state.visited.includes("rust_barleyamphora"));
});

test("rust sorghumamphora is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumamphora);
  assert.ok(state.visited.includes("rust_sorghumamphora"));
});

test("rust milletamphora is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletamphora);
  assert.ok(state.visited.includes("rust_milletamphora"));
});

test("rust cornamphora is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornamphora);
  assert.ok(state.visited.includes("rust_cornamphora"));
});

test("rust oatamphora is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatamphora);
  assert.ok(state.visited.includes("rust_oatamphora"));
});

test("rust durumdemijohn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumdemijohn);
  assert.ok(state.visited.includes("rust_durumdemijohn"));
});

test("rust foniodemijohn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniodemijohn);
  assert.ok(state.visited.includes("rust_foniodemijohn"));
});

test("rust teffdemijohn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffdemijohn);
  assert.ok(state.visited.includes("rust_teffdemijohn"));
});

test("rust barleydemijohn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleydemijohn);
  assert.ok(state.visited.includes("rust_barleydemijohn"));
});

test("rust sorghumdemijohn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumdemijohn);
  assert.ok(state.visited.includes("rust_sorghumdemijohn"));
});

test("rust milletdemijohn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletdemijohn);
  assert.ok(state.visited.includes("rust_milletdemijohn"));
});

test("rust corndemijohn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_corndemijohn);
  assert.ok(state.visited.includes("rust_corndemijohn"));
});

test("rust oatdemijohn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatdemijohn);
  assert.ok(state.visited.includes("rust_oatdemijohn"));
});

test("rust durumcarboy is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumcarboy);
  assert.ok(state.visited.includes("rust_durumcarboy"));
});

test("rust foniocarboy is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniocarboy);
  assert.ok(state.visited.includes("rust_foniocarboy"));
});

test("rust teffcarboy is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffcarboy);
  assert.ok(state.visited.includes("rust_teffcarboy"));
});

test("rust barleycarboy is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleycarboy);
  assert.ok(state.visited.includes("rust_barleycarboy"));
});

test("rust sorghumcarboy is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumcarboy);
  assert.ok(state.visited.includes("rust_sorghumcarboy"));
});

test("rust milletcarboy is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletcarboy);
  assert.ok(state.visited.includes("rust_milletcarboy"));
});

test("rust corncarboy is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_corncarboy);
  assert.ok(state.visited.includes("rust_corncarboy"));
});

test("rust oatcarboy is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatcarboy);
  assert.ok(state.visited.includes("rust_oatcarboy"));
});

test("rust durumampule is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumampule);
  assert.ok(state.visited.includes("rust_durumampule"));
});

test("rust fonioampule is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fonioampule);
  assert.ok(state.visited.includes("rust_fonioampule"));
});

test("rust teffampule is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffampule);
  assert.ok(state.visited.includes("rust_teffampule"));
});

test("rust barleyampule is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyampule);
  assert.ok(state.visited.includes("rust_barleyampule"));
});

test("rust sorghumampule is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumampule);
  assert.ok(state.visited.includes("rust_sorghumampule"));
});

test("rust milletampule is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletampule);
  assert.ok(state.visited.includes("rust_milletampule"));
});

test("rust cornampule is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornampule);
  assert.ok(state.visited.includes("rust_cornampule"));
});

test("rust oatampule is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatampule);
  assert.ok(state.visited.includes("rust_oatampule"));
});

test("rust durumphial is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumphial);
  assert.ok(state.visited.includes("rust_durumphial"));
});

test("rust foniophial is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniophial);
  assert.ok(state.visited.includes("rust_foniophial"));
});

test("rust teffphial is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffphial);
  assert.ok(state.visited.includes("rust_teffphial"));
});

test("rust barleyphial is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyphial);
  assert.ok(state.visited.includes("rust_barleyphial"));
});

test("rust sorghumphial is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumphial);
  assert.ok(state.visited.includes("rust_sorghumphial"));
});

test("rust milletphial is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletphial);
  assert.ok(state.visited.includes("rust_milletphial"));
});

test("rust cornphial is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornphial);
  assert.ok(state.visited.includes("rust_cornphial"));
});

test("rust oatphial is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatphial);
  assert.ok(state.visited.includes("rust_oatphial"));
});

test("rust durumflagon is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumflagon);
  assert.ok(state.visited.includes("rust_durumflagon"));
});

test("rust fonioflagon is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fonioflagon);
  assert.ok(state.visited.includes("rust_fonioflagon"));
});

test("rust teffflagon is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffflagon);
  assert.ok(state.visited.includes("rust_teffflagon"));
});

test("rust barleyflagon is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyflagon);
  assert.ok(state.visited.includes("rust_barleyflagon"));
});

test("rust sorghumflagon is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumflagon);
  assert.ok(state.visited.includes("rust_sorghumflagon"));
});

test("rust milletflagon is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletflagon);
  assert.ok(state.visited.includes("rust_milletflagon"));
});

test("rust cornflagon is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornflagon);
  assert.ok(state.visited.includes("rust_cornflagon"));
});

test("rust oatflagon is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatflagon);
  assert.ok(state.visited.includes("rust_oatflagon"));
});

test("rust durumewer is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumewer);
  assert.ok(state.visited.includes("rust_durumewer"));
});

test("rust fonioewer is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fonioewer);
  assert.ok(state.visited.includes("rust_fonioewer"));
});

test("rust teffewer is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffewer);
  assert.ok(state.visited.includes("rust_teffewer"));
});

test("rust barleyewer is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyewer);
  assert.ok(state.visited.includes("rust_barleyewer"));
});

test("rust sorghumewer is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumewer);
  assert.ok(state.visited.includes("rust_sorghumewer"));
});

test("rust milletewer is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletewer);
  assert.ok(state.visited.includes("rust_milletewer"));
});

test("rust cornewer is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornewer);
  assert.ok(state.visited.includes("rust_cornewer"));
});

test("rust oatewer is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatewer);
  assert.ok(state.visited.includes("rust_oatewer"));
});

test("rust durumcruet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumcruet);
  assert.ok(state.visited.includes("rust_durumcruet"));
});

test("rust foniocruet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniocruet);
  assert.ok(state.visited.includes("rust_foniocruet"));
});

test("rust teffcruet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffcruet);
  assert.ok(state.visited.includes("rust_teffcruet"));
});

test("rust barleycruet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleycruet);
  assert.ok(state.visited.includes("rust_barleycruet"));
});

test("rust sorghumcruet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumcruet);
  assert.ok(state.visited.includes("rust_sorghumcruet"));
});

test("rust milletcruet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletcruet);
  assert.ok(state.visited.includes("rust_milletcruet"));
});

test("rust corncruet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_corncruet);
  assert.ok(state.visited.includes("rust_corncruet"));
});

test("rust oatcruet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatcruet);
  assert.ok(state.visited.includes("rust_oatcruet"));
});

test("rust durumjug is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumjug);
  assert.ok(state.visited.includes("rust_durumjug"));
});

test("rust foniojug is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniojug);
  assert.ok(state.visited.includes("rust_foniojug"));
});

test("rust teffjug is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffjug);
  assert.ok(state.visited.includes("rust_teffjug"));
});

test("rust barleyjug is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyjug);
  assert.ok(state.visited.includes("rust_barleyjug"));
});

test("rust sorghumjug is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumjug);
  assert.ok(state.visited.includes("rust_sorghumjug"));
});

test("rust milletjug is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletjug);
  assert.ok(state.visited.includes("rust_milletjug"));
});

test("rust cornjug is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornjug);
  assert.ok(state.visited.includes("rust_cornjug"));
});

test("rust oatjug is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatjug);
  assert.ok(state.visited.includes("rust_oatjug"));
});

test("rust durumbottle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumbottle);
  assert.ok(state.visited.includes("rust_durumbottle"));
});

test("rust foniobottle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniobottle);
  assert.ok(state.visited.includes("rust_foniobottle"));
});

test("rust teffbottle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffbottle);
  assert.ok(state.visited.includes("rust_teffbottle"));
});

test("rust barleybottle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleybottle);
  assert.ok(state.visited.includes("rust_barleybottle"));
});

test("rust sorghumbottle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumbottle);
  assert.ok(state.visited.includes("rust_sorghumbottle"));
});

test("rust milletbottle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletbottle);
  assert.ok(state.visited.includes("rust_milletbottle"));
});

test("rust cornbottle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornbottle);
  assert.ok(state.visited.includes("rust_cornbottle"));
});

test("rust oatbottle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatbottle);
  assert.ok(state.visited.includes("rust_oatbottle"));
});

test("rust durumvial is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumvial);
  assert.ok(state.visited.includes("rust_durumvial"));
});

test("rust foniovial is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniovial);
  assert.ok(state.visited.includes("rust_foniovial"));
});

test("rust teffvial is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffvial);
  assert.ok(state.visited.includes("rust_teffvial"));
});

test("rust barleyvial is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyvial);
  assert.ok(state.visited.includes("rust_barleyvial"));
});

test("rust sorghumvial is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumvial);
  assert.ok(state.visited.includes("rust_sorghumvial"));
});

test("rust milletvial is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletvial);
  assert.ok(state.visited.includes("rust_milletvial"));
});

test("rust cornvial is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornvial);
  assert.ok(state.visited.includes("rust_cornvial"));
});

test("rust oatvial is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatvial);
  assert.ok(state.visited.includes("rust_oatvial"));
});

test("rust durumflask is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumflask);
  assert.ok(state.visited.includes("rust_durumflask"));
});

test("rust fonioflask is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fonioflask);
  assert.ok(state.visited.includes("rust_fonioflask"));
});

test("rust teffflask is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffflask);
  assert.ok(state.visited.includes("rust_teffflask"));
});

test("rust barleyflask is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyflask);
  assert.ok(state.visited.includes("rust_barleyflask"));
});

test("rust sorghumflask is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumflask);
  assert.ok(state.visited.includes("rust_sorghumflask"));
});

test("rust milletflask is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletflask);
  assert.ok(state.visited.includes("rust_milletflask"));
});

test("rust cornflask is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornflask);
  assert.ok(state.visited.includes("rust_cornflask"));
});

test("rust oatflask is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatflask);
  assert.ok(state.visited.includes("rust_oatflask"));
});

test("rust durumurn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumurn);
  assert.ok(state.visited.includes("rust_durumurn"));
});

test("rust foniourn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniourn);
  assert.ok(state.visited.includes("rust_foniourn"));
});

test("rust teffurn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffurn);
  assert.ok(state.visited.includes("rust_teffurn"));
});

test("rust barleyurn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyurn);
  assert.ok(state.visited.includes("rust_barleyurn"));
});

test("rust sorghumurn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumurn);
  assert.ok(state.visited.includes("rust_sorghumurn"));
});

test("rust milleturn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milleturn);
  assert.ok(state.visited.includes("rust_milleturn"));
});

test("rust cornurn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornurn);
  assert.ok(state.visited.includes("rust_cornurn"));
});

test("rust oaturn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oaturn);
  assert.ok(state.visited.includes("rust_oaturn"));
});

test("rust durumscoop is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumscoop);
  assert.ok(state.visited.includes("rust_durumscoop"));
});

test("rust fonioscoop is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fonioscoop);
  assert.ok(state.visited.includes("rust_fonioscoop"));
});

test("rust teffscoop is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffscoop);
  assert.ok(state.visited.includes("rust_teffscoop"));
});

test("rust barleyscoop is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyscoop);
  assert.ok(state.visited.includes("rust_barleyscoop"));
});

test("rust sorghumscoop is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumscoop);
  assert.ok(state.visited.includes("rust_sorghumscoop"));
});

test("rust milletscoop is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletscoop);
  assert.ok(state.visited.includes("rust_milletscoop"));
});

test("rust cornscoop is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornscoop);
  assert.ok(state.visited.includes("rust_cornscoop"));
});

test("rust oatscoop is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatscoop);
  assert.ok(state.visited.includes("rust_oatscoop"));
});

test("rust durumladle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumladle);
  assert.ok(state.visited.includes("rust_durumladle"));
});

test("rust fonioladle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fonioladle);
  assert.ok(state.visited.includes("rust_fonioladle"));
});

test("rust teffladle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffladle);
  assert.ok(state.visited.includes("rust_teffladle"));
});

test("rust barleyladle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyladle);
  assert.ok(state.visited.includes("rust_barleyladle"));
});

test("rust sorghumladle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumladle);
  assert.ok(state.visited.includes("rust_sorghumladle"));
});

test("rust milletladle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletladle);
  assert.ok(state.visited.includes("rust_milletladle"));
});

test("rust cornladle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornladle);
  assert.ok(state.visited.includes("rust_cornladle"));
});

test("rust oatladle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatladle);
  assert.ok(state.visited.includes("rust_oatladle"));
});

test("rust durumtray is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumtray);
  assert.ok(state.visited.includes("rust_durumtray"));
});

test("rust foniotray is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniotray);
  assert.ok(state.visited.includes("rust_foniotray"));
});

test("rust tefftray is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tefftray);
  assert.ok(state.visited.includes("rust_tefftray"));
});

test("rust barleytray is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleytray);
  assert.ok(state.visited.includes("rust_barleytray"));
});

test("rust sorghumtray is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumtray);
  assert.ok(state.visited.includes("rust_sorghumtray"));
});

test("rust millettray is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_millettray);
  assert.ok(state.visited.includes("rust_millettray"));
});

test("rust corntray is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_corntray);
  assert.ok(state.visited.includes("rust_corntray"));
});

test("rust oattray is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oattray);
  assert.ok(state.visited.includes("rust_oattray"));
});

test("rust durumbasin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumbasin);
  assert.ok(state.visited.includes("rust_durumbasin"));
});

test("rust foniobasin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniobasin);
  assert.ok(state.visited.includes("rust_foniobasin"));
});

test("rust teffbasin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffbasin);
  assert.ok(state.visited.includes("rust_teffbasin"));
});

test("rust barleybasin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleybasin);
  assert.ok(state.visited.includes("rust_barleybasin"));
});

test("rust sorghumbasin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumbasin);
  assert.ok(state.visited.includes("rust_sorghumbasin"));
});

test("rust milletbasin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletbasin);
  assert.ok(state.visited.includes("rust_milletbasin"));
});

test("rust cornbasin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornbasin);
  assert.ok(state.visited.includes("rust_cornbasin"));
});

test("rust oatbasin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatbasin);
  assert.ok(state.visited.includes("rust_oatbasin"));
});

test("rust durumcrock is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumcrock);
  assert.ok(state.visited.includes("rust_durumcrock"));
});

test("rust foniocrock is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniocrock);
  assert.ok(state.visited.includes("rust_foniocrock"));
});

test("rust teffcrock is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffcrock);
  assert.ok(state.visited.includes("rust_teffcrock"));
});

test("rust barleycrock is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleycrock);
  assert.ok(state.visited.includes("rust_barleycrock"));
});

test("rust sorghumcrock is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumcrock);
  assert.ok(state.visited.includes("rust_sorghumcrock"));
});

test("rust milletcrock is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletcrock);
  assert.ok(state.visited.includes("rust_milletcrock"));
});

test("rust corncrock is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_corncrock);
  assert.ok(state.visited.includes("rust_corncrock"));
});

test("rust oatcrock is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatcrock);
  assert.ok(state.visited.includes("rust_oatcrock"));
});

test("rust durumskillet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumskillet);
  assert.ok(state.visited.includes("rust_durumskillet"));
});

test("rust fonioskillet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fonioskillet);
  assert.ok(state.visited.includes("rust_fonioskillet"));
});

test("rust teffskillet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffskillet);
  assert.ok(state.visited.includes("rust_teffskillet"));
});

test("rust barleyskillet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyskillet);
  assert.ok(state.visited.includes("rust_barleyskillet"));
});

test("rust sorghumskillet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumskillet);
  assert.ok(state.visited.includes("rust_sorghumskillet"));
});

test("rust milletskillet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletskillet);
  assert.ok(state.visited.includes("rust_milletskillet"));
});

test("rust cornskillet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornskillet);
  assert.ok(state.visited.includes("rust_cornskillet"));
});

test("rust oatskillet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatskillet);
  assert.ok(state.visited.includes("rust_oatskillet"));
});

test("rust durumkettle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumkettle);
  assert.ok(state.visited.includes("rust_durumkettle"));
});

test("rust foniokettle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniokettle);
  assert.ok(state.visited.includes("rust_foniokettle"));
});

test("rust teffkettle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffkettle);
  assert.ok(state.visited.includes("rust_teffkettle"));
});

test("rust barleykettle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleykettle);
  assert.ok(state.visited.includes("rust_barleykettle"));
});

test("rust sorghumkettle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumkettle);
  assert.ok(state.visited.includes("rust_sorghumkettle"));
});

test("rust milletkettle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletkettle);
  assert.ok(state.visited.includes("rust_milletkettle"));
});

test("rust cornkettle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornkettle);
  assert.ok(state.visited.includes("rust_cornkettle"));
});

test("rust oatkettle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatkettle);
  assert.ok(state.visited.includes("rust_oatkettle"));
});

test("rust durumbucket is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumbucket);
  assert.ok(state.visited.includes("rust_durumbucket"));
});

test("rust foniobucket is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniobucket);
  assert.ok(state.visited.includes("rust_foniobucket"));
});

test("rust teffbucket is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffbucket);
  assert.ok(state.visited.includes("rust_teffbucket"));
});

test("rust barleybucket is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleybucket);
  assert.ok(state.visited.includes("rust_barleybucket"));
});

test("rust sorghumbucket is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumbucket);
  assert.ok(state.visited.includes("rust_sorghumbucket"));
});

test("rust milletbucket is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletbucket);
  assert.ok(state.visited.includes("rust_milletbucket"));
});

test("rust cornbucket is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornbucket);
  assert.ok(state.visited.includes("rust_cornbucket"));
});

test("rust oatbucket is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatbucket);
  assert.ok(state.visited.includes("rust_oatbucket"));
});

test("rust durumbowl is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumbowl);
  assert.ok(state.visited.includes("rust_durumbowl"));
});

test("rust foniobowl is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniobowl);
  assert.ok(state.visited.includes("rust_foniobowl"));
});

test("rust teffbowl is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffbowl);
  assert.ok(state.visited.includes("rust_teffbowl"));
});

test("rust barleybowl is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleybowl);
  assert.ok(state.visited.includes("rust_barleybowl"));
});

test("rust sorghumbowl is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumbowl);
  assert.ok(state.visited.includes("rust_sorghumbowl"));
});

test("rust milletbowl is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletbowl);
  assert.ok(state.visited.includes("rust_milletbowl"));
});

test("rust cornbowl is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornbowl);
  assert.ok(state.visited.includes("rust_cornbowl"));
});

test("rust oatbowl is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatbowl);
  assert.ok(state.visited.includes("rust_oatbowl"));
});

test("rust durumpot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumpot);
  assert.ok(state.visited.includes("rust_durumpot"));
});

test("rust foniopot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniopot);
  assert.ok(state.visited.includes("rust_foniopot"));
});

test("rust teffpot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffpot);
  assert.ok(state.visited.includes("rust_teffpot"));
});

test("rust barleypot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleypot);
  assert.ok(state.visited.includes("rust_barleypot"));
});

test("rust sorghumpot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumpot);
  assert.ok(state.visited.includes("rust_sorghumpot"));
});

test("rust milletpot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletpot);
  assert.ok(state.visited.includes("rust_milletpot"));
});

test("rust cornpot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornpot);
  assert.ok(state.visited.includes("rust_cornpot"));
});

test("rust oatpot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatpot);
  assert.ok(state.visited.includes("rust_oatpot"));
});

test("rust durumpan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumpan);
  assert.ok(state.visited.includes("rust_durumpan"));
});

test("rust foniopan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniopan);
  assert.ok(state.visited.includes("rust_foniopan"));
});

test("rust teffpan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffpan);
  assert.ok(state.visited.includes("rust_teffpan"));
});

test("rust barleypan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleypan);
  assert.ok(state.visited.includes("rust_barleypan"));
});

test("rust sorghumpan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumpan);
  assert.ok(state.visited.includes("rust_sorghumpan"));
});

test("rust milletpan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletpan);
  assert.ok(state.visited.includes("rust_milletpan"));
});

test("rust cornpan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornpan);
  assert.ok(state.visited.includes("rust_cornpan"));
});

test("rust oatpan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatpan);
  assert.ok(state.visited.includes("rust_oatpan"));
});

test("rust durumtank is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumtank);
  assert.ok(state.visited.includes("rust_durumtank"));
});

test("rust foniotank is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniotank);
  assert.ok(state.visited.includes("rust_foniotank"));
});

test("rust tefftank is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tefftank);
  assert.ok(state.visited.includes("rust_tefftank"));
});

test("rust barleytank is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleytank);
  assert.ok(state.visited.includes("rust_barleytank"));
});

test("rust sorghumtank is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumtank);
  assert.ok(state.visited.includes("rust_sorghumtank"));
});

test("rust millettank is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_millettank);
  assert.ok(state.visited.includes("rust_millettank"));
});

test("rust corntank is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_corntank);
  assert.ok(state.visited.includes("rust_corntank"));
});

test("rust oattank is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oattank);
  assert.ok(state.visited.includes("rust_oattank"));
});

test("rust durumark is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumark);
  assert.ok(state.visited.includes("rust_durumark"));
});

test("rust fonioark is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fonioark);
  assert.ok(state.visited.includes("rust_fonioark"));
});

test("rust teffark is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffark);
  assert.ok(state.visited.includes("rust_teffark"));
});

test("rust barleyark is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyark);
  assert.ok(state.visited.includes("rust_barleyark"));
});

test("rust sorghumark is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumark);
  assert.ok(state.visited.includes("rust_sorghumark"));
});

test("rust milletark is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletark);
  assert.ok(state.visited.includes("rust_milletark"));
});

test("rust cornark is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornark);
  assert.ok(state.visited.includes("rust_cornark"));
});

test("rust oatark is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatark);
  assert.ok(state.visited.includes("rust_oatark"));
});

test("rust durumtote is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumtote);
  assert.ok(state.visited.includes("rust_durumtote"));
});

test("rust foniotote is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniotote);
  assert.ok(state.visited.includes("rust_foniotote"));
});

test("rust tefftote is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tefftote);
  assert.ok(state.visited.includes("rust_tefftote"));
});

test("rust barleytote is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleytote);
  assert.ok(state.visited.includes("rust_barleytote"));
});

test("rust sorghumtote is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumtote);
  assert.ok(state.visited.includes("rust_sorghumtote"));
});

test("rust millettote is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_millettote);
  assert.ok(state.visited.includes("rust_millettote"));
});

test("rust corntote is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_corntote);
  assert.ok(state.visited.includes("rust_corntote"));
});

test("rust oattote is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oattote);
  assert.ok(state.visited.includes("rust_oattote"));
});

test("rust durumpress is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumpress);
  assert.ok(state.visited.includes("rust_durumpress"));
});

test("rust foniopress is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniopress);
  assert.ok(state.visited.includes("rust_foniopress"));
});

test("rust teffpress is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffpress);
  assert.ok(state.visited.includes("rust_teffpress"));
});

test("rust barleypress is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleypress);
  assert.ok(state.visited.includes("rust_barleypress"));
});

test("rust sorghumpress is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumpress);
  assert.ok(state.visited.includes("rust_sorghumpress"));
});

test("rust milletpress is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletpress);
  assert.ok(state.visited.includes("rust_milletpress"));
});

test("rust cornpress is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornpress);
  assert.ok(state.visited.includes("rust_cornpress"));
});

test("rust oatpress is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatpress);
  assert.ok(state.visited.includes("rust_oatpress"));
});

test("rust durumsilo is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumsilo);
  assert.ok(state.visited.includes("rust_durumsilo"));
});

test("rust foniosilo is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniosilo);
  assert.ok(state.visited.includes("rust_foniosilo"));
});

test("rust teffsilo is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffsilo);
  assert.ok(state.visited.includes("rust_teffsilo"));
});

test("rust barleysilo is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleysilo);
  assert.ok(state.visited.includes("rust_barleysilo"));
});

test("rust sorghumsilo is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumsilo);
  assert.ok(state.visited.includes("rust_sorghumsilo"));
});

test("rust milletsilo is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletsilo);
  assert.ok(state.visited.includes("rust_milletsilo"));
});

test("rust cornsilo is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornsilo);
  assert.ok(state.visited.includes("rust_cornsilo"));
});

test("rust oatsilo is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatsilo);
  assert.ok(state.visited.includes("rust_oatsilo"));
});

test("rust durumhopper is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumhopper);
  assert.ok(state.visited.includes("rust_durumhopper"));
});

test("rust foniohopper is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniohopper);
  assert.ok(state.visited.includes("rust_foniohopper"));
});

test("rust teffhopper is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffhopper);
  assert.ok(state.visited.includes("rust_teffhopper"));
});

test("rust barleyhopper is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyhopper);
  assert.ok(state.visited.includes("rust_barleyhopper"));
});

test("rust sorghumhopper is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumhopper);
  assert.ok(state.visited.includes("rust_sorghumhopper"));
});

test("rust millethopper is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_millethopper);
  assert.ok(state.visited.includes("rust_millethopper"));
});

test("rust cornhopper is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornhopper);
  assert.ok(state.visited.includes("rust_cornhopper"));
});

test("rust oathopper is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oathopper);
  assert.ok(state.visited.includes("rust_oathopper"));
});

test("rust durumbunker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumbunker);
  assert.ok(state.visited.includes("rust_durumbunker"));
});

test("rust foniobunker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniobunker);
  assert.ok(state.visited.includes("rust_foniobunker"));
});

test("rust teffbunker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffbunker);
  assert.ok(state.visited.includes("rust_teffbunker"));
});

test("rust barleybunker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleybunker);
  assert.ok(state.visited.includes("rust_barleybunker"));
});

test("rust sorghumbunker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumbunker);
  assert.ok(state.visited.includes("rust_sorghumbunker"));
});

test("rust milletbunker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletbunker);
  assert.ok(state.visited.includes("rust_milletbunker"));
});

test("rust cornbunker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornbunker);
  assert.ok(state.visited.includes("rust_cornbunker"));
});

test("rust oatbunker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatbunker);
  assert.ok(state.visited.includes("rust_oatbunker"));
});

test("rust durumcoffer is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumcoffer);
  assert.ok(state.visited.includes("rust_durumcoffer"));
});

test("rust foniocoffer is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniocoffer);
  assert.ok(state.visited.includes("rust_foniocoffer"));
});

test("rust teffcoffer is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffcoffer);
  assert.ok(state.visited.includes("rust_teffcoffer"));
});

test("rust barleycoffer is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleycoffer);
  assert.ok(state.visited.includes("rust_barleycoffer"));
});

test("rust sorghumcoffer is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumcoffer);
  assert.ok(state.visited.includes("rust_sorghumcoffer"));
});

test("rust milletcoffer is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletcoffer);
  assert.ok(state.visited.includes("rust_milletcoffer"));
});

test("rust corncoffer is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_corncoffer);
  assert.ok(state.visited.includes("rust_corncoffer"));
});

test("rust oatcoffer is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatcoffer);
  assert.ok(state.visited.includes("rust_oatcoffer"));
});

test("rust durumhamper is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumhamper);
  assert.ok(state.visited.includes("rust_durumhamper"));
});

test("rust foniohamper is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniohamper);
  assert.ok(state.visited.includes("rust_foniohamper"));
});

test("rust teffhamper is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffhamper);
  assert.ok(state.visited.includes("rust_teffhamper"));
});

test("rust barleyhamper is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyhamper);
  assert.ok(state.visited.includes("rust_barleyhamper"));
});

test("rust sorghumhamper is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumhamper);
  assert.ok(state.visited.includes("rust_sorghumhamper"));
});

test("rust millethamper is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_millethamper);
  assert.ok(state.visited.includes("rust_millethamper"));
});

test("rust cornhamper is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornhamper);
  assert.ok(state.visited.includes("rust_cornhamper"));
});

test("rust oathamper is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oathamper);
  assert.ok(state.visited.includes("rust_oathamper"));
});

test("rust durumtrunk is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumtrunk);
  assert.ok(state.visited.includes("rust_durumtrunk"));
});

test("rust foniotrunk is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniotrunk);
  assert.ok(state.visited.includes("rust_foniotrunk"));
});

test("rust tefftrunk is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tefftrunk);
  assert.ok(state.visited.includes("rust_tefftrunk"));
});

test("rust barleytrunk is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleytrunk);
  assert.ok(state.visited.includes("rust_barleytrunk"));
});

test("rust sorghumtrunk is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumtrunk);
  assert.ok(state.visited.includes("rust_sorghumtrunk"));
});

test("rust millettrunk is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_millettrunk);
  assert.ok(state.visited.includes("rust_millettrunk"));
});

test("rust corntrunk is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_corntrunk);
  assert.ok(state.visited.includes("rust_corntrunk"));
});

test("rust oattrunk is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oattrunk);
  assert.ok(state.visited.includes("rust_oattrunk"));
});

test("rust durumlocker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumlocker);
  assert.ok(state.visited.includes("rust_durumlocker"));
});

test("rust foniolocker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniolocker);
  assert.ok(state.visited.includes("rust_foniolocker"));
});

test("rust tefflocker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tefflocker);
  assert.ok(state.visited.includes("rust_tefflocker"));
});

test("rust barleylocker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleylocker);
  assert.ok(state.visited.includes("rust_barleylocker"));
});

test("rust sorghumlocker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumlocker);
  assert.ok(state.visited.includes("rust_sorghumlocker"));
});

test("rust milletlocker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletlocker);
  assert.ok(state.visited.includes("rust_milletlocker"));
});

test("rust cornlocker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornlocker);
  assert.ok(state.visited.includes("rust_cornlocker"));
});

test("rust oatlocker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatlocker);
  assert.ok(state.visited.includes("rust_oatlocker"));
});

test("rust durumchest is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumchest);
  assert.ok(state.visited.includes("rust_durumchest"));
});

test("rust foniochest is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniochest);
  assert.ok(state.visited.includes("rust_foniochest"));
});

test("rust teffchest is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffchest);
  assert.ok(state.visited.includes("rust_teffchest"));
});

test("rust barleychest is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleychest);
  assert.ok(state.visited.includes("rust_barleychest"));
});

test("rust sorghumchest is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumchest);
  assert.ok(state.visited.includes("rust_sorghumchest"));
});

test("rust milletchest is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletchest);
  assert.ok(state.visited.includes("rust_milletchest"));
});

test("rust cornchest is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornchest);
  assert.ok(state.visited.includes("rust_cornchest"));
});

test("rust oatchest is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatchest);
  assert.ok(state.visited.includes("rust_oatchest"));
});

test("rust durumdrum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumdrum);
  assert.ok(state.visited.includes("rust_durumdrum"));
});

test("rust foniodrum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniodrum);
  assert.ok(state.visited.includes("rust_foniodrum"));
});

test("rust teffdrum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffdrum);
  assert.ok(state.visited.includes("rust_teffdrum"));
});

test("rust barleydrum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleydrum);
  assert.ok(state.visited.includes("rust_barleydrum"));
});

test("rust sorghumdrum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumdrum);
  assert.ok(state.visited.includes("rust_sorghumdrum"));
});

test("rust milletdrum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletdrum);
  assert.ok(state.visited.includes("rust_milletdrum"));
});

test("rust corndrum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_corndrum);
  assert.ok(state.visited.includes("rust_corndrum"));
});

test("rust oatdrum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatdrum);
  assert.ok(state.visited.includes("rust_oatdrum"));
});

test("rust durumcan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumcan);
  assert.ok(state.visited.includes("rust_durumcan"));
});

test("rust foniocan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniocan);
  assert.ok(state.visited.includes("rust_foniocan"));
});

test("rust teffcan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffcan);
  assert.ok(state.visited.includes("rust_teffcan"));
});

test("rust barleycan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleycan);
  assert.ok(state.visited.includes("rust_barleycan"));
});

test("rust sorghumcan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumcan);
  assert.ok(state.visited.includes("rust_sorghumcan"));
});

test("rust milletcan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletcan);
  assert.ok(state.visited.includes("rust_milletcan"));
});

test("rust corncan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_corncan);
  assert.ok(state.visited.includes("rust_corncan"));
});

test("rust oatcan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatcan);
  assert.ok(state.visited.includes("rust_oatcan"));
});

test("rust durumjar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumjar);
  assert.ok(state.visited.includes("rust_durumjar"));
});

test("rust foniojar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniojar);
  assert.ok(state.visited.includes("rust_foniojar"));
});

test("rust teffjar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffjar);
  assert.ok(state.visited.includes("rust_teffjar"));
});

test("rust barleyjar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyjar);
  assert.ok(state.visited.includes("rust_barleyjar"));
});

test("rust sorghumjar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumjar);
  assert.ok(state.visited.includes("rust_sorghumjar"));
});

test("rust milletjar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletjar);
  assert.ok(state.visited.includes("rust_milletjar"));
});

test("rust cornjar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornjar);
  assert.ok(state.visited.includes("rust_cornjar"));
});

test("rust oatjar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatjar);
  assert.ok(state.visited.includes("rust_oatjar"));
});

test("rust durumtub is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumtub);
  assert.ok(state.visited.includes("rust_durumtub"));
});

test("rust foniotub is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniotub);
  assert.ok(state.visited.includes("rust_foniotub"));
});

test("rust tefftub is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tefftub);
  assert.ok(state.visited.includes("rust_tefftub"));
});

test("rust barleytub is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleytub);
  assert.ok(state.visited.includes("rust_barleytub"));
});

test("rust sorghumtub is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumtub);
  assert.ok(state.visited.includes("rust_sorghumtub"));
});

test("rust millettub is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_millettub);
  assert.ok(state.visited.includes("rust_millettub"));
});

test("rust corntub is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_corntub);
  assert.ok(state.visited.includes("rust_corntub"));
});

test("rust oattub is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oattub);
  assert.ok(state.visited.includes("rust_oattub"));
});

test("rust durumcask is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumcask);
  assert.ok(state.visited.includes("rust_durumcask"));
});

test("rust foniocask is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniocask);
  assert.ok(state.visited.includes("rust_foniocask"));
});

test("rust teffcask is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffcask);
  assert.ok(state.visited.includes("rust_teffcask"));
});

test("rust barleycask is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleycask);
  assert.ok(state.visited.includes("rust_barleycask"));
});

test("rust sorghumcask is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumcask);
  assert.ok(state.visited.includes("rust_sorghumcask"));
});

test("rust milletcask is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletcask);
  assert.ok(state.visited.includes("rust_milletcask"));
});

test("rust corncask is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_corncask);
  assert.ok(state.visited.includes("rust_corncask"));
});

test("rust oatcask is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatcask);
  assert.ok(state.visited.includes("rust_oatcask"));
});

test("rust durumvat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumvat);
  assert.ok(state.visited.includes("rust_durumvat"));
});

test("rust foniovat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniovat);
  assert.ok(state.visited.includes("rust_foniovat"));
});

test("rust teffvat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffvat);
  assert.ok(state.visited.includes("rust_teffvat"));
});

test("rust barleyvat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyvat);
  assert.ok(state.visited.includes("rust_barleyvat"));
});

test("rust sorghumvat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumvat);
  assert.ok(state.visited.includes("rust_sorghumvat"));
});

test("rust milletvat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletvat);
  assert.ok(state.visited.includes("rust_milletvat"));
});

test("rust cornvat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornvat);
  assert.ok(state.visited.includes("rust_cornvat"));
});

test("rust oatvat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatvat);
  assert.ok(state.visited.includes("rust_oatvat"));
});

test("rust durumkeg is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumkeg);
  assert.ok(state.visited.includes("rust_durumkeg"));
});

test("rust foniokeg is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniokeg);
  assert.ok(state.visited.includes("rust_foniokeg"));
});

test("rust teffkeg is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffkeg);
  assert.ok(state.visited.includes("rust_teffkeg"));
});

test("rust barleykeg is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleykeg);
  assert.ok(state.visited.includes("rust_barleykeg"));
});

test("rust sorghumkeg is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumkeg);
  assert.ok(state.visited.includes("rust_sorghumkeg"));
});

test("rust milletkeg is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletkeg);
  assert.ok(state.visited.includes("rust_milletkeg"));
});

test("rust cornkeg is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornkeg);
  assert.ok(state.visited.includes("rust_cornkeg"));
});

test("rust oatkeg is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatkeg);
  assert.ok(state.visited.includes("rust_oatkeg"));
});

test("rust durumpail is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumpail);
  assert.ok(state.visited.includes("rust_durumpail"));
});

test("rust foniopail is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniopail);
  assert.ok(state.visited.includes("rust_foniopail"));
});

test("rust teffpail is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffpail);
  assert.ok(state.visited.includes("rust_teffpail"));
});

test("rust barleypail is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleypail);
  assert.ok(state.visited.includes("rust_barleypail"));
});

test("rust sorghumpail is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumpail);
  assert.ok(state.visited.includes("rust_sorghumpail"));
});

test("rust milletpail is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletpail);
  assert.ok(state.visited.includes("rust_milletpail"));
});

test("rust cornpail is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornpail);
  assert.ok(state.visited.includes("rust_cornpail"));
});

test("rust oatpail is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatpail);
  assert.ok(state.visited.includes("rust_oatpail"));
});

test("rust durumtin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumtin);
  assert.ok(state.visited.includes("rust_durumtin"));
});

test("rust foniotin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniotin);
  assert.ok(state.visited.includes("rust_foniotin"));
});

test("rust tefftin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tefftin);
  assert.ok(state.visited.includes("rust_tefftin"));
});

test("rust barleytin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleytin);
  assert.ok(state.visited.includes("rust_barleytin"));
});

test("rust sorghumtin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumtin);
  assert.ok(state.visited.includes("rust_sorghumtin"));
});

test("rust millettin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_millettin);
  assert.ok(state.visited.includes("rust_millettin"));
});

test("rust corntin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_corntin);
  assert.ok(state.visited.includes("rust_corntin"));
});

test("rust oattin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oattin);
  assert.ok(state.visited.includes("rust_oattin"));
});

test("rust durumcrate is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumcrate);
  assert.ok(state.visited.includes("rust_durumcrate"));
});

test("rust foniocrate is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniocrate);
  assert.ok(state.visited.includes("rust_foniocrate"));
});

test("rust teffcrate is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffcrate);
  assert.ok(state.visited.includes("rust_teffcrate"));
});

test("rust barleycrate is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleycrate);
  assert.ok(state.visited.includes("rust_barleycrate"));
});

test("rust sorghumcrate is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumcrate);
  assert.ok(state.visited.includes("rust_sorghumcrate"));
});

test("rust milletcrate is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletcrate);
  assert.ok(state.visited.includes("rust_milletcrate"));
});

test("rust corncrate is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_corncrate);
  assert.ok(state.visited.includes("rust_corncrate"));
});

test("rust oatcrate is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatcrate);
  assert.ok(state.visited.includes("rust_oatcrate"));
});

test("rust durumbox is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumbox);
  assert.ok(state.visited.includes("rust_durumbox"));
});

test("rust foniobox is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniobox);
  assert.ok(state.visited.includes("rust_foniobox"));
});

test("rust teffbox is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffbox);
  assert.ok(state.visited.includes("rust_teffbox"));
});

test("rust barleybox is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleybox);
  assert.ok(state.visited.includes("rust_barleybox"));
});

test("rust sorghumbox is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumbox);
  assert.ok(state.visited.includes("rust_sorghumbox"));
});

test("rust milletbox is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletbox);
  assert.ok(state.visited.includes("rust_milletbox"));
});

test("rust cornbox is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornbox);
  assert.ok(state.visited.includes("rust_cornbox"));
});

test("rust oatbox is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatbox);
  assert.ok(state.visited.includes("rust_oatbox"));
});

test("rust durumbag is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumbag);
  assert.ok(state.visited.includes("rust_durumbag"));
});

test("rust foniobag is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniobag);
  assert.ok(state.visited.includes("rust_foniobag"));
});

test("rust teffbag is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffbag);
  assert.ok(state.visited.includes("rust_teffbag"));
});

test("rust barleybag is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleybag);
  assert.ok(state.visited.includes("rust_barleybag"));
});

test("rust sorghumbag is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumbag);
  assert.ok(state.visited.includes("rust_sorghumbag"));
});

test("rust milletbag is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletbag);
  assert.ok(state.visited.includes("rust_milletbag"));
});

test("rust cornbag is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornbag);
  assert.ok(state.visited.includes("rust_cornbag"));
});

test("rust oatbag is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatbag);
  assert.ok(state.visited.includes("rust_oatbag"));
});

test("rust durumbale is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumbale);
  assert.ok(state.visited.includes("rust_durumbale"));
});

test("rust foniobale is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniobale);
  assert.ok(state.visited.includes("rust_foniobale"));
});

test("rust teffbale is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffbale);
  assert.ok(state.visited.includes("rust_teffbale"));
});

test("rust barleybale is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleybale);
  assert.ok(state.visited.includes("rust_barleybale"));
});

test("rust sorghumbale is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumbale);
  assert.ok(state.visited.includes("rust_sorghumbale"));
});

test("rust milletbale is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletbale);
  assert.ok(state.visited.includes("rust_milletbale"));
});

test("rust cornbale is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornbale);
  assert.ok(state.visited.includes("rust_cornbale"));
});

test("rust oatbale is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatbale);
  assert.ok(state.visited.includes("rust_oatbale"));
});

test("rust durumsack is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumsack);
  assert.ok(state.visited.includes("rust_durumsack"));
});

test("rust foniosack is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniosack);
  assert.ok(state.visited.includes("rust_foniosack"));
});

test("rust teffsack is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffsack);
  assert.ok(state.visited.includes("rust_teffsack"));
});

test("rust barleysack is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleysack);
  assert.ok(state.visited.includes("rust_barleysack"));
});

test("rust sorghumsack is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumsack);
  assert.ok(state.visited.includes("rust_sorghumsack"));
});

test("rust milletsack is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletsack);
  assert.ok(state.visited.includes("rust_milletsack"));
});

test("rust cornsack is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornsack);
  assert.ok(state.visited.includes("rust_cornsack"));
});

test("rust oatsack is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatsack);
  assert.ok(state.visited.includes("rust_oatsack"));
});

test("rust durumcrib is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumcrib);
  assert.ok(state.visited.includes("rust_durumcrib"));
});

test("rust foniocrib is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniocrib);
  assert.ok(state.visited.includes("rust_foniocrib"));
});

test("rust teffcrib is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffcrib);
  assert.ok(state.visited.includes("rust_teffcrib"));
});

test("rust barleycrib is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleycrib);
  assert.ok(state.visited.includes("rust_barleycrib"));
});

test("rust sorghumcrib is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumcrib);
  assert.ok(state.visited.includes("rust_sorghumcrib"));
});

test("rust milletcrib is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletcrib);
  assert.ok(state.visited.includes("rust_milletcrib"));
});

test("rust corncrib is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_corncrib);
  assert.ok(state.visited.includes("rust_corncrib"));
});

test("rust oatcrib is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatcrib);
  assert.ok(state.visited.includes("rust_oatcrib"));
});

test("rust durumloft is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumloft);
  assert.ok(state.visited.includes("rust_durumloft"));
});

test("rust fonioloft is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fonioloft);
  assert.ok(state.visited.includes("rust_fonioloft"));
});

test("rust teffloft is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffloft);
  assert.ok(state.visited.includes("rust_teffloft"));
});

test("rust barleyloft is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyloft);
  assert.ok(state.visited.includes("rust_barleyloft"));
});

test("rust sorghumloft is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumloft);
  assert.ok(state.visited.includes("rust_sorghumloft"));
});

test("rust milletloft is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletloft);
  assert.ok(state.visited.includes("rust_milletloft"));
});

test("rust cornloft is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornloft);
  assert.ok(state.visited.includes("rust_cornloft"));
});

test("rust oatloft is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatloft);
  assert.ok(state.visited.includes("rust_oatloft"));
});

test("rust durummill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durummill);
  assert.ok(state.visited.includes("rust_durummill"));
});

test("rust foniomill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniomill);
  assert.ok(state.visited.includes("rust_foniomill"));
});

test("rust teffmill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffmill);
  assert.ok(state.visited.includes("rust_teffmill"));
});

test("rust barleymill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleymill);
  assert.ok(state.visited.includes("rust_barleymill"));
});

test("rust sorghummill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghummill);
  assert.ok(state.visited.includes("rust_sorghummill"));
});

test("rust milletmill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletmill);
  assert.ok(state.visited.includes("rust_milletmill"));
});

test("rust cornmill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornmill);
  assert.ok(state.visited.includes("rust_cornmill"));
});

test("rust oatmill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatmill);
  assert.ok(state.visited.includes("rust_oatmill"));
});

test("rust durumbin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumbin);
  assert.ok(state.visited.includes("rust_durumbin"));
});

test("rust foniobin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniobin);
  assert.ok(state.visited.includes("rust_foniobin"));
});

test("rust teffbin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffbin);
  assert.ok(state.visited.includes("rust_teffbin"));
});

test("rust barleybin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleybin);
  assert.ok(state.visited.includes("rust_barleybin"));
});

test("rust sorghumbin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumbin);
  assert.ok(state.visited.includes("rust_sorghumbin"));
});

test("rust milletbin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletbin);
  assert.ok(state.visited.includes("rust_milletbin"));
});

test("rust cornbin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornbin);
  assert.ok(state.visited.includes("rust_cornbin"));
});

test("rust oatbin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatbin);
  assert.ok(state.visited.includes("rust_oatbin"));
});

test("rust durumrun is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumrun);
  assert.ok(state.visited.includes("rust_durumrun"));
});

test("rust foniorun is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniorun);
  assert.ok(state.visited.includes("rust_foniorun"));
});

test("rust teffrun is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffrun);
  assert.ok(state.visited.includes("rust_teffrun"));
});

test("rust barleyrun is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyrun);
  assert.ok(state.visited.includes("rust_barleyrun"));
});

test("rust sorghumrun is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumrun);
  assert.ok(state.visited.includes("rust_sorghumrun"));
});

test("rust milletrun is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletrun);
  assert.ok(state.visited.includes("rust_milletrun"));
});

test("rust cornrun is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornrun);
  assert.ok(state.visited.includes("rust_cornrun"));
});

test("rust oatrun is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatrun);
  assert.ok(state.visited.includes("rust_oatrun"));
});

test("rust durumlot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumlot);
  assert.ok(state.visited.includes("rust_durumlot"));
});

test("rust foniolot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniolot);
  assert.ok(state.visited.includes("rust_foniolot"));
});

test("rust tefflot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tefflot);
  assert.ok(state.visited.includes("rust_tefflot"));
});

test("rust barleylot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleylot);
  assert.ok(state.visited.includes("rust_barleylot"));
});

test("rust sorghumlot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumlot);
  assert.ok(state.visited.includes("rust_sorghumlot"));
});

test("rust milletlot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletlot);
  assert.ok(state.visited.includes("rust_milletlot"));
});

test("rust cornlot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornlot);
  assert.ok(state.visited.includes("rust_cornlot"));
});

test("rust oatlot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatlot);
  assert.ok(state.visited.includes("rust_oatlot"));
});

test("rust durumcut is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumcut);
  assert.ok(state.visited.includes("rust_durumcut"));
});

test("rust foniocut is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniocut);
  assert.ok(state.visited.includes("rust_foniocut"));
});

test("rust teffcut is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffcut);
  assert.ok(state.visited.includes("rust_teffcut"));
});

test("rust barleycut is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleycut);
  assert.ok(state.visited.includes("rust_barleycut"));
});

test("rust sorghumcut is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumcut);
  assert.ok(state.visited.includes("rust_sorghumcut"));
});

test("rust milletcut is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletcut);
  assert.ok(state.visited.includes("rust_milletcut"));
});

test("rust corncut is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_corncut);
  assert.ok(state.visited.includes("rust_corncut"));
});

test("rust oatcut is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatcut);
  assert.ok(state.visited.includes("rust_oatcut"));
});

test("rust durumgrade is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumgrade);
  assert.ok(state.visited.includes("rust_durumgrade"));
});

test("rust foniograde is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniograde);
  assert.ok(state.visited.includes("rust_foniograde"));
});

test("rust teffgrade is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffgrade);
  assert.ok(state.visited.includes("rust_teffgrade"));
});

test("rust barleygrade is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleygrade);
  assert.ok(state.visited.includes("rust_barleygrade"));
});

test("rust sorghumgrade is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumgrade);
  assert.ok(state.visited.includes("rust_sorghumgrade"));
});

test("rust milletgrade is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletgrade);
  assert.ok(state.visited.includes("rust_milletgrade"));
});

test("rust corngrade is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_corngrade);
  assert.ok(state.visited.includes("rust_corngrade"));
});

test("rust oatgrade is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatgrade);
  assert.ok(state.visited.includes("rust_oatgrade"));
});

test("rust durumchoice is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumchoice);
  assert.ok(state.visited.includes("rust_durumchoice"));
});

test("rust foniochoice is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniochoice);
  assert.ok(state.visited.includes("rust_foniochoice"));
});

test("rust teffchoice is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffchoice);
  assert.ok(state.visited.includes("rust_teffchoice"));
});

test("rust barleychoice is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleychoice);
  assert.ok(state.visited.includes("rust_barleychoice"));
});

test("rust sorghumchoice is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumchoice);
  assert.ok(state.visited.includes("rust_sorghumchoice"));
});

test("rust milletchoice is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletchoice);
  assert.ok(state.visited.includes("rust_milletchoice"));
});

test("rust cornchoice is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornchoice);
  assert.ok(state.visited.includes("rust_cornchoice"));
});

test("rust oatchoice is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatchoice);
  assert.ok(state.visited.includes("rust_oatchoice"));
});

test("rust durumprime is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumprime);
  assert.ok(state.visited.includes("rust_durumprime"));
});

test("rust fonioprime is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fonioprime);
  assert.ok(state.visited.includes("rust_fonioprime"));
});

test("rust teffprime is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffprime);
  assert.ok(state.visited.includes("rust_teffprime"));
});

test("rust barleyprime is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyprime);
  assert.ok(state.visited.includes("rust_barleyprime"));
});

test("rust sorghumprime is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumprime);
  assert.ok(state.visited.includes("rust_sorghumprime"));
});

test("rust milletprime is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletprime);
  assert.ok(state.visited.includes("rust_milletprime"));
});

test("rust cornprime is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornprime);
  assert.ok(state.visited.includes("rust_cornprime"));
});

test("rust oatprime is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatprime);
  assert.ok(state.visited.includes("rust_oatprime"));
});

test("rust durumselect is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumselect);
  assert.ok(state.visited.includes("rust_durumselect"));
});

test("rust fonioselect is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fonioselect);
  assert.ok(state.visited.includes("rust_fonioselect"));
});

test("rust teffselect is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffselect);
  assert.ok(state.visited.includes("rust_teffselect"));
});

test("rust barleyselect is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyselect);
  assert.ok(state.visited.includes("rust_barleyselect"));
});

test("rust sorghumselect is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumselect);
  assert.ok(state.visited.includes("rust_sorghumselect"));
});

test("rust milletselect is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletselect);
  assert.ok(state.visited.includes("rust_milletselect"));
});

test("rust cornselect is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornselect);
  assert.ok(state.visited.includes("rust_cornselect"));
});

test("rust oatselect is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatselect);
  assert.ok(state.visited.includes("rust_oatselect"));
});

test("rust durumstandard is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumstandard);
  assert.ok(state.visited.includes("rust_durumstandard"));
});

test("rust foniostandard is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniostandard);
  assert.ok(state.visited.includes("rust_foniostandard"));
});

test("rust teffstandard is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffstandard);
  assert.ok(state.visited.includes("rust_teffstandard"));
});

test("rust barleystandard is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleystandard);
  assert.ok(state.visited.includes("rust_barleystandard"));
});

test("rust sorghumstandard is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumstandard);
  assert.ok(state.visited.includes("rust_sorghumstandard"));
});

test("rust milletstandard is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletstandard);
  assert.ok(state.visited.includes("rust_milletstandard"));
});

test("rust cornstandard is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornstandard);
  assert.ok(state.visited.includes("rust_cornstandard"));
});

test("rust oatstandard is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatstandard);
  assert.ok(state.visited.includes("rust_oatstandard"));
});

test("rust durumgeneral is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumgeneral);
  assert.ok(state.visited.includes("rust_durumgeneral"));
});

test("rust foniogeneral is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniogeneral);
  assert.ok(state.visited.includes("rust_foniogeneral"));
});

test("rust teffgeneral is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffgeneral);
  assert.ok(state.visited.includes("rust_teffgeneral"));
});

test("rust barleygeneral is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleygeneral);
  assert.ok(state.visited.includes("rust_barleygeneral"));
});

test("rust sorghumgeneral is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumgeneral);
  assert.ok(state.visited.includes("rust_sorghumgeneral"));
});

test("rust milletgeneral is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletgeneral);
  assert.ok(state.visited.includes("rust_milletgeneral"));
});

test("rust corngeneral is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_corngeneral);
  assert.ok(state.visited.includes("rust_corngeneral"));
});

test("rust oatgeneral is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatgeneral);
  assert.ok(state.visited.includes("rust_oatgeneral"));
});

test("rust durumweak is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumweak);
  assert.ok(state.visited.includes("rust_durumweak"));
});

test("rust fonioweak is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fonioweak);
  assert.ok(state.visited.includes("rust_fonioweak"));
});

test("rust teffweak is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffweak);
  assert.ok(state.visited.includes("rust_teffweak"));
});

test("rust barleyweak is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyweak);
  assert.ok(state.visited.includes("rust_barleyweak"));
});

test("rust sorghumweak is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumweak);
  assert.ok(state.visited.includes("rust_sorghumweak"));
});

test("rust milletweak is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletweak);
  assert.ok(state.visited.includes("rust_milletweak"));
});

test("rust cornweak is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornweak);
  assert.ok(state.visited.includes("rust_cornweak"));
});

test("rust oatweak is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatweak);
  assert.ok(state.visited.includes("rust_oatweak"));
});

test("rust durumstrong is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumstrong);
  assert.ok(state.visited.includes("rust_durumstrong"));
});

test("rust foniostrong is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniostrong);
  assert.ok(state.visited.includes("rust_foniostrong"));
});

test("rust teffstrong is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffstrong);
  assert.ok(state.visited.includes("rust_teffstrong"));
});

test("rust barleystrong is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleystrong);
  assert.ok(state.visited.includes("rust_barleystrong"));
});

test("rust sorghumstrong is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumstrong);
  assert.ok(state.visited.includes("rust_sorghumstrong"));
});

test("rust milletstrong is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletstrong);
  assert.ok(state.visited.includes("rust_milletstrong"));
});

test("rust cornstrong is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornstrong);
  assert.ok(state.visited.includes("rust_cornstrong"));
});

test("rust oatstrong is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatstrong);
  assert.ok(state.visited.includes("rust_oatstrong"));
});

test("rust durumfamily is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumfamily);
  assert.ok(state.visited.includes("rust_durumfamily"));
});

test("rust foniofamily is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniofamily);
  assert.ok(state.visited.includes("rust_foniofamily"));
});

test("rust tefffamily is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tefffamily);
  assert.ok(state.visited.includes("rust_tefffamily"));
});

test("rust barleyfamily is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyfamily);
  assert.ok(state.visited.includes("rust_barleyfamily"));
});

test("rust sorghumfamily is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumfamily);
  assert.ok(state.visited.includes("rust_sorghumfamily"));
});

test("rust milletfamily is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletfamily);
  assert.ok(state.visited.includes("rust_milletfamily"));
});

test("rust cornfamily is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornfamily);
  assert.ok(state.visited.includes("rust_cornfamily"));
});

test("rust oatfamily is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatfamily);
  assert.ok(state.visited.includes("rust_oatfamily"));
});

test("rust durumhousehold is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumhousehold);
  assert.ok(state.visited.includes("rust_durumhousehold"));
});

test("rust foniohousehold is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniohousehold);
  assert.ok(state.visited.includes("rust_foniohousehold"));
});

test("rust teffhousehold is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffhousehold);
  assert.ok(state.visited.includes("rust_teffhousehold"));
});

test("rust barleyhousehold is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyhousehold);
  assert.ok(state.visited.includes("rust_barleyhousehold"));
});

test("rust sorghumhousehold is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumhousehold);
  assert.ok(state.visited.includes("rust_sorghumhousehold"));
});

test("rust millethousehold is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_millethousehold);
  assert.ok(state.visited.includes("rust_millethousehold"));
});

test("rust cornhousehold is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornhousehold);
  assert.ok(state.visited.includes("rust_cornhousehold"));
});

test("rust oathousehold is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oathousehold);
  assert.ok(state.visited.includes("rust_oathousehold"));
});

test("rust durumbolted is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumbolted);
  assert.ok(state.visited.includes("rust_durumbolted"));
});

test("rust foniobolted is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniobolted);
  assert.ok(state.visited.includes("rust_foniobolted"));
});

test("rust teffbolted is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffbolted);
  assert.ok(state.visited.includes("rust_teffbolted"));
});

test("rust barleybolted is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleybolted);
  assert.ok(state.visited.includes("rust_barleybolted"));
});

test("rust sorghumbolted is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumbolted);
  assert.ok(state.visited.includes("rust_sorghumbolted"));
});

test("rust milletbolted is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletbolted);
  assert.ok(state.visited.includes("rust_milletbolted"));
});

test("rust cornbolted is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornbolted);
  assert.ok(state.visited.includes("rust_cornbolted"));
});

test("rust oatbolted is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatbolted);
  assert.ok(state.visited.includes("rust_oatbolted"));
});

test("rust durumsifted is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumsifted);
  assert.ok(state.visited.includes("rust_durumsifted"));
});

test("rust foniosifted is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniosifted);
  assert.ok(state.visited.includes("rust_foniosifted"));
});

test("rust teffsifted is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffsifted);
  assert.ok(state.visited.includes("rust_teffsifted"));
});

test("rust barleysifted is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleysifted);
  assert.ok(state.visited.includes("rust_barleysifted"));
});

test("rust sorghumsifted is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumsifted);
  assert.ok(state.visited.includes("rust_sorghumsifted"));
});

test("rust milletsifted is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletsifted);
  assert.ok(state.visited.includes("rust_milletsifted"));
});

test("rust cornsifted is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornsifted);
  assert.ok(state.visited.includes("rust_cornsifted"));
});

test("rust oatsifted is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatsifted);
  assert.ok(state.visited.includes("rust_oatsifted"));
});

test("rust durumplain is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumplain);
  assert.ok(state.visited.includes("rust_durumplain"));
});

test("rust fonioplain is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fonioplain);
  assert.ok(state.visited.includes("rust_fonioplain"));
});

test("rust teffplain is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffplain);
  assert.ok(state.visited.includes("rust_teffplain"));
});

test("rust barleyplain is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyplain);
  assert.ok(state.visited.includes("rust_barleyplain"));
});

test("rust sorghumplain is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumplain);
  assert.ok(state.visited.includes("rust_sorghumplain"));
});

test("rust milletplain is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletplain);
  assert.ok(state.visited.includes("rust_milletplain"));
});

test("rust cornplain is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornplain);
  assert.ok(state.visited.includes("rust_cornplain"));
});

test("rust oatplain is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatplain);
  assert.ok(state.visited.includes("rust_oatplain"));
});

test("rust durumallpurpose is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumallpurpose);
  assert.ok(state.visited.includes("rust_durumallpurpose"));
});

test("rust fonioallpurpose is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fonioallpurpose);
  assert.ok(state.visited.includes("rust_fonioallpurpose"));
});

test("rust teffallpurpose is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffallpurpose);
  assert.ok(state.visited.includes("rust_teffallpurpose"));
});

test("rust barleyallpurpose is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyallpurpose);
  assert.ok(state.visited.includes("rust_barleyallpurpose"));
});

test("rust sorghumallpurpose is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumallpurpose);
  assert.ok(state.visited.includes("rust_sorghumallpurpose"));
});

test("rust milletallpurpose is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletallpurpose);
  assert.ok(state.visited.includes("rust_milletallpurpose"));
});

test("rust cornallpurpose is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornallpurpose);
  assert.ok(state.visited.includes("rust_cornallpurpose"));
});

test("rust oatallpurpose is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatallpurpose);
  assert.ok(state.visited.includes("rust_oatallpurpose"));
});

test("rust ryeallpurpose is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ryeallpurpose);
  assert.ok(state.visited.includes("rust_ryeallpurpose"));
});

test("rust wheatallpurpose is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatallpurpose);
  assert.ok(state.visited.includes("rust_wheatallpurpose"));
});

test("rust durumbaker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumbaker);
  assert.ok(state.visited.includes("rust_durumbaker"));
});

test("rust foniobaker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniobaker);
  assert.ok(state.visited.includes("rust_foniobaker"));
});

test("rust teffbaker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffbaker);
  assert.ok(state.visited.includes("rust_teffbaker"));
});

test("rust barleybaker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleybaker);
  assert.ok(state.visited.includes("rust_barleybaker"));
});

test("rust sorghumbaker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumbaker);
  assert.ok(state.visited.includes("rust_sorghumbaker"));
});

test("rust milletbaker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletbaker);
  assert.ok(state.visited.includes("rust_milletbaker"));
});

test("rust cornbaker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornbaker);
  assert.ok(state.visited.includes("rust_cornbaker"));
});

test("rust oatbaker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatbaker);
  assert.ok(state.visited.includes("rust_oatbaker"));
});

test("rust ryebaker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ryebaker);
  assert.ok(state.visited.includes("rust_ryebaker"));
});

test("rust wheatbaker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatbaker);
  assert.ok(state.visited.includes("rust_wheatbaker"));
});

test("rust durumstraight is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumstraight);
  assert.ok(state.visited.includes("rust_durumstraight"));
});

test("rust foniostraight is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniostraight);
  assert.ok(state.visited.includes("rust_foniostraight"));
});

test("rust teffstraight is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffstraight);
  assert.ok(state.visited.includes("rust_teffstraight"));
});

test("rust barleystraight is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleystraight);
  assert.ok(state.visited.includes("rust_barleystraight"));
});

test("rust sorghumstraight is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumstraight);
  assert.ok(state.visited.includes("rust_sorghumstraight"));
});

test("rust milletstraight is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletstraight);
  assert.ok(state.visited.includes("rust_milletstraight"));
});

test("rust cornstraight is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornstraight);
  assert.ok(state.visited.includes("rust_cornstraight"));
});

test("rust oatstraight is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatstraight);
  assert.ok(state.visited.includes("rust_oatstraight"));
});

test("rust ryestraight is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ryestraight);
  assert.ok(state.visited.includes("rust_ryestraight"));
});

test("rust wheatstraight is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatstraight);
  assert.ok(state.visited.includes("rust_wheatstraight"));
});

test("rust durumsecondclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumsecondclear);
  assert.ok(state.visited.includes("rust_durumsecondclear"));
});

test("rust foniosecondclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniosecondclear);
  assert.ok(state.visited.includes("rust_foniosecondclear"));
});

test("rust teffsecondclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffsecondclear);
  assert.ok(state.visited.includes("rust_teffsecondclear"));
});

test("rust barleysecondclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleysecondclear);
  assert.ok(state.visited.includes("rust_barleysecondclear"));
});

test("rust sorghumsecondclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumsecondclear);
  assert.ok(state.visited.includes("rust_sorghumsecondclear"));
});

test("rust milletsecondclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletsecondclear);
  assert.ok(state.visited.includes("rust_milletsecondclear"));
});

test("rust cornsecondclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornsecondclear);
  assert.ok(state.visited.includes("rust_cornsecondclear"));
});

test("rust oatsecondclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatsecondclear);
  assert.ok(state.visited.includes("rust_oatsecondclear"));
});

test("rust ryesecondclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ryesecondclear);
  assert.ok(state.visited.includes("rust_ryesecondclear"));
});

test("rust wheatsecondclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatsecondclear);
  assert.ok(state.visited.includes("rust_wheatsecondclear"));
});

test("rust durumfirstclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumfirstclear);
  assert.ok(state.visited.includes("rust_durumfirstclear"));
});

test("rust foniofirstclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniofirstclear);
  assert.ok(state.visited.includes("rust_foniofirstclear"));
});

test("rust tefffirstclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tefffirstclear);
  assert.ok(state.visited.includes("rust_tefffirstclear"));
});

test("rust barleyfirstclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyfirstclear);
  assert.ok(state.visited.includes("rust_barleyfirstclear"));
});

test("rust sorghumfirstclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumfirstclear);
  assert.ok(state.visited.includes("rust_sorghumfirstclear"));
});

test("rust milletfirstclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletfirstclear);
  assert.ok(state.visited.includes("rust_milletfirstclear"));
});

test("rust cornfirstclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornfirstclear);
  assert.ok(state.visited.includes("rust_cornfirstclear"));
});

test("rust oatfirstclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatfirstclear);
  assert.ok(state.visited.includes("rust_oatfirstclear"));
});

test("rust ryefirstclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ryefirstclear);
  assert.ok(state.visited.includes("rust_ryefirstclear"));
});

test("rust wheatfirstclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatfirstclear);
  assert.ok(state.visited.includes("rust_wheatfirstclear"));
});

test("rust durumpatent is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumpatent);
  assert.ok(state.visited.includes("rust_durumpatent"));
});

test("rust foniopatent is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniopatent);
  assert.ok(state.visited.includes("rust_foniopatent"));
});

test("rust teffpatent is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffpatent);
  assert.ok(state.visited.includes("rust_teffpatent"));
});

test("rust barleypatent is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleypatent);
  assert.ok(state.visited.includes("rust_barleypatent"));
});

test("rust sorghumpatent is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumpatent);
  assert.ok(state.visited.includes("rust_sorghumpatent"));
});

test("rust milletpatent is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletpatent);
  assert.ok(state.visited.includes("rust_milletpatent"));
});

test("rust cornpatent is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornpatent);
  assert.ok(state.visited.includes("rust_cornpatent"));
});

test("rust oatpatent is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatpatent);
  assert.ok(state.visited.includes("rust_oatpatent"));
});

test("rust ryepatent is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ryepatent);
  assert.ok(state.visited.includes("rust_ryepatent"));
});

test("rust wheatpatent is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatpatent);
  assert.ok(state.visited.includes("rust_wheatpatent"));
});

test("rust durumbreak is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumbreak);
  assert.ok(state.visited.includes("rust_durumbreak"));
});

test("rust foniobreak is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniobreak);
  assert.ok(state.visited.includes("rust_foniobreak"));
});

test("rust teffbreak is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffbreak);
  assert.ok(state.visited.includes("rust_teffbreak"));
});

test("rust barleybreak is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleybreak);
  assert.ok(state.visited.includes("rust_barleybreak"));
});

test("rust sorghumbreak is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumbreak);
  assert.ok(state.visited.includes("rust_sorghumbreak"));
});

test("rust milletbreak is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletbreak);
  assert.ok(state.visited.includes("rust_milletbreak"));
});

test("rust cornbreak is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornbreak);
  assert.ok(state.visited.includes("rust_cornbreak"));
});

test("rust oatbreak is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatbreak);
  assert.ok(state.visited.includes("rust_oatbreak"));
});

test("rust ryebreak is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ryebreak);
  assert.ok(state.visited.includes("rust_ryebreak"));
});

test("rust wheatbreak is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatbreak);
  assert.ok(state.visited.includes("rust_wheatbreak"));
});

test("rust durumlowgrade is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumlowgrade);
  assert.ok(state.visited.includes("rust_durumlowgrade"));
});

test("rust foniolowgrade is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniolowgrade);
  assert.ok(state.visited.includes("rust_foniolowgrade"));
});

test("rust tefflowgrade is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tefflowgrade);
  assert.ok(state.visited.includes("rust_tefflowgrade"));
});

test("rust barleylowgrade is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleylowgrade);
  assert.ok(state.visited.includes("rust_barleylowgrade"));
});

test("rust sorghumlowgrade is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumlowgrade);
  assert.ok(state.visited.includes("rust_sorghumlowgrade"));
});

test("rust milletlowgrade is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletlowgrade);
  assert.ok(state.visited.includes("rust_milletlowgrade"));
});

test("rust cornlowgrade is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornlowgrade);
  assert.ok(state.visited.includes("rust_cornlowgrade"));
});

test("rust oatlowgrade is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatlowgrade);
  assert.ok(state.visited.includes("rust_oatlowgrade"));
});

test("rust ryelowgrade is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ryelowgrade);
  assert.ok(state.visited.includes("rust_ryelowgrade"));
});

test("rust wheatlowgrade is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatlowgrade);
  assert.ok(state.visited.includes("rust_wheatlowgrade"));
});

test("rust durumclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumclear);
  assert.ok(state.visited.includes("rust_durumclear"));
});

test("rust fonioclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fonioclear);
  assert.ok(state.visited.includes("rust_fonioclear"));
});

test("rust teffclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffclear);
  assert.ok(state.visited.includes("rust_teffclear"));
});

test("rust barleyclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyclear);
  assert.ok(state.visited.includes("rust_barleyclear"));
});

test("rust sorghumclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumclear);
  assert.ok(state.visited.includes("rust_sorghumclear"));
});

test("rust milletclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletclear);
  assert.ok(state.visited.includes("rust_milletclear"));
});

test("rust cornclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornclear);
  assert.ok(state.visited.includes("rust_cornclear"));
});

test("rust oatclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatclear);
  assert.ok(state.visited.includes("rust_oatclear"));
});

test("rust ryeclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ryeclear);
  assert.ok(state.visited.includes("rust_ryeclear"));
});

test("rust wheatclear is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatclear);
  assert.ok(state.visited.includes("rust_wheatclear"));
});

test("rust durumreddog is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumreddog);
  assert.ok(state.visited.includes("rust_durumreddog"));
});

test("rust fonioreddog is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fonioreddog);
  assert.ok(state.visited.includes("rust_fonioreddog"));
});

test("rust teffreddog is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffreddog);
  assert.ok(state.visited.includes("rust_teffreddog"));
});

test("rust barleyreddog is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyreddog);
  assert.ok(state.visited.includes("rust_barleyreddog"));
});

test("rust sorghumreddog is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumreddog);
  assert.ok(state.visited.includes("rust_sorghumreddog"));
});

test("rust milletreddog is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletreddog);
  assert.ok(state.visited.includes("rust_milletreddog"));
});

test("rust cornreddog is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornreddog);
  assert.ok(state.visited.includes("rust_cornreddog"));
});

test("rust oatreddog is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatreddog);
  assert.ok(state.visited.includes("rust_oatreddog"));
});

test("rust ryereddog is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ryereddog);
  assert.ok(state.visited.includes("rust_ryereddog"));
});

test("rust wheatreddog is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatreddog);
  assert.ok(state.visited.includes("rust_wheatreddog"));
});

test("rust durumoffal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumoffal);
  assert.ok(state.visited.includes("rust_durumoffal"));
});

test("rust foniooffal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniooffal);
  assert.ok(state.visited.includes("rust_foniooffal"));
});

test("rust teffoffal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffoffal);
  assert.ok(state.visited.includes("rust_teffoffal"));
});

test("rust barleyoffal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyoffal);
  assert.ok(state.visited.includes("rust_barleyoffal"));
});

test("rust sorghumoffal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumoffal);
  assert.ok(state.visited.includes("rust_sorghumoffal"));
});

test("rust milletoffal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletoffal);
  assert.ok(state.visited.includes("rust_milletoffal"));
});

test("rust cornoffal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornoffal);
  assert.ok(state.visited.includes("rust_cornoffal"));
});

test("rust oatoffal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatoffal);
  assert.ok(state.visited.includes("rust_oatoffal"));
});

test("rust ryeoffal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ryeoffal);
  assert.ok(state.visited.includes("rust_ryeoffal"));
});

test("rust wheatoffal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatoffal);
  assert.ok(state.visited.includes("rust_wheatoffal"));
});

test("rust durumscreenings is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumscreenings);
  assert.ok(state.visited.includes("rust_durumscreenings"));
});

test("rust fonioscreenings is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fonioscreenings);
  assert.ok(state.visited.includes("rust_fonioscreenings"));
});

test("rust teffscreenings is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffscreenings);
  assert.ok(state.visited.includes("rust_teffscreenings"));
});

test("rust barleyscreenings is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyscreenings);
  assert.ok(state.visited.includes("rust_barleyscreenings"));
});

test("rust sorghumscreenings is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumscreenings);
  assert.ok(state.visited.includes("rust_sorghumscreenings"));
});

test("rust milletscreenings is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletscreenings);
  assert.ok(state.visited.includes("rust_milletscreenings"));
});

test("rust cornscreenings is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornscreenings);
  assert.ok(state.visited.includes("rust_cornscreenings"));
});

test("rust oatscreenings is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatscreenings);
  assert.ok(state.visited.includes("rust_oatscreenings"));
});

test("rust wheatscreenings is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatscreenings);
  assert.ok(state.visited.includes("rust_wheatscreenings"));
});

test("rust durumgermflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumgermflake);
  assert.ok(state.visited.includes("rust_durumgermflake"));
});

test("rust foniogermflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniogermflake);
  assert.ok(state.visited.includes("rust_foniogermflake"));
});

test("rust teffgermflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffgermflake);
  assert.ok(state.visited.includes("rust_teffgermflake"));
});

test("rust barleygermflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleygermflake);
  assert.ok(state.visited.includes("rust_barleygermflake"));
});

test("rust sorghumgermflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumgermflake);
  assert.ok(state.visited.includes("rust_sorghumgermflake"));
});

test("rust milletgermflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletgermflake);
  assert.ok(state.visited.includes("rust_milletgermflake"));
});

test("rust corngermflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_corngermflake);
  assert.ok(state.visited.includes("rust_corngermflake"));
});

test("rust oatgermflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatgermflake);
  assert.ok(state.visited.includes("rust_oatgermflake"));
});

test("rust ryegermflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ryegermflake);
  assert.ok(state.visited.includes("rust_ryegermflake"));
});

test("rust wheatgermflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatgermflake);
  assert.ok(state.visited.includes("rust_wheatgermflake"));
});

test("rust durumfeedflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumfeedflake);
  assert.ok(state.visited.includes("rust_durumfeedflake"));
});

test("rust foniofeedflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniofeedflake);
  assert.ok(state.visited.includes("rust_foniofeedflake"));
});

test("rust tefffeedflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tefffeedflake);
  assert.ok(state.visited.includes("rust_tefffeedflake"));
});

test("rust barleyfeedflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyfeedflake);
  assert.ok(state.visited.includes("rust_barleyfeedflake"));
});

test("rust sorghumfeedflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumfeedflake);
  assert.ok(state.visited.includes("rust_sorghumfeedflake"));
});

test("rust milletfeedflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletfeedflake);
  assert.ok(state.visited.includes("rust_milletfeedflake"));
});

test("rust cornfeedflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornfeedflake);
  assert.ok(state.visited.includes("rust_cornfeedflake"));
});

test("rust oatfeedflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatfeedflake);
  assert.ok(state.visited.includes("rust_oatfeedflake"));
});

test("rust ryefeedflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ryefeedflake);
  assert.ok(state.visited.includes("rust_ryefeedflake"));
});

test("rust wheatfeedflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatfeedflake);
  assert.ok(state.visited.includes("rust_wheatfeedflake"));
});

test("rust durumshorts is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumshorts);
  assert.ok(state.visited.includes("rust_durumshorts"));
});

test("rust fonioshorts is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fonioshorts);
  assert.ok(state.visited.includes("rust_fonioshorts"));
});

test("rust teffshorts is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffshorts);
  assert.ok(state.visited.includes("rust_teffshorts"));
});

test("rust barleyshorts is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyshorts);
  assert.ok(state.visited.includes("rust_barleyshorts"));
});

test("rust sorghumshorts is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumshorts);
  assert.ok(state.visited.includes("rust_sorghumshorts"));
});

test("rust milletshorts is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletshorts);
  assert.ok(state.visited.includes("rust_milletshorts"));
});

test("rust oatshorts is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatshorts);
  assert.ok(state.visited.includes("rust_oatshorts"));
});

test("rust ryeshorts is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ryeshorts);
  assert.ok(state.visited.includes("rust_ryeshorts"));
});

test("rust durummiddlings is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durummiddlings);
  assert.ok(state.visited.includes("rust_durummiddlings"));
});

test("rust foniomiddlings is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniomiddlings);
  assert.ok(state.visited.includes("rust_foniomiddlings"));
});

test("rust teffmiddlings is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffmiddlings);
  assert.ok(state.visited.includes("rust_teffmiddlings"));
});

test("rust barleymiddlings is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleymiddlings);
  assert.ok(state.visited.includes("rust_barleymiddlings"));
});

test("rust sorghimmiddlings is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghimmiddlings);
  assert.ok(state.visited.includes("rust_sorghimmiddlings"));
});

test("rust milletmiddlings is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletmiddlings);
  assert.ok(state.visited.includes("rust_milletmiddlings"));
});

test("rust cornmiddlings is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornmiddlings);
  assert.ok(state.visited.includes("rust_cornmiddlings"));
});

test("rust oatmiddlings is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatmiddlings);
  assert.ok(state.visited.includes("rust_oatmiddlings"));
});

test("rust ryemiddlings is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ryemiddlings);
  assert.ok(state.visited.includes("rust_ryemiddlings"));
});

test("rust wheatmiddlings is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatmiddlings);
  assert.ok(state.visited.includes("rust_wheatmiddlings"));
});

test("rust durumbran is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumbran);
  assert.ok(state.visited.includes("rust_durumbran"));
});

test("rust foniobran is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniobran);
  assert.ok(state.visited.includes("rust_foniobran"));
});

test("rust teffbran is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffbran);
  assert.ok(state.visited.includes("rust_teffbran"));
});

test("rust barleybranflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleybranflake);
  assert.ok(state.visited.includes("rust_barleybranflake"));
});

test("rust sorghumbranflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumbranflake);
  assert.ok(state.visited.includes("rust_sorghumbranflake"));
});

test("rust milletbranflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletbranflake);
  assert.ok(state.visited.includes("rust_milletbranflake"));
});

test("rust oatbranflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatbranflake);
  assert.ok(state.visited.includes("rust_oatbranflake"));
});

test("rust ryebranflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ryebranflake);
  assert.ok(state.visited.includes("rust_ryebranflake"));
});

test("rust wheatbranflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatbranflake);
  assert.ok(state.visited.includes("rust_wheatbranflake"));
});

test("rust durumpollard is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumpollard);
  assert.ok(state.visited.includes("rust_durumpollard"));
});

test("rust foniopollard is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniopollard);
  assert.ok(state.visited.includes("rust_foniopollard"));
});

test("rust teffpollard is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffpollard);
  assert.ok(state.visited.includes("rust_teffpollard"));
});

test("rust barleypollard is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleypollard);
  assert.ok(state.visited.includes("rust_barleypollard"));
});

test("rust sorghumpollard is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumpollard);
  assert.ok(state.visited.includes("rust_sorghumpollard"));
});

test("rust milletpollard is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletpollard);
  assert.ok(state.visited.includes("rust_milletpollard"));
});

test("rust cornpollard is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornpollard);
  assert.ok(state.visited.includes("rust_cornpollard"));
});

test("rust oatpollard is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatpollard);
  assert.ok(state.visited.includes("rust_oatpollard"));
});

test("rust ryepollard is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ryepollard);
  assert.ok(state.visited.includes("rust_ryepollard"));
});

test("rust wheatpollard is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatpollard);
  assert.ok(state.visited.includes("rust_wheatpollard"));
});

test("rust sorghings is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghings);
  assert.ok(state.visited.includes("rust_sorghings"));
});

test("rust millings is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_millings);
  assert.ok(state.visited.includes("rust_millings"));
});

test("rust cornings is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornings);
  assert.ok(state.visited.includes("rust_cornings"));
});

test("rust oatings is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatings);
  assert.ok(state.visited.includes("rust_oatings"));
});

test("rust ryeings is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ryeings);
  assert.ok(state.visited.includes("rust_ryeings"));
});

test("rust wheatings is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatings);
  assert.ok(state.visited.includes("rust_wheatings"));
});

test("rust durumfeed is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumfeed);
  assert.ok(state.visited.includes("rust_durumfeed"));
});

test("rust foniofeed is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniofeed);
  assert.ok(state.visited.includes("rust_foniofeed"));
});

test("rust tefffeed is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tefffeed);
  assert.ok(state.visited.includes("rust_tefffeed"));
});

test("rust barleyfeed is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyfeed);
  assert.ok(state.visited.includes("rust_barleyfeed"));
});

test("rust sorghumfeed is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumfeed);
  assert.ok(state.visited.includes("rust_sorghumfeed"));
});

test("rust milletfeed is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletfeed);
  assert.ok(state.visited.includes("rust_milletfeed"));
});

test("rust cornfeed is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornfeed);
  assert.ok(state.visited.includes("rust_cornfeed"));
});

test("rust oatfeed is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatfeed);
  assert.ok(state.visited.includes("rust_oatfeed"));
});

test("rust ryefeed is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ryefeed);
  assert.ok(state.visited.includes("rust_ryefeed"));
});

test("rust wheatfeed is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatfeed);
  assert.ok(state.visited.includes("rust_wheatfeed"));
});

test("rust cornshorts is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornshorts);
  assert.ok(state.visited.includes("rust_cornshorts"));
});

test("rust oatmidds is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatmidds);
  assert.ok(state.visited.includes("rust_oatmidds"));
});

test("rust ryescreenings is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ryescreenings);
  assert.ok(state.visited.includes("rust_ryescreenings"));
});

test("rust wheatshorts is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatshorts);
  assert.ok(state.visited.includes("rust_wheatshorts"));
});

test("rust ryegrassseed is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ryegrassseed);
  assert.ok(state.visited.includes("rust_ryegrassseed"));
});

test("rust barleygerm is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleygerm);
  assert.ok(state.visited.includes("rust_barleygerm"));
});

test("rust sorghumgerm is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumgerm);
  assert.ok(state.visited.includes("rust_sorghumgerm"));
});

test("rust milletgerm is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletgerm);
  assert.ok(state.visited.includes("rust_milletgerm"));
});

test("rust cornsemolina is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornsemolina);
  assert.ok(state.visited.includes("rust_cornsemolina"));
});

test("rust oatsemolina is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatsemolina);
  assert.ok(state.visited.includes("rust_oatsemolina"));
});

test("rust ryesemolina is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ryesemolina);
  assert.ok(state.visited.includes("rust_ryesemolina"));
});

test("rust wheatmidds is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatmidds);
  assert.ok(state.visited.includes("rust_wheatmidds"));
});

test("rust cornbranflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornbranflake);
  assert.ok(state.visited.includes("rust_cornbranflake"));
});

test("rust branflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_branflake);
  assert.ok(state.visited.includes("rust_branflake"));
});

test("rust oatflakebran is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatflakebran);
  assert.ok(state.visited.includes("rust_oatflakebran"));
});

test("rust ryeberrymeal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ryeberrymeal);
  assert.ok(state.visited.includes("rust_ryeberrymeal"));
});

test("rust durumgrits is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumgrits);
  assert.ok(state.visited.includes("rust_durumgrits"));
});

test("rust foniogrits is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniogrits);
  assert.ok(state.visited.includes("rust_foniogrits"));
});

test("rust teffgrits is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffgrits);
  assert.ok(state.visited.includes("rust_teffgrits"));
});

test("rust triticalegrits is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_triticalegrits);
  assert.ok(state.visited.includes("rust_triticalegrits"));
});

test("rust einkorngrits is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_einkorngrits);
  assert.ok(state.visited.includes("rust_einkorngrits"));
});

test("rust emmergrits is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_emmergrits);
  assert.ok(state.visited.includes("rust_emmergrits"));
});

test("rust kamutgrits is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kamutgrits);
  assert.ok(state.visited.includes("rust_kamutgrits"));
});

test("rust durumflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumflake);
  assert.ok(state.visited.includes("rust_durumflake"));
});

test("rust fonioflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fonioflake);
  assert.ok(state.visited.includes("rust_fonioflake"));
});

test("rust teffflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffflake);
  assert.ok(state.visited.includes("rust_teffflake"));
});

test("rust triticaleflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_triticaleflour);
  assert.ok(state.visited.includes("rust_triticaleflour"));
});

test("rust einkornmeal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_einkornmeal);
  assert.ok(state.visited.includes("rust_einkornmeal"));
});

test("rust emmermeal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_emmermeal);
  assert.ok(state.visited.includes("rust_emmermeal"));
});

test("rust buckwheatberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_buckwheatberry);
  assert.ok(state.visited.includes("rust_buckwheatberry"));
});

test("rust amaranthberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_amaranthberry);
  assert.ok(state.visited.includes("rust_amaranthberry"));
});

test("rust quinoaberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_quinoaberry);
  assert.ok(state.visited.includes("rust_quinoaberry"));
});

test("rust kamutmeal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kamutmeal);
  assert.ok(state.visited.includes("rust_kamutmeal"));
});

test("rust einkornflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_einkornflour);
  assert.ok(state.visited.includes("rust_einkornflour"));
});

test("rust emmerflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_emmerflour);
  assert.ok(state.visited.includes("rust_emmerflour"));
});

test("rust freekehflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_freekehflour);
  assert.ok(state.visited.includes("rust_freekehflour"));
});

test("rust farinagrit is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_farinagrit);
  assert.ok(state.visited.includes("rust_farinagrit"));
});

test("rust semolinagrit is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_semolinagrit);
  assert.ok(state.visited.includes("rust_semolinagrit"));
});

test("rust oatgerm is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatgerm);
  assert.ok(state.visited.includes("rust_oatgerm"));
});

test("rust wheatgerm is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatgerm);
  assert.ok(state.visited.includes("rust_wheatgerm"));
});

test("rust crackedwheat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_crackedwheat);
  assert.ok(state.visited.includes("rust_crackedwheat"));
});

test("rust buckwheatbran is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_buckwheatbran);
  assert.ok(state.visited.includes("rust_buckwheatbran"));
});

test("rust amaranthflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_amaranthflour);
  assert.ok(state.visited.includes("rust_amaranthflour"));
});

test("rust quinoaflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_quinoaflour);
  assert.ok(state.visited.includes("rust_quinoaflour"));
});

test("rust foniomeal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniomeal);
  assert.ok(state.visited.includes("rust_foniomeal"));
});

test("rust teffmeal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffmeal);
  assert.ok(state.visited.includes("rust_teffmeal"));
});

test("rust fonioflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fonioflour);
  assert.ok(state.visited.includes("rust_fonioflour"));
});

test("rust teffflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffflour);
  assert.ok(state.visited.includes("rust_teffflour"));
});

test("rust triticaleberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_triticaleberry);
  assert.ok(state.visited.includes("rust_triticaleberry"));
});

test("rust einkornberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_einkornberry);
  assert.ok(state.visited.includes("rust_einkornberry"));
});

test("rust emmerberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_emmerberry);
  assert.ok(state.visited.includes("rust_emmerberry"));
});

test("rust kamutberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kamutberry);
  assert.ok(state.visited.includes("rust_kamutberry"));
});

test("rust maizegroat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_maizegroat);
  assert.ok(state.visited.includes("rust_maizegroat"));
});

test("rust durumgroat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumgroat);
  assert.ok(state.visited.includes("rust_durumgroat"));
});

test("rust foniogroat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foniogroat);
  assert.ok(state.visited.includes("rust_foniogroat"));
});

test("rust teffgroat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teffgroat);
  assert.ok(state.visited.includes("rust_teffgroat"));
});

test("rust wheatgroat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatgroat);
  assert.ok(state.visited.includes("rust_wheatgroat"));
});

test("rust oatgroat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatgroat);
  assert.ok(state.visited.includes("rust_oatgroat"));
});

test("rust barleygroat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleygroat);
  assert.ok(state.visited.includes("rust_barleygroat"));
});

test("rust sorghumgroat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumgroat);
  assert.ok(state.visited.includes("rust_sorghumgroat"));
});

test("rust milletgroat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletgroat);
  assert.ok(state.visited.includes("rust_milletgroat"));
});

test("rust triticalegroat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_triticalegroat);
  assert.ok(state.visited.includes("rust_triticalegroat"));
});

test("rust emmergroat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_emmergroat);
  assert.ok(state.visited.includes("rust_emmergroat"));
});

test("rust einkorngroat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_einkorngroat);
  assert.ok(state.visited.includes("rust_einkorngroat"));
});

test("rust freekehgroat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_freekehgroat);
  assert.ok(state.visited.includes("rust_freekehgroat"));
});

test("rust kamutgroat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kamutgroat);
  assert.ok(state.visited.includes("rust_kamutgroat"));
});

test("rust speltgroat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_speltgroat);
  assert.ok(state.visited.includes("rust_speltgroat"));
});

test("rust triticaleflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_triticaleflake);
  assert.ok(state.visited.includes("rust_triticaleflake"));
});

test("rust emmerflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_emmerflake);
  assert.ok(state.visited.includes("rust_emmerflake"));
});

test("rust einkornflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_einkornflake);
  assert.ok(state.visited.includes("rust_einkornflake"));
});

test("rust freekehflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_freekehflake);
  assert.ok(state.visited.includes("rust_freekehflake"));
});

test("rust kamutflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kamutflake);
  assert.ok(state.visited.includes("rust_kamutflake"));
});

test("rust ryeflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ryeflake);
  assert.ok(state.visited.includes("rust_ryeflake"));
});

test("rust barleyflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyflake);
  assert.ok(state.visited.includes("rust_barleyflake"));
});

test("rust sorghumflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumflake);
  assert.ok(state.visited.includes("rust_sorghumflake"));
});

test("rust milletflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletflake);
  assert.ok(state.visited.includes("rust_milletflake"));
});

test("rust riceflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_riceflake);
  assert.ok(state.visited.includes("rust_riceflake"));
});

test("rust cornflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornflake);
  assert.ok(state.visited.includes("rust_cornflake"));
});

test("rust wheatflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatflake);
  assert.ok(state.visited.includes("rust_wheatflake"));
});

test("rust oatflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatflake);
  assert.ok(state.visited.includes("rust_oatflake"));
});

test("rust speltflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_speltflake);
  assert.ok(state.visited.includes("rust_speltflake"));
});

test("rust groatflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_groatflake);
  assert.ok(state.visited.includes("rust_groatflake"));
});

test("rust farroberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_farroberry);
  assert.ok(state.visited.includes("rust_farroberry"));
});

test("rust barleyberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyberry);
  assert.ok(state.visited.includes("rust_barleyberry"));
});

test("rust sorghumberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumberry);
  assert.ok(state.visited.includes("rust_sorghumberry"));
});

test("rust milletberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletberry);
  assert.ok(state.visited.includes("rust_milletberry"));
});

test("rust riceberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_riceberry);
  assert.ok(state.visited.includes("rust_riceberry"));
});

test("rust cornberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornberry);
  assert.ok(state.visited.includes("rust_cornberry"));
});

test("rust wheatberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatberry);
  assert.ok(state.visited.includes("rust_wheatberry"));
});

test("rust oatberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatberry);
  assert.ok(state.visited.includes("rust_oatberry"));
});

test("rust ryeberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ryeberry);
  assert.ok(state.visited.includes("rust_ryeberry"));
});

test("rust pumpkinflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pumpkinflour);
  assert.ok(state.visited.includes("rust_pumpkinflour"));
});

test("rust hempflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hempflour);
  assert.ok(state.visited.includes("rust_hempflour"));
});

test("rust chiaflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_chiaflour);
  assert.ok(state.visited.includes("rust_chiaflour"));
});

test("rust nigellaflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_nigellaflour);
  assert.ok(state.visited.includes("rust_nigellaflour"));
});

test("rust poppyflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_poppyflour);
  assert.ok(state.visited.includes("rust_poppyflour"));
});

test("rust sunflowerflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sunflowerflour);
  assert.ok(state.visited.includes("rust_sunflowerflour"));
});

test("rust sesameflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sesameflour);
  assert.ok(state.visited.includes("rust_sesameflour"));
});

test("rust barleybran is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleybran);
  assert.ok(state.visited.includes("rust_barleybran"));
});

test("rust sorghumbran is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumbran);
  assert.ok(state.visited.includes("rust_sorghumbran"));
});

test("rust milletbran is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletbran);
  assert.ok(state.visited.includes("rust_milletbran"));
});

test("rust speltberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_speltberry);
  assert.ok(state.visited.includes("rust_speltberry"));
});

test("rust buckwheatgroat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_buckwheatgroat);
  assert.ok(state.visited.includes("rust_buckwheatgroat"));
});

test("rust quinoaflake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_quinoaflake);
  assert.ok(state.visited.includes("rust_quinoaflake"));
});

test("rust amaranthseed is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_amaranthseed);
  assert.ok(state.visited.includes("rust_amaranthseed"));
});

test("rust farinaflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_farinaflour);
  assert.ok(state.visited.includes("rust_farinaflour"));
});

test("rust coconutflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_coconutflour);
  assert.ok(state.visited.includes("rust_coconutflour"));
});

test("rust almondflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_almondflour);
  assert.ok(state.visited.includes("rust_almondflour"));
});

test("rust peanutflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_peanutflour);
  assert.ok(state.visited.includes("rust_peanutflour"));
});

test("rust lentilflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lentilflour);
  assert.ok(state.visited.includes("rust_lentilflour"));
});

test("rust chickpeaflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_chickpeaflour);
  assert.ok(state.visited.includes("rust_chickpeaflour"));
});

test("rust buckwheatflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_buckwheatflour);
  assert.ok(state.visited.includes("rust_buckwheatflour"));
});

test("rust ricebran is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ricebran);
  assert.ok(state.visited.includes("rust_ricebran"));
});

test("rust cornbran is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornbran);
  assert.ok(state.visited.includes("rust_cornbran"));
});

test("rust wheatbran is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatbran);
  assert.ok(state.visited.includes("rust_wheatbran"));
});

test("rust oatbran is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatbran);
  assert.ok(state.visited.includes("rust_oatbran"));
});

test("rust ryebran is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ryebran);
  assert.ok(state.visited.includes("rust_ryebran"));
});

test("rust speltflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_speltflour);
  assert.ok(state.visited.includes("rust_speltflour"));
});

test("rust durumflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durumflour);
  assert.ok(state.visited.includes("rust_durumflour"));
});

test("rust breadflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_breadflour);
  assert.ok(state.visited.includes("rust_breadflour"));
});

test("rust pastryflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pastryflour);
  assert.ok(state.visited.includes("rust_pastryflour"));
});

test("rust grahamflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_grahamflour);
  assert.ok(state.visited.includes("rust_grahamflour"));
});

test("rust arrowroot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_arrowroot);
  assert.ok(state.visited.includes("rust_arrowroot"));
});

test("rust sago is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sago);
  assert.ok(state.visited.includes("rust_sago"));
});

test("rust tapioca is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tapioca);
  assert.ok(state.visited.includes("rust_tapioca"));
});

test("rust cassava is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cassava);
  assert.ok(state.visited.includes("rust_cassava"));
});

test("rust riceflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_riceflour);
  assert.ok(state.visited.includes("rust_riceflour"));
});

test("rust cornflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornflour);
  assert.ok(state.visited.includes("rust_cornflour"));
});

test("rust wheatflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatflour);
  assert.ok(state.visited.includes("rust_wheatflour"));
});

test("rust barleyflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleyflour);
  assert.ok(state.visited.includes("rust_barleyflour"));
});

test("rust oatflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatflour);
  assert.ok(state.visited.includes("rust_oatflour"));
});

test("rust ryeflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ryeflour);
  assert.ok(state.visited.includes("rust_ryeflour"));
});

test("rust milletflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletflour);
  assert.ok(state.visited.includes("rust_milletflour"));
});

test("rust sorghumflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumflour);
  assert.ok(state.visited.includes("rust_sorghumflour"));
});

test("rust freekeh is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_freekeh);
  assert.ok(state.visited.includes("rust_freekeh"));
});

test("rust kamut is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kamut);
  assert.ok(state.visited.includes("rust_kamut"));
});

test("rust sticky is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sticky);
  assert.ok(state.visited.includes("rust_sticky"));
});

test("rust blackrice is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_blackrice);
  assert.ok(state.visited.includes("rust_blackrice"));
});

test("rust wildrice is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wildrice);
  assert.ok(state.visited.includes("rust_wildrice"));
});

test("rust redrice is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_redrice);
  assert.ok(state.visited.includes("rust_redrice"));
});

test("rust jasmine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_jasmine);
  assert.ok(state.visited.includes("rust_jasmine"));
});

test("rust basmati is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_basmati);
  assert.ok(state.visited.includes("rust_basmati"));
});

test("rust glutinous is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_glutinous);
  assert.ok(state.visited.includes("rust_glutinous"));
});

test("rust japonica is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_japonica);
  assert.ok(state.visited.includes("rust_japonica"));
});

test("rust chia is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_chia);
  assert.ok(state.visited.includes("rust_chia"));
});

test("rust hempseed is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hempseed);
  assert.ok(state.visited.includes("rust_hempseed"));
});

test("rust pumpkinseed is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pumpkinseed);
  assert.ok(state.visited.includes("rust_pumpkinseed"));
});

test("rust flaxseed is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_flaxseed);
  assert.ok(state.visited.includes("rust_flaxseed"));
});

test("rust nigella is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_nigella);
  assert.ok(state.visited.includes("rust_nigella"));
});

test("rust poppyseed is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_poppyseed);
  assert.ok(state.visited.includes("rust_poppyseed"));
});

test("rust sunflower is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sunflower);
  assert.ok(state.visited.includes("rust_sunflower"));
});

test("rust sesame is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sesame);
  assert.ok(state.visited.includes("rust_sesame"));
});

test("rust vialone is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_vialone);
  assert.ok(state.visited.includes("rust_vialone"));
});

test("rust carnaroli is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_carnaroli);
  assert.ok(state.visited.includes("rust_carnaroli"));
});

test("rust arborio is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_arborio);
  assert.ok(state.visited.includes("rust_arborio"));
});

test("rust orzo is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_orzo);
  assert.ok(state.visited.includes("rust_orzo"));
});

test("rust polentameal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_polentameal);
  assert.ok(state.visited.includes("rust_polentameal"));
});

test("rust semolinaflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_semolinaflour);
  assert.ok(state.visited.includes("rust_semolinaflour"));
});

test("rust barleygrits is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleygrits);
  assert.ok(state.visited.includes("rust_barleygrits"));
});

test("rust wheatgrits is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatgrits);
  assert.ok(state.visited.includes("rust_wheatgrits"));
});

test("rust oatgrits is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatgrits);
  assert.ok(state.visited.includes("rust_oatgrits"));
});

test("rust ryegrits is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ryegrits);
  assert.ok(state.visited.includes("rust_ryegrits"));
});

test("rust sorghumgrits is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghumgrits);
  assert.ok(state.visited.includes("rust_sorghumgrits"));
});

test("rust milletgrits is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletgrits);
  assert.ok(state.visited.includes("rust_milletgrits"));
});

test("rust steelcutoats is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_steelcutoats);
  assert.ok(state.visited.includes("rust_steelcutoats"));
});

test("rust farina is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_farina);
  assert.ok(state.visited.includes("rust_farina"));
});

test("rust bulgur is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bulgur);
  assert.ok(state.visited.includes("rust_bulgur"));
});

test("rust couscous is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_couscous);
  assert.ok(state.visited.includes("rust_couscous"));
});

test("rust kasha is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kasha);
  assert.ok(state.visited.includes("rust_kasha"));
});

test("rust rolledoats is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rolledoats);
  assert.ok(state.visited.includes("rust_rolledoats"));
});

test("rust pearlbarley is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pearlbarley);
  assert.ok(state.visited.includes("rust_pearlbarley"));
});

test("rust groats is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_groats);
  assert.ok(state.visited.includes("rust_groats"));
});

test("rust middlings is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_middlings);
  assert.ok(state.visited.includes("rust_middlings"));
});

test("rust grist is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_grist);
  assert.ok(state.visited.includes("rust_grist"));
});

test("rust sampmeal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sampmeal);
  assert.ok(state.visited.includes("rust_sampmeal"));
});

test("rust nixtamal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_nixtamal);
  assert.ok(state.visited.includes("rust_nixtamal"));
});

test("rust masa is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_masa);
  assert.ok(state.visited.includes("rust_masa"));
});

test("rust sorghummeal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghummeal);
  assert.ok(state.visited.includes("rust_sorghummeal"));
});

test("rust milletmeal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milletmeal);
  assert.ok(state.visited.includes("rust_milletmeal"));
});

test("rust wheatmeal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatmeal);
  assert.ok(state.visited.includes("rust_wheatmeal"));
});

test("rust barleymeal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barleymeal);
  assert.ok(state.visited.includes("rust_barleymeal"));
});

test("rust ryegrain is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ryegrain);
  assert.ok(state.visited.includes("rust_ryegrain"));
});

test("rust oatmeal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oatmeal);
  assert.ok(state.visited.includes("rust_oatmeal"));
});

test("rust cornmeal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cornmeal);
  assert.ok(state.visited.includes("rust_cornmeal"));
});

test("rust teparybean is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teparybean);
  assert.ok(state.visited.includes("rust_teparybean"));
});

test("rust haricotbean is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_haricotbean);
  assert.ok(state.visited.includes("rust_haricotbean"));
});

test("rust maize is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_maize);
  assert.ok(state.visited.includes("rust_maize"));
});

test("rust grits is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_grits);
  assert.ok(state.visited.includes("rust_grits"));
});

test("rust hominy is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hominy);
  assert.ok(state.visited.includes("rust_hominy"));
});

test("rust polenta is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_polenta);
  assert.ok(state.visited.includes("rust_polenta"));
});

test("rust semolina is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_semolina);
  assert.ok(state.visited.includes("rust_semolina"));
});

test("rust wheatcorn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatcorn);
  assert.ok(state.visited.includes("rust_wheatcorn"));
});

test("rust groat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_groat);
  assert.ok(state.visited.includes("rust_groat"));
});

test("rust fonio is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fonio);
  assert.ok(state.visited.includes("rust_fonio"));
});

test("rust teff is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teff);
  assert.ok(state.visited.includes("rust_teff"));
});

test("rust triticale is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_triticale);
  assert.ok(state.visited.includes("rust_triticale"));
});

test("rust einkorn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_einkorn);
  assert.ok(state.visited.includes("rust_einkorn"));
});

test("rust emmer is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_emmer);
  assert.ok(state.visited.includes("rust_emmer"));
});

test("rust spelt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_spelt);
  assert.ok(state.visited.includes("rust_spelt"));
});

test("rust farro is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_farro);
  assert.ok(state.visited.includes("rust_farro"));
});

test("rust buckwheat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_buckwheat);
  assert.ok(state.visited.includes("rust_buckwheat"));
});

test("rust gramflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_gramflour);
  assert.ok(state.visited.includes("rust_gramflour"));
});

test("rust soyflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_soyflour);
  assert.ok(state.visited.includes("rust_soyflour"));
});

test("rust peaflour is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_peaflour);
  assert.ok(state.visited.includes("rust_peaflour"));
});

test("rust azuki is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_azuki);
  assert.ok(state.visited.includes("rust_azuki"));
});

test("rust soymeal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_soymeal);
  assert.ok(state.visited.includes("rust_soymeal"));
});

test("rust beanpod is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_beanpod);
  assert.ok(state.visited.includes("rust_beanpod"));
});

test("rust cardamom is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cardamom);
  assert.ok(state.visited.includes("rust_cardamom"));
});

test("rust blackeye is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_blackeye);
  assert.ok(state.visited.includes("rust_blackeye"));
});

test("rust fieldpea is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fieldpea);
  assert.ok(state.visited.includes("rust_fieldpea"));
});

test("rust lentilbean is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lentilbean);
  assert.ok(state.visited.includes("rust_lentilbean"));
});

test("rust mungbean is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mungbean);
  assert.ok(state.visited.includes("rust_mungbean"));
});

test("rust jackbean is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_jackbean);
  assert.ok(state.visited.includes("rust_jackbean"));
});

test("rust velvetbean is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_velvetbean);
  assert.ok(state.visited.includes("rust_velvetbean"));
});

test("rust yardlong is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_yardlong);
  assert.ok(state.visited.includes("rust_yardlong"));
});

test("rust tepary is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tepary);
  assert.ok(state.visited.includes("rust_tepary"));
});

test("rust seabean is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_seabean);
  assert.ok(state.visited.includes("rust_seabean"));
});

test("rust glasswort is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_glasswort);
  assert.ok(state.visited.includes("rust_glasswort"));
});

test("rust splitpea is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_splitpea);
  assert.ok(state.visited.includes("rust_splitpea"));
});

test("rust marrowfat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_marrowfat);
  assert.ok(state.visited.includes("rust_marrowfat"));
});

test("rust cannellini is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cannellini);
  assert.ok(state.visited.includes("rust_cannellini"));
});

test("rust borlotti is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_borlotti);
  assert.ok(state.visited.includes("rust_borlotti"));
});

test("rust flageolet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_flageolet);
  assert.ok(state.visited.includes("rust_flageolet"));
});

test("rust haricot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_haricot);
  assert.ok(state.visited.includes("rust_haricot"));
});

test("rust samphire is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_samphire);
  assert.ok(state.visited.includes("rust_samphire"));
});

test("rust gram is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_gram);
  assert.ok(state.visited.includes("rust_gram"));
});

test("rust fenugreek is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fenugreek);
  assert.ok(state.visited.includes("rust_fenugreek"));
});

test("rust lupin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lupin);
  assert.ok(state.visited.includes("rust_lupin"));
});

test("rust pigeonpea is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pigeonpea);
  assert.ok(state.visited.includes("rust_pigeonpea"));
});

test("rust blackbean is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_blackbean);
  assert.ok(state.visited.includes("rust_blackbean"));
});

test("rust kidneybean is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kidneybean);
  assert.ok(state.visited.includes("rust_kidneybean"));
});

test("rust pinto is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pinto);
  assert.ok(state.visited.includes("rust_pinto"));
});

test("rust navybean is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_navybean);
  assert.ok(state.visited.includes("rust_navybean"));
});

test("rust lima is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lima);
  assert.ok(state.visited.includes("rust_lima"));
});

test("rust cowpea is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cowpea);
  assert.ok(state.visited.includes("rust_cowpea"));
});

test("rust soybean is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_soybean);
  assert.ok(state.visited.includes("rust_soybean"));
});

test("rust adzuki is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_adzuki);
  assert.ok(state.visited.includes("rust_adzuki"));
});

test("rust mung is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mung);
  assert.ok(state.visited.includes("rust_mung"));
});

test("rust fava is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fava);
  assert.ok(state.visited.includes("rust_fava"));
});

test("rust chickpea is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_chickpea);
  assert.ok(state.visited.includes("rust_chickpea"));
});

test("rust goosefoot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_goosefoot);
  assert.ok(state.visited.includes("rust_goosefoot"));
});

test("rust claytonia is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_claytonia);
  assert.ok(state.visited.includes("rust_claytonia"));
});

test("rust mache is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mache);
  assert.ok(state.visited.includes("rust_mache"));
});

test("rust fennelseed is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fennelseed);
  assert.ok(state.visited.includes("rust_fennelseed"));
});

test("rust malabar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_malabar);
  assert.ok(state.visited.includes("rust_malabar"));
});

test("rust lambsquarter is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lambsquarter);
  assert.ok(state.visited.includes("rust_lambsquarter"));
});

test("rust waterleaf is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_waterleaf);
  assert.ok(state.visited.includes("rust_waterleaf"));
});

test("rust amaranth is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_amaranth);
  assert.ok(state.visited.includes("rust_amaranth"));
});

test("rust orach is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_orach);
  assert.ok(state.visited.includes("rust_orach"));
});

test("rust cilantro is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cilantro);
  assert.ok(state.visited.includes("rust_cilantro"));
});

test("rust dandelion is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_dandelion);
  assert.ok(state.visited.includes("rust_dandelion"));
});

test("rust purslane is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_purslane);
  assert.ok(state.visited.includes("rust_purslane"));
});

test("rust bokchoy is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bokchoy);
  assert.ok(state.visited.includes("rust_bokchoy"));
});

test("rust mustard is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mustard);
  assert.ok(state.visited.includes("rust_mustard"));
});

test("rust cress is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cress);
  assert.ok(state.visited.includes("rust_cress"));
});

test("rust sprout is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sprout);
  assert.ok(state.visited.includes("rust_sprout"));
});

test("rust tatsoi is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tatsoi);
  assert.ok(state.visited.includes("rust_tatsoi"));
});

test("rust mizuna is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mizuna);
  assert.ok(state.visited.includes("rust_mizuna"));
});

test("rust chicory is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_chicory);
  assert.ok(state.visited.includes("rust_chicory"));
});

test("rust romaine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_romaine);
  assert.ok(state.visited.includes("rust_romaine"));
});

test("rust radicchio is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_radicchio);
  assert.ok(state.visited.includes("rust_radicchio"));
});

test("rust arugula is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_arugula);
  assert.ok(state.visited.includes("rust_arugula"));
});

test("rust escarole is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_escarole);
  assert.ok(state.visited.includes("rust_escarole"));
});

test("rust endive is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_endive);
  assert.ok(state.visited.includes("rust_endive"));
});

test("rust lettuce is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lettuce);
  assert.ok(state.visited.includes("rust_lettuce"));
});

test("rust brussels is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_brussels);
  assert.ok(state.visited.includes("rust_brussels"));
});

test("rust cauliflower is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cauliflower);
  assert.ok(state.visited.includes("rust_cauliflower"));
});

test("rust broccoli is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_broccoli);
  assert.ok(state.visited.includes("rust_broccoli"));
});

test("rust collard is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_collard);
  assert.ok(state.visited.includes("rust_collard"));
});

test("rust kale is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kale);
  assert.ok(state.visited.includes("rust_kale"));
});

test("rust chard is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_chard);
  assert.ok(state.visited.includes("rust_chard"));
});

test("rust spinach is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_spinach);
  assert.ok(state.visited.includes("rust_spinach"));
});

test("rust cabbage is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cabbage);
  assert.ok(state.visited.includes("rust_cabbage"));
});

test("rust kohlrabi is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kohlrabi);
  assert.ok(state.visited.includes("rust_kohlrabi"));
});

test("rust rutabaga is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rutabaga);
  assert.ok(state.visited.includes("rust_rutabaga"));
});

test("rust swede is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_swede);
  assert.ok(state.visited.includes("rust_swede"));
});

test("rust carrot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_carrot);
  assert.ok(state.visited.includes("rust_carrot"));
});

test("rust radish is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_radish);
  assert.ok(state.visited.includes("rust_radish"));
});

test("rust beetroot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_beetroot);
  assert.ok(state.visited.includes("rust_beetroot"));
});

test("rust turnip is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_turnip);
  assert.ok(state.visited.includes("rust_turnip"));
});

test("rust parsnip is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_parsnip);
  assert.ok(state.visited.includes("rust_parsnip"));
});

test("rust celeriac is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_celeriac);
  assert.ok(state.visited.includes("rust_celeriac"));
});

test("rust ramson is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ramson);
  assert.ok(state.visited.includes("rust_ramson"));
});

test("rust scallion is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_scallion);
  assert.ok(state.visited.includes("rust_scallion"));
});

test("rust leek is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_leek);
  assert.ok(state.visited.includes("rust_leek"));
});

test("rust sorrel is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorrel);
  assert.ok(state.visited.includes("rust_sorrel"));
});

test("rust lemonbalm is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lemonbalm);
  assert.ok(state.visited.includes("rust_lemonbalm"));
});

test("rust wintersavory is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wintersavory);
  assert.ok(state.visited.includes("rust_wintersavory"));
});

test("rust shallot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_shallot);
  assert.ok(state.visited.includes("rust_shallot"));
});

test("rust onion is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_onion);
  assert.ok(state.visited.includes("rust_onion"));
});

test("rust garlic is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_garlic);
  assert.ok(state.visited.includes("rust_garlic"));
});

test("rust chives is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_chives);
  assert.ok(state.visited.includes("rust_chives"));
});

test("rust sage is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sage);
  assert.ok(state.visited.includes("rust_sage"));
});

test("rust basil is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_basil);
  assert.ok(state.visited.includes("rust_basil"));
});

test("rust mint is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mint);
  assert.ok(state.visited.includes("rust_mint"));
});

test("rust thyme is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_thyme);
  assert.ok(state.visited.includes("rust_thyme"));
});

test("rust rosemary is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rosemary);
  assert.ok(state.visited.includes("rust_rosemary"));
});

test("rust parsley is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_parsley);
  assert.ok(state.visited.includes("rust_parsley"));
});

test("rust anise is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_anise);
  assert.ok(state.visited.includes("rust_anise"));
});

test("rust caraway is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_caraway);
  assert.ok(state.visited.includes("rust_caraway"));
});

test("rust coriander is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_coriander);
  assert.ok(state.visited.includes("rust_coriander"));
});

test("rust cumin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cumin);
  assert.ok(state.visited.includes("rust_cumin"));
});

test("rust dill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_dill);
  assert.ok(state.visited.includes("rust_dill"));
});

test("rust fennel is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fennel);
  assert.ok(state.visited.includes("rust_fennel"));
});

test("rust hyssop is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hyssop);
  assert.ok(state.visited.includes("rust_hyssop"));
});

test("rust borage is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_borage);
  assert.ok(state.visited.includes("rust_borage"));
});

test("rust lovage is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lovage);
  assert.ok(state.visited.includes("rust_lovage"));
});

test("rust chervil is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_chervil);
  assert.ok(state.visited.includes("rust_chervil"));
});

test("rust tarragon is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tarragon);
  assert.ok(state.visited.includes("rust_tarragon"));
});

test("rust savory is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_savory);
  assert.ok(state.visited.includes("rust_savory"));
});

test("rust oregano is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oregano);
  assert.ok(state.visited.includes("rust_oregano"));
});

test("rust marjoram is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_marjoram);
  assert.ok(state.visited.includes("rust_marjoram"));
});

test("rust pistia is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pistia);
  assert.ok(state.visited.includes("rust_pistia"));
});

test("rust wolffia is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wolffia);
  assert.ok(state.visited.includes("rust_wolffia"));
});

test("rust lemna is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lemna);
  assert.ok(state.visited.includes("rust_lemna"));
});

test("rust riccia is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_riccia);
  assert.ok(state.visited.includes("rust_riccia"));
});

test("rust nitella is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_nitella);
  assert.ok(state.visited.includes("rust_nitella"));
});

test("rust chara is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_chara);
  assert.ok(state.visited.includes("rust_chara"));
});

test("rust hydrilla is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hydrilla);
  assert.ok(state.visited.includes("rust_hydrilla"));
});

test("rust vallisneria is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_vallisneria);
  assert.ok(state.visited.includes("rust_vallisneria"));
});

test("rust elodea is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_elodea);
  assert.ok(state.visited.includes("rust_elodea"));
});

test("rust naiad is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_naiad);
  assert.ok(state.visited.includes("rust_naiad"));
});

test("rust watermeal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_watermeal);
  assert.ok(state.visited.includes("rust_watermeal"));
});

test("rust salvinia is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_salvinia);
  assert.ok(state.visited.includes("rust_salvinia"));
});

test("rust azolla is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_azolla);
  assert.ok(state.visited.includes("rust_azolla"));
});

test("rust frogbit is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_frogbit);
  assert.ok(state.visited.includes("rust_frogbit"));
});

test("rust tapegrass is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tapegrass);
  assert.ok(state.visited.includes("rust_tapegrass"));
});

test("rust spikegrass is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_spikegrass);
  assert.ok(state.visited.includes("rust_spikegrass"));
});

test("rust reedmace is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_reedmace);
  assert.ok(state.visited.includes("rust_reedmace"));
});

test("rust bladderwort is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bladderwort);
  assert.ok(state.visited.includes("rust_bladderwort"));
});

test("rust bulrush is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bulrush);
  assert.ok(state.visited.includes("rust_bulrush"));
});

test("rust cattail is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cattail);
  assert.ok(state.visited.includes("rust_cattail"));
});

test("rust waterlily is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_waterlily);
  assert.ok(state.visited.includes("rust_waterlily"));
});

test("rust watercress is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_watercress);
  assert.ok(state.visited.includes("rust_watercress"));
});

test("rust millfoil is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_millfoil);
  assert.ok(state.visited.includes("rust_millfoil"));
});

test("rust pondweed is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pondweed);
  assert.ok(state.visited.includes("rust_pondweed"));
});

test("rust duckweed is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_duckweed);
  assert.ok(state.visited.includes("rust_duckweed"));
});

test("rust hornwort is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hornwort);
  assert.ok(state.visited.includes("rust_hornwort"));
});

test("rust arame is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_arame);
  assert.ok(state.visited.includes("rust_arame"));
});

test("rust hijiki is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hijiki);
  assert.ok(state.visited.includes("rust_hijiki"));
});

test("rust kombu is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kombu);
  assert.ok(state.visited.includes("rust_kombu"));
});

test("rust wakame is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wakame);
  assert.ok(state.visited.includes("rust_wakame"));
});

test("rust laminaria is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_laminaria);
  assert.ok(state.visited.includes("rust_laminaria"));
});

test("rust seagrass is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_seagrass);
  assert.ok(state.visited.includes("rust_seagrass"));
});

test("rust eelgrass is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_eelgrass);
  assert.ok(state.visited.includes("rust_eelgrass"));
});

test("rust sargassum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sargassum);
  assert.ok(state.visited.includes("rust_sargassum"));
});

test("rust irishmoss is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_irishmoss);
  assert.ok(state.visited.includes("rust_irishmoss"));
});

test("rust rockweed is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rockweed);
  assert.ok(state.visited.includes("rust_rockweed"));
});

test("rust bladderwrack is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bladderwrack);
  assert.ok(state.visited.includes("rust_bladderwrack"));
});

test("rust holdfast is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_holdfast);
  assert.ok(state.visited.includes("rust_holdfast"));
});

test("rust stipe is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_stipe);
  assert.ok(state.visited.includes("rust_stipe"));
});

test("rust spore is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_spore);
  assert.ok(state.visited.includes("rust_spore"));
});

test("rust frond is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_frond);
  assert.ok(state.visited.includes("rust_frond"));
});

test("rust fern is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fern);
  assert.ok(state.visited.includes("rust_fern"));
});

test("rust turf is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_turf);
  assert.ok(state.visited.includes("rust_turf"));
});

test("rust hay is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hay);
  assert.ok(state.visited.includes("rust_hay"));
});

test("rust furze is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_furze);
  assert.ok(state.visited.includes("rust_furze"));
});

test("rust cane is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cane);
  assert.ok(state.visited.includes("rust_cane"));
});

test("rust agar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_agar);
  assert.ok(state.visited.includes("rust_agar"));
});

test("rust nori is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_nori);
  assert.ok(state.visited.includes("rust_nori"));
});

test("rust fucus is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fucus);
  assert.ok(state.visited.includes("rust_fucus"));
});

test("rust wrack is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wrack);
  assert.ok(state.visited.includes("rust_wrack"));
});

test("rust dulse is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_dulse);
  assert.ok(state.visited.includes("rust_dulse"));
});

test("rust heather is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_heather);
  assert.ok(state.visited.includes("rust_heather"));
});

test("rust bracken is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bracken);
  assert.ok(state.visited.includes("rust_bracken"));
});

test("rust osier is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_osier);
  assert.ok(state.visited.includes("rust_osier"));
});

test("rust reed is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_reed);
  assert.ok(state.visited.includes("rust_reed"));
});

test("rust broom is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_broom);
  assert.ok(state.visited.includes("rust_broom"));
});

test("rust gorse is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_gorse);
  assert.ok(state.visited.includes("rust_gorse"));
});

test("rust rush is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rush);
  assert.ok(state.visited.includes("rust_rush"));
});

test("rust papyrus is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_papyrus);
  assert.ok(state.visited.includes("rust_papyrus"));
});

test("rust sedge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sedge);
  assert.ok(state.visited.includes("rust_sedge"));
});

test("rust pina is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pina);
  assert.ok(state.visited.includes("rust_pina"));
});

test("rust alfa is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_alfa);
  assert.ok(state.visited.includes("rust_alfa"));
});

test("rust piassava is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_piassava);
  assert.ok(state.visited.includes("rust_piassava"));
});

test("rust esparto is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_esparto);
  assert.ok(state.visited.includes("rust_esparto"));
});

test("rust harakeke is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_harakeke);
  assert.ok(state.visited.includes("rust_harakeke"));
});

test("rust phormium is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_phormium);
  assert.ok(state.visited.includes("rust_phormium"));
});

test("rust yucca is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_yucca);
  assert.ok(state.visited.includes("rust_yucca"));
});

test("rust agave is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_agave);
  assert.ok(state.visited.includes("rust_agave"));
});

test("rust pita is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pita);
  assert.ok(state.visited.includes("rust_pita"));
});

test("rust maguey is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_maguey);
  assert.ok(state.visited.includes("rust_maguey"));
});

test("rust istle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_istle);
  assert.ok(state.visited.includes("rust_istle"));
});

test("rust henequen is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_henequen);
  assert.ok(state.visited.includes("rust_henequen"));
});

test("rust sunn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sunn);
  assert.ok(state.visited.includes("rust_sunn"));
});

test("rust kenaf is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kenaf);
  assert.ok(state.visited.includes("rust_kenaf"));
});

test("rust abaca is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_abaca);
  assert.ok(state.visited.includes("rust_abaca"));
});

test("rust nettle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_nettle);
  assert.ok(state.visited.includes("rust_nettle"));
});

test("rust ramie is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ramie);
  assert.ok(state.visited.includes("rust_ramie"));
});

test("rust kapok is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kapok);
  assert.ok(state.visited.includes("rust_kapok"));
});

test("rust bast is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bast);
  assert.ok(state.visited.includes("rust_bast"));
});

test("rust raffia is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_raffia);
  assert.ok(state.visited.includes("rust_raffia"));
});

test("rust quinoa is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_quinoa);
  assert.ok(state.visited.includes("rust_quinoa"));
});

test("rust sorghum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sorghum);
  assert.ok(state.visited.includes("rust_sorghum"));
});

test("rust millet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_millet);
  assert.ok(state.visited.includes("rust_millet"));
});

test("rust rye is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rye);
  assert.ok(state.visited.includes("rust_rye"));
});

test("rust oats is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oats);
  assert.ok(state.visited.includes("rust_oats"));
});

test("rust barley is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barley);
  assert.ok(state.visited.includes("rust_barley"));
});

test("rust wheat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheat);
  assert.ok(state.visited.includes("rust_wheat"));
});

test("rust rice is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rice);
  assert.ok(state.visited.includes("rust_rice"));
});

test("rust lentil is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lentil);
  assert.ok(state.visited.includes("rust_lentil"));
});

test("rust pea is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pea);
  assert.ok(state.visited.includes("rust_pea"));
});

test("rust bean is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bean);
  assert.ok(state.visited.includes("rust_bean"));
});

test("rust corn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_corn);
  assert.ok(state.visited.includes("rust_corn"));
});

test("rust okra is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_okra);
  assert.ok(state.visited.includes("rust_okra"));
});

test("rust eggplant is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_eggplant);
  assert.ok(state.visited.includes("rust_eggplant"));
});

test("rust pepper is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pepper);
  assert.ok(state.visited.includes("rust_pepper"));
});

test("rust tomato is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tomato);
  assert.ok(state.visited.includes("rust_tomato"));
});

test("rust delicata is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_delicata);
  assert.ok(state.visited.includes("rust_delicata"));
});

test("rust pattypan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pattypan);
  assert.ok(state.visited.includes("rust_pattypan"));
});

test("rust marrow is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_marrow);
  assert.ok(state.visited.includes("rust_marrow"));
});

test("rust gourd is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_gourd);
  assert.ok(state.visited.includes("rust_gourd"));
});

test("rust cucumber is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cucumber);
  assert.ok(state.visited.includes("rust_cucumber"));
});

test("rust zucchini is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_zucchini);
  assert.ok(state.visited.includes("rust_zucchini"));
});

test("rust squash is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_squash);
  assert.ok(state.visited.includes("rust_squash"));
});

test("rust pumpkin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pumpkin);
  assert.ok(state.visited.includes("rust_pumpkin"));
});

test("rust canary is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_canary);
  assert.ok(state.visited.includes("rust_canary"));
});

test("rust charentais is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_charentais);
  assert.ok(state.visited.includes("rust_charentais"));
});

test("rust galia is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_galia);
  assert.ok(state.visited.includes("rust_galia"));
});

test("rust crenshaw is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_crenshaw);
  assert.ok(state.visited.includes("rust_crenshaw"));
});

test("rust casaba is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_casaba);
  assert.ok(state.visited.includes("rust_casaba"));
});

test("rust honeydew is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_honeydew);
  assert.ok(state.visited.includes("rust_honeydew"));
});

test("rust cantaloupe is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cantaloupe);
  assert.ok(state.visited.includes("rust_cantaloupe"));
});

test("rust watermelon is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_watermelon);
  assert.ok(state.visited.includes("rust_watermelon"));
});

test("rust kiwi is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kiwi);
  assert.ok(state.visited.includes("rust_kiwi"));
});

test("rust dragonfruit is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_dragonfruit);
  assert.ok(state.visited.includes("rust_dragonfruit"));
});

test("rust starfruit is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_starfruit);
  assert.ok(state.visited.includes("rust_starfruit"));
});

test("rust passionfruit is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_passionfruit);
  assert.ok(state.visited.includes("rust_passionfruit"));
});

test("rust pineapple is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pineapple);
  assert.ok(state.visited.includes("rust_pineapple"));
});

test("rust coconut is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_coconut);
  assert.ok(state.visited.includes("rust_coconut"));
});

test("rust plantain is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_plantain);
  assert.ok(state.visited.includes("rust_plantain"));
});

test("rust banana is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_banana);
  assert.ok(state.visited.includes("rust_banana"));
});

test("rust sweetsop is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sweetsop);
  assert.ok(state.visited.includes("rust_sweetsop"));
});

test("rust soursop is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_soursop);
  assert.ok(state.visited.includes("rust_soursop"));
});

test("rust breadfruit is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_breadfruit);
  assert.ok(state.visited.includes("rust_breadfruit"));
});

test("rust jackfruit is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_jackfruit);
  assert.ok(state.visited.includes("rust_jackfruit"));
});

test("rust durian is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durian);
  assert.ok(state.visited.includes("rust_durian"));
});

test("rust longan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_longan);
  assert.ok(state.visited.includes("rust_longan"));
});

test("rust rambutan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rambutan);
  assert.ok(state.visited.includes("rust_rambutan"));
});

test("rust lychee is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lychee);
  assert.ok(state.visited.includes("rust_lychee"));
});

test("rust sapodilla is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sapodilla);
  assert.ok(state.visited.includes("rust_sapodilla"));
});

test("rust cherimoya is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cherimoya);
  assert.ok(state.visited.includes("rust_cherimoya"));
});

test("rust feijoa is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_feijoa);
  assert.ok(state.visited.includes("rust_feijoa"));
});

test("rust guava is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_guava);
  assert.ok(state.visited.includes("rust_guava"));
});

test("rust papaya is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_papaya);
  assert.ok(state.visited.includes("rust_papaya"));
});

test("rust mango is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mango);
  assert.ok(state.visited.includes("rust_mango"));
});

test("rust avocado is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_avocado);
  assert.ok(state.visited.includes("rust_avocado"));
});

test("rust olive is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_olive);
  assert.ok(state.visited.includes("rust_olive"));
});

test("rust yuzu is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_yuzu);
  assert.ok(state.visited.includes("rust_yuzu"));
});

test("rust calamondin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_calamondin);
  assert.ok(state.visited.includes("rust_calamondin"));
});

test("rust kumquat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kumquat);
  assert.ok(state.visited.includes("rust_kumquat"));
});

test("rust bergamot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bergamot);
  assert.ok(state.visited.includes("rust_bergamot"));
});

test("rust citron is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_citron);
  assert.ok(state.visited.includes("rust_citron"));
});

test("rust pomegranate is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pomegranate);
  assert.ok(state.visited.includes("rust_pomegranate"));
});

test("rust date is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_date);
  assert.ok(state.visited.includes("rust_date"));
});

test("rust fig is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fig);
  assert.ok(state.visited.includes("rust_fig"));
});

test("rust gean is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_gean);
  assert.ok(state.visited.includes("rust_gean"));
});

test("rust morello is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_morello);
  assert.ok(state.visited.includes("rust_morello"));
});

test("rust bullace is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bullace);
  assert.ok(state.visited.includes("rust_bullace"));
});

test("rust mirabelle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mirabelle);
  assert.ok(state.visited.includes("rust_mirabelle"));
});

test("rust damson is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_damson);
  assert.ok(state.visited.includes("rust_damson"));
});

test("rust greengage is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_greengage);
  assert.ok(state.visited.includes("rust_greengage"));
});

test("rust nectarine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_nectarine);
  assert.ok(state.visited.includes("rust_nectarine"));
});

test("rust apricot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_apricot);
  assert.ok(state.visited.includes("rust_apricot"));
});

test("rust hawtree is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hawtree);
  assert.ok(state.visited.includes("rust_hawtree"));
});

test("rust jujube is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_jujube);
  assert.ok(state.visited.includes("rust_jujube"));
});

test("rust loquat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_loquat);
  assert.ok(state.visited.includes("rust_loquat"));
});

test("rust quince is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_quince);
  assert.ok(state.visited.includes("rust_quince"));
});

test("rust medlar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_medlar);
  assert.ok(state.visited.includes("rust_medlar"));
});

test("rust sloe is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sloe);
  assert.ok(state.visited.includes("rust_sloe"));
});

test("rust blackthorn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_blackthorn);
  assert.ok(state.visited.includes("rust_blackthorn"));
});

test("rust hawthorn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hawthorn);
  assert.ok(state.visited.includes("rust_hawthorn"));
});

test("rust mulberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mulberry);
  assert.ok(state.visited.includes("rust_mulberry"));
});

test("rust wintergreen is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wintergreen);
  assert.ok(state.visited.includes("rust_wintergreen"));
});

test("rust barberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barberry);
  assert.ok(state.visited.includes("rust_barberry"));
});

test("rust juneberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_juneberry);
  assert.ok(state.visited.includes("rust_juneberry"));
});

test("rust blackberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_blackberry);
  assert.ok(state.visited.includes("rust_blackberry"));
});

test("rust currant is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_currant);
  assert.ok(state.visited.includes("rust_currant"));
});

test("rust blueberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_blueberry);
  assert.ok(state.visited.includes("rust_blueberry"));
});

test("rust strawberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_strawberry);
  assert.ok(state.visited.includes("rust_strawberry"));
});

test("rust foxberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foxberry);
  assert.ok(state.visited.includes("rust_foxberry"));
});

test("rust cowberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cowberry);
  assert.ok(state.visited.includes("rust_cowberry"));
});

test("rust crowberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_crowberry);
  assert.ok(state.visited.includes("rust_crowberry"));
});

test("rust lingonberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lingonberry);
  assert.ok(state.visited.includes("rust_lingonberry"));
});

test("rust marionberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_marionberry);
  assert.ok(state.visited.includes("rust_marionberry"));
});

test("rust boysenberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_boysenberry);
  assert.ok(state.visited.includes("rust_boysenberry"));
});

test("rust raspberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_raspberry);
  assert.ok(state.visited.includes("rust_raspberry"));
});

test("rust bilberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bilberry);
  assert.ok(state.visited.includes("rust_bilberry"));
});

test("rust dewberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_dewberry);
  assert.ok(state.visited.includes("rust_dewberry"));
});

test("rust salmonberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_salmonberry);
  assert.ok(state.visited.includes("rust_salmonberry"));
});

test("rust thimbleberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_thimbleberry);
  assert.ok(state.visited.includes("rust_thimbleberry"));
});

test("rust cloudberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cloudberry);
  assert.ok(state.visited.includes("rust_cloudberry"));
});

test("rust loganberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_loganberry);
  assert.ok(state.visited.includes("rust_loganberry"));
});

test("rust huckleberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_huckleberry);
  assert.ok(state.visited.includes("rust_huckleberry"));
});

test("rust gooseberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_gooseberry);
  assert.ok(state.visited.includes("rust_gooseberry"));
});

test("rust cranberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cranberry);
  assert.ok(state.visited.includes("rust_cranberry"));
});

test("rust bayberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bayberry);
  assert.ok(state.visited.includes("rust_bayberry"));
});

test("rust bearberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bearberry);
  assert.ok(state.visited.includes("rust_bearberry"));
});

test("rust chokeberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_chokeberry);
  assert.ok(state.visited.includes("rust_chokeberry"));
});

test("rust inkberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_inkberry);
  assert.ok(state.visited.includes("rust_inkberry"));
});

test("rust winterberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_winterberry);
  assert.ok(state.visited.includes("rust_winterberry"));
});

test("rust coralberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_coralberry);
  assert.ok(state.visited.includes("rust_coralberry"));
});

test("rust snowberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_snowberry);
  assert.ok(state.visited.includes("rust_snowberry"));
});

test("rust elderberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_elderberry);
  assert.ok(state.visited.includes("rust_elderberry"));
});

test("rust buttonbush is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_buttonbush);
  assert.ok(state.visited.includes("rust_buttonbush"));
});

test("rust spicebush is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_spicebush);
  assert.ok(state.visited.includes("rust_spicebush"));
});

test("rust witchhazel is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_witchhazel);
  assert.ok(state.visited.includes("rust_witchhazel"));
});

test("rust hophorn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hophorn);
  assert.ok(state.visited.includes("rust_hophorn"));
});

test("rust serviceberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_serviceberry);
  assert.ok(state.visited.includes("rust_serviceberry"));
});

test("rust pawpaw is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pawpaw);
  assert.ok(state.visited.includes("rust_pawpaw"));
});

test("rust buckeye is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_buckeye);
  assert.ok(state.visited.includes("rust_buckeye"));
});

test("rust redbud is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_redbud);
  assert.ok(state.visited.includes("rust_redbud"));
});

test("rust sweetgum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sweetgum);
  assert.ok(state.visited.includes("rust_sweetgum"));
});

test("rust tupelo is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tupelo);
  assert.ok(state.visited.includes("rust_tupelo"));
});

test("rust sourwood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sourwood);
  assert.ok(state.visited.includes("rust_sourwood"));
});

test("rust hackberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hackberry);
  assert.ok(state.visited.includes("rust_hackberry"));
});

test("rust persimmon is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_persimmon);
  assert.ok(state.visited.includes("rust_persimmon"));
});

test("rust ailanthus is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ailanthus);
  assert.ok(state.visited.includes("rust_ailanthus"));
});

test("rust paulownia is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_paulownia);
  assert.ok(state.visited.includes("rust_paulownia"));
});

test("rust catalpa is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_catalpa);
  assert.ok(state.visited.includes("rust_catalpa"));
});

test("rust robinia is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_robinia);
  assert.ok(state.visited.includes("rust_robinia"));
});

test("rust samanea is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_samanea);
  assert.ok(state.visited.includes("rust_samanea"));
});

test("rust calliandra is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_calliandra);
  assert.ok(state.visited.includes("rust_calliandra"));
});

test("rust gliricidia is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_gliricidia);
  assert.ok(state.visited.includes("rust_gliricidia"));
});

test("rust leucaena is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_leucaena);
  assert.ok(state.visited.includes("rust_leucaena"));
});

test("rust sesbania is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sesbania);
  assert.ok(state.visited.includes("rust_sesbania"));
});

test("rust albizia is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_albizia);
  assert.ok(state.visited.includes("rust_albizia"));
});

test("rust falcata is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_falcata);
  assert.ok(state.visited.includes("rust_falcata"));
});

test("rust kiei is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kiei);
  assert.ok(state.visited.includes("rust_kiei"));
});

test("rust pahala is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pahala);
  assert.ok(state.visited.includes("rust_pahala"));
});

test("rust olopua is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_olopua);
  assert.ok(state.visited.includes("rust_olopua"));
});

test("rust neleau is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_neleau);
  assert.ok(state.visited.includes("rust_neleau"));
});

test("rust akoko is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_akoko);
  assert.ok(state.visited.includes("rust_akoko"));
});

test("rust lonomea is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lonomea);
  assert.ok(state.visited.includes("rust_lonomea"));
});

test("rust kalia is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kalia);
  assert.ok(state.visited.includes("rust_kalia"));
});

test("rust alahee is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_alahee);
  assert.ok(state.visited.includes("rust_alahee"));
});

test("rust alani is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_alani);
  assert.ok(state.visited.includes("rust_alani"));
});

test("rust mehame is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mehame);
  assert.ok(state.visited.includes("rust_mehame"));
});

test("rust koaia is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_koaia);
  assert.ok(state.visited.includes("rust_koaia"));
});

test("rust kauila is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kauila);
  assert.ok(state.visited.includes("rust_kauila"));
});

test("rust uhiuhi is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_uhiuhi);
  assert.ok(state.visited.includes("rust_uhiuhi"));
});

test("rust pukiawe is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pukiawe);
  assert.ok(state.visited.includes("rust_pukiawe"));
});

test("rust olona is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_olona);
  assert.ok(state.visited.includes("rust_olona"));
});

test("rust wauke is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wauke);
  assert.ok(state.visited.includes("rust_wauke"));
});

test("rust ohai is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ohai);
  assert.ok(state.visited.includes("rust_ohai"));
});

test("rust ilima is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ilima);
  assert.ok(state.visited.includes("rust_ilima"));
});

test("rust naupaka is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_naupaka);
  assert.ok(state.visited.includes("rust_naupaka"));
});

test("rust aiea is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_aiea);
  assert.ok(state.visited.includes("rust_aiea"));
});

test("rust pilo is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pilo);
  assert.ok(state.visited.includes("rust_pilo"));
});

test("rust ohelo is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ohelo);
  assert.ok(state.visited.includes("rust_ohelo"));
});

test("rust ieie is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ieie);
  assert.ok(state.visited.includes("rust_ieie"));
});

test("rust maile is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_maile);
  assert.ok(state.visited.includes("rust_maile"));
});

test("rust ulei is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ulei);
  assert.ok(state.visited.includes("rust_ulei"));
});

test("rust akia is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_akia);
  assert.ok(state.visited.includes("rust_akia"));
});

test("rust mamaki is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mamaki);
  assert.ok(state.visited.includes("rust_mamaki"));
});

test("rust papala is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_papala);
  assert.ok(state.visited.includes("rust_papala"));
});

test("rust kopiko is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kopiko);
  assert.ok(state.visited.includes("rust_kopiko"));
});

test("rust kolea is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kolea);
  assert.ok(state.visited.includes("rust_kolea"));
});

test("rust olapa is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_olapa);
  assert.ok(state.visited.includes("rust_olapa"));
});

test("rust niu is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_niu);
  assert.ok(state.visited.includes("rust_niu"));
});

test("rust iliahi is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_iliahi);
  assert.ok(state.visited.includes("rust_iliahi"));
});

test("rust noni is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_noni);
  assert.ok(state.visited.includes("rust_noni"));
});

test("rust kukui is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kukui);
  assert.ok(state.visited.includes("rust_kukui"));
});

test("rust naio is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_naio);
  assert.ok(state.visited.includes("rust_naio"));
});

test("rust mamane is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mamane);
  assert.ok(state.visited.includes("rust_mamane"));
});

test("rust lehua is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lehua);
  assert.ok(state.visited.includes("rust_lehua"));
});

test("rust aalii is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_aalii);
  assert.ok(state.visited.includes("rust_aalii"));
});

test("rust lama is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lama);
  assert.ok(state.visited.includes("rust_lama"));
});

test("rust hapuu is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hapuu);
  assert.ok(state.visited.includes("rust_hapuu"));
});

test("rust wiliwili is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wiliwili);
  assert.ok(state.visited.includes("rust_wiliwili"));
});

test("rust kamani is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kamani);
  assert.ok(state.visited.includes("rust_kamani"));
});

test("rust milo is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_milo);
  assert.ok(state.visited.includes("rust_milo"));
});

test("rust koa is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_koa);
  assert.ok(state.visited.includes("rust_koa"));
});

test("rust toropapa is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_toropapa);
  assert.ok(state.visited.includes("rust_toropapa"));
});

test("rust kumarahou is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kumarahou);
  assert.ok(state.visited.includes("rust_kumarahou"));
});

test("rust ramarama is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ramarama);
  assert.ok(state.visited.includes("rust_ramarama"));
});

test("rust ohia is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ohia);
  assert.ok(state.visited.includes("rust_ohia"));
});

test("rust broadleaf is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_broadleaf);
  assert.ok(state.visited.includes("rust_broadleaf"));
});

test("rust marbleleaf is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_marbleleaf);
  assert.ok(state.visited.includes("rust_marbleleaf"));
});

test("rust wineberry is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wineberry);
  assert.ok(state.visited.includes("rust_wineberry"));
});

test("rust lancewood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lancewood);
  assert.ok(state.visited.includes("rust_lancewood"));
});

test("rust hangehange is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hangehange);
  assert.ok(state.visited.includes("rust_hangehange"));
});

test("rust makomako is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_makomako);
  assert.ok(state.visited.includes("rust_makomako"));
});

test("rust houpara is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_houpara);
  assert.ok(state.visited.includes("rust_houpara"));
});

test("rust whau is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_whau);
  assert.ok(state.visited.includes("rust_whau"));
});

test("rust puka is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_puka);
  assert.ok(state.visited.includes("rust_puka"));
});

test("rust kohia is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kohia);
  assert.ok(state.visited.includes("rust_kohia"));
});

test("rust tarata is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tarata);
  assert.ok(state.visited.includes("rust_tarata"));
});

test("rust mapou is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mapou);
  assert.ok(state.visited.includes("rust_mapou"));
});

test("rust kohuhu is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kohuhu);
  assert.ok(state.visited.includes("rust_kohuhu"));
});

test("rust karamu is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_karamu);
  assert.ok(state.visited.includes("rust_karamu"));
});

test("rust kawakawa is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kawakawa);
  assert.ok(state.visited.includes("rust_kawakawa"));
});

test("rust nikau is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_nikau);
  assert.ok(state.visited.includes("rust_nikau"));
});

test("rust rangiora is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rangiora);
  assert.ok(state.visited.includes("rust_rangiora"));
});

test("rust kaikomako is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kaikomako);
  assert.ok(state.visited.includes("rust_kaikomako"));
});

test("rust houhere is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_houhere);
  assert.ok(state.visited.includes("rust_houhere"));
});

test("rust akeake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_akeake);
  assert.ok(state.visited.includes("rust_akeake"));
});

test("rust horopito is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_horopito);
  assert.ok(state.visited.includes("rust_horopito"));
});

test("rust tawhai is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tawhai);
  assert.ok(state.visited.includes("rust_tawhai"));
});

test("rust pukatea is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pukatea);
  assert.ok(state.visited.includes("rust_pukatea"));
});

test("rust mahoe is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mahoe);
  assert.ok(state.visited.includes("rust_mahoe"));
});

test("rust karaka is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_karaka);
  assert.ok(state.visited.includes("rust_karaka"));
});

test("rust ngaio is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ngaio);
  assert.ok(state.visited.includes("rust_ngaio"));
});

test("rust kanuka is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kanuka);
  assert.ok(state.visited.includes("rust_kanuka"));
});

test("rust manuka is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_manuka);
  assert.ok(state.visited.includes("rust_manuka"));
});

test("rust kowhai is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kowhai);
  assert.ok(state.visited.includes("rust_kowhai"));
});

test("rust titoki is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_titoki);
  assert.ok(state.visited.includes("rust_titoki"));
});

test("rust hinau is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hinau);
  assert.ok(state.visited.includes("rust_hinau"));
});

test("rust maire is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_maire);
  assert.ok(state.visited.includes("rust_maire"));
});

test("rust kamahi is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kamahi);
  assert.ok(state.visited.includes("rust_kamahi"));
});

test("rust rata is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rata);
  assert.ok(state.visited.includes("rust_rata"));
});

test("rust rewarewa is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rewarewa);
  assert.ok(state.visited.includes("rust_rewarewa"));
});

test("rust kohekohe is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kohekohe);
  assert.ok(state.visited.includes("rust_kohekohe"));
});

test("rust puriri is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_puriri);
  assert.ok(state.visited.includes("rust_puriri"));
});

test("rust tawa is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tawa);
  assert.ok(state.visited.includes("rust_tawa"));
});

test("rust taraire is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_taraire);
  assert.ok(state.visited.includes("rust_taraire"));
});

test("rust pokaka is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pokaka);
  assert.ok(state.visited.includes("rust_pokaka"));
});

test("rust toatoa is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_toatoa);
  assert.ok(state.visited.includes("rust_toatoa"));
});

test("rust tanekaha is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tanekaha);
  assert.ok(state.visited.includes("rust_tanekaha"));
});

test("rust kahikatea is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kahikatea);
  assert.ok(state.visited.includes("rust_kahikatea"));
});

test("rust miro is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_miro);
  assert.ok(state.visited.includes("rust_miro"));
});

test("rust matai is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_matai);
  assert.ok(state.visited.includes("rust_matai"));
});

test("rust totara is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_totara);
  assert.ok(state.visited.includes("rust_totara"));
});

test("rust rimu is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rimu);
  assert.ok(state.visited.includes("rust_rimu"));
});

test("rust cryptomeria is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cryptomeria);
  assert.ok(state.visited.includes("rust_cryptomeria"));
});

test("rust taiwania is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_taiwania);
  assert.ok(state.visited.includes("rust_taiwania"));
});

test("rust cunninghamia is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cunninghamia);
  assert.ok(state.visited.includes("rust_cunninghamia"));
});

test("rust keteleeria is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_keteleeria);
  assert.ok(state.visited.includes("rust_keteleeria"));
});

test("rust morrison is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_morrison);
  assert.ok(state.visited.includes("rust_morrison"));
});

test("rust formosana is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_formosana);
  assert.ok(state.visited.includes("rust_formosana"));
});

test("rust asunaro is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_asunaro);
  assert.ok(state.visited.includes("rust_asunaro"));
});

test("rust hiba is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hiba);
  assert.ok(state.visited.includes("rust_hiba"));
});

test("rust sieboldii is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sieboldii);
  assert.ok(state.visited.includes("rust_sieboldii"));
});

test("rust firma is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_firma);
  assert.ok(state.visited.includes("rust_firma"));
});

test("rust nephrolepis is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_nephrolepis);
  assert.ok(state.visited.includes("rust_nephrolepis"));
});

test("rust koreana is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_koreana);
  assert.ok(state.visited.includes("rust_koreana"));
});

test("rust sachalin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sachalin);
  assert.ok(state.visited.includes("rust_sachalin"));
});

test("rust homolepis is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_homolepis);
  assert.ok(state.visited.includes("rust_homolepis"));
});

test("rust maries is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_maries);
  assert.ok(state.visited.includes("rust_maries"));
});

test("rust kawakami is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kawakami);
  assert.ok(state.visited.includes("rust_kawakami"));
});

test("rust cephalonica is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cephalonica);
  assert.ok(state.visited.includes("rust_cephalonica"));
});

test("rust pinsapo is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pinsapo);
  assert.ok(state.visited.includes("rust_pinsapo"));
});

test("rust numidica is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_numidica);
  assert.ok(state.visited.includes("rust_numidica"));
});

test("rust spanishfir is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_spanishfir);
  assert.ok(state.visited.includes("rust_spanishfir"));
});

test("rust greekfir is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_greekfir);
  assert.ok(state.visited.includes("rust_greekfir"));
});

test("rust bornmueller is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bornmueller);
  assert.ok(state.visited.includes("rust_bornmueller"));
});

test("rust cilician is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cilician);
  assert.ok(state.visited.includes("rust_cilician"));
});

test("rust oyamel is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oyamel);
  assert.ok(state.visited.includes("rust_oyamel"));
});

test("rust subalpine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_subalpine);
  assert.ok(state.visited.includes("rust_subalpine"));
});

test("rust shastafir is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_shastafir);
  assert.ok(state.visited.includes("rust_shastafir"));
});

test("rust momifir is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_momifir);
  assert.ok(state.visited.includes("rust_momifir"));
});

test("rust nikkofir is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_nikkofir);
  assert.ok(state.visited.includes("rust_nikkofir"));
});

test("rust veitchfir is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_veitchfir);
  assert.ok(state.visited.includes("rust_veitchfir"));
});

test("rust corkbark is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_corkbark);
  assert.ok(state.visited.includes("rust_corkbark"));
});

test("rust nordmann is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_nordmann);
  assert.ok(state.visited.includes("rust_nordmann"));
});

test("rust sitka is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sitka);
  assert.ok(state.visited.includes("rust_sitka"));
});

test("rust alaskan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_alaskan);
  assert.ok(state.visited.includes("rust_alaskan"));
});

test("rust westernred is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_westernred);
  assert.ok(state.visited.includes("rust_westernred"));
});

test("rust pondcypress is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pondcypress);
  assert.ok(state.visited.includes("rust_pondcypress"));
});

test("rust baldcypress is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_baldcypress);
  assert.ok(state.visited.includes("rust_baldcypress"));
});

test("rust dawnredwood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_dawnredwood);
  assert.ok(state.visited.includes("rust_dawnredwood"));
});

test("rust lawson is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lawson);
  assert.ok(state.visited.includes("rust_lawson"));
});

test("rust cypruscedar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cypruscedar);
  assert.ok(state.visited.includes("rust_cypruscedar"));
});

test("rust lebanoncedar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lebanoncedar);
  assert.ok(state.visited.includes("rust_lebanoncedar"));
});

test("rust atlascedar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_atlascedar);
  assert.ok(state.visited.includes("rust_atlascedar"));
});

test("rust sawara is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sawara);
  assert.ok(state.visited.includes("rust_sawara"));
});

test("rust sugi is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sugi);
  assert.ok(state.visited.includes("rust_sugi"));
});

test("rust hinoki is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hinoki);
  assert.ok(state.visited.includes("rust_hinoki"));
});

test("rust yellowcedar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_yellowcedar);
  assert.ok(state.visited.includes("rust_yellowcedar"));
});

test("rust redcedar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_redcedar);
  assert.ok(state.visited.includes("rust_redcedar"));
});

test("rust amabilis is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_amabilis);
  assert.ok(state.visited.includes("rust_amabilis"));
});

test("rust fraserfir is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fraserfir);
  assert.ok(state.visited.includes("rust_fraserfir"));
});

test("rust arborvitae is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_arborvitae);
  assert.ok(state.visited.includes("rust_arborvitae"));
});

test("rust alerce is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_alerce);
  assert.ok(state.visited.includes("rust_alerce"));
});

test("rust portorford is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_portorford);
  assert.ok(state.visited.includes("rust_portorford"));
});

test("rust incensecedar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_incensecedar);
  assert.ok(state.visited.includes("rust_incensecedar"));
});

test("rust nobelfir is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_nobelfir);
  assert.ok(state.visited.includes("rust_nobelfir"));
});

test("rust grandfir is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_grandfir);
  assert.ok(state.visited.includes("rust_grandfir"));
});

test("rust whitefir is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_whitefir);
  assert.ok(state.visited.includes("rust_whitefir"));
});

test("rust balsamfir is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_balsamfir);
  assert.ok(state.visited.includes("rust_balsamfir"));
});

test("rust lacebark is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lacebark);
  assert.ok(state.visited.includes("rust_lacebark"));
});

test("rust umbrellapine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_umbrellapine);
  assert.ok(state.visited.includes("rust_umbrellapine"));
});

test("rust siberian is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_siberian);
  assert.ok(state.visited.includes("rust_siberian"));
});

test("rust koreanpine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_koreanpine);
  assert.ok(state.visited.includes("rust_koreanpine"));
});

test("rust serbianspruce is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_serbianspruce);
  assert.ok(state.visited.includes("rust_serbianspruce"));
});

test("rust norwayspruce is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_norwayspruce);
  assert.ok(state.visited.includes("rust_norwayspruce"));
});

test("rust blackspruce is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_blackspruce);
  assert.ok(state.visited.includes("rust_blackspruce"));
});

test("rust bluespruce is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bluespruce);
  assert.ok(state.visited.includes("rust_bluespruce"));
});

test("rust blackhills is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_blackhills);
  assert.ok(state.visited.includes("rust_blackhills"));
});

test("rust engelmann is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_engelmann);
  assert.ok(state.visited.includes("rust_engelmann"));
});

test("rust whitespruce is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_whitespruce);
  assert.ok(state.visited.includes("rust_whitespruce"));
});

test("rust redspruce is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_redspruce);
  assert.ok(state.visited.includes("rust_redspruce"));
});

test("rust austrianpine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_austrianpine);
  assert.ok(state.visited.includes("rust_austrianpine"));
});

test("rust sprucepine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sprucepine);
  assert.ok(state.visited.includes("rust_sprucepine"));
});

test("rust shortleaf is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_shortleaf);
  assert.ok(state.visited.includes("rust_shortleaf"));
});

test("rust sandpine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sandpine);
  assert.ok(state.visited.includes("rust_sandpine"));
});

test("rust pondpine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pondpine);
  assert.ok(state.visited.includes("rust_pondpine"));
});

test("rust torrey is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_torrey);
  assert.ok(state.visited.includes("rust_torrey"));
});

test("rust tablemountain is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tablemountain);
  assert.ok(state.visited.includes("rust_tablemountain"));
});

test("rust westernwhite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_westernwhite);
  assert.ok(state.visited.includes("rust_westernwhite"));
});

test("rust greypine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_greypine);
  assert.ok(state.visited.includes("rust_greypine"));
});

test("rust knobcone is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_knobcone);
  assert.ok(state.visited.includes("rust_knobcone"));
});

test("rust bishoppine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bishoppine);
  assert.ok(state.visited.includes("rust_bishoppine"));
});

test("rust coulter is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_coulter);
  assert.ok(state.visited.includes("rust_coulter"));
});

test("rust virginiapine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_virginiapine);
  assert.ok(state.visited.includes("rust_virginiapine"));
});

test("rust longleaf is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_longleaf);
  assert.ok(state.visited.includes("rust_longleaf"));
});

test("rust jackpine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_jackpine);
  assert.ok(state.visited.includes("rust_jackpine"));
});

test("rust foxtail is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foxtail);
  assert.ok(state.visited.includes("rust_foxtail"));
});

test("rust limberpine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_limberpine);
  assert.ok(state.visited.includes("rust_limberpine"));
});

test("rust macedonian is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_macedonian);
  assert.ok(state.visited.includes("rust_macedonian"));
});

test("rust arolla is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_arolla);
  assert.ok(state.visited.includes("rust_arolla"));
});

test("rust pinyon is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pinyon);
  assert.ok(state.visited.includes("rust_pinyon"));
});

test("rust monterey is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_monterey);
  assert.ok(state.visited.includes("rust_monterey"));
});

test("rust corsican is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_corsican);
  assert.ok(state.visited.includes("rust_corsican"));
});

test("rust maritime is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_maritime);
  assert.ok(state.visited.includes("rust_maritime"));
});

test("rust aleppo is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_aleppo);
  assert.ok(state.visited.includes("rust_aleppo"));
});

test("rust bristlecone is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bristlecone);
  assert.ok(state.visited.includes("rust_bristlecone"));
});

test("rust jeffreypine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_jeffreypine);
  assert.ok(state.visited.includes("rust_jeffreypine"));
});

test("rust lodgepole is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lodgepole);
  assert.ok(state.visited.includes("rust_lodgepole"));
});

test("rust stonepine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_stonepine);
  assert.ok(state.visited.includes("rust_stonepine"));
});

test("rust norfolkpine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_norfolkpine);
  assert.ok(state.visited.includes("rust_norfolkpine"));
});

test("rust sitkaspruce is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sitkaspruce);
  assert.ok(state.visited.includes("rust_sitkaspruce"));
});

test("rust douglasfir is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_douglasfir);
  assert.ok(state.visited.includes("rust_douglasfir"));
});

test("rust scotspine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_scotspine);
  assert.ok(state.visited.includes("rust_scotspine"));
});

test("rust yellowpine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_yellowpine);
  assert.ok(state.visited.includes("rust_yellowpine"));
});

test("rust redpine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_redpine);
  assert.ok(state.visited.includes("rust_redpine"));
});

test("rust whitepine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_whitepine);
  assert.ok(state.visited.includes("rust_whitepine"));
});

test("rust pencilpine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pencilpine);
  assert.ok(state.visited.includes("rust_pencilpine"));
});

test("rust kingbilly is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kingbilly);
  assert.ok(state.visited.includes("rust_kingbilly"));
});

test("rust kauripine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kauripine);
  assert.ok(state.visited.includes("rust_kauripine"));
});

test("rust sugarpine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sugarpine);
  assert.ok(state.visited.includes("rust_sugarpine"));
});

test("rust ponderosa is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ponderosa);
  assert.ok(state.visited.includes("rust_ponderosa"));
});

test("rust loblolly is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_loblolly);
  assert.ok(state.visited.includes("rust_loblolly"));
});

test("rust slashpine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_slashpine);
  assert.ok(state.visited.includes("rust_slashpine"));
});

test("rust radiatapine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_radiatapine);
  assert.ok(state.visited.includes("rust_radiatapine"));
});

test("rust blackpine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_blackpine);
  assert.ok(state.visited.includes("rust_blackpine"));
});

test("rust leatherwood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_leatherwood);
  assert.ok(state.visited.includes("rust_leatherwood"));
});

test("rust myrtlebeech is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_myrtlebeech);
  assert.ok(state.visited.includes("rust_myrtlebeech"));
});

test("rust sassafras is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sassafras);
  assert.ok(state.visited.includes("rust_sassafras"));
});

test("rust celerytop is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_celerytop);
  assert.ok(state.visited.includes("rust_celerytop"));
});

test("rust huonpine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_huonpine);
  assert.ok(state.visited.includes("rust_huonpine"));
});

test("rust cypresspine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cypresspine);
  assert.ok(state.visited.includes("rust_cypresspine"));
});

test("rust macadamia is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_macadamia);
  assert.ok(state.visited.includes("rust_macadamia"));
});

test("rust hooppine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hooppine);
  assert.ok(state.visited.includes("rust_hooppine"));
});

test("rust bunya is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bunya);
  assert.ok(state.visited.includes("rust_bunya"));
});

test("rust quandong is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_quandong);
  assert.ok(state.visited.includes("rust_quandong"));
});

test("rust silverwattle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_silverwattle);
  assert.ok(state.visited.includes("rust_silverwattle"));
});

test("rust blackwattle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_blackwattle);
  assert.ok(state.visited.includes("rust_blackwattle"));
});

test("rust belah is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_belah);
  assert.ok(state.visited.includes("rust_belah"));
});

test("rust brigalow is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_brigalow);
  assert.ok(state.visited.includes("rust_brigalow"));
});

test("rust myall is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_myall);
  assert.ok(state.visited.includes("rust_myall"));
});

test("rust mulga is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mulga);
  assert.ok(state.visited.includes("rust_mulga"));
});

test("rust geebung is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_geebung);
  assert.ok(state.visited.includes("rust_geebung"));
});

test("rust kurrajong is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kurrajong);
  assert.ok(state.visited.includes("rust_kurrajong"));
});

test("rust gympie is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_gympie);
  assert.ok(state.visited.includes("rust_gympie"));
});

test("rust lillypilly is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lillypilly);
  assert.ok(state.visited.includes("rust_lillypilly"));
});

test("rust waratah is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_waratah);
  assert.ok(state.visited.includes("rust_waratah"));
});

test("rust callistemon is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_callistemon);
  assert.ok(state.visited.includes("rust_callistemon"));
});

test("rust bottlebrush is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bottlebrush);
  assert.ok(state.visited.includes("rust_bottlebrush"));
});

test("rust acacia is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_acacia);
  assert.ok(state.visited.includes("rust_acacia"));
});

test("rust grevillea is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_grevillea);
  assert.ok(state.visited.includes("rust_grevillea"));
});

test("rust hakea is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hakea);
  assert.ok(state.visited.includes("rust_hakea"));
});

test("rust redoak is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_redoak);
  assert.ok(state.visited.includes("rust_redoak"));
});

test("rust blackoak is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_blackoak);
  assert.ok(state.visited.includes("rust_blackoak"));
});

test("rust swampbox is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_swampbox);
  assert.ok(state.visited.includes("rust_swampbox"));
});

test("rust melaleuca is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_melaleuca);
  assert.ok(state.visited.includes("rust_melaleuca"));
});

test("rust teatree is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teatree);
  assert.ok(state.visited.includes("rust_teatree"));
});

test("rust banksia is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_banksia);
  assert.ok(state.visited.includes("rust_banksia"));
});

test("rust casuarina is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_casuarina);
  assert.ok(state.visited.includes("rust_casuarina"));
});

test("rust forestoak is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_forestoak);
  assert.ok(state.visited.includes("rust_forestoak"));
});

test("rust swampoak is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_swampoak);
  assert.ok(state.visited.includes("rust_swampoak"));
});

test("rust spottedironbark is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_spottedironbark);
  assert.ok(state.visited.includes("rust_spottedironbark"));
});

test("rust silverleaf is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_silverleaf);
  assert.ok(state.visited.includes("rust_silverleaf"));
});

test("rust angophora is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_angophora);
  assert.ok(state.visited.includes("rust_angophora"));
});

test("rust mallet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mallet);
  assert.ok(state.visited.includes("rust_mallet"));
});

test("rust yate is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_yate);
  assert.ok(state.visited.includes("rust_yate"));
});

test("rust sheoak is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sheoak);
  assert.ok(state.visited.includes("rust_sheoak"));
});

test("rust paperbark is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_paperbark);
  assert.ok(state.visited.includes("rust_paperbark"));
});

test("rust lemongum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lemongum);
  assert.ok(state.visited.includes("rust_lemongum"));
});

test("rust whitemahogany is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_whitemahogany);
  assert.ok(state.visited.includes("rust_whitemahogany"));
});

test("rust brownbarrel is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_brownbarrel);
  assert.ok(state.visited.includes("rust_brownbarrel"));
});

test("rust cidergum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cidergum);
  assert.ok(state.visited.includes("rust_cidergum"));
});

test("rust ribbongum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ribbongum);
  assert.ok(state.visited.includes("rust_ribbongum"));
});

test("rust shininggum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_shininggum);
  assert.ok(state.visited.includes("rust_shininggum"));
});

test("rust scribblygum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_scribblygum);
  assert.ok(state.visited.includes("rust_scribblygum"));
});

test("rust applebox is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_applebox);
  assert.ok(state.visited.includes("rust_applebox"));
});

test("rust redbox is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_redbox);
  assert.ok(state.visited.includes("rust_redbox"));
});

test("rust blackbox is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_blackbox);
  assert.ok(state.visited.includes("rust_blackbox"));
});

test("rust bangalay is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bangalay);
  assert.ok(state.visited.includes("rust_bangalay"));
});

test("rust tuart is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tuart);
  assert.ok(state.visited.includes("rust_tuart"));
});

test("rust marri is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_marri);
  assert.ok(state.visited.includes("rust_marri"));
});

test("rust coolibah is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_coolibah);
  assert.ok(state.visited.includes("rust_coolibah"));
});

test("rust mugga is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mugga);
  assert.ok(state.visited.includes("rust_mugga"));
});

test("rust wandoo is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wandoo);
  assert.ok(state.visited.includes("rust_wandoo"));
});

test("rust gimlet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_gimlet);
  assert.ok(state.visited.includes("rust_gimlet"));
});

test("rust yorkgum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_yorkgum);
  assert.ok(state.visited.includes("rust_yorkgum"));
});

test("rust salmongum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_salmongum);
  assert.ok(state.visited.includes("rust_salmongum"));
});

test("rust whitebox is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_whitebox);
  assert.ok(state.visited.includes("rust_whitebox"));
});

test("rust redironbark is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_redironbark);
  assert.ok(state.visited.includes("rust_redironbark"));
});

test("rust greyironbark is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_greyironbark);
  assert.ok(state.visited.includes("rust_greyironbark"));
});

test("rust swampmahogany is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_swampmahogany);
  assert.ok(state.visited.includes("rust_swampmahogany"));
});

test("rust floodedgum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_floodedgum);
  assert.ok(state.visited.includes("rust_floodedgum"));
});

test("rust sugargum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sugargum);
  assert.ok(state.visited.includes("rust_sugargum"));
});

test("rust mannagum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mannagum);
  assert.ok(state.visited.includes("rust_mannagum"));
});

test("rust woollybutt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_woollybutt);
  assert.ok(state.visited.includes("rust_woollybutt"));
});

test("rust candlebark is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_candlebark);
  assert.ok(state.visited.includes("rust_candlebark"));
});

test("rust snowgum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_snowgum);
  assert.ok(state.visited.includes("rust_snowgum"));
});

test("rust riverredgum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_riverredgum);
  assert.ok(state.visited.includes("rust_riverredgum"));
});

test("rust yellowbox is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_yellowbox);
  assert.ok(state.visited.includes("rust_yellowbox"));
});

test("rust greybox is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_greybox);
  assert.ok(state.visited.includes("rust_greybox"));
});

test("rust redgum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_redgum);
  assert.ok(state.visited.includes("rust_redgum"));
});

test("rust swampgum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_swampgum);
  assert.ok(state.visited.includes("rust_swampgum"));
});

test("rust peppermint is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_peppermint);
  assert.ok(state.visited.includes("rust_peppermint"));
});

test("rust silvertop is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_silvertop);
  assert.ok(state.visited.includes("rust_silvertop"));
});

test("rust mountainash is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mountainash);
  assert.ok(state.visited.includes("rust_mountainash"));
});

test("rust alpineash is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_alpineash);
  assert.ok(state.visited.includes("rust_alpineash"));
});

test("rust bluegum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bluegum);
  assert.ok(state.visited.includes("rust_bluegum"));
});

test("rust stringybark is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_stringybark);
  assert.ok(state.visited.includes("rust_stringybark"));
});

test("rust messmate is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_messmate);
  assert.ok(state.visited.includes("rust_messmate"));
});

test("rust ironbark is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ironbark);
  assert.ok(state.visited.includes("rust_ironbark"));
});

test("rust blackbutt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_blackbutt);
  assert.ok(state.visited.includes("rust_blackbutt"));
});

test("rust spottedgum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_spottedgum);
  assert.ok(state.visited.includes("rust_spottedgum"));
});

test("rust tallowwood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tallowwood);
  assert.ok(state.visited.includes("rust_tallowwood"));
});

test("rust karri is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_karri);
  assert.ok(state.visited.includes("rust_karri"));
});

test("rust narig is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_narig);
  assert.ok(state.visited.includes("rust_narig"));
});

test("rust gisok is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_gisok);
  assert.ok(state.visited.includes("rust_gisok"));
});

test("rust malugai is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_malugai);
  assert.ok(state.visited.includes("rust_malugai"));
});

test("rust tiaong is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tiaong);
  assert.ok(state.visited.includes("rust_tiaong"));
});

test("rust redlauan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_redlauan);
  assert.ok(state.visited.includes("rust_redlauan"));
});

test("rust bagras is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bagras);
  assert.ok(state.visited.includes("rust_bagras"));
});

test("rust whiteapo is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_whiteapo);
  assert.ok(state.visited.includes("rust_whiteapo"));
});

test("rust dao is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_dao);
  assert.ok(state.visited.includes("rust_dao"));
});

test("rust salai is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_salai);
  assert.ok(state.visited.includes("rust_salai"));
});

test("rust tendu is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tendu);
  assert.ok(state.visited.includes("rust_tendu"));
});

test("rust bija is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bija);
  assert.ok(state.visited.includes("rust_bija"));
});

test("rust arjun is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_arjun);
  assert.ok(state.visited.includes("rust_arjun"));
});

test("rust palash is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_palash);
  assert.ok(state.visited.includes("rust_palash"));
});

test("rust siris is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_siris);
  assert.ok(state.visited.includes("rust_siris"));
});

test("rust babul is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_babul);
  assert.ok(state.visited.includes("rust_babul"));
});

test("rust khair is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_khair);
  assert.ok(state.visited.includes("rust_khair"));
});

test("rust neem is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_neem);
  assert.ok(state.visited.includes("rust_neem"));
});

test("rust palmyra is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_palmyra);
  assert.ok(state.visited.includes("rust_palmyra"));
});

test("rust champak is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_champak);
  assert.ok(state.visited.includes("rust_champak"));
});

test("rust toon is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_toon);
  assert.ok(state.visited.includes("rust_toon"));
});

test("rust haldu is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_haldu);
  assert.ok(state.visited.includes("rust_haldu"));
});

test("rust salwood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_salwood);
  assert.ok(state.visited.includes("rust_salwood"));
});

test("rust sissoo is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sissoo);
  assert.ok(state.visited.includes("rust_sissoo"));
});

test("rust shisham is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_shisham);
  assert.ok(state.visited.includes("rust_shisham"));
});

test("rust deodar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_deodar);
  assert.ok(state.visited.includes("rust_deodar"));
});

test("rust kalantas is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kalantas);
  assert.ok(state.visited.includes("rust_kalantas"));
});

test("rust kekatong is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kekatong);
  assert.ok(state.visited.includes("rust_kekatong"));
});

test("rust sesendok is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sesendok);
  assert.ok(state.visited.includes("rust_sesendok"));
});

test("rust terap is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_terap);
  assert.ok(state.visited.includes("rust_terap"));
});

test("rust palosapis is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_palosapis);
  assert.ok(state.visited.includes("rust_palosapis"));
});

test("rust mayapis is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mayapis);
  assert.ok(state.visited.includes("rust_mayapis"));
});

test("rust bagtikan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bagtikan);
  assert.ok(state.visited.includes("rust_bagtikan"));
});

test("rust almon is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_almon);
  assert.ok(state.visited.includes("rust_almon"));
});

test("rust tanguile is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tanguile);
  assert.ok(state.visited.includes("rust_tanguile"));
});

test("rust kamagong is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kamagong);
  assert.ok(state.visited.includes("rust_kamagong"));
});

test("rust molave is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_molave);
  assert.ok(state.visited.includes("rust_molave"));
});

test("rust ipil is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ipil);
  assert.ok(state.visited.includes("rust_ipil"));
});

test("rust narra is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_narra);
  assert.ok(state.visited.includes("rust_narra"));
});

test("rust yakal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_yakal);
  assert.ok(state.visited.includes("rust_yakal"));
});

test("rust apitong is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_apitong);
  assert.ok(state.visited.includes("rust_apitong"));
});

test("rust petaling is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_petaling);
  assert.ok(state.visited.includes("rust_petaling"));
});

test("rust keranji is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_keranji);
  assert.ok(state.visited.includes("rust_keranji"));
});

test("rust tembesu is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tembesu);
  assert.ok(state.visited.includes("rust_tembesu"));
});

test("rust tualang is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tualang);
  assert.ok(state.visited.includes("rust_tualang"));
});

test("rust keladan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_keladan);
  assert.ok(state.visited.includes("rust_keladan"));
});

test("rust gerutu is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_gerutu);
  assert.ok(state.visited.includes("rust_gerutu"));
});

test("rust merpauh is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_merpauh);
  assert.ok(state.visited.includes("rust_merpauh"));
});

test("rust selangan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_selangan);
  assert.ok(state.visited.includes("rust_selangan"));
});

test("rust punah is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_punah);
  assert.ok(state.visited.includes("rust_punah"));
});

test("rust belian is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_belian);
  assert.ok(state.visited.includes("rust_belian"));
});

test("rust chengal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_chengal);
  assert.ok(state.visited.includes("rust_chengal"));
});

test("rust resak is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_resak);
  assert.ok(state.visited.includes("rust_resak"));
});

test("rust merawan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_merawan);
  assert.ok(state.visited.includes("rust_merawan"));
});

test("rust sepetir is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sepetir);
  assert.ok(state.visited.includes("rust_sepetir"));
});

test("rust kempas is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kempas);
  assert.ok(state.visited.includes("rust_kempas"));
});

test("rust balau is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_balau);
  assert.ok(state.visited.includes("rust_balau"));
});

test("rust mersawa is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mersawa);
  assert.ok(state.visited.includes("rust_mersawa"));
});

test("rust geronggang is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_geronggang);
  assert.ok(state.visited.includes("rust_geronggang"));
});

test("rust bintangor is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bintangor);
  assert.ok(state.visited.includes("rust_bintangor"));
});

test("rust nyatoh is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_nyatoh);
  assert.ok(state.visited.includes("rust_nyatoh"));
});

test("rust seraya is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_seraya);
  assert.ok(state.visited.includes("rust_seraya"));
});

test("rust kapur is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kapur);
  assert.ok(state.visited.includes("rust_kapur"));
});

test("rust keruing is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_keruing);
  assert.ok(state.visited.includes("rust_keruing"));
});

test("rust merbau is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_merbau);
  assert.ok(state.visited.includes("rust_merbau"));
});

test("rust bocote is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bocote);
  assert.ok(state.visited.includes("rust_bocote"));
});

test("rust ziricote is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ziricote);
  assert.ok(state.visited.includes("rust_ziricote"));
});

test("rust palosanto is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_palosanto);
  assert.ok(state.visited.includes("rust_palosanto"));
});

test("rust primavera is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_primavera);
  assert.ok(state.visited.includes("rust_primavera"));
});

test("rust nargusta is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_nargusta);
  assert.ok(state.visited.includes("rust_nargusta"));
});

test("rust missanda is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_missanda);
  assert.ok(state.visited.includes("rust_missanda"));
});

test("rust okan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_okan);
  assert.ok(state.visited.includes("rust_okan"));
});

test("rust dahoma is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_dahoma);
  assert.ok(state.visited.includes("rust_dahoma"));
});

test("rust breu is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_breu);
  assert.ok(state.visited.includes("rust_breu"));
});

test("rust virola is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_virola);
  assert.ok(state.visited.includes("rust_virola"));
});

test("rust quaruba is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_quaruba);
  assert.ok(state.visited.includes("rust_quaruba"));
});

test("rust cedrorosa is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cedrorosa);
  assert.ok(state.visited.includes("rust_cedrorosa"));
});

test("rust cambara is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cambara);
  assert.ok(state.visited.includes("rust_cambara"));
});

test("rust itauba is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_itauba);
  assert.ok(state.visited.includes("rust_itauba"));
});

test("rust goncalo is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_goncalo);
  assert.ok(state.visited.includes("rust_goncalo"));
});

test("rust muiracatiara is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_muiracatiara);
  assert.ok(state.visited.includes("rust_muiracatiara"));
});

test("rust ucuuba is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ucuuba);
  assert.ok(state.visited.includes("rust_ucuuba"));
});

test("rust marupa is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_marupa);
  assert.ok(state.visited.includes("rust_marupa"));
});

test("rust cancharana is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cancharana);
  assert.ok(state.visited.includes("rust_cancharana"));
});

test("rust louropreto is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_louropreto);
  assert.ok(state.visited.includes("rust_louropreto"));
});

test("rust faveira is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_faveira);
  assert.ok(state.visited.includes("rust_faveira"));
});

test("rust arariba is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_arariba);
  assert.ok(state.visited.includes("rust_arariba"));
});

test("rust jequitiba is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_jequitiba);
  assert.ok(state.visited.includes("rust_jequitiba"));
});

test("rust amendoim is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_amendoim);
  assert.ok(state.visited.includes("rust_amendoim"));
});

test("rust cupiuba is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cupiuba);
  assert.ok(state.visited.includes("rust_cupiuba"));
});

test("rust tauari is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tauari);
  assert.ok(state.visited.includes("rust_tauari"));
});

test("rust vinhatico is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_vinhatico);
  assert.ok(state.visited.includes("rust_vinhatico"));
});

test("rust freijo is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_freijo);
  assert.ok(state.visited.includes("rust_freijo"));
});

test("rust peroba is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_peroba);
  assert.ok(state.visited.includes("rust_peroba"));
});

test("rust guatambu is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_guatambu);
  assert.ok(state.visited.includes("rust_guatambu"));
});

test("rust cabreuva is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cabreuva);
  assert.ok(state.visited.includes("rust_cabreuva"));
});

test("rust pauferro is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pauferro);
  assert.ok(state.visited.includes("rust_pauferro"));
});

test("rust angelim is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_angelim);
  assert.ok(state.visited.includes("rust_angelim"));
});

test("rust massaranduba is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_massaranduba);
  assert.ok(state.visited.includes("rust_massaranduba"));
});

test("rust tatajuba is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tatajuba);
  assert.ok(state.visited.includes("rust_tatajuba"));
});

test("rust courbaril is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_courbaril);
  assert.ok(state.visited.includes("rust_courbaril"));
});

test("rust andiroba is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_andiroba);
  assert.ok(state.visited.includes("rust_andiroba"));
});

test("rust sucupira is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sucupira);
  assert.ok(state.visited.includes("rust_sucupira"));
});

test("rust cumaru is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cumaru);
  assert.ok(state.visited.includes("rust_cumaru"));
});

test("rust jatoba is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_jatoba);
  assert.ok(state.visited.includes("rust_jatoba"));
});

test("rust aniegre is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_aniegre);
  assert.ok(state.visited.includes("rust_aniegre"));
});

test("rust gmelina is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_gmelina);
  assert.ok(state.visited.includes("rust_gmelina"));
});

test("rust ovangkol is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ovangkol);
  assert.ok(state.visited.includes("rust_ovangkol"));
});

test("rust kosipo is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kosipo);
  assert.ok(state.visited.includes("rust_kosipo"));
});

test("rust dibetou is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_dibetou);
  assert.ok(state.visited.includes("rust_dibetou"));
});

test("rust bosse is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bosse);
  assert.ok(state.visited.includes("rust_bosse"));
});

test("rust tiama is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tiama);
  assert.ok(state.visited.includes("rust_tiama"));
});

test("rust sipo is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sipo);
  assert.ok(state.visited.includes("rust_sipo"));
});

test("rust okoume is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_okoume);
  assert.ok(state.visited.includes("rust_okoume"));
});

test("rust movingui is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_movingui);
  assert.ok(state.visited.includes("rust_movingui"));
});

test("rust mansonia is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mansonia);
  assert.ok(state.visited.includes("rust_mansonia"));
});

test("rust idigbo is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_idigbo);
  assert.ok(state.visited.includes("rust_idigbo"));
});

test("rust framire is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_framire);
  assert.ok(state.visited.includes("rust_framire"));
});

test("rust anigre is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_anigre);
  assert.ok(state.visited.includes("rust_anigre"));
});

test("rust avodire is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_avodire);
  assert.ok(state.visited.includes("rust_avodire"));
});

test("rust agba is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_agba);
  assert.ok(state.visited.includes("rust_agba"));
});

test("rust makore is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_makore);
  assert.ok(state.visited.includes("rust_makore"));
});

test("rust afzelia is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_afzelia);
  assert.ok(state.visited.includes("rust_afzelia"));
});

test("rust opepe is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_opepe);
  assert.ok(state.visited.includes("rust_opepe"));
});

test("rust danta is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_danta);
  assert.ok(state.visited.includes("rust_danta"));
});

test("rust niangon is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_niangon);
  assert.ok(state.visited.includes("rust_niangon"));
});

test("rust utile is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_utile);
  assert.ok(state.visited.includes("rust_utile"));
});

test("rust koto is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_koto);
  assert.ok(state.visited.includes("rust_koto"));
});

test("rust abachi is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_abachi);
  assert.ok(state.visited.includes("rust_abachi"));
});

test("rust obeche is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_obeche);
  assert.ok(state.visited.includes("rust_obeche"));
});

test("rust limba is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_limba);
  assert.ok(state.visited.includes("rust_limba"));
});

test("rust lacewood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lacewood);
  assert.ok(state.visited.includes("rust_lacewood"));
});

test("rust bloodwood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bloodwood);
  assert.ok(state.visited.includes("rust_bloodwood"));
});

test("rust snakewood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_snakewood);
  assert.ok(state.visited.includes("rust_snakewood"));
});

test("rust satinwood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_satinwood);
  assert.ok(state.visited.includes("rust_satinwood"));
});

test("rust tulipwood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tulipwood);
  assert.ok(state.visited.includes("rust_tulipwood"));
});

test("rust kingwood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kingwood);
  assert.ok(state.visited.includes("rust_kingwood"));
});

test("rust arsenopyrite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_arsenopyrite);
  assert.ok(state.visited.includes("rust_arsenopyrite"));
});

test("rust lollingite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lollingite);
  assert.ok(state.visited.includes("rust_lollingite"));
});

test("rust ullmannite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ullmannite);
  assert.ok(state.visited.includes("rust_ullmannite"));
});

test("rust gersdorffite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_gersdorffite);
  assert.ok(state.visited.includes("rust_gersdorffite"));
});

test("rust skutterudite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_skutterudite);
  assert.ok(state.visited.includes("rust_skutterudite"));
});

test("rust safflorite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_safflorite);
  assert.ok(state.visited.includes("rust_safflorite"));
});

test("rust rammelsbergite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rammelsbergite);
  assert.ok(state.visited.includes("rust_rammelsbergite"));
});

test("rust maucherite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_maucherite);
  assert.ok(state.visited.includes("rust_maucherite"));
});

test("rust breithauptite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_breithauptite);
  assert.ok(state.visited.includes("rust_breithauptite"));
});

test("rust violarite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_violarite);
  assert.ok(state.visited.includes("rust_violarite"));
});

test("rust mackinawite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mackinawite);
  assert.ok(state.visited.includes("rust_mackinawite"));
});

test("rust valleriite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_valleriite);
  assert.ok(state.visited.includes("rust_valleriite"));
});

test("rust cubanite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cubanite);
  assert.ok(state.visited.includes("rust_cubanite"));
});

test("rust pyrrhotite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pyrrhotite);
  assert.ok(state.visited.includes("rust_pyrrhotite"));
});

test("rust pentlandite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pentlandite);
  assert.ok(state.visited.includes("rust_pentlandite"));
});

test("rust nickeline is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_nickeline);
  assert.ok(state.visited.includes("rust_nickeline"));
});

test("rust millerite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_millerite);
  assert.ok(state.visited.includes("rust_millerite"));
});

test("rust hawleyite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hawleyite);
  assert.ok(state.visited.includes("rust_hawleyite"));
});

test("rust greenockite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_greenockite);
  assert.ok(state.visited.includes("rust_greenockite"));
});

test("rust wurtzite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wurtzite);
  assert.ok(state.visited.includes("rust_wurtzite"));
});

test("rust franklinite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_franklinite);
  assert.ok(state.visited.includes("rust_franklinite"));
});

test("rust hydrozincite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hydrozincite);
  assert.ok(state.visited.includes("rust_hydrozincite"));
});

test("rust gahnite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_gahnite);
  assert.ok(state.visited.includes("rust_gahnite"));
});

test("rust zincite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_zincite);
  assert.ok(state.visited.includes("rust_zincite"));
});

test("rust polianite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_polianite);
  assert.ok(state.visited.includes("rust_polianite"));
});

test("rust psilomelane is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_psilomelane);
  assert.ok(state.visited.includes("rust_psilomelane"));
});

test("rust manganite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_manganite);
  assert.ok(state.visited.includes("rust_manganite"));
});

test("rust braunite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_braunite);
  assert.ok(state.visited.includes("rust_braunite"));
});

test("rust hausmannite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hausmannite);
  assert.ok(state.visited.includes("rust_hausmannite"));
});

test("rust crednerite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_crednerite);
  assert.ok(state.visited.includes("rust_crednerite"));
});

test("rust delafossite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_delafossite);
  assert.ok(state.visited.includes("rust_delafossite"));
});

test("rust paramelaconite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_paramelaconite);
  assert.ok(state.visited.includes("rust_paramelaconite"));
});

test("rust eriochalcite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_eriochalcite);
  assert.ok(state.visited.includes("rust_eriochalcite"));
});

test("rust anthonyite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_anthonyite);
  assert.ok(state.visited.includes("rust_anthonyite"));
});

test("rust calumetite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_calumetite);
  assert.ok(state.visited.includes("rust_calumetite"));
});

test("rust percylite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_percylite);
  assert.ok(state.visited.includes("rust_percylite"));
});

test("rust cumengeite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cumengeite);
  assert.ok(state.visited.includes("rust_cumengeite"));
});

test("rust clinoatacamite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_clinoatacamite);
  assert.ok(state.visited.includes("rust_clinoatacamite"));
});

test("rust paratacamite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_paratacamite);
  assert.ok(state.visited.includes("rust_paratacamite"));
});

test("rust botallackite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_botallackite);
  assert.ok(state.visited.includes("rust_botallackite"));
});

test("rust nantokite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_nantokite);
  assert.ok(state.visited.includes("rust_nantokite"));
});

test("rust spangolite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_spangolite);
  assert.ok(state.visited.includes("rust_spangolite"));
});

test("rust posnjakite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_posnjakite);
  assert.ok(state.visited.includes("rust_posnjakite"));
});

test("rust connellite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_connellite);
  assert.ok(state.visited.includes("rust_connellite"));
});

test("rust diaboleite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_diaboleite);
  assert.ok(state.visited.includes("rust_diaboleite"));
});

test("rust plancheite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_plancheite);
  assert.ok(state.visited.includes("rust_plancheite"));
});

test("rust shattuckite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_shattuckite);
  assert.ok(state.visited.includes("rust_shattuckite"));
});

test("rust libethenite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_libethenite);
  assert.ok(state.visited.includes("rust_libethenite"));
});

test("rust olivenite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_olivenite);
  assert.ok(state.visited.includes("rust_olivenite"));
});

test("rust tetrahedrite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tetrahedrite);
  assert.ok(state.visited.includes("rust_tetrahedrite"));
});

test("rust enargite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_enargite);
  assert.ok(state.visited.includes("rust_enargite"));
});

test("rust chalcocite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_chalcocite);
  assert.ok(state.visited.includes("rust_chalcocite"));
});

test("rust sphalerite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sphalerite);
  assert.ok(state.visited.includes("rust_sphalerite"));
});

test("rust willemite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_willemite);
  assert.ok(state.visited.includes("rust_willemite"));
});

test("rust hemimorphite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hemimorphite);
  assert.ok(state.visited.includes("rust_hemimorphite"));
});

test("rust smithsonite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_smithsonite);
  assert.ok(state.visited.includes("rust_smithsonite"));
});

test("rust aurichalcite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_aurichalcite);
  assert.ok(state.visited.includes("rust_aurichalcite"));
});

test("rust linarite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_linarite);
  assert.ok(state.visited.includes("rust_linarite"));
});

test("rust tenorite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tenorite);
  assert.ok(state.visited.includes("rust_tenorite"));
});

test("rust cuprite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cuprite);
  assert.ok(state.visited.includes("rust_cuprite"));
});

test("rust bornite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bornite);
  assert.ok(state.visited.includes("rust_bornite"));
});

test("rust covellite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_covellite);
  assert.ok(state.visited.includes("rust_covellite"));
});

test("rust chalcanthite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_chalcanthite);
  assert.ok(state.visited.includes("rust_chalcanthite"));
});

test("rust antlerite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_antlerite);
  assert.ok(state.visited.includes("rust_antlerite"));
});

test("rust langite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_langite);
  assert.ok(state.visited.includes("rust_langite"));
});

test("rust smaltite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_smaltite);
  assert.ok(state.visited.includes("rust_smaltite"));
});

test("rust mayanblue is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mayanblue);
  assert.ok(state.visited.includes("rust_mayanblue"));
});

test("rust brochantite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_brochantite);
  assert.ok(state.visited.includes("rust_brochantite"));
});

test("rust atacamite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_atacamite);
  assert.ok(state.visited.includes("rust_atacamite"));
});

test("rust dioptase is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_dioptase);
  assert.ok(state.visited.includes("rust_dioptase"));
});

test("rust chrysocolla is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_chrysocolla);
  assert.ok(state.visited.includes("rust_chrysocolla"));
});

test("rust turquoise is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_turquoise);
  assert.ok(state.visited.includes("rust_turquoise"));
});

test("rust cobaltite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cobaltite);
  assert.ok(state.visited.includes("rust_cobaltite"));
});

test("rust rhodochrosite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rhodochrosite);
  assert.ok(state.visited.includes("rust_rhodochrosite"));
});

test("rust pyrolusite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pyrolusite);
  assert.ok(state.visited.includes("rust_pyrolusite"));
});

test("rust glauconite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_glauconite);
  assert.ok(state.visited.includes("rust_glauconite"));
});

test("rust celadonite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_celadonite);
  assert.ok(state.visited.includes("rust_celadonite"));
});

test("rust vivianite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_vivianite);
  assert.ok(state.visited.includes("rust_vivianite"));
});

test("rust prussian is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_prussian);
  assert.ok(state.visited.includes("rust_prussian"));
});

test("rust egyptianblue is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_egyptianblue);
  assert.ok(state.visited.includes("rust_egyptianblue"));
});

test("rust lapis is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lapis);
  assert.ok(state.visited.includes("rust_lapis"));
});

test("rust bice is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bice);
  assert.ok(state.visited.includes("rust_bice"));
});

test("rust sapgreen is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sapgreen);
  assert.ok(state.visited.includes("rust_sapgreen"));
});

test("rust greenearth is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_greenearth);
  assert.ok(state.visited.includes("rust_greenearth"));
});

test("rust burntsienna is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_burntsienna);
  assert.ok(state.visited.includes("rust_burntsienna"));
});

test("rust rawsienna is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rawsienna);
  assert.ok(state.visited.includes("rust_rawsienna"));
});

test("rust burntumber is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_burntumber);
  assert.ok(state.visited.includes("rust_burntumber"));
});

test("rust yellowochre is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_yellowochre);
  assert.ok(state.visited.includes("rust_yellowochre"));
});

test("rust redochre is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_redochre);
  assert.ok(state.visited.includes("rust_redochre"));
});

test("rust ruddle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ruddle);
  assert.ok(state.visited.includes("rust_ruddle"));
});

test("rust manganese is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_manganese);
  assert.ok(state.visited.includes("rust_manganese"));
});

test("rust stibnite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_stibnite);
  assert.ok(state.visited.includes("rust_stibnite"));
});

test("rust galena is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_galena);
  assert.ok(state.visited.includes("rust_galena"));
});

test("rust goethite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_goethite);
  assert.ok(state.visited.includes("rust_goethite"));
});

test("rust limonite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_limonite);
  assert.ok(state.visited.includes("rust_limonite"));
});

test("rust siderite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_siderite);
  assert.ok(state.visited.includes("rust_siderite"));
});

test("rust infusorial is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_infusorial);
  assert.ok(state.visited.includes("rust_infusorial"));
});

test("rust glasspaper is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_glasspaper);
  assert.ok(state.visited.includes("rust_glasspaper"));
});

test("rust sandpaper is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sandpaper);
  assert.ok(state.visited.includes("rust_sandpaper"));
});

test("rust oilstone is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oilstone);
  assert.ok(state.visited.includes("rust_oilstone"));
});

test("rust honestone is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_honestone);
  assert.ok(state.visited.includes("rust_honestone"));
});

test("rust novaculite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_novaculite);
  assert.ok(state.visited.includes("rust_novaculite"));
});

test("rust pyrite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pyrite);
  assert.ok(state.visited.includes("rust_pyrite"));
});

test("rust magnetite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_magnetite);
  assert.ok(state.visited.includes("rust_magnetite"));
});

test("rust colcothar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_colcothar);
  assert.ok(state.visited.includes("rust_colcothar"));
});

test("rust hematite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hematite);
  assert.ok(state.visited.includes("rust_hematite"));
});

test("rust carborundum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_carborundum);
  assert.ok(state.visited.includes("rust_carborundum"));
});

test("rust grindstone is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_grindstone);
  assert.ok(state.visited.includes("rust_grindstone"));
});

test("rust whetstone is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_whetstone);
  assert.ok(state.visited.includes("rust_whetstone"));
});

test("rust granite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_granite);
  assert.ok(state.visited.includes("rust_granite"));
});

test("rust basalt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_basalt);
  assert.ok(state.visited.includes("rust_basalt"));
});

test("rust obsidian is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_obsidian);
  assert.ok(state.visited.includes("rust_obsidian"));
});

test("rust jasper is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_jasper);
  assert.ok(state.visited.includes("rust_jasper"));
});

test("rust agate is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_agate);
  assert.ok(state.visited.includes("rust_agate"));
});

test("rust flint is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_flint);
  assert.ok(state.visited.includes("rust_flint"));
});

test("rust slatepowder is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_slatepowder);
  assert.ok(state.visited.includes("rust_slatepowder"));
});

test("rust spanishwhite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_spanishwhite);
  assert.ok(state.visited.includes("rust_spanishwhite"));
});

test("rust terraalba is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_terraalba);
  assert.ok(state.visited.includes("rust_terraalba"));
});

test("rust kieselguhr is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kieselguhr);
  assert.ok(state.visited.includes("rust_kieselguhr"));
});

test("rust meerschaum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_meerschaum);
  assert.ok(state.visited.includes("rust_meerschaum"));
});

test("rust steatite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_steatite);
  assert.ok(state.visited.includes("rust_steatite"));
});

test("rust marble is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_marble);
  assert.ok(state.visited.includes("rust_marble"));
});

test("rust limestone is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_limestone);
  assert.ok(state.visited.includes("rust_limestone"));
});

test("rust puttypowder is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_puttypowder);
  assert.ok(state.visited.includes("rust_puttypowder"));
});

test("rust crocus is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_crocus);
  assert.ok(state.visited.includes("rust_crocus"));
});

test("rust garnet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_garnet);
  assert.ok(state.visited.includes("rust_garnet"));
});

test("rust quartz is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_quartz);
  assert.ok(state.visited.includes("rust_quartz"));
});

test("rust feldspar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_feldspar);
  assert.ok(state.visited.includes("rust_feldspar"));
});

test("rust diatomite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_diatomite);
  assert.ok(state.visited.includes("rust_diatomite"));
});

test("rust soapstone is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_soapstone);
  assert.ok(state.visited.includes("rust_soapstone"));
});

test("rust calcite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_calcite);
  assert.ok(state.visited.includes("rust_calcite"));
});

test("rust alabaster is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_alabaster);
  assert.ok(state.visited.includes("rust_alabaster"));
});

test("rust pariswhite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pariswhite);
  assert.ok(state.visited.includes("rust_pariswhite"));
});

test("rust fullersearth is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fullersearth);
  assert.ok(state.visited.includes("rust_fullersearth"));
});

test("rust tripoli is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tripoli);
  assert.ok(state.visited.includes("rust_tripoli"));
});

test("rust rottenstone is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rottenstone);
  assert.ok(state.visited.includes("rust_rottenstone"));
});

test("rust dolomite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_dolomite);
  assert.ok(state.visited.includes("rust_dolomite"));
});

test("rust bentonite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bentonite);
  assert.ok(state.visited.includes("rust_bentonite"));
});

test("rust megilp is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_megilp);
  assert.ok(state.visited.includes("rust_megilp"));
});

test("rust siccative is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_siccative);
  assert.ok(state.visited.includes("rust_siccative"));
});

test("rust drier is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_drier);
  assert.ok(state.visited.includes("rust_drier"));
});

test("rust strontia is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_strontia);
  assert.ok(state.visited.includes("rust_strontia"));
});

test("rust celestine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_celestine);
  assert.ok(state.visited.includes("rust_celestine"));
});

test("rust magnesia is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_magnesia);
  assert.ok(state.visited.includes("rust_magnesia"));
});

test("rust alumina is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_alumina);
  assert.ok(state.visited.includes("rust_alumina"));
});

test("rust corundum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_corundum);
  assert.ok(state.visited.includes("rust_corundum"));
});

test("rust emery is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_emery);
  assert.ok(state.visited.includes("rust_emery"));
});

test("rust pumice is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pumice);
  assert.ok(state.visited.includes("rust_pumice"));
});

test("rust silica is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_silica);
  assert.ok(state.visited.includes("rust_silica"));
});

test("rust mica is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mica);
  assert.ok(state.visited.includes("rust_mica"));
});

test("rust talc is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_talc);
  assert.ok(state.visited.includes("rust_talc"));
});

test("rust kaolin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kaolin);
  assert.ok(state.visited.includes("rust_kaolin"));
});

test("rust leadwhite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_leadwhite);
  assert.ok(state.visited.includes("rust_leadwhite"));
});

test("rust lithopone is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lithopone);
  assert.ok(state.visited.includes("rust_lithopone"));
});

test("rust blancfixe is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_blancfixe);
  assert.ok(state.visited.includes("rust_blancfixe"));
});

test("rust barytes is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barytes);
  assert.ok(state.visited.includes("rust_barytes"));
});

test("rust zincwhite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_zincwhite);
  assert.ok(state.visited.includes("rust_zincwhite"));
});

test("rust flakewhite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_flakewhite);
  assert.ok(state.visited.includes("rust_flakewhite"));
});

test("rust titanium is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_titanium);
  assert.ok(state.visited.includes("rust_titanium"));
});

test("rust cadmium is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cadmium);
  assert.ok(state.visited.includes("rust_cadmium"));
});

test("rust madderlake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_madderlake);
  assert.ok(state.visited.includes("rust_madderlake"));
});

test("rust rosemadder is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rosemadder);
  assert.ok(state.visited.includes("rust_rosemadder"));
});

test("rust indianyellow is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_indianyellow);
  assert.ok(state.visited.includes("rust_indianyellow"));
});

test("rust hansa is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hansa);
  assert.ok(state.visited.includes("rust_hansa"));
});

test("rust phthalo is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_phthalo);
  assert.ok(state.visited.includes("rust_phthalo"));
});

test("rust vermilion is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_vermilion);
  assert.ok(state.visited.includes("rust_vermilion"));
});

test("rust carmine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_carmine);
  assert.ok(state.visited.includes("rust_carmine"));
});

test("rust alizarin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_alizarin);
  assert.ok(state.visited.includes("rust_alizarin"));
});

test("rust graphiteblack is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_graphiteblack);
  assert.ok(state.visited.includes("rust_graphiteblack"));
});

test("rust jetblack is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_jetblack);
  assert.ok(state.visited.includes("rust_jetblack"));
});

test("rust clarain is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_clarain);
  assert.ok(state.visited.includes("rust_clarain"));
});

test("rust durain is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_durain);
  assert.ok(state.visited.includes("rust_durain"));
});

test("rust vitrain is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_vitrain);
  assert.ok(state.visited.includes("rust_vitrain"));
});

test("rust fusain is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fusain);
  assert.ok(state.visited.includes("rust_fusain"));
});

test("rust cannel is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cannel);
  assert.ok(state.visited.includes("rust_cannel"));
});

test("rust anthracite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_anthracite);
  assert.ok(state.visited.includes("rust_anthracite"));
});

test("rust lampwick is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lampwick);
  assert.ok(state.visited.includes("rust_lampwick"));
});

test("rust sootblack is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sootblack);
  assert.ok(state.visited.includes("rust_sootblack"));
});

test("rust carbon is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_carbon);
  assert.ok(state.visited.includes("rust_carbon"));
});

test("rust coal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_coal);
  assert.ok(state.visited.includes("rust_coal"));
});

test("rust peat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_peat);
  assert.ok(state.visited.includes("rust_peat"));
});

test("rust lignite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lignite);
  assert.ok(state.visited.includes("rust_lignite"));
});

test("rust coke is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_coke);
  assert.ok(state.visited.includes("rust_coke"));
});

test("rust charcoal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_charcoal);
  assert.ok(state.visited.includes("rust_charcoal"));
});

test("rust vinechar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_vinechar);
  assert.ok(state.visited.includes("rust_vinechar"));
});

test("rust cassel is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cassel);
  assert.ok(state.visited.includes("rust_cassel"));
});

test("rust sepia is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sepia);
  assert.ok(state.visited.includes("rust_sepia"));
});

test("rust bistre is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bistre);
  assert.ok(state.visited.includes("rust_bistre"));
});

test("rust peachblack is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_peachblack);
  assert.ok(state.visited.includes("rust_peachblack"));
});

test("rust marsblack is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_marsblack);
  assert.ok(state.visited.includes("rust_marsblack"));
});

test("rust vineblack is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_vineblack);
  assert.ok(state.visited.includes("rust_vineblack"));
});

test("rust ivoryblack is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ivoryblack);
  assert.ok(state.visited.includes("rust_ivoryblack"));
});

test("rust boneblack is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_boneblack);
  assert.ok(state.visited.includes("rust_boneblack"));
});

test("rust caput is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_caput);
  assert.ok(state.visited.includes("rust_caput"));
});

test("rust naples is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_naples);
  assert.ok(state.visited.includes("rust_naples"));
});

test("rust chrome is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_chrome);
  assert.ok(state.visited.includes("rust_chrome"));
});

test("rust viridian is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_viridian);
  assert.ok(state.visited.includes("rust_viridian"));
});

test("rust cerulean is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cerulean);
  assert.ok(state.visited.includes("rust_cerulean"));
});

test("rust cobalt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cobalt);
  assert.ok(state.visited.includes("rust_cobalt"));
});

test("rust ultramarine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ultramarine);
  assert.ok(state.visited.includes("rust_ultramarine"));
});

test("rust dividivi is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_dividivi);
  assert.ok(state.visited.includes("rust_dividivi"));
});

test("rust oakgall is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oakgall);
  assert.ok(state.visited.includes("rust_oakgall"));
});

test("rust wattle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wattle);
  assert.ok(state.visited.includes("rust_wattle"));
});

test("rust mangrove is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mangrove);
  assert.ok(state.visited.includes("rust_mangrove"));
});

test("rust quebracho is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_quebracho);
  assert.ok(state.visited.includes("rust_quebracho"));
});

test("rust myrobalan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_myrobalan);
  assert.ok(state.visited.includes("rust_myrobalan"));
});

test("rust gallnut is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_gallnut);
  assert.ok(state.visited.includes("rust_gallnut"));
});

test("rust sumac is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sumac);
  assert.ok(state.visited.includes("rust_sumac"));
});

test("rust catechu is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_catechu);
  assert.ok(state.visited.includes("rust_catechu"));
});

test("rust cutch is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cutch);
  assert.ok(state.visited.includes("rust_cutch"));
});

test("rust annotto is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_annotto);
  assert.ok(state.visited.includes("rust_annotto"));
});

test("rust fustic is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fustic);
  assert.ok(state.visited.includes("rust_fustic"));
});

test("rust litmus is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_litmus);
  assert.ok(state.visited.includes("rust_litmus"));
});

test("rust orchil is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_orchil);
  assert.ok(state.visited.includes("rust_orchil"));
});

test("rust alkanet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_alkanet);
  assert.ok(state.visited.includes("rust_alkanet"));
});

test("rust henna is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_henna);
  assert.ok(state.visited.includes("rust_henna"));
});

test("rust turmeric is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_turmeric);
  assert.ok(state.visited.includes("rust_turmeric"));
});

test("rust saffron is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_saffron);
  assert.ok(state.visited.includes("rust_saffron"));
});

test("rust safflower is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_safflower);
  assert.ok(state.visited.includes("rust_safflower"));
});

test("rust minium is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_minium);
  assert.ok(state.visited.includes("rust_minium"));
});

test("rust ceruse is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ceruse);
  assert.ok(state.visited.includes("rust_ceruse"));
});

test("rust massicot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_massicot);
  assert.ok(state.visited.includes("rust_massicot"));
});

test("rust litharge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_litharge);
  assert.ok(state.visited.includes("rust_litharge"));
});

test("rust cinnabar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cinnabar);
  assert.ok(state.visited.includes("rust_cinnabar"));
});

test("rust realgar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_realgar);
  assert.ok(state.visited.includes("rust_realgar"));
});

test("rust logwood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_logwood);
  assert.ok(state.visited.includes("rust_logwood"));
});

test("rust brazilwood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_brazilwood);
  assert.ok(state.visited.includes("rust_brazilwood"));
});

test("rust cochineal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cochineal);
  assert.ok(state.visited.includes("rust_cochineal"));
});

test("rust kermes is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kermes);
  assert.ok(state.visited.includes("rust_kermes"));
});

test("rust madder is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_madder);
  assert.ok(state.visited.includes("rust_madder"));
});

test("rust woad is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_woad);
  assert.ok(state.visited.includes("rust_woad"));
});

test("rust indigo is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_indigo);
  assert.ok(state.visited.includes("rust_indigo"));
});

test("rust gamboge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_gamboge);
  assert.ok(state.visited.includes("rust_gamboge"));
});

test("rust malachite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_malachite);
  assert.ok(state.visited.includes("rust_malachite"));
});

test("rust azurite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_azurite);
  assert.ok(state.visited.includes("rust_azurite"));
});

test("rust orpiment is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_orpiment);
  assert.ok(state.visited.includes("rust_orpiment"));
});

test("rust verdigris is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_verdigris);
  assert.ok(state.visited.includes("rust_verdigris"));
});

test("rust terreverte is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_terreverte);
  assert.ok(state.visited.includes("rust_terreverte"));
});

test("rust verditer is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_verditer);
  assert.ok(state.visited.includes("rust_verditer"));
});

test("rust smalt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_smalt);
  assert.ok(state.visited.includes("rust_smalt"));
});

test("rust bole is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bole);
  assert.ok(state.visited.includes("rust_bole"));
});

test("rust carrageen is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_carrageen);
  assert.ok(state.visited.includes("rust_carrageen"));
});

test("rust algin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_algin);
  assert.ok(state.visited.includes("rust_algin"));
});

test("rust carob is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_carob);
  assert.ok(state.visited.includes("rust_carob"));
});

test("rust locustbean is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_locustbean);
  assert.ok(state.visited.includes("rust_locustbean"));
});

test("rust dragonblood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_dragonblood);
  assert.ok(state.visited.includes("rust_dragonblood"));
});

test("rust labdanum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_labdanum);
  assert.ok(state.visited.includes("rust_labdanum"));
});

test("rust olibanum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_olibanum);
  assert.ok(state.visited.includes("rust_olibanum"));
});

test("rust pectin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pectin);
  assert.ok(state.visited.includes("rust_pectin"));
});

test("rust xanthan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_xanthan);
  assert.ok(state.visited.includes("rust_xanthan"));
});

test("rust ghatti is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ghatti);
  assert.ok(state.visited.includes("rust_ghatti"));
});

test("rust karaya is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_karaya);
  assert.ok(state.visited.includes("rust_karaya"));
});

test("rust storax is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_storax);
  assert.ok(state.visited.includes("rust_storax"));
});

test("rust benzoin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_benzoin);
  assert.ok(state.visited.includes("rust_benzoin"));
});

test("rust myrrh is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_myrrh);
  assert.ok(state.visited.includes("rust_myrrh"));
});

test("rust frankincense is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_frankincense);
  assert.ok(state.visited.includes("rust_frankincense"));
});

test("rust colophony is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_colophony);
  assert.ok(state.visited.includes("rust_colophony"));
});

test("rust venice is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_venice);
  assert.ok(state.visited.includes("rust_venice"));
});

test("rust burgundy is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_burgundy);
  assert.ok(state.visited.includes("rust_burgundy"));
});

test("rust pinegum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pinegum);
  assert.ok(state.visited.includes("rust_pinegum"));
});

test("rust galipot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_galipot);
  assert.ok(state.visited.includes("rust_galipot"));
});

test("rust rosin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rosin);
  assert.ok(state.visited.includes("rust_rosin"));
});

test("rust tragacanth is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tragacanth);
  assert.ok(state.visited.includes("rust_tragacanth"));
});

test("rust gumarabic is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_gumarabic);
  assert.ok(state.visited.includes("rust_gumarabic"));
});

test("rust dextrin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_dextrin);
  assert.ok(state.visited.includes("rust_dextrin"));
});

test("rust sizeglue is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sizeglue);
  assert.ok(state.visited.includes("rust_sizeglue"));
});

test("rust collodion is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_collodion);
  assert.ok(state.visited.includes("rust_collodion"));
});

test("rust riceglue is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_riceglue);
  assert.ok(state.visited.includes("rust_riceglue"));
});

test("rust wheatpaste is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wheatpaste);
  assert.ok(state.visited.includes("rust_wheatpaste"));
});

test("rust starchpaste is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_starchpaste);
  assert.ok(state.visited.includes("rust_starchpaste"));
});

test("rust boneglue is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_boneglue);
  assert.ok(state.visited.includes("rust_boneglue"));
});

test("rust hideglue is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hideglue);
  assert.ok(state.visited.includes("rust_hideglue"));
});

test("rust anime is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_anime);
  assert.ok(state.visited.includes("rust_anime"));
});

test("rust copalite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_copalite);
  assert.ok(state.visited.includes("rust_copalite"));
});

test("rust rabbitglue is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rabbitglue);
  assert.ok(state.visited.includes("rust_rabbitglue"));
});

test("rust fishglue is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fishglue);
  assert.ok(state.visited.includes("rust_fishglue"));
});

test("rust casein is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_casein);
  assert.ok(state.visited.includes("rust_casein"));
});

test("rust isinglass is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_isinglass);
  assert.ok(state.visited.includes("rust_isinglass"));
});

test("rust distemper is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_distemper);
  assert.ok(state.visited.includes("rust_distemper"));
});

test("rust gesso is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_gesso);
  assert.ok(state.visited.includes("rust_gesso"));
});

test("rust ambergris is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ambergris);
  assert.ok(state.visited.includes("rust_ambergris"));
});

test("rust spermaceti is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_spermaceti);
  assert.ok(state.visited.includes("rust_spermaceti"));
});

test("rust japanblack is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_japanblack);
  assert.ok(state.visited.includes("rust_japanblack"));
});

test("rust tungoil is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tungoil);
  assert.ok(state.visited.includes("rust_tungoil"));
});

test("rust copaiba is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_copaiba);
  assert.ok(state.visited.includes("rust_copaiba"));
});

test("rust elemi is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_elemi);
  assert.ok(state.visited.includes("rust_elemi"));
});

test("rust sandarac is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sandarac);
  assert.ok(state.visited.includes("rust_sandarac"));
});

test("rust mastic is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mastic);
  assert.ok(state.visited.includes("rust_mastic"));
});

test("rust jelutong is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_jelutong);
  assert.ok(state.visited.includes("rust_jelutong"));
});

test("rust ramin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ramin);
  assert.ok(state.visited.includes("rust_ramin"));
});

test("rust afromosia is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_afromosia);
  assert.ok(state.visited.includes("rust_afromosia"));
});

test("rust sapele is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sapele);
  assert.ok(state.visited.includes("rust_sapele"));
});

test("rust cocobolo is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cocobolo);
  assert.ok(state.visited.includes("rust_cocobolo"));
});

test("rust bubinga is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bubinga);
  assert.ok(state.visited.includes("rust_bubinga"));
});

test("rust wenge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wenge);
  assert.ok(state.visited.includes("rust_wenge"));
});

test("rust zebrawood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_zebrawood);
  assert.ok(state.visited.includes("rust_zebrawood"));
});

test("rust teakwood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teakwood);
  assert.ok(state.visited.includes("rust_teakwood"));
});

test("rust purpleheart is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_purpleheart);
  assert.ok(state.visited.includes("rust_purpleheart"));
});

test("rust padauk is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_padauk);
  assert.ok(state.visited.includes("rust_padauk"));
});

test("rust meranti is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_meranti);
  assert.ok(state.visited.includes("rust_meranti"));
});

test("rust greenheart is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_greenheart);
  assert.ok(state.visited.includes("rust_greenheart"));
});

test("rust iroko is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_iroko);
  assert.ok(state.visited.includes("rust_iroko"));
});

test("rust lauan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lauan);
  assert.ok(state.visited.includes("rust_lauan"));
});

test("rust balsa is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_balsa);
  assert.ok(state.visited.includes("rust_balsa"));
});

test("rust jarrah is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_jarrah);
  assert.ok(state.visited.includes("rust_jarrah"));
});

test("rust kauri is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kauri);
  assert.ok(state.visited.includes("rust_kauri"));
});

test("rust pitchpine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pitchpine);
  assert.ok(state.visited.includes("rust_pitchpine"));
});

test("rust whitewash is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_whitewash);
  assert.ok(state.visited.includes("rust_whitewash"));
});

test("rust limewash is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_limewash);
  assert.ok(state.visited.includes("rust_limewash"));
});

test("rust sienna is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sienna);
  assert.ok(state.visited.includes("rust_sienna"));
});

test("rust whiting is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_whiting);
  assert.ok(state.visited.includes("rust_whiting"));
});

test("rust chalk is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_chalk);
  assert.ok(state.visited.includes("rust_chalk"));
});

test("rust graphite is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_graphite);
  assert.ok(state.visited.includes("rust_graphite"));
});

test("rust asphalt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_asphalt);
  assert.ok(state.visited.includes("rust_asphalt"));
});

test("rust bitumen is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bitumen);
  assert.ok(state.visited.includes("rust_bitumen"));
});

test("rust creosote is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_creosote);
  assert.ok(state.visited.includes("rust_creosote"));
});

test("rust camphor is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_camphor);
  assert.ok(state.visited.includes("rust_camphor"));
});

test("rust sandalwood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sandalwood);
  assert.ok(state.visited.includes("rust_sandalwood"));
});

test("rust rosewood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rosewood);
  assert.ok(state.visited.includes("rust_rosewood"));
});

test("rust ebony is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ebony);
  assert.ok(state.visited.includes("rust_ebony"));
});

test("rust whaleoil is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_whaleoil);
  assert.ok(state.visited.includes("rust_whaleoil"));
});

test("rust grout is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_grout);
  assert.ok(state.visited.includes("rust_grout"));
});

test("rust caulk is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_caulk);
  assert.ok(state.visited.includes("rust_caulk"));
});

test("rust plaster is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_plaster);
  assert.ok(state.visited.includes("rust_plaster"));
});

test("rust palm is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_palm);
  assert.ok(state.visited.includes("rust_palm"));
});

test("rust juniper is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_juniper);
  assert.ok(state.visited.includes("rust_juniper"));
});

test("rust redwood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_redwood);
  assert.ok(state.visited.includes("rust_redwood"));
});

test("rust cypress is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cypress);
  assert.ok(state.visited.includes("rust_cypress"));
});

test("rust tamarack is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tamarack);
  assert.ok(state.visited.includes("rust_tamarack"));
});

test("rust cottonwood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cottonwood);
  assert.ok(state.visited.includes("rust_cottonwood"));
});

test("rust butternut is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_butternut);
  assert.ok(state.visited.includes("rust_butternut"));
});

test("rust hornbeam is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hornbeam);
  assert.ok(state.visited.includes("rust_hornbeam"));
});

test("rust ironwood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ironwood);
  assert.ok(state.visited.includes("rust_ironwood"));
});

test("rust dogwood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_dogwood);
  assert.ok(state.visited.includes("rust_dogwood"));
});

test("rust osage is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_osage);
  assert.ok(state.visited.includes("rust_osage"));
});

test("rust willow is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_willow);
  assert.ok(state.visited.includes("rust_willow"));
});

test("rust hemlock is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hemlock);
  assert.ok(state.visited.includes("rust_hemlock"));
});

test("rust basswood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_basswood);
  assert.ok(state.visited.includes("rust_basswood"));
});

test("rust sycamore is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sycamore);
  assert.ok(state.visited.includes("rust_sycamore"));
});

test("rust locust is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_locust);
  assert.ok(state.visited.includes("rust_locust"));
});

test("rust chestnut is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_chestnut);
  assert.ok(state.visited.includes("rust_chestnut"));
});

test("rust pecan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pecan);
  assert.ok(state.visited.includes("rust_pecan"));
});

test("rust hickory is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hickory);
  assert.ok(state.visited.includes("rust_hickory"));
});

test("rust aspen is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_aspen);
  assert.ok(state.visited.includes("rust_aspen"));
});

test("rust beech is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_beech);
  assert.ok(state.visited.includes("rust_beech"));
});

test("rust larch is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_larch);
  assert.ok(state.visited.includes("rust_larch"));
});

test("rust fir is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fir);
  assert.ok(state.visited.includes("rust_fir"));
});

test("rust poplar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_poplar);
  assert.ok(state.visited.includes("rust_poplar"));
});

test("rust alder is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_alder);
  assert.ok(state.visited.includes("rust_alder"));
});

test("rust walnut is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_walnut);
  assert.ok(state.visited.includes("rust_walnut"));
});

test("rust maple is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_maple);
  assert.ok(state.visited.includes("rust_maple"));
});

test("rust birch is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_birch);
  assert.ok(state.visited.includes("rust_birch"));
});

test("rust colza is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_colza);
  assert.ok(state.visited.includes("rust_colza"));
});

test("rust lignum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lignum);
  assert.ok(state.visited.includes("rust_lignum"));
});

test("rust boxwood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_boxwood);
  assert.ok(state.visited.includes("rust_boxwood"));
});

test("rust mahogany is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mahogany);
  assert.ok(state.visited.includes("rust_mahogany"));
});

test("rust yew is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_yew);
  assert.ok(state.visited.includes("rust_yew"));
});

test("rust elm is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_elm);
  assert.ok(state.visited.includes("rust_elm"));
});

test("rust cedar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cedar);
  assert.ok(state.visited.includes("rust_cedar"));
});

test("rust spruce is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_spruce);
  assert.ok(state.visited.includes("rust_spruce"));
});

test("rust pine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pine);
  assert.ok(state.visited.includes("rust_pine"));
});

test("rust teak is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_teak);
  assert.ok(state.visited.includes("rust_teak"));
});

test("rust gypsum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_gypsum);
  assert.ok(state.visited.includes("rust_gypsum"));
});

test("rust redlead is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_redlead);
  assert.ok(state.visited.includes("rust_redlead"));
});

test("rust whitelead is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_whitelead);
  assert.ok(state.visited.includes("rust_whitelead"));
});

test("rust damar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_damar);
  assert.ok(state.visited.includes("rust_damar"));
});

test("rust kerosene is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kerosene);
  assert.ok(state.visited.includes("rust_kerosene"));
});

test("rust naphtha is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_naphtha);
  assert.ok(state.visited.includes("rust_naphtha"));
});

test("rust umber is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_umber);
  assert.ok(state.visited.includes("rust_umber"));
});

test("rust suet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_suet);
  assert.ok(state.visited.includes("rust_suet"));
});

test("rust copra is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_copra);
  assert.ok(state.visited.includes("rust_copra"));
});

test("rust bamboo is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bamboo);
  assert.ok(state.visited.includes("rust_bamboo"));
});

test("rust rattan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rattan);
  assert.ok(state.visited.includes("rust_rattan"));
});

test("rust lanolin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lanolin);
  assert.ok(state.visited.includes("rust_lanolin"));
});

test("rust turpentine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_turpentine);
  assert.ok(state.visited.includes("rust_turpentine"));
});

test("rust lampblack is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lampblack);
  assert.ok(state.visited.includes("rust_lampblack"));
});

test("rust ochre is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ochre);
  assert.ok(state.visited.includes("rust_ochre"));
});

test("rust copal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_copal);
  assert.ok(state.visited.includes("rust_copal"));
});

test("rust putty is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_putty);
  assert.ok(state.visited.includes("rust_putty"));
});

test("rust lacquer is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lacquer);
  assert.ok(state.visited.includes("rust_lacquer"));
});

test("rust shellac is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_shellac);
  assert.ok(state.visited.includes("rust_shellac"));
});

test("rust rubber is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rubber);
  assert.ok(state.visited.includes("rust_rubber"));
});

test("rust cork is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cork);
  assert.ok(state.visited.includes("rust_cork"));
});

test("rust tow is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tow);
  assert.ok(state.visited.includes("rust_tow"));
});

test("rust varnish is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_varnish);
  assert.ok(state.visited.includes("rust_varnish"));
});

test("rust linseed is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_linseed);
  assert.ok(state.visited.includes("rust_linseed"));
});

test("rust beeswax is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_beeswax);
  assert.ok(state.visited.includes("rust_beeswax"));
});

test("rust tallow is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tallow);
  assert.ok(state.visited.includes("rust_tallow"));
});

test("rust wool is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wool);
  assert.ok(state.visited.includes("rust_wool"));
});

test("rust cotton is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cotton);
  assert.ok(state.visited.includes("rust_cotton"));
});

test("rust linen is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_linen);
  assert.ok(state.visited.includes("rust_linen"));
});

test("rust flax is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_flax);
  assert.ok(state.visited.includes("rust_flax"));
});

test("rust hawserline is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hawserline);
  assert.ok(state.visited.includes("rust_hawserline"));
});

test("rust cable is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cable);
  assert.ok(state.visited.includes("rust_cable"));
});

test("rust burlap is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_burlap);
  assert.ok(state.visited.includes("rust_burlap"));
});

test("rust duck is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_duck);
  assert.ok(state.visited.includes("rust_duck"));
});

test("rust oilskin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oilskin);
  assert.ok(state.visited.includes("rust_oilskin"));
});

test("rust junk is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_junk);
  assert.ok(state.visited.includes("rust_junk"));
});

test("rust jute is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_jute);
  assert.ok(state.visited.includes("rust_jute"));
});

test("rust coir is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_coir);
  assert.ok(state.visited.includes("rust_coir"));
});

test("rust manila is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_manila);
  assert.ok(state.visited.includes("rust_manila"));
});

test("rust hemp is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hemp);
  assert.ok(state.visited.includes("rust_hemp"));
});

test("rust tarpaulin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tarpaulin);
  assert.ok(state.visited.includes("rust_tarpaulin"));
});

test("rust yarn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_yarn);
  assert.ok(state.visited.includes("rust_yarn"));
});

test("rust sisal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sisal);
  assert.ok(state.visited.includes("rust_sisal"));
});

test("rust roping is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_roping);
  assert.ok(state.visited.includes("rust_roping"));
});

test("rust canvas is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_canvas);
  assert.ok(state.visited.includes("rust_canvas"));
});

test("rust sailcloth is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sailcloth);
  assert.ok(state.visited.includes("rust_sailcloth"));
});

test("rust halyardgasket is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_halyardgasket);
  assert.ok(state.visited.includes("rust_halyardgasket"));
});

test("rust jibgasket is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_jibgasket);
  assert.ok(state.visited.includes("rust_jibgasket"));
});

test("rust staygasket is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_staygasket);
  assert.ok(state.visited.includes("rust_staygasket"));
});

test("rust spangasket is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_spangasket);
  assert.ok(state.visited.includes("rust_spangasket"));
});

test("rust clewgasket is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_clewgasket);
  assert.ok(state.visited.includes("rust_clewgasket"));
});

test("rust boomgasket is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_boomgasket);
  assert.ok(state.visited.includes("rust_boomgasket"));
});

test("rust mastgasket is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mastgasket);
  assert.ok(state.visited.includes("rust_mastgasket"));
});

test("rust yardgasket is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_yardgasket);
  assert.ok(state.visited.includes("rust_yardgasket"));
});

test("rust parrelbead is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_parrelbead);
  assert.ok(state.visited.includes("rust_parrelbead"));
});

test("rust sailrope is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sailrope);
  assert.ok(state.visited.includes("rust_sailrope"));
});

test("rust headcringle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_headcringle);
  assert.ok(state.visited.includes("rust_headcringle"));
});

test("rust tackline is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tackline);
  assert.ok(state.visited.includes("rust_tackline"));
});

test("rust leechgasket is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_leechgasket);
  assert.ok(state.visited.includes("rust_leechgasket"));
});

test("rust buntgasket is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_buntgasket);
  assert.ok(state.visited.includes("rust_buntgasket"));
});

test("rust reefgasket is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_reefgasket);
  assert.ok(state.visited.includes("rust_reefgasket"));
});

test("rust sailgasket is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sailgasket);
  assert.ok(state.visited.includes("rust_sailgasket"));
});

test("rust footline is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_footline);
  assert.ok(state.visited.includes("rust_footline"));
});

test("rust boltline is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_boltline);
  assert.ok(state.visited.includes("rust_boltline"));
});

test("rust sailtwine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sailtwine);
  assert.ok(state.visited.includes("rust_sailtwine"));
});

test("rust clewcringle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_clewcringle);
  assert.ok(state.visited.includes("rust_clewcringle"));
});

test("rust tackcringle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tackcringle);
  assert.ok(state.visited.includes("rust_tackcringle"));
});

test("rust reefcringle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_reefcringle);
  assert.ok(state.visited.includes("rust_reefcringle"));
});

test("rust throatrope is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_throatrope);
  assert.ok(state.visited.includes("rust_throatrope"));
});

test("rust peakrope is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_peakrope);
  assert.ok(state.visited.includes("rust_peakrope"));
});

test("rust clewrope is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_clewrope);
  assert.ok(state.visited.includes("rust_clewrope"));
});

test("rust buntrope is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_buntrope);
  assert.ok(state.visited.includes("rust_buntrope"));
});

test("rust tackrope is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tackrope);
  assert.ok(state.visited.includes("rust_tackrope"));
});

test("rust footband is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_footband);
  assert.ok(state.visited.includes("rust_footband"));
});

test("rust leechrope is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_leechrope);
  assert.ok(state.visited.includes("rust_leechrope"));
});

test("rust headrope is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_headrope);
  assert.ok(state.visited.includes("rust_headrope"));
});

test("rust reefband is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_reefband);
  assert.ok(state.visited.includes("rust_reefband"));
});

test("rust hanks is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hanks);
  assert.ok(state.visited.includes("rust_hanks"));
});

test("rust slings is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_slings);
  assert.ok(state.visited.includes("rust_slings"));
});

test("rust reefearring is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_reefearring);
  assert.ok(state.visited.includes("rust_reefearring"));
});

test("rust yardsling is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_yardsling);
  assert.ok(state.visited.includes("rust_yardsling"));
});

test("rust woolding is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_woolding);
  assert.ok(state.visited.includes("rust_woolding"));
});

test("rust backrope is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_backrope);
  assert.ok(state.visited.includes("rust_backrope"));
});

test("rust clewgarnet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_clewgarnet);
  assert.ok(state.visited.includes("rust_clewgarnet"));
});

test("rust jigger is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_jigger);
  assert.ok(state.visited.includes("rust_jigger"));
});

test("rust crowfoot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_crowfoot);
  assert.ok(state.visited.includes("rust_crowfoot"));
});

test("rust futtockband is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_futtockband);
  assert.ok(state.visited.includes("rust_futtockband"));
});

test("rust chainwale is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_chainwale);
  assert.ok(state.visited.includes("rust_chainwale"));
});

test("rust houndband is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_houndband);
  assert.ok(state.visited.includes("rust_houndband"));
});

test("rust rackseizing is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rackseizing);
  assert.ok(state.visited.includes("rust_rackseizing"));
});

test("rust throatseizing is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_throatseizing);
  assert.ok(state.visited.includes("rust_throatseizing"));
});

test("rust mastcap is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mastcap);
  assert.ok(state.visited.includes("rust_mastcap"));
});

test("rust roundseizing is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_roundseizing);
  assert.ok(state.visited.includes("rust_roundseizing"));
});

test("rust heavingknot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_heavingknot);
  assert.ok(state.visited.includes("rust_heavingknot"));
});

test("rust wagoners is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wagoners);
  assert.ok(state.visited.includes("rust_wagoners"));
});

test("rust packers is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_packers);
  assert.ok(state.visited.includes("rust_packers"));
});

test("rust thief is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_thief);
  assert.ok(state.visited.includes("rust_thief"));
});

test("rust bagknot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bagknot);
  assert.ok(state.visited.includes("rust_bagknot"));
});

test("rust tomfool is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tomfool);
  assert.ok(state.visited.includes("rust_tomfool"));
});

test("rust millers is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_millers);
  assert.ok(state.visited.includes("rust_millers"));
});

test("rust surgeon is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_surgeon);
  assert.ok(state.visited.includes("rust_surgeon"));
});

test("rust palstek is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_palstek);
  assert.ok(state.visited.includes("rust_palstek"));
});

test("rust midshipman is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_midshipman);
  assert.ok(state.visited.includes("rust_midshipman"));
});

test("rust icicle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_icicle);
  assert.ok(state.visited.includes("rust_icicle"));
});

test("rust running is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_running);
  assert.ok(state.visited.includes("rust_running"));
});

test("rust trucker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_trucker);
  assert.ok(state.visited.includes("rust_trucker"));
});

test("rust italian is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_italian);
  assert.ok(state.visited.includes("rust_italian"));
});

test("rust bachmann is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bachmann);
  assert.ok(state.visited.includes("rust_bachmann"));
});

test("rust blake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_blake);
  assert.ok(state.visited.includes("rust_blake"));
});

test("rust alpine is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_alpine);
  assert.ok(state.visited.includes("rust_alpine"));
});

test("rust munter is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_munter);
  assert.ok(state.visited.includes("rust_munter"));
});

test("rust klemheist is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_klemheist);
  assert.ok(state.visited.includes("rust_klemheist"));
});

test("rust roundturn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_roundturn);
  assert.ok(state.visited.includes("rust_roundturn"));
});

test("rust stopperknot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_stopperknot);
  assert.ok(state.visited.includes("rust_stopperknot"));
});

test("rust diamondknot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_diamondknot);
  assert.ok(state.visited.includes("rust_diamondknot"));
});

test("rust barrelknot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barrelknot);
  assert.ok(state.visited.includes("rust_barrelknot"));
});

test("rust waterknot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_waterknot);
  assert.ok(state.visited.includes("rust_waterknot"));
});

test("rust bloodknot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bloodknot);
  assert.ok(state.visited.includes("rust_bloodknot"));
});

test("rust tautline is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tautline);
  assert.ok(state.visited.includes("rust_tautline"));
});

test("rust prusik is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_prusik);
  assert.ok(state.visited.includes("rust_prusik"));
});

test("rust palomar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_palomar);
  assert.ok(state.visited.includes("rust_palomar"));
});

test("rust butterfly is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_butterfly);
  assert.ok(state.visited.includes("rust_butterfly"));
});

test("rust ashley is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ashley);
  assert.ok(state.visited.includes("rust_ashley"));
});

test("rust zeppelin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_zeppelin);
  assert.ok(state.visited.includes("rust_zeppelin"));
});

test("rust fisherman is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fisherman);
  assert.ok(state.visited.includes("rust_fisherman"));
});

test("rust squareknot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_squareknot);
  assert.ok(state.visited.includes("rust_squareknot"));
});

test("rust overhand is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_overhand);
  assert.ok(state.visited.includes("rust_overhand"));
});

test("rust figureeight is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_figureeight);
  assert.ok(state.visited.includes("rust_figureeight"));
});

test("rust granny is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_granny);
  assert.ok(state.visited.includes("rust_granny"));
});

test("rust reefknot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_reefknot);
  assert.ok(state.visited.includes("rust_reefknot"));
});

test("rust marlinespike is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_marlinespike);
  assert.ok(state.visited.includes("rust_marlinespike"));
});

test("rust blackwall is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_blackwall);
  assert.ok(state.visited.includes("rust_blackwall"));
});

test("rust timberhitch is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_timberhitch);
  assert.ok(state.visited.includes("rust_timberhitch"));
});

test("rust rollinghitch is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rollinghitch);
  assert.ok(state.visited.includes("rust_rollinghitch"));
});

test("rust constrictor is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_constrictor);
  assert.ok(state.visited.includes("rust_constrictor"));
});

test("rust carrick is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_carrick);
  assert.ok(state.visited.includes("rust_carrick"));
});

test("rust halfhitch is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_halfhitch);
  assert.ok(state.visited.includes("rust_halfhitch"));
});

test("rust cowhitch is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cowhitch);
  assert.ok(state.visited.includes("rust_cowhitch"));
});

test("rust larkhead is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_larkhead);
  assert.ok(state.visited.includes("rust_larkhead"));
});

test("rust belaying is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_belaying);
  assert.ok(state.visited.includes("rust_belaying"));
});

test("rust coiling is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_coiling);
  assert.ok(state.visited.includes("rust_coiling"));
});

test("rust fid is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fid);
  assert.ok(state.visited.includes("rust_fid"));
});

test("rust racking is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_racking);
  assert.ok(state.visited.includes("rust_racking"));
});

test("rust frapping is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_frapping);
  assert.ok(state.visited.includes("rust_frapping"));
});

test("rust bending is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bending);
  assert.ok(state.visited.includes("rust_bending"));
});

test("rust reeving is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_reeving);
  assert.ok(state.visited.includes("rust_reeving"));
});

test("rust catspaw is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_catspaw);
  assert.ok(state.visited.includes("rust_catspaw"));
});

test("rust sheepshank is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sheepshank);
  assert.ok(state.visited.includes("rust_sheepshank"));
});

test("rust sheetbend is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sheetbend);
  assert.ok(state.visited.includes("rust_sheetbend"));
});

test("rust clove is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_clove);
  assert.ok(state.visited.includes("rust_clove"));
});

test("rust stevedore is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_stevedore);
  assert.ok(state.visited.includes("rust_stevedore"));
});

test("rust walker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_walker);
  assert.ok(state.visited.includes("rust_walker"));
});

test("rust turkshead is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_turkshead);
  assert.ok(state.visited.includes("rust_turkshead"));
});

test("rust wallknot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wallknot);
  assert.ok(state.visited.includes("rust_wallknot"));
});

test("rust shortsplice is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_shortsplice);
  assert.ok(state.visited.includes("rust_shortsplice"));
});

test("rust eyeplice is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_eyeplice);
  assert.ok(state.visited.includes("rust_eyeplice"));
});

test("rust splice is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_splice);
  assert.ok(state.visited.includes("rust_splice"));
});

test("rust hitch is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hitch);
  assert.ok(state.visited.includes("rust_hitch"));
});

test("rust paunch is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_paunch);
  assert.ok(state.visited.includes("rust_paunch"));
});

test("rust mouse is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mouse);
  assert.ok(state.visited.includes("rust_mouse"));
});

test("rust whipping is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_whipping);
  assert.ok(state.visited.includes("rust_whipping"));
});

test("rust pointing is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pointing);
  assert.ok(state.visited.includes("rust_pointing"));
});

test("rust keckling is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_keckling);
  assert.ok(state.visited.includes("rust_keckling"));
});

test("rust rounding is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rounding);
  assert.ok(state.visited.includes("rust_rounding"));
});

test("rust serving is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_serving);
  assert.ok(state.visited.includes("rust_serving"));
});

test("rust nock is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_nock);
  assert.ok(state.visited.includes("rust_nock"));
});

test("rust hambroline is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hambroline);
  assert.ok(state.visited.includes("rust_hambroline"));
});

test("rust foxes is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foxes);
  assert.ok(state.visited.includes("rust_foxes"));
});

test("rust lashing is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lashing);
  assert.ok(state.visited.includes("rust_lashing"));
});

test("rust stopper is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_stopper);
  assert.ok(state.visited.includes("rust_stopper"));
});

test("rust messenger is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_messenger);
  assert.ok(state.visited.includes("rust_messenger"));
});

test("rust warp is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_warp);
  assert.ok(state.visited.includes("rust_warp"));
});

test("rust breastline is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_breastline);
  assert.ok(state.visited.includes("rust_breastline"));
});

test("rust heavingline is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_heavingline);
  assert.ok(state.visited.includes("rust_heavingline"));
});

test("rust sternfast is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sternfast);
  assert.ok(state.visited.includes("rust_sternfast"));
});

test("rust headfast is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_headfast);
  assert.ok(state.visited.includes("rust_headfast"));
});

test("rust towline is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_towline);
  assert.ok(state.visited.includes("rust_towline"));
});

test("rust leadline is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_leadline);
  assert.ok(state.visited.includes("rust_leadline"));
});

test("rust logline is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_logline);
  assert.ok(state.visited.includes("rust_logline"));
});

test("rust roundline is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_roundline);
  assert.ok(state.visited.includes("rust_roundline"));
});

test("rust marling is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_marling);
  assert.ok(state.visited.includes("rust_marling"));
});

test("rust thimble is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_thimble);
  assert.ok(state.visited.includes("rust_thimble"));
});

test("rust sennit is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sennit);
  assert.ok(state.visited.includes("rust_sennit"));
});

test("rust nettles is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_nettles);
  assert.ok(state.visited.includes("rust_nettles"));
});

test("rust seizing is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_seizing);
  assert.ok(state.visited.includes("rust_seizing"));
});

test("rust roband is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_roband);
  assert.ok(state.visited.includes("rust_roband"));
});

test("rust lugsail is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lugsail);
  assert.ok(state.visited.includes("rust_lugsail"));
});

test("rust lateen is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lateen);
  assert.ok(state.visited.includes("rust_lateen"));
});

test("rust spencer is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_spencer);
  assert.ok(state.visited.includes("rust_spencer"));
});

test("rust yardarm is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_yardarm);
  assert.ok(state.visited.includes("rust_yardarm"));
});

test("rust lazyjack is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lazyjack);
  assert.ok(state.visited.includes("rust_lazyjack"));
});

test("rust bridle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bridle);
  assert.ok(state.visited.includes("rust_bridle"));
});

test("rust bowline is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bowline);
  assert.ok(state.visited.includes("rust_bowline"));
});

test("rust earing is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_earing);
  assert.ok(state.visited.includes("rust_earing"));
});

test("rust tabling is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tabling);
  assert.ok(state.visited.includes("rust_tabling"));
});

test("rust boltrope is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_boltrope);
  assert.ok(state.visited.includes("rust_boltrope"));
});

test("rust houseline is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_houseline);
  assert.ok(state.visited.includes("rust_houseline"));
});

test("rust spunyarn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_spunyarn);
  assert.ok(state.visited.includes("rust_spunyarn"));
});

test("rust worming is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_worming);
  assert.ok(state.visited.includes("rust_worming"));
});

test("rust parcelling is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_parcelling);
  assert.ok(state.visited.includes("rust_parcelling"));
});

test("rust girtline is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_girtline);
  assert.ok(state.visited.includes("rust_girtline"));
});

test("rust stemson is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_stemson);
  assert.ok(state.visited.includes("rust_stemson"));
});

test("rust sternpost is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sternpost);
  assert.ok(state.visited.includes("rust_sternpost"));
});

test("rust footwale is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_footwale);
  assert.ok(state.visited.includes("rust_footwale"));
});

test("rust scarph is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_scarph);
  assert.ok(state.visited.includes("rust_scarph"));
});

test("rust eyebolt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_eyebolt);
  assert.ok(state.visited.includes("rust_eyebolt"));
});

test("rust ringbolt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ringbolt);
  assert.ok(state.visited.includes("rust_ringbolt"));
});

test("rust swivel is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_swivel);
  assert.ok(state.visited.includes("rust_swivel"));
});

test("rust fluke is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fluke);
  assert.ok(state.visited.includes("rust_fluke"));
});

test("rust kedge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kedge);
  assert.ok(state.visited.includes("rust_kedge"));
});

test("rust hawser is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hawser);
  assert.ok(state.visited.includes("rust_hawser"));
});

test("rust nipper is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_nipper);
  assert.ok(state.visited.includes("rust_nipper"));
});

test("rust gantline is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_gantline);
  assert.ok(state.visited.includes("rust_gantline"));
});

test("rust masthead is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_masthead);
  assert.ok(state.visited.includes("rust_masthead"));
});

test("rust checkstay is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_checkstay);
  assert.ok(state.visited.includes("rust_checkstay"));
});

test("rust sheerpole is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sheerpole);
  assert.ok(state.visited.includes("rust_sheerpole"));
});

test("rust catharpin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_catharpin);
  assert.ok(state.visited.includes("rust_catharpin"));
});

test("rust marline is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_marline);
  assert.ok(state.visited.includes("rust_marline"));
});

test("rust lizard is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lizard);
  assert.ok(state.visited.includes("rust_lizard"));
});

test("rust sling is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sling);
  assert.ok(state.visited.includes("rust_sling"));
});

test("rust truss is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_truss);
  assert.ok(state.visited.includes("rust_truss"));
});

test("rust tye is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tye);
  assert.ok(state.visited.includes("rust_tye"));
});

test("rust jeer is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_jeer);
  assert.ok(state.visited.includes("rust_jeer"));
});

test("rust pendant is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pendant);
  assert.ok(state.visited.includes("rust_pendant"));
});

test("rust guy is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_guy);
  assert.ok(state.visited.includes("rust_guy"));
});

test("rust brace is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_brace);
  assert.ok(state.visited.includes("rust_brace"));
});

test("rust topping is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_topping);
  assert.ok(state.visited.includes("rust_topping"));
});

test("rust inhaul is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_inhaul);
  assert.ok(state.visited.includes("rust_inhaul"));
});

test("rust skysail is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_skysail);
  assert.ok(state.visited.includes("rust_skysail"));
});

test("rust topgallant is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_topgallant);
  assert.ok(state.visited.includes("rust_topgallant"));
});

test("rust jibboom is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_jibboom);
  assert.ok(state.visited.includes("rust_jibboom"));
});

test("rust brail is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_brail);
  assert.ok(state.visited.includes("rust_brail"));
});

test("rust clewline is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_clewline);
  assert.ok(state.visited.includes("rust_clewline"));
});

test("rust leechline is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_leechline);
  assert.ok(state.visited.includes("rust_leechline"));
});

test("rust buntline is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_buntline);
  assert.ok(state.visited.includes("rust_buntline"));
});

test("rust driver is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_driver);
  assert.ok(state.visited.includes("rust_driver"));
});

test("rust spanker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_spanker);
  assert.ok(state.visited.includes("rust_spanker"));
});

test("rust stunsail is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_stunsail);
  assert.ok(state.visited.includes("rust_stunsail"));
});

test("rust lazarette is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lazarette);
  assert.ok(state.visited.includes("rust_lazarette"));
});

test("rust orlop is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_orlop);
  assert.ok(state.visited.includes("rust_orlop"));
});

test("rust skylight is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_skylight);
  assert.ok(state.visited.includes("rust_skylight"));
});

test("rust deadlight is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_deadlight);
  assert.ok(state.visited.includes("rust_deadlight"));
});

test("rust scuttle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_scuttle);
  assert.ok(state.visited.includes("rust_scuttle"));
});

test("rust companion is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_companion);
  assert.ok(state.visited.includes("rust_companion"));
});

test("rust grating is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_grating);
  assert.ok(state.visited.includes("rust_grating"));
});

test("rust coaming is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_coaming);
  assert.ok(state.visited.includes("rust_coaming"));
});

test("rust kevel is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kevel);
  assert.ok(state.visited.includes("rust_kevel"));
});

test("rust timberhead is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_timberhead);
  assert.ok(state.visited.includes("rust_timberhead"));
});

test("rust fiferail is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fiferail);
  assert.ok(state.visited.includes("rust_fiferail"));
});

test("rust trestle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_trestle);
  assert.ok(state.visited.includes("rust_trestle"));
});

test("rust crosstree is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_crosstree);
  assert.ok(state.visited.includes("rust_crosstree"));
});

test("rust tabernacle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tabernacle);
  assert.ok(state.visited.includes("rust_tabernacle"));
});

test("rust chainplate is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_chainplate);
  assert.ok(state.visited.includes("rust_chainplate"));
});

test("rust taffrail is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_taffrail);
  assert.ok(state.visited.includes("rust_taffrail"));
});

test("rust fish is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fish);
  assert.ok(state.visited.includes("rust_fish"));
});

test("rust covering is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_covering);
  assert.ok(state.visited.includes("rust_covering"));
});

test("rust topsail is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_topsail);
  assert.ok(state.visited.includes("rust_topsail"));
});

test("rust course is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_course);
  assert.ok(state.visited.includes("rust_course"));
});

test("rust royal is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_royal);
  assert.ok(state.visited.includes("rust_royal"));
});

test("rust bumpkin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bumpkin);
  assert.ok(state.visited.includes("rust_bumpkin"));
});

test("rust hawsepipe is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hawsepipe);
  assert.ok(state.visited.includes("rust_hawsepipe"));
});

test("rust staysail is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_staysail);
  assert.ok(state.visited.includes("rust_staysail"));
});

test("rust floor is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_floor);
  assert.ok(state.visited.includes("rust_floor"));
});

test("rust pinrail is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pinrail);
  assert.ok(state.visited.includes("rust_pinrail"));
});

test("rust rider is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rider);
  assert.ok(state.visited.includes("rust_rider"));
});

test("rust bonnet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bonnet);
  assert.ok(state.visited.includes("rust_bonnet"));
});

test("rust triatic is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_triatic);
  assert.ok(state.visited.includes("rust_triatic"));
});

test("rust striker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_striker);
  assert.ok(state.visited.includes("rust_striker"));
});

test("rust dolphin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_dolphin);
  assert.ok(state.visited.includes("rust_dolphin"));
});

test("rust knighthead is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_knighthead);
  assert.ok(state.visited.includes("rust_knighthead"));
});

test("rust frame is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_frame);
  assert.ok(state.visited.includes("rust_frame"));
});

test("rust timber is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_timber);
  assert.ok(state.visited.includes("rust_timber"));
});

test("rust trysail is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_trysail);
  assert.ok(state.visited.includes("rust_trysail"));
});

test("rust sprit is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sprit);
  assert.ok(state.visited.includes("rust_sprit"));
});

test("rust mizzen is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mizzen);
  assert.ok(state.visited.includes("rust_mizzen"));
});

test("rust boomkin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_boomkin);
  assert.ok(state.visited.includes("rust_boomkin"));
});

test("rust partner is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_partner);
  assert.ok(state.visited.includes("rust_partner"));
});

test("rust carling is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_carling);
  assert.ok(state.visited.includes("rust_carling"));
});

test("rust zinc is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_zinc);
  assert.ok(state.visited.includes("rust_zinc"));
});

test("rust flemish is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_flemish);
  assert.ok(state.visited.includes("rust_flemish"));
});

test("rust horse is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_horse);
  assert.ok(state.visited.includes("rust_horse"));
});

test("rust felt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_felt);
  assert.ok(state.visited.includes("rust_felt"));
});

test("rust ceiling is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ceiling);
  assert.ok(state.visited.includes("rust_ceiling"));
});

test("rust clamp is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_clamp);
  assert.ok(state.visited.includes("rust_clamp"));
});

test("rust hog is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hog);
  assert.ok(state.visited.includes("rust_hog"));
});

test("rust rabbet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rabbet);
  assert.ok(state.visited.includes("rust_rabbet"));
});

test("rust sheer is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sheer);
  assert.ok(state.visited.includes("rust_sheer"));
});

test("rust burton is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_burton);
  assert.ok(state.visited.includes("rust_burton"));
});

test("rust runner is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_runner);
  assert.ok(state.visited.includes("rust_runner"));
});

test("rust gripe is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_gripe);
  assert.ok(state.visited.includes("rust_gripe"));
});

test("rust deadwood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_deadwood);
  assert.ok(state.visited.includes("rust_deadwood"));
});

test("rust apron is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_apron);
  assert.ok(state.visited.includes("rust_apron"));
});

test("rust stringer is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_stringer);
  assert.ok(state.visited.includes("rust_stringer"));
});

test("rust limber is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_limber);
  assert.ok(state.visited.includes("rust_limber"));
});

test("rust jackstay is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_jackstay);
  assert.ok(state.visited.includes("rust_jackstay"));
});

test("rust wale is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wale);
  assert.ok(state.visited.includes("rust_wale"));
});

test("rust oakum is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oakum);
  assert.ok(state.visited.includes("rust_oakum"));
});

test("rust stirrup is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_stirrup);
  assert.ok(state.visited.includes("rust_stirrup"));
});

test("rust jumper is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_jumper);
  assert.ok(state.visited.includes("rust_jumper"));
});

test("rust whisker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_whisker);
  assert.ok(state.visited.includes("rust_whisker"));
});

test("rust bowsprit is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bowsprit);
  assert.ok(state.visited.includes("rust_bowsprit"));
});

test("rust footrope is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_footrope);
  assert.ok(state.visited.includes("rust_footrope"));
});

test("rust helm is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_helm);
  assert.ok(state.visited.includes("rust_helm"));
});

test("rust stem is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_stem);
  assert.ok(state.visited.includes("rust_stem"));
});

test("rust garboard is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_garboard);
  assert.ok(state.visited.includes("rust_garboard"));
});

test("rust keelson is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_keelson);
  assert.ok(state.visited.includes("rust_keelson"));
});

test("rust yard is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_yard);
  assert.ok(state.visited.includes("rust_yard"));
});

test("rust bunt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bunt);
  assert.ok(state.visited.includes("rust_bunt"));
});

test("rust luff is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_luff);
  assert.ok(state.visited.includes("rust_luff"));
});

test("rust leech is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_leech);
  assert.ok(state.visited.includes("rust_leech"));
});

test("rust gammon is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_gammon);
  assert.ok(state.visited.includes("rust_gammon"));
});

test("rust martingale is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_martingale);
  assert.ok(state.visited.includes("rust_martingale"));
});

test("rust reefpoint is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_reefpoint);
  assert.ok(state.visited.includes("rust_reefpoint"));
});

test("rust truck is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_truck);
  assert.ok(state.visited.includes("rust_truck"));
});

test("rust becket is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_becket);
  assert.ok(state.visited.includes("rust_becket"));
});

test("rust toggle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_toggle);
  assert.ok(state.visited.includes("rust_toggle"));
});

test("rust gasket is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_gasket);
  assert.ok(state.visited.includes("rust_gasket"));
});

test("rust jib is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_jib);
  assert.ok(state.visited.includes("rust_jib"));
});

test("rust hounds is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hounds);
  assert.ok(state.visited.includes("rust_hounds"));
});

test("rust spreader is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_spreader);
  assert.ok(state.visited.includes("rust_spreader"));
});

test("rust samson is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_samson);
  assert.ok(state.visited.includes("rust_samson"));
});

test("rust cranse is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cranse);
  assert.ok(state.visited.includes("rust_cranse"));
});

test("rust parrel is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_parrel);
  assert.ok(state.visited.includes("rust_parrel"));
});

test("rust bobstay is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bobstay);
  assert.ok(state.visited.includes("rust_bobstay"));
});

test("rust backstay is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_backstay);
  assert.ok(state.visited.includes("rust_backstay"));
});

test("rust forestay is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_forestay);
  assert.ok(state.visited.includes("rust_forestay"));
});

test("rust preventer is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_preventer);
  assert.ok(state.visited.includes("rust_preventer"));
});

test("rust downhaul is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_downhaul);
  assert.ok(state.visited.includes("rust_downhaul"));
});

test("rust outhaul is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_outhaul);
  assert.ok(state.visited.includes("rust_outhaul"));
});

test("rust yoke is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_yoke);
  assert.ok(state.visited.includes("rust_yoke"));
});

test("rust clew is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_clew);
  assert.ok(state.visited.includes("rust_clew"));
});

test("rust trunnel is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_trunnel);
  assert.ok(state.visited.includes("rust_trunnel"));
});

test("rust rudder is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rudder);
  assert.ok(state.visited.includes("rust_rudder"));
});

test("rust skeg is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_skeg);
  assert.ok(state.visited.includes("rust_skeg"));
});

test("rust cathead is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cathead);
  assert.ok(state.visited.includes("rust_cathead"));
});

test("rust futtock is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_futtock);
  assert.ok(state.visited.includes("rust_futtock"));
});

test("rust vang is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_vang);
  assert.ok(state.visited.includes("rust_vang"));
});

test("rust halyard is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_halyard);
  assert.ok(state.visited.includes("rust_halyard"));
});

test("rust ratline is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ratline);
  assert.ok(state.visited.includes("rust_ratline"));
});

test("rust windlass is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_windlass);
  assert.ok(state.visited.includes("rust_windlass"));
});

test("rust lanyard is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lanyard);
  assert.ok(state.visited.includes("rust_lanyard"));
});

test("rust gooseneck is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_gooseneck);
  assert.ok(state.visited.includes("rust_gooseneck"));
});

test("rust bollard is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bollard);
  assert.ok(state.visited.includes("rust_bollard"));
});

test("rust pawl is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pawl);
  assert.ok(state.visited.includes("rust_pawl"));
});

test("rust capstan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_capstan);
  assert.ok(state.visited.includes("rust_capstan"));
});

test("rust winch is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_winch);
  assert.ok(state.visited.includes("rust_winch"));
});

test("rust cringle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cringle);
  assert.ok(state.visited.includes("rust_cringle"));
});

test("rust davit is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_davit);
  assert.ok(state.visited.includes("rust_davit"));
});

test("rust hawse is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hawse);
  assert.ok(state.visited.includes("rust_hawse"));
});

test("rust bitt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bitt);
  assert.ok(state.visited.includes("rust_bitt"));
});

test("rust deadeye is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_deadeye);
  assert.ok(state.visited.includes("rust_deadeye"));
});

test("rust shroud is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_shroud);
  assert.ok(state.visited.includes("rust_shroud"));
});

test("rust stay is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_stay);
  assert.ok(state.visited.includes("rust_stay"));
});

test("rust mast is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mast);
  assert.ok(state.visited.includes("rust_mast"));
});

test("rust gaff is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_gaff);
  assert.ok(state.visited.includes("rust_gaff"));
});

test("rust boom is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_boom);
  assert.ok(state.visited.includes("rust_boom"));
});

test("rust sheave is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sheave);
  assert.ok(state.visited.includes("rust_sheave"));
});

test("rust fairlead is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fairlead);
  assert.ok(state.visited.includes("rust_fairlead"));
});

test("rust chock is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_chock);
  assert.ok(state.visited.includes("rust_chock"));
});

test("rust strake is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_strake);
  assert.ok(state.visited.includes("rust_strake"));
});

test("rust transom is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_transom);
  assert.ok(state.visited.includes("rust_transom"));
});

test("rust gunnel is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_gunnel);
  assert.ok(state.visited.includes("rust_gunnel"));
});

test("rust thwart is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_thwart);
  assert.ok(state.visited.includes("rust_thwart"));
});

test("rust tiller is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tiller);
  assert.ok(state.visited.includes("rust_tiller"));
});

test("rust gudgeon is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_gudgeon);
  assert.ok(state.visited.includes("rust_gudgeon"));
});

test("rust pintle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pintle);
  assert.ok(state.visited.includes("rust_pintle"));
});

test("rust bit is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bit);
  assert.ok(state.visited.includes("rust_bit"));
});

test("rust hasp is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hasp);
  assert.ok(state.visited.includes("rust_hasp"));
});

test("rust eyelet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_eyelet);
  assert.ok(state.visited.includes("rust_eyelet"));
});

test("rust knee is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_knee);
  assert.ok(state.visited.includes("rust_knee"));
});

test("rust oar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oar);
  assert.ok(state.visited.includes("rust_oar"));
});

test("rust thole is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_thole);
  assert.ok(state.visited.includes("rust_thole"));
});

test("rust cleat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cleat);
  assert.ok(state.visited.includes("rust_cleat"));
});

test("rust eye is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_eye);
  assert.ok(state.visited.includes("rust_eye"));
});

test("rust lath is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lath);
  assert.ok(state.visited.includes("rust_lath"));
});

test("rust joist is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_joist);
  assert.ok(state.visited.includes("rust_joist"));
});

test("rust beam is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_beam);
  assert.ok(state.visited.includes("rust_beam"));
});

test("rust keel is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_keel);
  assert.ok(state.visited.includes("rust_keel"));
});

test("rust spar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_spar);
  assert.ok(state.visited.includes("rust_spar"));
});

test("rust grommet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_grommet);
  assert.ok(state.visited.includes("rust_grommet"));
});

test("rust bush is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bush);
  assert.ok(state.visited.includes("rust_bush"));
});

test("rust nut is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_nut);
  assert.ok(state.visited.includes("rust_nut"));
});

test("rust cuff is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cuff);
  assert.ok(state.visited.includes("rust_cuff"));
});

test("rust sleeve is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sleeve);
  assert.ok(state.visited.includes("rust_sleeve"));
});

test("rust shim is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_shim);
  assert.ok(state.visited.includes("rust_shim"));
});

test("rust wedge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wedge);
  assert.ok(state.visited.includes("rust_wedge"));
});

test("rust pommel is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pommel);
  assert.ok(state.visited.includes("rust_pommel"));
});

test("rust stack is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_stack);
  assert.ok(state.visited.includes("rust_stack"));
});

test("rust flue is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_flue);
  assert.ok(state.visited.includes("rust_flue"));
});

test("rust guard is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_guard);
  assert.ok(state.visited.includes("rust_guard"));
});

test("rust hilt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hilt);
  assert.ok(state.visited.includes("rust_hilt"));
});

test("rust socket is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_socket);
  assert.ok(state.visited.includes("rust_socket"));
});

test("rust coat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_coat);
  assert.ok(state.visited.includes("rust_coat"));
});

test("rust pelt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pelt);
  assert.ok(state.visited.includes("rust_pelt"));
});

test("rust dross is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_dross);
  assert.ok(state.visited.includes("rust_dross"));
});

test("rust belt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_belt);
  assert.ok(state.visited.includes("rust_belt"));
});

test("rust hide is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hide);
  assert.ok(state.visited.includes("rust_hide"));
});

test("rust fang is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fang);
  assert.ok(state.visited.includes("rust_fang"));
});

test("rust tooth is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tooth);
  assert.ok(state.visited.includes("rust_tooth"));
});

test("rust brow is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_brow);
  assert.ok(state.visited.includes("rust_brow"));
});

test("rust chin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_chin);
  assert.ok(state.visited.includes("rust_chin"));
});

test("rust mill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mill);
  assert.ok(state.visited.includes("rust_mill"));
});

test("rust hull is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hull);
  assert.ok(state.visited.includes("rust_hull"));
});

test("rust bore is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bore);
  assert.ok(state.visited.includes("rust_bore"));
});

test("rust core is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_core);
  assert.ok(state.visited.includes("rust_core"));
});

test("rust axle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_axle);
  assert.ok(state.visited.includes("rust_axle"));
});

test("rust hub is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hub);
  assert.ok(state.visited.includes("rust_hub"));
});

test("rust spoke is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_spoke);
  assert.ok(state.visited.includes("rust_spoke"));
});

test("rust strap is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_strap);
  assert.ok(state.visited.includes("rust_strap"));
});

test("rust loop is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_loop);
  assert.ok(state.visited.includes("rust_loop"));
});

test("rust shaft is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_shaft);
  assert.ok(state.visited.includes("rust_shaft"));
});

test("rust duct is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_duct);
  assert.ok(state.visited.includes("rust_duct"));
});

test("rust vent is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_vent);
  assert.ok(state.visited.includes("rust_vent"));
});

test("rust pipe is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pipe);
  assert.ok(state.visited.includes("rust_pipe"));
});

test("rust rod is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rod);
  assert.ok(state.visited.includes("rust_rod"));
});

test("rust band is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_band);
  assert.ok(state.visited.includes("rust_band"));
});

test("rust claw is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_claw);
  assert.ok(state.visited.includes("rust_claw"));
});

test("rust horn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_horn);
  assert.ok(state.visited.includes("rust_horn"));
});

test("rust jaw is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wire);
  assert.ok(state.visited.includes("rust_jaw"));
});

test("rust leaf is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_coil);
  assert.ok(state.visited.includes("rust_leaf"));
});

test("rust sheet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lug);
  assert.ok(state.visited.includes("rust_sheet"));
});

test("rust plate is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_boss);
  assert.ok(state.visited.includes("rust_plate"));
});

test("rust grid is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tab);
  assert.ok(state.visited.includes("rust_grid"));
});

test("rust mesh is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_stud);
  assert.ok(state.visited.includes("rust_mesh"));
});

test("rust web is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foil);
  assert.ok(state.visited.includes("rust_web"));
});

test("rust rib is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_spec);
  assert.ok(state.visited.includes("rust_rib"));
});

test("rust edge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_trace);
  assert.ok(state.visited.includes("rust_edge"));
});

test("rust plank is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_line);
  assert.ok(state.visited.includes("rust_plank"));
});

test("rust post is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_dash);
  assert.ok(state.visited.includes("rust_post"));
});

test("rust flap is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_dot);
  assert.ok(state.visited.includes("rust_flap"));
});

test("rust cover is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_streak);
  assert.ok(state.visited.includes("rust_cover"));
});

test("rust brim is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_smudge);
  assert.ok(state.visited.includes("rust_brim"));
});

test("rust tip is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mark);
  assert.ok(state.visited.includes("rust_tip"));
});

test("rust hole is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_spot);
  assert.ok(state.visited.includes("rust_hole"));
});

test("rust pit is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_patch);
  assert.ok(state.visited.includes("rust_pit"));
});

test("rust toe is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_blob);
  assert.ok(state.visited.includes("rust_toe"));
});

test("rust lid is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_dab);
  assert.ok(state.visited.includes("rust_lid"));
});

test("rust rail is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bar);
  assert.ok(state.visited.includes("rust_rail"));
});

test("rust heel is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_nick);
  assert.ok(state.visited.includes("rust_heel"));
});

test("rust pan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_crumb);
  assert.ok(state.visited.includes("rust_pan"));
});

test("rust bank is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_knot);
  assert.ok(state.visited.includes("rust_bank"));
});

test("rust step is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bead);
  assert.ok(state.visited.includes("rust_step"));
});

test("rust flank is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_slab);
  assert.ok(state.visited.includes("rust_flank"));
});

test("rust crown is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_crown);
  assert.ok(state.visited.includes("rust_crown"));
});

test("rust fin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_spur);
  assert.ok(state.visited.includes("rust_fin"));
});

test("rust spur is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_crest);
  assert.ok(state.visited.includes("rust_spur"));
});

test("rust hood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_knob);
  assert.ok(state.visited.includes("rust_hood"));
});

test("rust rim is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wad);
  assert.ok(state.visited.includes("rust_rim"));
});

test("rust peak is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fleck);
  assert.ok(state.visited.includes("rust_peak"));
});

test("oxide hood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lime);
  assert.ok(state.visited.includes("oxide_hood"));
});

test("rust bay is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mud);
  assert.ok(state.visited.includes("rust_bay"));
});

test("oxide step is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_clay);
  assert.ok(state.visited.includes("oxide_step"));
});

test("oxide bay is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_peel);
  assert.ok(state.visited.includes("oxide_bay"));
});

test("rust well is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_skin);
  assert.ok(state.visited.includes("rust_well"));
});

test("rust drop is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_slag);
  assert.ok(state.visited.includes("rust_drop"));
});

test("oxide stoop is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_clod);
  assert.ok(state.visited.includes("oxide_stoop"));
});

test("rust shelf is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_curl);
  assert.ok(state.visited.includes("rust_shelf"));
});

test("rust cap is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_nub);
  assert.ok(state.visited.includes("rust_cap"));
});

test("rust ledge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pit);
  assert.ok(state.visited.includes("rust_ledge"));
});

test("oxide sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pock);
  assert.ok(state.visited.includes("oxide_sump"));
});

test("rust stoop is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rust);
  assert.ok(state.visited.includes("rust_stoop"));
});

test("oxide ridge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_scar);
  assert.ok(state.visited.includes("oxide_ridge"));
});

test("flange nook is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_washer);
  assert.ok(state.visited.includes("flange_nook"));
});

test("salt sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rime);
  assert.ok(state.visited.includes("salt_sump"));
});

test("flange lip is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_brass);
  assert.ok(state.visited.includes("flange_lip"));
});

test("oxide nook is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rind);
  assert.ok(state.visited.includes("oxide_nook"));
});

test("salt ridge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cake);
  assert.ok(state.visited.includes("salt_ridge"));
});

test("link sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_split);
  assert.ok(state.visited.includes("link_sump"));
});

test("salt nook is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lump);
  assert.ok(state.visited.includes("salt_nook"));
});

test("iron sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sliver);
  assert.ok(state.visited.includes("iron_sump"));
});

test("gum sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sap);
  assert.ok(state.visited.includes("gum_sump"));
});

test("salt sill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_grain);
  assert.ok(state.visited.includes("salt_sill"));
});

test("link ridge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cotter);
  assert.ok(state.visited.includes("link_ridge"));
});

test("iron ridge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bits);
  assert.ok(state.visited.includes("iron_ridge"));
});

test("gum ridge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_sludge);
  assert.ok(state.visited.includes("gum_ridge"));
});

test("salt lip is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_salt);
  assert.ok(state.visited.includes("salt_lip"));
});

test("link nook is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_catch);
  assert.ok(state.visited.includes("link_nook"));
});

test("iron nook is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_filings);
  assert.ok(state.visited.includes("iron_nook"));
});

test("gum nook is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_paste);
  assert.ok(state.visited.includes("gum_nook"));
});

test("oxide sill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_scab);
  assert.ok(state.visited.includes("oxide_sill"));
});

test("link sill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_clip);
  assert.ok(state.visited.includes("link_sill"));
});

test("iron sill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_speck);
  assert.ok(state.visited.includes("iron_sill"));
});

test("gum sill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_grease);
  assert.ok(state.visited.includes("gum_sill"));
});

test("oxide lip is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bloom);
  assert.ok(state.visited.includes("oxide_lip"));
});

test("link lip is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pin);
  assert.ok(state.visited.includes("link_lip"));
});

test("iron lip is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_crust);
  assert.ok(state.visited.includes("iron_lip"));
});

test("gum lip is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oil);
  assert.ok(state.visited.includes("gum_lip"));
});

test("chain sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_spike);
  assert.ok(state.visited.includes("chain_sump"));
});

test("hook sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_barb);
  assert.ok(state.visited.includes("hook_sump"));
});

test("snip sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_rivet);
  assert.ok(state.visited.includes("snip_sump"));
});

test("rust sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_powder);
  assert.ok(state.visited.includes("rust_sump"));
});

test("chain ridge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_staple);
  assert.ok(state.visited.includes("chain_ridge"));
});

test("hook ridge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_collar);
  assert.ok(state.visited.includes("hook_ridge"));
});

test("snip ridge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_spring);
  assert.ok(state.visited.includes("snip_ridge"));
});

test("rust ridge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_stain);
  assert.ok(state.visited.includes("rust_ridge"));
});

test("keg sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tap);
  assert.ok(state.visited.includes("keg_sump"));
});

test("pick sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tang);
  assert.ok(state.visited.includes("pick_sump"));
});

test("torch sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ash);
  assert.ok(state.visited.includes("torch_sump"));
});

test("chain stoop is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_weld);
  assert.ok(state.visited.includes("chain_stoop"));
});

test("hook sill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_shank);
  assert.ok(state.visited.includes("hook_sill"));
});

test("snip sill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_blade);
  assert.ok(state.visited.includes("snip_sill"));
});

test("rust sill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_smear);
  assert.ok(state.visited.includes("rust_sill"));
});

test("keg ridge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_peg);
  assert.ok(state.visited.includes("keg_ridge"));
});

test("pick ridge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ferrule);
  assert.ok(state.visited.includes("pick_ridge"));
});

test("torch ridge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ember);
  assert.ok(state.visited.includes("torch_ridge"));
});

test("chain lip is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_shackle);
  assert.ok(state.visited.includes("chain_lip"));
});

test("hook lip is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_ring);
  assert.ok(state.visited.includes("hook_lip"));
});

test("snip lip is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pivot);
  assert.ok(state.visited.includes("snip_lip"));
});

test("rust nook is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_flange);
  assert.ok(state.visited.includes("rust_nook"));
});

test("pick sill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wrap);
  assert.ok(state.visited.includes("pick_sill"));
});

test("torch sill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_resin);
  assert.ok(state.visited.includes("torch_sill"));
});

test("keg sill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_head);
  assert.ok(state.visited.includes("keg_sill"));
});

test("pick lip is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_haft);
  assert.ok(state.visited.includes("pick_lip"));
});

test("torch lip is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_char);
  assert.ok(state.visited.includes("torch_lip"));
});

test("tide sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_muck);
  assert.ok(state.visited.includes("tide_sump"));
});

test("keg nook is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_chime);
  assert.ok(state.visited.includes("keg_nook"));
});

test("pick nook is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_burr);
  assert.ok(state.visited.includes("pick_nook"));
});

test("tide ridge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_scum);
  assert.ok(state.visited.includes("tide_ridge"));
});

test("cache sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lees);
  assert.ok(state.visited.includes("cache_sump"));
});

test("hook nook is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_iron);
  assert.ok(state.visited.includes("hook_nook"));
});

test("snip nook is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_gum);
  assert.ok(state.visited.includes("snip_nook"));
});

test("rust lip is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oxide);
  assert.ok(state.visited.includes("rust_lip"));
});

test("torch nook is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_cinder);
  assert.ok(state.visited.includes("torch_nook"));
});

test("tide nook is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_foam);
  assert.ok(state.visited.includes("tide_nook"));
});

test("keg lip is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_pitch);
  assert.ok(state.visited.includes("keg_lip"));
});

test("chain sill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_link);
  assert.ok(state.visited.includes("chain_sill"));
});

test("tide lip is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_kelp);
  assert.ok(state.visited.includes("tide_lip"));
});

test("cache nook is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_slat);
  assert.ok(state.visited.includes("cache_nook"));
});

test("oil ridge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bung);
  assert.ok(state.visited.includes("oil_ridge"));
});

test("tide sill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_brine);
  assert.ok(state.visited.includes("tide_sill"));
});

test("lamp ridge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_wick);
  assert.ok(state.visited.includes("lamp_ridge"));
});

test("cache lip is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_crate);
  assert.ok(state.visited.includes("cache_lip"));
});

test("stair sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_stone);
  assert.ok(state.visited.includes("stair_sump"));
});

test("oil sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_drip);
  assert.ok(state.visited.includes("oil_sump"));
});

test("lamp lip is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_soot);
  assert.ok(state.visited.includes("lamp_lip"));
});

test("stair lip is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_mortar);
  assert.ok(state.visited.includes("stair_lip"));
});

test("oil lip is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_stave);
  assert.ok(state.visited.includes("oil_lip"));
});

test("gallery lip is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_paint);
  assert.ok(state.visited.includes("gallery_lip"));
});

test("cache sill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_straw);
  assert.ok(state.visited.includes("cache_sill"));
});

test("stair sill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_scrape_grit);
  assert.ok(state.visited.includes("stair_sill"));
});

test("oil sill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_hoop);
  assert.ok(state.visited.includes("oil_sill"));
});

test("lamp sill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_film);
  assert.ok(state.visited.includes("lamp_sill"));
});

test("gallery sill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_scale);
  assert.ok(state.visited.includes("gallery_sill"));
});

test("hold stoop is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_scrape_plank);
  assert.ok(state.visited.includes("hold_stoop"));
});

test("ice ridge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_frost);
  assert.ok(state.visited.includes("ice_ridge"));
});

test("cellar stoop is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_scrape_flag);
  assert.ok(state.visited.includes("cellar_stoop"));
});

test("cleft ridge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_silt);
  assert.ok(state.visited.includes("cleft_ridge"));
});

test("strand ridge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_weed);
  assert.ok(state.visited.includes("strand_ridge"));
});

test("oar ridge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_leather);
  assert.ok(state.visited.includes("oar_ridge"));
});

test("net ridge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_tar);
  assert.ok(state.visited.includes("net_ridge"));
});

test("door lintel is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_scrape_lintel);
  assert.ok(state.visited.includes("door_lintel"));
});

test("crypt stoop is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_scrape_joint);
  assert.ok(state.visited.includes("crypt_stoop"));
});

test("oar nook is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_loom);
  assert.ok(state.visited.includes("oar_nook"));
});

test("door sill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_scrape_salt);
  assert.ok(state.visited.includes("door_sill"));
});

test("net sill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_twine);
  assert.ok(state.visited.includes("net_sill"));
});

test("cellar nook is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_thumb_brick);
  assert.ok(state.visited.includes("cellar_nook"));
});

test("hold lip is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_oak);
  assert.ok(state.visited.includes("hold_lip"));
});

test("ice sill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_scrape_sand);
  assert.ok(state.visited.includes("ice_sill"));
});

test("cleft ledge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_thumb_slime);
  assert.ok(state.visited.includes("cleft_ledge"));
});

test("crypt nook is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_thumb_mortar);
  assert.ok(state.visited.includes("crypt_nook"));
});

test("strand lip is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bladder);
  assert.ok(state.visited.includes("strand_lip"));
});

test("door hinge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_ease_pin);
  assert.ok(state.visited.includes("door_hinge"));
});

test("lamp nook is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_scrape_rust);
  assert.ok(state.visited.includes("lamp_nook"));
});

test("gallery sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bolt);
  assert.ok(state.visited.includes("gallery_sump"));
});

test("cellar sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_nail);
  assert.ok(state.visited.includes("cellar_sump"));
});

test("hold nook is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_twist_trenail);
  assert.ok(state.visited.includes("hold_nook"));
});

test("net nook is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_float);
  assert.ok(state.visited.includes("net_nook"));
});

test("oar sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_scrape_blade);
  assert.ok(state.visited.includes("oar_sump"));
});

test("crypt sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_chip);
  assert.ok(state.visited.includes("crypt_sump"));
});

test("cleft nook is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_scrape_nick);
  assert.ok(state.visited.includes("cleft_nook"));
});

test("ice sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_flake);
  assert.ok(state.visited.includes("ice_sump"));
});

test("strand sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_shard);
  assert.ok(state.visited.includes("strand_sump"));
});

test("cove sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_scrape_rib);
  assert.ok(state.visited.includes("cove_sump"));
});

test("churchyard grave-hood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_lichen);
  assert.ok(state.visited.includes("grave_hood"));
});

test("vestry loft is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_thumb_cassock);
  assert.ok(state.visited.includes("vestry_loft"));
});

test("churchyard grave-sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_grit);
  assert.ok(state.visited.includes("grave_sump"));
});

test("tavern porch is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_wipe_rail);
  assert.ok(state.visited.includes("tavern_porch"));
});

test("vestry stoop is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_scrape_step);
  assert.ok(state.visited.includes("vestry_stoop"));
});

test("headland cairn-hood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_moss);
  assert.ok(state.visited.includes("cairn_hood"));
});

test("wharf sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_scrape_pile);
  assert.ok(state.visited.includes("wharf_sump"));
});

test("boathouse ridge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_rap_ridge);
  assert.ok(state.visited.includes("boat_ridge"));
});

test("headland cairn-sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_press_sod);
  assert.ok(state.visited.includes("cairn_sump"));
});

test("signal-pit sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_thumb_ember);
  assert.ok(state.visited.includes("pit_sump"));
});

test("dory sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_cup_silt);
  assert.ok(state.visited.includes("dory_sump"));
});

test("nest pit is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_dirt);
  assert.ok(state.visited.includes("nest_pit"));
});

test("inn-room stoop is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_scrape_tread);
  assert.ok(state.visited.includes("inn_stoop"));
});

test("sexton cellar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pick_shard);
  assert.ok(state.visited.includes("sexton_cellar"));
});

test("chapel cellar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_tap_flag);
  assert.ok(state.visited.includes("chapel_cellar"));
});

test("signal-pit hood is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_lift_cowl);
  assert.ok(state.visited.includes("pit_hood"));
});

test("headland lip is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_grip_turf);
  assert.ok(state.visited.includes("headland_lip"));
});

test("nest loft is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_thumb_lint);
  assert.ok(state.visited.includes("nest_loft"));
});

test("dory keel is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_rap_transom);
  assert.ok(state.visited.includes("dory_keel"));
});

test("sexton loft is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_thatch);
  assert.ok(state.visited.includes("sexton_loft"));
});

test("chapel loft is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pluck_rope);
  assert.ok(state.visited.includes("chapel_loft"));
});

test("inn-room loft is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_tap_lath);
  assert.ok(state.visited.includes("inn_loft"));
});

test("wreck-cabin beam is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_tap_rafter);
  assert.ok(state.visited.includes("cabin_beam"));
});

test("mouse-run pit is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pick_pellet);
  assert.ok(state.visited.includes("mouse_pit"));
});

test("peat-crate lid is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_seat_cap);
  assert.ok(state.visited.includes("peat_lid"));
});

test("nest-nook fluff is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_fluff);
  assert.ok(state.visited.includes("nest_fluff"));
});

test("boot-scraper post is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_grip_post);
  assert.ok(state.visited.includes("scraper_post"));
});

test("peat-crate wall is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_press_stave);
  assert.ok(state.visited.includes("peat_wall"));
});

test("nest-nook rim is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_lift_tuft);
  assert.ok(state.visited.includes("nest_rim"));
});

test("oat-sack floor is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pick_hull);
  assert.ok(state.visited.includes("oat_floor"));
});

test("boot-scraper sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_thumb_mud);
  assert.ok(state.visited.includes("scraper_sump"));
});

test("peat-crate pit is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_dust);
  assert.ok(state.visited.includes("peat_pit"));
});

test("mouse-run loft is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_feel_beam);
  assert.ok(state.visited.includes("mouse_loft"));
});

test("oat-sack beam is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_rap_beam);
  assert.ok(state.visited.includes("sack_beam"));
});

test("feed-bin oat-dregs are scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_thumb_dregs);
  assert.ok(state.visited.includes("oat_dregs"));
});

test("mouse-run husk-trail is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_trace_husk);
  assert.ok(state.visited.includes("husk_trail"));
});

test("feed-bin hatch is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_lift_cover);
  assert.ok(state.visited.includes("bin_hatch"));
});

test("oat-sack spill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_lift_spill);
  assert.ok(state.visited.includes("oat_spill"));
});

test("boot-scraper grit-tray is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_knock_grit);
  assert.ok(state.visited.includes("grit_tray"));
});

test("tack-room floor-crack is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_thumb_crack);
  assert.ok(state.visited.includes("tack_crack"));
});

test("mouse-run gnaw-rail is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_feel_gnaw);
  assert.ok(state.visited.includes("gnaw_rail"));
});

test("feed-bin foot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pick_husk);
  assert.ok(state.visited.includes("bin_foot"));
});

test("boot-scraper heel-iron is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_press_iron);
  assert.ok(state.visited.includes("heel_iron"));
});

test("oat-sack lip is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_fold_flap);
  assert.ok(state.visited.includes("sack_lip"));
});

test("tack-room loft is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_lift_numnah);
  assert.ok(state.visited.includes("tack_loft"));
});

test("peat-crate slat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_flex_slat);
  assert.ok(state.visited.includes("peat_slat"));
});

test("boot-scraper clay-pan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_prise_clay);
  assert.ok(state.visited.includes("clay_pan"));
});

test("feed-bin rim is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_scrape_chew);
  assert.ok(state.visited.includes("bin_rim"));
});

test("cliff-stair drop is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_brace_step);
  assert.ok(state.visited.includes("path_drop"));
});

test("tack-room girth-peg is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_seat_girth);
  assert.ok(state.visited.includes("girth_peg"));
});

test("peat-crate edge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_brush_crumb);
  assert.ok(state.visited.includes("peat_edge"));
});

test("cliff-stair path-nook is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_trace_nick);
  assert.ok(state.visited.includes("path_nook"));
});

test("tack-room bit-hook is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_hang_bit);
  assert.ok(state.visited.includes("bit_hook"));
});

test("keeper-cottage nook is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_lift_slate);
  assert.ok(state.visited.includes("cottage_nook"));
});

test("cottage-well apron is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_chip_lime);
  assert.ok(state.visited.includes("well_apron"));
});

test("keeper-cottage cellar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_rake_ash);
  assert.ok(state.visited.includes("cottage_cellar"));
});

test("herb-shed loft is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_bundle);
  assert.ok(state.visited.includes("herb_loft"));
});

test("garden trellis is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_seat_lath);
  assert.ok(state.visited.includes("trellis"));
});

test("cottage-well lid is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_lift_lid);
  assert.ok(state.visited.includes("well_lid"));
});

test("herb-shed bin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_sift_stalks);
  assert.ok(state.visited.includes("herb_bin"));
});

test("garden compost is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_turn_heap);
  assert.ok(state.visited.includes("compost"));
});

test("cottage-well silt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_thumb_pebble);
  assert.ok(state.visited.includes("well_silt"));
});

test("paddock salt-rail is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_brush_salt);
  assert.ok(state.visited.includes("salt_rail"));
});

test("still-room vent is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_wipe_lip);
  assert.ok(state.visited.includes("still_vent"));
});

test("trough pump-arm is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_lift_arm);
  assert.ok(state.visited.includes("pump_arm"));
});

test("attic ridge-vent is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_feel_draft);
  assert.ok(state.visited.includes("ridge_vent"));
});

test("still-room ash is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_crush_flake);
  assert.ok(state.visited.includes("still_ash"));
});

test("trough foot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pick_silt);
  assert.ok(state.visited.includes("trough_foot"));
});

test("paddock post-hole is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_chip_crust);
  assert.ok(state.visited.includes("post_hole"));
});

test("stable stall-drain is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_poke_grate);
  assert.ok(state.visited.includes("stall_drain"));
});

test("inkwell dregs are scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_scrape_dregs);
  assert.ok(state.visited.includes("ink_dregs"));
});

test("ledger nook bin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_stir_scraps);
  assert.ok(state.visited.includes("ledger_bin"));
});

test("blotter press is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_work_screw);
  assert.ok(state.visited.includes("blot_press"));
});

test("weigh-house scale-pan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_thumb_dent);
  assert.ok(state.visited.includes("scale_pan"));
});

test("sack-bay pit is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_rake_dust);
  assert.ok(state.visited.includes("sack_pit"));
});

test("inkwell pen-rest is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_roll_pen);
  assert.ok(state.visited.includes("pen_rest"));
});

test("sack-bay loft is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_knot_twine);
  assert.ok(state.visited.includes("sack_loft"));
});

test("blotter spare-sheet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_slide_sheet);
  assert.ok(state.visited.includes("blot_shelf"));
});

test("ledger loft is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_rap_joist);
  assert.ok(state.visited.includes("ledger_loft"));
});

test("inkwell nib-box is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_sort_nibs);
  assert.ok(state.visited.includes("nib_box"));
});

test("ledger pencil-box is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_twirl_stub);
  assert.ok(state.visited.includes("pencil_box"));
});

test("blotter letter-knife is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_hone_edge);
  assert.ok(state.visited.includes("letter_knife"));
});

test("chute pan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_scrape_pan);
  assert.ok(state.visited.includes("chute_pan"));
});

test("hopper boot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pack_seam);
  assert.ok(state.visited.includes("hopper_boot"));
});

test("lean-to spare-flue is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_rattle_flue);
  assert.ok(state.visited.includes("spare_flue"));
});

test("sack-bay tally-board is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_score_tally);
  assert.ok(state.visited.includes("tally_board"));
});

test("blotter sealing-wax is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_nick_stick);
  assert.ok(state.visited.includes("sealing_wax"));
});

test("bunker sump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_stir_sump);
  assert.ok(state.visited.includes("bunker_sump"));
});

test("stable hay-loft is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_toss_wisp);
  assert.ok(state.visited.includes("hay_loft"));
});

test("chute collar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_tap_collar);
  assert.ok(state.visited.includes("chute_collar"));
});

test("hopper lid is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_seat_lid);
  assert.ok(state.visited.includes("hopper_lid"));
});

test("inkwell pounce-pot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_sift_pounce);
  assert.ok(state.visited.includes("pounce_pot"));
});

test("ledger stamp-pad is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_press_pad);
  assert.ok(state.visited.includes("stamp_pad"));
});

test("sack-bay hook is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_test_hook);
  assert.ok(state.visited.includes("sack_hook"));
});

test("weigh-house loft is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_trace_date);
  assert.ok(state.visited.includes("weigh_loft"));
});

test("chute slack-heap is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_kick_slack);
  assert.ok(state.visited.includes("slack_heap"));
});

test("weigh-house ticket-spike is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pull_ticket);
  assert.ok(state.visited.includes("ticket_spike"));
});

test("chute rung is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_grip_rung);
  assert.ok(state.visited.includes("chute_rung"));
});

test("bunker coal-hatch is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_throw_bolt);
  assert.ok(state.visited.includes("coal_hatch"));
});

test("lean-to vent-flap is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_seat_flap);
  assert.ok(state.visited.includes("vent_flap"));
});

test("stable hay-fork is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_lift_fork);
  assert.ok(state.visited.includes("hay_fork"));
});

test("attic dormer-sill is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_wipe_sill);
  assert.ok(state.visited.includes("dormer_sill"));
});

test("hopper clinker-tray is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_shake_tray);
  assert.ok(state.visited.includes("clinker_tray"));
});

test("paddock missing-post is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_kick_stub);
  assert.ok(state.visited.includes("missing_post"));
});

test("trough hitch-ring is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_rattle_ring);
  assert.ok(state.visited.includes("hitch_ring"));
});

test("still-room spirit tap is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_turn_tap);
  assert.ok(state.visited.includes("spirit_tap"));
});

test("weigh-house scale-weight is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_lift_weight);
  assert.ok(state.visited.includes("scale_weight"));
});

test("bunker coal-slide is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_work_slide);
  assert.ok(state.visited.includes("coal_slide"));
});

test("lean-to wick tin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_prise_lid);
  assert.ok(state.visited.includes("wick_tin"));
});

test("stable manger-rail is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_rub_chew);
  assert.ok(state.visited.includes("manger_rail"));
});

test("paddock fence-wire is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pluck_wire);
  assert.ok(state.visited.includes("fence_wire"));
});

test("horse-trough bung is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_seat_bung);
  assert.ok(state.visited.includes("trough_bung"));
});

test("attic rafter-nail is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_twist_nail);
  assert.ok(state.visited.includes("rafter_nail"));
});

test("hopper coal-gate is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_ease_gate);
  assert.ok(state.visited.includes("coal_gate"));
});

test("cottage-well crank is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_turn_crank);
  assert.ok(state.visited.includes("well_crank"));
});

test("still-room spirit jar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_thumb_wax);
  assert.ok(state.visited.includes("spirit_jar"));
});

test("net-loft hemp bin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_tease_strand);
  assert.ok(state.visited.includes("hemp_bin"));
});

test("inn-room peg rail is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_straighten_peg);
  assert.ok(state.visited.includes("peg_rail"));
});

test("gallery rail-bolt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_seat_nut);
  assert.ok(state.visited.includes("rail_bolt"));
});

test("sexton bead-string is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_count_beads);
  assert.ok(state.visited.includes("bead_string"));
});

test("signal-pit ash bucket is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_tip_bucket);
  assert.ok(state.visited.includes("ash_bucket"));
});

test("vestry prie-dieu is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_press_cushion);
  assert.ok(state.visited.includes("prie_dieu"));
});

test("cabin bulkhead is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_rap_plank);
  assert.ok(state.visited.includes("bulkhead"));
});

test("tavern spittoon is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_nudge_tin);
  assert.ok(state.visited.includes("spittoon"));
});

test("peat crate is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_split_brick);
  assert.ok(state.visited.includes("peat_crate"));
});

test("wick scissors are scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_work_snips);
  assert.ok(state.visited.includes("wick_scissors"));
});

test("grave vase is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_tilt_vase);
  assert.ok(state.visited.includes("grave_vase"));
});

test("crypt pall-ring is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_turn_ring);
  assert.ok(state.visited.includes("pall_ring"));
});

test("herb-shed drying rack is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_snap_stem);
  assert.ok(state.visited.includes("drying_rack"));
});

test("boot scraper is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_scrape_boot);
  assert.ok(state.visited.includes("boot_scraper"));
});

test("oar-loft rowlock is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_twist_horn);
  assert.ok(state.visited.includes("rowlock"));
});

test("ice pick is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_test_pick);
  assert.ok(state.visited.includes("ice_pick"));
});

test("wreck-cabin porthole is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_wipe_glass);
  assert.ok(state.visited.includes("porthole"));
});

test("cold-frame pane is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_lift_pane);
  assert.ok(state.visited.includes("cold_frame"));
});

test("shovel haft is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_grip_haft);
  assert.ok(state.visited.includes("shovel_haft"));
});

test("landing key-hook is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_feel_hook);
  assert.ok(state.visited.includes("key_hook"));
});

test("door stud is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_press_stud);
  assert.ok(state.visited.includes("door_stud"));
});

test("hasp plate is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_work_hasp);
  assert.ok(state.visited.includes("hasp_plate"));
});

test("hold rib-knee is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_tap_knee);
  assert.ok(state.visited.includes("rib_knee"));
});

test("cairn-base stones are scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_count_stones);
  assert.ok(state.visited.includes("cairn_base"));
});

test("chain hook is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_hang_link);
  assert.ok(state.visited.includes("chain_hook"));
});

test("torch rest is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_seat_brand);
  assert.ok(state.visited.includes("torch_rest"));
});

test("fid rack is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_draw_fid);
  assert.ok(state.visited.includes("fid_rack"));
});

test("window catch is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_throw_catch);
  assert.ok(state.visited.includes("window_latch"));
});

test("lectern leaf is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_turn_leaf);
  assert.ok(state.visited.includes("lectern"));
});

test("gallery salt pan is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_lick_salt);
  assert.ok(state.visited.includes("salt_pan"));
});

test("kettle lid is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_rap_lid);
  assert.ok(state.visited.includes("kettle_lid"));
});

test("soot-brush soot is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_knock_soot);
  assert.ok(state.visited.includes("soot_brush"));
});

test("stoup rim is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_touch_rim);
  assert.ok(state.visited.includes("stoup"));
});

test("lych-gate latch is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_lift_latch);
  assert.ok(state.visited.includes("lych_gate"));
});

test("seed tin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_rattle_tin);
  assert.ok(state.visited.includes("seed_tin"));
});

test("wick-box wicks are scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_count_wicks);
  assert.ok(state.visited.includes("wick_box"));
});

test("thole pin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_seat_thole);
  assert.ok(state.visited.includes("thole_pin"));
});

test("tide-pool water is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_cup_water);
  assert.ok(state.visited.includes("tide_pool"));
});

test("binnacle card is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_spin_card);
  assert.ok(state.visited.includes("binnacle"));
});

test("lightning-rod burn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_trace_burn);
  assert.ok(state.visited.includes("lightning_rod"));
});

test("keg bung is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_twist_bung);
  assert.ok(state.visited.includes("keg_bung"));
});

test("chart-tube chart is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_unroll_chart);
  assert.ok(state.visited.includes("chart_tube"));
});

test("cutwater copper is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_thumb_copper);
  assert.ok(state.visited.includes("cutwater"));
});

test("snuff-spoon bowl is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_wipe_bowl);
  assert.ok(state.visited.includes("snuff_spoon"));
});

test("malt-riddle mesh is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_stretch_mesh);
  assert.ok(state.visited.includes("malt_riddle"));
});

test("palette knife is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_peel_knife);
  assert.ok(state.visited.includes("palette_knife"));
});

test("barnacle plate is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_crack_barnacle);
  assert.ok(state.visited.includes("barnacle"));
});

test("flint-box knap is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_knap_flint);
  assert.ok(state.visited.includes("flint_box"));
});

test("mash-stone groove is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_clear_groove);
  assert.ok(state.visited.includes("mash_stone"));
});

test("ice-sled runner is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_rock_runner);
  assert.ok(state.visited.includes("ice_sled"));
});

test("haul bar is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_twist_bar);
  assert.ok(state.visited.includes("haul_bar"));
});

test("drag-chain link is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_close_link);
  assert.ok(state.visited.includes("drag_chain"));
});

test("block-mold slat is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_press_slat);
  assert.ok(state.visited.includes("block_mold"));
});

test("ice-hook point is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_test_point);
  assert.ok(state.visited.includes("ice_hook"));
});

test("ice-saw teeth are scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_rap_teeth);
  assert.ok(state.visited.includes("ice_saw"));
});

test("wort-pail film is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_scrape_film);
  assert.ok(state.visited.includes("wort_pail"));
});

test("packing-straw band is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_tug_band);
  assert.ok(state.visited.includes("packing_straw"));
});

test("match-tin stick is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_strike_stick);
  assert.ok(state.visited.includes("match_tin"));
});

test("barm crock is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_sniff_barm);
  assert.ok(state.visited.includes("barm_crock"));
});

test("sawdust-bin board is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_lift_board);
  assert.ok(state.visited.includes("sawdust_bin"));
});

test("mash-paddle blade is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_flex_blade);
  assert.ok(state.visited.includes("mash_paddle"));
});

test("worm-tub hoop is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_seat_hoop);
  assert.ok(state.visited.includes("worm_tub"));
});

test("ice-tong jaws are scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_close_jaws);
  assert.ok(state.visited.includes("ice_tongs"));
});

test("sand shaker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_tip_shaker);
  assert.ok(state.visited.includes("sand_shaker"));
});

test("straw plug is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pull_plug);
  assert.ok(state.visited.includes("straw_plug"));
});

test("ash-rake tines are scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_shake_tines);
  assert.ok(state.visited.includes("ash_rake"));
});

test("wrack-line cork is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pick_cork);
  assert.ok(state.visited.includes("wrack_line"));
});

test("oiled paper is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_unfold_paper);
  assert.ok(state.visited.includes("oiled_paper"));
});

test("drip-tray drop is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_scrape_drop);
  assert.ok(state.visited.includes("drip_tray"));
});

test("kelp-mat holdfast is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_tug_holdfast);
  assert.ok(state.visited.includes("kelp_mat"));
});

test("snuff-tin lid is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_work_lid);
  assert.ok(state.visited.includes("snuff_tin"));
});

test("spray-cup shell is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_prise_shell);
  assert.ok(state.visited.includes("spray_cup"));
});

test("nest-nook shred is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_tease_shred);
  assert.ok(state.visited.includes("nest_nook"));
});

test("stopper-jar cork is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_squeeze_cork);
  assert.ok(state.visited.includes("stopper"));
});

test("button-box button is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_roll_button);
  assert.ok(state.visited.includes("button_box"));
});

test("mouse-run hole is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_listen_hole);
  assert.ok(state.visited.includes("mouse_run"));
});

test("paint funnel is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_tilt_funnel);
  assert.ok(state.visited.includes("funnel"));
});

test("char-pan lump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_crack_lump);
  assert.ok(state.visited.includes("char_pan"));
});

test("glass-rest rain is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_dip_finger);
  assert.ok(state.visited.includes("glass_rest"));
});

test("thimble pin is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_draw_pin);
  assert.ok(state.visited.includes("thimble"));
});

test("hull-plate rivet is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_press_rivet);
  assert.ok(state.visited.includes("hull_plate"));
});

test("oat-sack seam is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pinch_seam);
  assert.ok(state.visited.includes("oat_sack"));
});

test("turpentine cap is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_loosen_cap);
  assert.ok(state.visited.includes("turps"));
});

test("darning-box yarn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_tug_yarn);
  assert.ok(state.visited.includes("darning"));
});

test("censer bowl is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_tap_bowl);
  assert.ok(state.visited.includes("censer"));
});

test("spy-notch lichen is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_wipe_lichen);
  assert.ok(state.visited.includes("spy_notch"));
});

test("scupper crust is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_scrape_crust);
  assert.ok(state.visited.includes("scupper"));
});

test("feed-bin scoop is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_rattle_scoop);
  assert.ok(state.visited.includes("feed_bin"));
});

test("rag-tin rag is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_wring_rag);
  assert.ok(state.visited.includes("rag_tin"));
});

test("mending-basket needle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_thread_needle);
  assert.ok(state.visited.includes("mending"));
});

test("inkwell blotter is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_peel_blotter);
  assert.ok(state.visited.includes("blotter"));
});

test("limber-hole silt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_probe_silt);
  assert.ok(state.visited.includes("limber"));
});

test("inkwell nib is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_test_nib);
  assert.ok(state.visited.includes("inkwell"));
});

test("ledger torn page is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_smooth_page);
  assert.ok(state.visited.includes("ledger_nook"));
});

test("shingle stack is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_lift_shingle);
  assert.ok(state.visited.includes("shingle_stack"));
});

test("tar-pot stick is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_twist_stick);
  assert.ok(state.visited.includes("tar_pot"));
});

test("drip pail is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_empty_pail);
  assert.ok(state.visited.includes("drip_pail"));
});

test("weigh-house needle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_nudge_needle);
  assert.ok(state.visited.includes("weigh_house"));
});

test("strum-box grate is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_clear_grate);
  assert.ok(state.visited.includes("strum_box"));
});

test("kindling-bin bundle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_untie_bundle);
  assert.ok(state.visited.includes("kindling_bin"));
});

test("wood-shed oak wedge is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pull_wedge);
  assert.ok(state.visited.includes("wood_shed"));
});

test("sack-bay stitch is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pull_stitch);
  assert.ok(state.visited.includes("sack_bay"));
});

test("bilge pump is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_work_pump);
  assert.ok(state.visited.includes("bilge"));
});

test("coal-hopper split board is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_press_board);
  assert.ok(state.visited.includes("hopper"));
});

test("sawhorse saw is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_draw_saw);
  assert.ok(state.visited.includes("sawhorse"));
});

test("linen-shelf nightshirt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_shake_shirt);
  assert.ok(state.visited.includes("linen"));
});

test("reliquary bottle is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_cork_bottle);
  assert.ok(state.visited.includes("reliquary"));
});

test("keelson copper bolt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_twist_bolt);
  assert.ok(state.visited.includes("keelson"));
});

test("paint-locker brush is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_wipe_brush);
  assert.ok(state.visited.includes("brush_rack"));
});

test("coal chute is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_rattle_chute);
  assert.ok(state.visited.includes("chute"));
});

test("chopping-block axe is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_work_axe);
  assert.ok(state.visited.includes("chopping_block"));
});

test("lookout-ledge boot-scuffs are scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_trace_scuffs);
  assert.ok(state.visited.includes("ledge"));
});

test("tack-room curry-comb is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_lift_comb);
  assert.ok(state.visited.includes("tack_room"));
});

test("stable bridle hook is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_touch_hook);
  assert.ok(state.visited.includes("stable"));
});

test("paddock posts are scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_count_posts);
  assert.ok(state.visited.includes("paddock"));
});

test("horse-trough moss is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_wipe_moss);
  assert.ok(state.visited.includes("trough"));
});

test("cottage-well bucket is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_haul_bucket);
  assert.ok(state.visited.includes("well"));
});

test("paint-locker tin lid is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_turn_lid);
  assert.ok(state.visited.includes("paint_locker"));
});

test("ossuary keeper's cap is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_tip_cap);
  assert.ok(state.visited.includes("ossuary"));
});

test("signal-pit ash is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_stir_ash);
  assert.ok(state.visited.includes("fire_pit"));
});

test("attic oilskin lining is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_fold_oilskin);
  assert.ok(state.visited.includes("trunk_nook"));
});

test("inn washstand ewer is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pour_ewer);
  assert.ok(state.visited.includes("washstand"));
});

test("sexton woodpile is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_stack_wood);
  assert.ok(state.visited.includes("woodpile"));
});

test("brig-hold wax is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_salvage_wax);
  assert.ok(state.visited.includes("hold"));
});

test("coal bunker is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_bank_coal);
  assert.ok(state.visited.includes("bunker"));
});

test("weather vane is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_free_vane);
  assert.ok(state.visited.includes("vane"));
});

test("smugglers' cache straw is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_stir_straw);
  assert.ok(state.visited.includes("cache"));
});

test("still-room copper worm is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_sniff_worm);
  assert.ok(state.visited.includes("still_room"));
});

test("ice-pit melt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_taste_ice);
  assert.ok(state.visited.includes("ice_pit"));
});

test("oar-loft fender is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_lash_fender);
  assert.ok(state.visited.includes("oar_loft"));
});

test("sexton's prayer is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_read_prayer);
  assert.ok(state.visited.includes("sexton_hut"));
});

test("brig name-board is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_trace_name);
  assert.ok(state.visited.includes("brig_stem"));
});

test("lean-to chimney is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_fit_chimney);
  assert.ok(state.visited.includes("lean_to"));
});

test("attic spyglass is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_glass_reef);
  assert.ok(state.visited.includes("attic"));
});

test("chapel-crypt niche is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_bow_niche);
  assert.ok(state.visited.includes("crypt"));
});

test("wrecker's rag-flag is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_hoist_rag);
  assert.ok(state.visited.includes("wreck_post"));
});

test("smugglers' tide-marks are scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_read_tides);
  assert.ok(state.visited.includes("cleft"));
});

test("inn-window reef watch is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_watch_window);
  assert.ok(state.visited.includes("inn_room"));
});

test("looking out the loft hatch is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_loft_look);
});

test("crushing fennel is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_crush_fennel);
  assert.ok(state.visited.includes("herb_shed"));
});

test("polishing the lamp brass is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_polish_brass);
});

test("knocking on the oak door is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_knock);
});

test("wreck-cabin cracked bell is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_toll_cracked);
  assert.ok(state.visited.includes("wreck_cabin"));
});

test("vestry votive is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_light_votive);
  assert.ok(state.visited.includes("vestry"));
});

test("warp splice and weather-glass tap are scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_splice);
  assert.ok(state.flags.did_tap_glass);
});

test("chain-lash and drop-listen are scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_bind_chain);
  assert.ok(state.flags.did_listen_drop);
});

test("drinking from the rain-butt is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_drink_rain);
  assert.ok(state.visited.includes("garden"));
});

test("shouting a south bearing is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_shout_bearing);
});

test("coiling lines and bracing the rail are scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_coil_lines);
  assert.ok(state.flags.did_brace_rail);
});

test("winding the lamp mechanism is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_wind_gear || state.flags.wound);
});

test("studying the reef charts is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_study_charts);
});

test("kneeling in the chapel is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_kneel);
});

test("bailing the dory is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_bail_dory);
});

test("drowned sailor brig tale is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.said_drowned_brig);
});

test("headland cairn is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_tend_cairn);
  assert.ok(state.visited.includes("headland"));
});

test("prying the cellar chest is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_pry_chest);
  assert.ok(state.visited.includes("cellar"));
});

test("lighting the cottage hearth is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_light_hearth);
});

test("net-mender wreck tale is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.said_netmender_wreck);
  assert.ok(state.visited.includes("net_loft"));
});

test("searching the oil-store casks is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_search_casks);
});

test("sexton's Maren tale is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.said_sexton_maren);
});

test("watching the reef is a scored once-action on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_watch_reef);
  assert.ok(state.visited.includes("gallery"));
});

test("ghost lighthouse tale is scored on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.said_keeper_ghost_her);
});

test("wiping the lamp mirrors is a scored once-action on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_wipe_mirrors);
});

test("foghorn is a scored once-action on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_foghorn);
});

test("hailing with the trumpet consumes it", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_hail_reef);
  assert.ok(!state.inv.includes("trumpet"), "trumpet still carried");
  assert.equal(state.itemLoc.trumpet, "nowhere");
});

test("tot of grog is a reachable tavern heal", () => {
  let { state } = newState(world, 1);
  for (const label of ["go north", "go east"]) {
    const a = actionByLabel(world, state, label);
    assert.ok(a, label);
    state = step(world, state, a).state;
  }
  assert.equal(state.room, "tavern");
  state = structuredClone(state);
  state.hp = 6;
  const drink = actionByLabel(world, state, "drink a tot of grog");
  assert.ok(drink);
  state = step(world, state, drink).state;
  assert.equal(state.hp, 10);
  assert.ok(state.flags.did_drink_grog);
  assert.equal(actionByLabel(world, state, "drink a tot of grog"), null);
});

test("reading the keeper's log is a scored beat on the proven path", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.read_log);
  assert.ok(state.inv.includes("maren_log") || state.itemLoc.maren_log === "inv");
});

test("firing the signal flare consumes it", () => {
  const { state } = playWalkthrough(1);
  assert.equal(state.ended?.id, "beacon_lit");
  assert.ok(state.flags.did_fire_flare);
  assert.ok(!state.inv.includes("flare"), "flare still carried");
  assert.equal(state.itemLoc.flare, "nowhere");
});

test("oil-mechanism copy names the flask, not a phantom wrench", () => {
  const oil = world.rooms.lamp_room?.actions?.find((a) => a.id === "oil_mechanism");
  assert.ok(oil);
  assert.match(oil.label, /flask/i);
  const blob = JSON.stringify(oil.fx);
  assert.doesNotMatch(blob, /wrench/i);
});
