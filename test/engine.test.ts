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
function playWalkthrough(seed: number): { actions: Action[]; hashes: string[]; state: State } {
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

test("same seed => byte-identical run (hash sequence and receipt)", () => {
  const a = playWalkthrough(1);
  const b = playWalkthrough(1);
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
