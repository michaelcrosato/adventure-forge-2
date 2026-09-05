/**
 * Growth pins: the shipped lighthouse must be larger than the 9-room / 55-point
 * snapshot, and the walkthrough must actually visit the new surface.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { actionByLabel, condOk, newState, step } from "../src/engine.ts";
import { loadWorldUrl, replayWalkthrough, validateWorld } from "../src/validate.ts";
import type { World } from "../src/types.ts";

const world: World = loadWorldUrl(new URL("../world/lighthouse.json", import.meta.url));

test("shipped world has grown past the 9-room 55-point snapshot", () => {
  const rooms = Object.keys(world.rooms).length;
  assert.ok(rooms > 9, `rooms ${rooms} — need more than the original 9`);
  assert.ok(world.maxScore > 55, `maxScore ${world.maxScore} — need more than the original 55`);
});

test("walkthrough still wins with score === maxScore after growth", () => {
  assert.deepEqual(validateWorld(world), []);
  const r = replayWalkthrough(world, 1);
  assert.equal(r.error, undefined);
  assert.equal(r.state?.ended?.kind, "win");
  assert.equal(r.state?.ended?.id, "beacon_lit");
  assert.equal(r.state?.score, world.maxScore);
});

test("walkthrough includes pinching the rust-colcothar colcothar", () => {
  assert.ok(world.rooms.rust_colcothar, "rust_colcothar room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the colcothar"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hematite hematite", () => {
  assert.ok(world.rooms.rust_hematite, "rust_hematite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hematite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-carborundum carborundum", () => {
  assert.ok(world.rooms.rust_carborundum, "rust_carborundum room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the carborundum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-grindstone grindstone", () => {
  assert.ok(world.rooms.rust_grindstone, "rust_grindstone room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the grindstone"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-whetstone whetstone", () => {
  assert.ok(world.rooms.rust_whetstone, "rust_whetstone room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the whetstone"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-granite granite", () => {
  assert.ok(world.rooms.rust_granite, "rust_granite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the granite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-basalt basalt", () => {
  assert.ok(world.rooms.rust_basalt, "rust_basalt room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the basalt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-obsidian obsidian", () => {
  assert.ok(world.rooms.rust_obsidian, "rust_obsidian room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the obsidian"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-jasper jasper", () => {
  assert.ok(world.rooms.rust_jasper, "rust_jasper room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the jasper"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-agate agate", () => {
  assert.ok(world.rooms.rust_agate, "rust_agate room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the agate"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-flint flint", () => {
  assert.ok(world.rooms.rust_flint, "rust_flint room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the flint"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-slatepowder slatepowder", () => {
  assert.ok(world.rooms.rust_slatepowder, "rust_slatepowder room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the slatepowder"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-spanishwhite spanishwhite", () => {
  assert.ok(world.rooms.rust_spanishwhite, "rust_spanishwhite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the spanishwhite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-terraalba terraalba", () => {
  assert.ok(world.rooms.rust_terraalba, "rust_terraalba room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the terraalba"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kieselguhr kieselguhr", () => {
  assert.ok(world.rooms.rust_kieselguhr, "rust_kieselguhr room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kieselguhr"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-meerschaum meerschaum", () => {
  assert.ok(world.rooms.rust_meerschaum, "rust_meerschaum room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the meerschaum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-steatite steatite", () => {
  assert.ok(world.rooms.rust_steatite, "rust_steatite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the steatite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-marble marble", () => {
  assert.ok(world.rooms.rust_marble, "rust_marble room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the marble"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-limestone limestone", () => {
  assert.ok(world.rooms.rust_limestone, "rust_limestone room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the limestone"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-puttypowder puttypowder", () => {
  assert.ok(world.rooms.rust_puttypowder, "rust_puttypowder room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the puttypowder"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-crocus crocus", () => {
  assert.ok(world.rooms.rust_crocus, "rust_crocus room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the crocus"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-garnet garnet", () => {
  assert.ok(world.rooms.rust_garnet, "rust_garnet room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the garnet"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-quartz quartz", () => {
  assert.ok(world.rooms.rust_quartz, "rust_quartz room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the quartz"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-feldspar feldspar", () => {
  assert.ok(world.rooms.rust_feldspar, "rust_feldspar room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the feldspar"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-diatomite diatomite", () => {
  assert.ok(world.rooms.rust_diatomite, "rust_diatomite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the diatomite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-soapstone soapstone", () => {
  assert.ok(world.rooms.rust_soapstone, "rust_soapstone room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the soapstone"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-calcite calcite", () => {
  assert.ok(world.rooms.rust_calcite, "rust_calcite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the calcite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-alabaster alabaster", () => {
  assert.ok(world.rooms.rust_alabaster, "rust_alabaster room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the alabaster"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pariswhite pariswhite", () => {
  assert.ok(world.rooms.rust_pariswhite, "rust_pariswhite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pariswhite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-fullersearth fullersearth", () => {
  assert.ok(world.rooms.rust_fullersearth, "rust_fullersearth room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the fullersearth"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tripoli tripoli", () => {
  assert.ok(world.rooms.rust_tripoli, "rust_tripoli room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tripoli"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rottenstone rottenstone", () => {
  assert.ok(world.rooms.rust_rottenstone, "rust_rottenstone room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rottenstone"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-dolomite dolomite", () => {
  assert.ok(world.rooms.rust_dolomite, "rust_dolomite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the dolomite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bentonite bentonite", () => {
  assert.ok(world.rooms.rust_bentonite, "rust_bentonite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bentonite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-megilp megilp", () => {
  assert.ok(world.rooms.rust_megilp, "rust_megilp room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the megilp"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-siccative siccative", () => {
  assert.ok(world.rooms.rust_siccative, "rust_siccative room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the siccative"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-drier drier", () => {
  assert.ok(world.rooms.rust_drier, "rust_drier room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the drier"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-strontia strontia", () => {
  assert.ok(world.rooms.rust_strontia, "rust_strontia room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the strontia"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-celestine celestine", () => {
  assert.ok(world.rooms.rust_celestine, "rust_celestine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the celestine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-magnesia magnesia", () => {
  assert.ok(world.rooms.rust_magnesia, "rust_magnesia room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the magnesia"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-alumina alumina", () => {
  assert.ok(world.rooms.rust_alumina, "rust_alumina room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the alumina"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-corundum corundum", () => {
  assert.ok(world.rooms.rust_corundum, "rust_corundum room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the corundum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-emery emery", () => {
  assert.ok(world.rooms.rust_emery, "rust_emery room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the emery"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pumice pumice", () => {
  assert.ok(world.rooms.rust_pumice, "rust_pumice room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pumice"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-silica silica", () => {
  assert.ok(world.rooms.rust_silica, "rust_silica room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the silica"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mica mica", () => {
  assert.ok(world.rooms.rust_mica, "rust_mica room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mica"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-talc talc", () => {
  assert.ok(world.rooms.rust_talc, "rust_talc room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the talc"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kaolin kaolin", () => {
  assert.ok(world.rooms.rust_kaolin, "rust_kaolin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kaolin"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-leadwhite leadwhite", () => {
  assert.ok(world.rooms.rust_leadwhite, "rust_leadwhite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the leadwhite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lithopone lithopone", () => {
  assert.ok(world.rooms.rust_lithopone, "rust_lithopone room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lithopone"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-blancfixe blancfixe", () => {
  assert.ok(world.rooms.rust_blancfixe, "rust_blancfixe room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the blancfixe"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-barytes barytes", () => {
  assert.ok(world.rooms.rust_barytes, "rust_barytes room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the barytes"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-zincwhite zincwhite", () => {
  assert.ok(world.rooms.rust_zincwhite, "rust_zincwhite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the zincwhite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-flakewhite flakewhite", () => {
  assert.ok(world.rooms.rust_flakewhite, "rust_flakewhite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the flakewhite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-titanium titanium", () => {
  assert.ok(world.rooms.rust_titanium, "rust_titanium room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the titanium"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cadmium cadmium", () => {
  assert.ok(world.rooms.rust_cadmium, "rust_cadmium room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cadmium"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-madderlake madderlake", () => {
  assert.ok(world.rooms.rust_madderlake, "rust_madderlake room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the madderlake"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rosemadder rosemadder", () => {
  assert.ok(world.rooms.rust_rosemadder, "rust_rosemadder room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rosemadder"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-indianyellow indianyellow", () => {
  assert.ok(world.rooms.rust_indianyellow, "rust_indianyellow room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the indianyellow"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hansa hansa", () => {
  assert.ok(world.rooms.rust_hansa, "rust_hansa room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hansa"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-phthalo phthalo", () => {
  assert.ok(world.rooms.rust_phthalo, "rust_phthalo room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the phthalo"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-vermilion vermilion", () => {
  assert.ok(world.rooms.rust_vermilion, "rust_vermilion room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the vermilion"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-carmine carmine", () => {
  assert.ok(world.rooms.rust_carmine, "rust_carmine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the carmine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-alizarin alizarin", () => {
  assert.ok(world.rooms.rust_alizarin, "rust_alizarin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the alizarin"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-graphiteblack graphiteblack", () => {
  assert.ok(world.rooms.rust_graphiteblack, "rust_graphiteblack room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the graphiteblack"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-jetblack jetblack", () => {
  assert.ok(world.rooms.rust_jetblack, "rust_jetblack room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the jetblack"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-clarain clarain", () => {
  assert.ok(world.rooms.rust_clarain, "rust_clarain room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the clarain"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-durain durain", () => {
  assert.ok(world.rooms.rust_durain, "rust_durain room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the durain"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-vitrain vitrain", () => {
  assert.ok(world.rooms.rust_vitrain, "rust_vitrain room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the vitrain"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-fusain fusain", () => {
  assert.ok(world.rooms.rust_fusain, "rust_fusain room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the fusain"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cannel cannel", () => {
  assert.ok(world.rooms.rust_cannel, "rust_cannel room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cannel"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-anthracite anthracite", () => {
  assert.ok(world.rooms.rust_anthracite, "rust_anthracite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the anthracite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lampwick lampwick", () => {
  assert.ok(world.rooms.rust_lampwick, "rust_lampwick room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lampwick"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sootblack sootblack", () => {
  assert.ok(world.rooms.rust_sootblack, "rust_sootblack room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sootblack"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-carbon carbon", () => {
  assert.ok(world.rooms.rust_carbon, "rust_carbon room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the carbon"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-coal coal", () => {
  assert.ok(world.rooms.rust_coal, "rust_coal room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the coal"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-peat peat", () => {
  assert.ok(world.rooms.rust_peat, "rust_peat room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the peat"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lignite lignite", () => {
  assert.ok(world.rooms.rust_lignite, "rust_lignite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lignite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-coke coke", () => {
  assert.ok(world.rooms.rust_coke, "rust_coke room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the coke"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-charcoal charcoal", () => {
  assert.ok(world.rooms.rust_charcoal, "rust_charcoal room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the charcoal"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-vinechar vinechar", () => {
  assert.ok(world.rooms.rust_vinechar, "rust_vinechar room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the vinechar"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cassel cassel", () => {
  assert.ok(world.rooms.rust_cassel, "rust_cassel room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cassel"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sepia sepia", () => {
  assert.ok(world.rooms.rust_sepia, "rust_sepia room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sepia"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bistre bistre", () => {
  assert.ok(world.rooms.rust_bistre, "rust_bistre room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bistre"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-peachblack peachblack", () => {
  assert.ok(world.rooms.rust_peachblack, "rust_peachblack room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the peachblack"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-marsblack marsblack", () => {
  assert.ok(world.rooms.rust_marsblack, "rust_marsblack room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the marsblack"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-vineblack vineblack", () => {
  assert.ok(world.rooms.rust_vineblack, "rust_vineblack room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the vineblack"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ivoryblack ivoryblack", () => {
  assert.ok(world.rooms.rust_ivoryblack, "rust_ivoryblack room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ivoryblack"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-boneblack boneblack", () => {
  assert.ok(world.rooms.rust_boneblack, "rust_boneblack room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the boneblack"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-caput caput", () => {
  assert.ok(world.rooms.rust_caput, "rust_caput room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the caput"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-naples naples", () => {
  assert.ok(world.rooms.rust_naples, "rust_naples room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the naples"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-chrome chrome", () => {
  assert.ok(world.rooms.rust_chrome, "rust_chrome room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the chrome"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-viridian viridian", () => {
  assert.ok(world.rooms.rust_viridian, "rust_viridian room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the viridian"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cerulean cerulean", () => {
  assert.ok(world.rooms.rust_cerulean, "rust_cerulean room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cerulean"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cobalt cobalt", () => {
  assert.ok(world.rooms.rust_cobalt, "rust_cobalt room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cobalt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ultramarine ultramarine", () => {
  assert.ok(world.rooms.rust_ultramarine, "rust_ultramarine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ultramarine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-dividivi dividivi", () => {
  assert.ok(world.rooms.rust_dividivi, "rust_dividivi room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the dividivi"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-oakgall oakgall", () => {
  assert.ok(world.rooms.rust_oakgall, "rust_oakgall room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the oakgall"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-wattle wattle", () => {
  assert.ok(world.rooms.rust_wattle, "rust_wattle room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the wattle"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mangrove mangrove", () => {
  assert.ok(world.rooms.rust_mangrove, "rust_mangrove room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mangrove"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-quebracho quebracho", () => {
  assert.ok(world.rooms.rust_quebracho, "rust_quebracho room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the quebracho"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-myrobalan myrobalan", () => {
  assert.ok(world.rooms.rust_myrobalan, "rust_myrobalan room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the myrobalan"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-gallnut gallnut", () => {
  assert.ok(world.rooms.rust_gallnut, "rust_gallnut room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the gallnut"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sumac sumac", () => {
  assert.ok(world.rooms.rust_sumac, "rust_sumac room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sumac"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-catechu catechu", () => {
  assert.ok(world.rooms.rust_catechu, "rust_catechu room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the catechu"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cutch cutch", () => {
  assert.ok(world.rooms.rust_cutch, "rust_cutch room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cutch"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-annotto annotto", () => {
  assert.ok(world.rooms.rust_annotto, "rust_annotto room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the annotto"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-fustic fustic", () => {
  assert.ok(world.rooms.rust_fustic, "rust_fustic room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the fustic"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-litmus litmus", () => {
  assert.ok(world.rooms.rust_litmus, "rust_litmus room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the litmus"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-orchil orchil", () => {
  assert.ok(world.rooms.rust_orchil, "rust_orchil room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the orchil"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-alkanet alkanet", () => {
  assert.ok(world.rooms.rust_alkanet, "rust_alkanet room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the alkanet"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-henna henna", () => {
  assert.ok(world.rooms.rust_henna, "rust_henna room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the henna"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-turmeric turmeric", () => {
  assert.ok(world.rooms.rust_turmeric, "rust_turmeric room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the turmeric"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-saffron saffron", () => {
  assert.ok(world.rooms.rust_saffron, "rust_saffron room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the saffron"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-safflower safflower", () => {
  assert.ok(world.rooms.rust_safflower, "rust_safflower room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the safflower"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-minium minium", () => {
  assert.ok(world.rooms.rust_minium, "rust_minium room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the minium"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ceruse ceruse", () => {
  assert.ok(world.rooms.rust_ceruse, "rust_ceruse room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ceruse"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-massicot massicot", () => {
  assert.ok(world.rooms.rust_massicot, "rust_massicot room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the massicot"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-litharge litharge", () => {
  assert.ok(world.rooms.rust_litharge, "rust_litharge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the litharge"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cinnabar cinnabar", () => {
  assert.ok(world.rooms.rust_cinnabar, "rust_cinnabar room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cinnabar"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-realgar realgar", () => {
  assert.ok(world.rooms.rust_realgar, "rust_realgar room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the realgar"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-logwood logwood", () => {
  assert.ok(world.rooms.rust_logwood, "rust_logwood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the logwood"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-brazilwood brazilwood", () => {
  assert.ok(world.rooms.rust_brazilwood, "rust_brazilwood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the brazilwood"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cochineal cochineal", () => {
  assert.ok(world.rooms.rust_cochineal, "rust_cochineal room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cochineal"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kermes kermes", () => {
  assert.ok(world.rooms.rust_kermes, "rust_kermes room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kermes"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-madder madder", () => {
  assert.ok(world.rooms.rust_madder, "rust_madder room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the madder"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-woad woad", () => {
  assert.ok(world.rooms.rust_woad, "rust_woad room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the woad"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-indigo indigo", () => {
  assert.ok(world.rooms.rust_indigo, "rust_indigo room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the indigo"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-gamboge gamboge", () => {
  assert.ok(world.rooms.rust_gamboge, "rust_gamboge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the gamboge"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-malachite malachite", () => {
  assert.ok(world.rooms.rust_malachite, "rust_malachite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the malachite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-azurite azurite", () => {
  assert.ok(world.rooms.rust_azurite, "rust_azurite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the azurite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-orpiment orpiment", () => {
  assert.ok(world.rooms.rust_orpiment, "rust_orpiment room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the orpiment"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-verdigris verdigris", () => {
  assert.ok(world.rooms.rust_verdigris, "rust_verdigris room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the verdigris"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-terreverte terreverte", () => {
  assert.ok(world.rooms.rust_terreverte, "rust_terreverte room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the terreverte"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-verditer verditer", () => {
  assert.ok(world.rooms.rust_verditer, "rust_verditer room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the verditer"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-smalt smalt", () => {
  assert.ok(world.rooms.rust_smalt, "rust_smalt room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the smalt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bole bole", () => {
  assert.ok(world.rooms.rust_bole, "rust_bole room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bole"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-carrageen carrageen", () => {
  assert.ok(world.rooms.rust_carrageen, "rust_carrageen room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the carrageen"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-algin algin", () => {
  assert.ok(world.rooms.rust_algin, "rust_algin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the algin"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-carob carob", () => {
  assert.ok(world.rooms.rust_carob, "rust_carob room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the carob"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-locustbean locustbean", () => {
  assert.ok(world.rooms.rust_locustbean, "rust_locustbean room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the locustbean"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-dragonblood dragonblood", () => {
  assert.ok(world.rooms.rust_dragonblood, "rust_dragonblood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the dragonblood"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-labdanum labdanum", () => {
  assert.ok(world.rooms.rust_labdanum, "rust_labdanum room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the labdanum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-olibanum olibanum", () => {
  assert.ok(world.rooms.rust_olibanum, "rust_olibanum room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the olibanum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pectin pectin", () => {
  assert.ok(world.rooms.rust_pectin, "rust_pectin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pectin"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-xanthan xanthan", () => {
  assert.ok(world.rooms.rust_xanthan, "rust_xanthan room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the xanthan"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ghatti ghatti", () => {
  assert.ok(world.rooms.rust_ghatti, "rust_ghatti room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ghatti"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-karaya karaya", () => {
  assert.ok(world.rooms.rust_karaya, "rust_karaya room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the karaya"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-storax storax", () => {
  assert.ok(world.rooms.rust_storax, "rust_storax room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the storax"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-benzoin benzoin", () => {
  assert.ok(world.rooms.rust_benzoin, "rust_benzoin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the benzoin"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-myrrh myrrh", () => {
  assert.ok(world.rooms.rust_myrrh, "rust_myrrh room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the myrrh"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-frankincense frankincense", () => {
  assert.ok(world.rooms.rust_frankincense, "rust_frankincense room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the frankincense"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-colophony colophony", () => {
  assert.ok(world.rooms.rust_colophony, "rust_colophony room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the colophony"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-venice venice", () => {
  assert.ok(world.rooms.rust_venice, "rust_venice room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the venice"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-burgundy burgundy", () => {
  assert.ok(world.rooms.rust_burgundy, "rust_burgundy room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the burgundy"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pinegum pinegum", () => {
  assert.ok(world.rooms.rust_pinegum, "rust_pinegum room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pinegum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-galipot galipot", () => {
  assert.ok(world.rooms.rust_galipot, "rust_galipot room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the galipot"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rosin rosin", () => {
  assert.ok(world.rooms.rust_rosin, "rust_rosin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rosin"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tragacanth tragacanth", () => {
  assert.ok(world.rooms.rust_tragacanth, "rust_tragacanth room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tragacanth"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-gumarabic gumarabic", () => {
  assert.ok(world.rooms.rust_gumarabic, "rust_gumarabic room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the gumarabic"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-dextrin dextrin", () => {
  assert.ok(world.rooms.rust_dextrin, "rust_dextrin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the dextrin"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sizeglue sizeglue", () => {
  assert.ok(world.rooms.rust_sizeglue, "rust_sizeglue room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sizeglue"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-collodion collodion", () => {
  assert.ok(world.rooms.rust_collodion, "rust_collodion room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the collodion"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-riceglue riceglue", () => {
  assert.ok(world.rooms.rust_riceglue, "rust_riceglue room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the riceglue"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-wheatpaste wheatpaste", () => {
  assert.ok(world.rooms.rust_wheatpaste, "rust_wheatpaste room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the wheatpaste"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-starchpaste starchpaste", () => {
  assert.ok(world.rooms.rust_starchpaste, "rust_starchpaste room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the starchpaste"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-boneglue boneglue", () => {
  assert.ok(world.rooms.rust_boneglue, "rust_boneglue room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the boneglue"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hideglue hideglue", () => {
  assert.ok(world.rooms.rust_hideglue, "rust_hideglue room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hideglue"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-anime anime", () => {
  assert.ok(world.rooms.rust_anime, "rust_anime room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the anime"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-copalite copalite", () => {
  assert.ok(world.rooms.rust_copalite, "rust_copalite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the copalite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rabbitglue rabbitglue", () => {
  assert.ok(world.rooms.rust_rabbitglue, "rust_rabbitglue room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rabbitglue"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-fishglue fishglue", () => {
  assert.ok(world.rooms.rust_fishglue, "rust_fishglue room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the fishglue"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-casein casein", () => {
  assert.ok(world.rooms.rust_casein, "rust_casein room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the casein"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-isinglass isinglass", () => {
  assert.ok(world.rooms.rust_isinglass, "rust_isinglass room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the isinglass"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-distemper distemper", () => {
  assert.ok(world.rooms.rust_distemper, "rust_distemper room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the distemper"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-gesso gesso", () => {
  assert.ok(world.rooms.rust_gesso, "rust_gesso room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the gesso"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ambergris ambergris", () => {
  assert.ok(world.rooms.rust_ambergris, "rust_ambergris room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ambergris"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-spermaceti spermaceti", () => {
  assert.ok(world.rooms.rust_spermaceti, "rust_spermaceti room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the spermaceti"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-japanblack japanblack", () => {
  assert.ok(world.rooms.rust_japanblack, "rust_japanblack room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the japanblack"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tungoil tungoil", () => {
  assert.ok(world.rooms.rust_tungoil, "rust_tungoil room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tungoil"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-copaiba copaiba", () => {
  assert.ok(world.rooms.rust_copaiba, "rust_copaiba room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the copaiba"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-elemi elemi", () => {
  assert.ok(world.rooms.rust_elemi, "rust_elemi room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the elemi"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sandarac sandarac", () => {
  assert.ok(world.rooms.rust_sandarac, "rust_sandarac room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sandarac"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mastic mastic", () => {
  assert.ok(world.rooms.rust_mastic, "rust_mastic room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mastic"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-jelutong jelutong", () => {
  assert.ok(world.rooms.rust_jelutong, "rust_jelutong room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the jelutong"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ramin ramin", () => {
  assert.ok(world.rooms.rust_ramin, "rust_ramin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ramin"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-afromosia afromosia", () => {
  assert.ok(world.rooms.rust_afromosia, "rust_afromosia room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the afromosia"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sapele sapele", () => {
  assert.ok(world.rooms.rust_sapele, "rust_sapele room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sapele"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cocobolo cocobolo", () => {
  assert.ok(world.rooms.rust_cocobolo, "rust_cocobolo room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cocobolo"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bubinga bubinga", () => {
  assert.ok(world.rooms.rust_bubinga, "rust_bubinga room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bubinga"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-wenge wenge", () => {
  assert.ok(world.rooms.rust_wenge, "rust_wenge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the wenge"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-zebrawood zebrawood", () => {
  assert.ok(world.rooms.rust_zebrawood, "rust_zebrawood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the zebrawood"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-teakwood teakwood", () => {
  assert.ok(world.rooms.rust_teakwood, "rust_teakwood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the teakwood"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-purpleheart purpleheart", () => {
  assert.ok(world.rooms.rust_purpleheart, "rust_purpleheart room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the purpleheart"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-padauk padauk", () => {
  assert.ok(world.rooms.rust_padauk, "rust_padauk room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the padauk"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-meranti meranti", () => {
  assert.ok(world.rooms.rust_meranti, "rust_meranti room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the meranti"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-greenheart greenheart", () => {
  assert.ok(world.rooms.rust_greenheart, "rust_greenheart room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the greenheart"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-iroko iroko", () => {
  assert.ok(world.rooms.rust_iroko, "rust_iroko room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the iroko"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lauan lauan", () => {
  assert.ok(world.rooms.rust_lauan, "rust_lauan room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lauan"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-balsa balsa", () => {
  assert.ok(world.rooms.rust_balsa, "rust_balsa room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the balsa"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-jarrah jarrah", () => {
  assert.ok(world.rooms.rust_jarrah, "rust_jarrah room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the jarrah"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kauri kauri", () => {
  assert.ok(world.rooms.rust_kauri, "rust_kauri room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kauri"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pitchpine pitchpine", () => {
  assert.ok(world.rooms.rust_pitchpine, "rust_pitchpine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pitchpine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-whitewash whitewash", () => {
  assert.ok(world.rooms.rust_whitewash, "rust_whitewash room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the whitewash"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-limewash limewash", () => {
  assert.ok(world.rooms.rust_limewash, "rust_limewash room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the limewash"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sienna sienna", () => {
  assert.ok(world.rooms.rust_sienna, "rust_sienna room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sienna"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-whiting whiting", () => {
  assert.ok(world.rooms.rust_whiting, "rust_whiting room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the whiting"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-chalk chalk", () => {
  assert.ok(world.rooms.rust_chalk, "rust_chalk room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the chalk"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-graphite graphite", () => {
  assert.ok(world.rooms.rust_graphite, "rust_graphite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the graphite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-asphalt asphalt", () => {
  assert.ok(world.rooms.rust_asphalt, "rust_asphalt room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the asphalt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bitumen bitumen", () => {
  assert.ok(world.rooms.rust_bitumen, "rust_bitumen room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bitumen"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-creosote creosote", () => {
  assert.ok(world.rooms.rust_creosote, "rust_creosote room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the creosote"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-camphor camphor", () => {
  assert.ok(world.rooms.rust_camphor, "rust_camphor room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the camphor"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sandalwood sandalwood", () => {
  assert.ok(world.rooms.rust_sandalwood, "rust_sandalwood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sandalwood"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rosewood rosewood", () => {
  assert.ok(world.rooms.rust_rosewood, "rust_rosewood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rosewood"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ebony ebony", () => {
  assert.ok(world.rooms.rust_ebony, "rust_ebony room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ebony"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-whaleoil whaleoil", () => {
  assert.ok(world.rooms.rust_whaleoil, "rust_whaleoil room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the whaleoil"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-grout grout", () => {
  assert.ok(world.rooms.rust_grout, "rust_grout room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the grout"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-caulk caulk", () => {
  assert.ok(world.rooms.rust_caulk, "rust_caulk room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the caulk"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-plaster plaster", () => {
  assert.ok(world.rooms.rust_plaster, "rust_plaster room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the plaster"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-palm palm", () => {
  assert.ok(world.rooms.rust_palm, "rust_palm room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the palm"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-juniper juniper", () => {
  assert.ok(world.rooms.rust_juniper, "rust_juniper room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the juniper"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-redwood redwood", () => {
  assert.ok(world.rooms.rust_redwood, "rust_redwood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the redwood"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cypress cypress", () => {
  assert.ok(world.rooms.rust_cypress, "rust_cypress room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cypress"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tamarack tamarack", () => {
  assert.ok(world.rooms.rust_tamarack, "rust_tamarack room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tamarack"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cottonwood cottonwood", () => {
  assert.ok(world.rooms.rust_cottonwood, "rust_cottonwood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cottonwood"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-butternut butternut", () => {
  assert.ok(world.rooms.rust_butternut, "rust_butternut room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the butternut"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hornbeam hornbeam", () => {
  assert.ok(world.rooms.rust_hornbeam, "rust_hornbeam room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hornbeam"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ironwood ironwood", () => {
  assert.ok(world.rooms.rust_ironwood, "rust_ironwood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ironwood"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-dogwood dogwood", () => {
  assert.ok(world.rooms.rust_dogwood, "rust_dogwood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the dogwood"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-osage osage", () => {
  assert.ok(world.rooms.rust_osage, "rust_osage room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the osage"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-willow willow", () => {
  assert.ok(world.rooms.rust_willow, "rust_willow room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the willow"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hemlock hemlock", () => {
  assert.ok(world.rooms.rust_hemlock, "rust_hemlock room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hemlock"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-basswood basswood", () => {
  assert.ok(world.rooms.rust_basswood, "rust_basswood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the basswood"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sycamore sycamore", () => {
  assert.ok(world.rooms.rust_sycamore, "rust_sycamore room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sycamore"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-locust locust", () => {
  assert.ok(world.rooms.rust_locust, "rust_locust room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the locust"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-chestnut chestnut", () => {
  assert.ok(world.rooms.rust_chestnut, "rust_chestnut room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the chestnut"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pecan pecan", () => {
  assert.ok(world.rooms.rust_pecan, "rust_pecan room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pecan"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hickory hickory", () => {
  assert.ok(world.rooms.rust_hickory, "rust_hickory room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hickory"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-aspen aspen", () => {
  assert.ok(world.rooms.rust_aspen, "rust_aspen room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the aspen"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-beech beech", () => {
  assert.ok(world.rooms.rust_beech, "rust_beech room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the beech"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-larch larch", () => {
  assert.ok(world.rooms.rust_larch, "rust_larch room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the larch"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-fir fir", () => {
  assert.ok(world.rooms.rust_fir, "rust_fir room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the fir"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-poplar poplar", () => {
  assert.ok(world.rooms.rust_poplar, "rust_poplar room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the poplar"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-alder alder", () => {
  assert.ok(world.rooms.rust_alder, "rust_alder room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the alder"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-walnut walnut", () => {
  assert.ok(world.rooms.rust_walnut, "rust_walnut room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the walnut"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-maple maple", () => {
  assert.ok(world.rooms.rust_maple, "rust_maple room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the maple"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-birch birch", () => {
  assert.ok(world.rooms.rust_birch, "rust_birch room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the birch"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-colza colza", () => {
  assert.ok(world.rooms.rust_colza, "rust_colza room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the colza"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lignum lignum", () => {
  assert.ok(world.rooms.rust_lignum, "rust_lignum room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lignum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-boxwood boxwood", () => {
  assert.ok(world.rooms.rust_boxwood, "rust_boxwood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the boxwood"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mahogany mahogany", () => {
  assert.ok(world.rooms.rust_mahogany, "rust_mahogany room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mahogany"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-yew yew", () => {
  assert.ok(world.rooms.rust_yew, "rust_yew room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the yew"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-elm elm", () => {
  assert.ok(world.rooms.rust_elm, "rust_elm room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the elm"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cedar cedar", () => {
  assert.ok(world.rooms.rust_cedar, "rust_cedar room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cedar"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-spruce spruce", () => {
  assert.ok(world.rooms.rust_spruce, "rust_spruce room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the spruce"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pine pine", () => {
  assert.ok(world.rooms.rust_pine, "rust_pine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-teak teak", () => {
  assert.ok(world.rooms.rust_teak, "rust_teak room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the teak"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-gypsum gypsum", () => {
  assert.ok(world.rooms.rust_gypsum, "rust_gypsum room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the gypsum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-redlead redlead", () => {
  assert.ok(world.rooms.rust_redlead, "rust_redlead room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the redlead"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-whitelead whitelead", () => {
  assert.ok(world.rooms.rust_whitelead, "rust_whitelead room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the whitelead"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-damar damar", () => {
  assert.ok(world.rooms.rust_damar, "rust_damar room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the damar"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kerosene kerosene", () => {
  assert.ok(world.rooms.rust_kerosene, "rust_kerosene room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kerosene"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-naphtha naphtha", () => {
  assert.ok(world.rooms.rust_naphtha, "rust_naphtha room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the naphtha"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-umber umber", () => {
  assert.ok(world.rooms.rust_umber, "rust_umber room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the umber"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-suet suet", () => {
  assert.ok(world.rooms.rust_suet, "rust_suet room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the suet"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-copra copra", () => {
  assert.ok(world.rooms.rust_copra, "rust_copra room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the copra"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bamboo bamboo", () => {
  assert.ok(world.rooms.rust_bamboo, "rust_bamboo room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bamboo"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rattan rattan", () => {
  assert.ok(world.rooms.rust_rattan, "rust_rattan room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rattan"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lanolin lanolin", () => {
  assert.ok(world.rooms.rust_lanolin, "rust_lanolin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lanolin"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-turpentine turpentine", () => {
  assert.ok(world.rooms.rust_turpentine, "rust_turpentine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the turpentine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lampblack lampblack", () => {
  assert.ok(world.rooms.rust_lampblack, "rust_lampblack room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lampblack"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ochre ochre", () => {
  assert.ok(world.rooms.rust_ochre, "rust_ochre room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ochre"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-copal copal", () => {
  assert.ok(world.rooms.rust_copal, "rust_copal room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the copal"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-putty putty", () => {
  assert.ok(world.rooms.rust_putty, "rust_putty room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the putty"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lacquer lacquer", () => {
  assert.ok(world.rooms.rust_lacquer, "rust_lacquer room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lacquer"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-shellac shellac", () => {
  assert.ok(world.rooms.rust_shellac, "rust_shellac room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the shellac"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rubber rubber", () => {
  assert.ok(world.rooms.rust_rubber, "rust_rubber room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rubber"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cork cork", () => {
  assert.ok(world.rooms.rust_cork, "rust_cork room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cork"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tow tow", () => {
  assert.ok(world.rooms.rust_tow, "rust_tow room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tow"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-varnish varnish", () => {
  assert.ok(world.rooms.rust_varnish, "rust_varnish room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the varnish"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-linseed linseed", () => {
  assert.ok(world.rooms.rust_linseed, "rust_linseed room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the linseed"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-beeswax beeswax", () => {
  assert.ok(world.rooms.rust_beeswax, "rust_beeswax room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the beeswax"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tallow tallow", () => {
  assert.ok(world.rooms.rust_tallow, "rust_tallow room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tallow"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-wool wool", () => {
  assert.ok(world.rooms.rust_wool, "rust_wool room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the wool"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cotton cotton", () => {
  assert.ok(world.rooms.rust_cotton, "rust_cotton room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cotton"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-linen linen", () => {
  assert.ok(world.rooms.rust_linen, "rust_linen room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the linen"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-flax flax", () => {
  assert.ok(world.rooms.rust_flax, "rust_flax room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the flax"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hawserline hawserline", () => {
  assert.ok(world.rooms.rust_hawserline, "rust_hawserline room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hawserline"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cable cable", () => {
  assert.ok(world.rooms.rust_cable, "rust_cable room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cable"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-burlap burlap", () => {
  assert.ok(world.rooms.rust_burlap, "rust_burlap room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the burlap"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-duck duck", () => {
  assert.ok(world.rooms.rust_duck, "rust_duck room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the duck"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-oilskin oilskin", () => {
  assert.ok(world.rooms.rust_oilskin, "rust_oilskin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the oilskin"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-junk junk", () => {
  assert.ok(world.rooms.rust_junk, "rust_junk room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the junk"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-jute jute", () => {
  assert.ok(world.rooms.rust_jute, "rust_jute room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the jute"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-coir coir", () => {
  assert.ok(world.rooms.rust_coir, "rust_coir room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the coir"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-manila manila", () => {
  assert.ok(world.rooms.rust_manila, "rust_manila room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the manila"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hemp hemp", () => {
  assert.ok(world.rooms.rust_hemp, "rust_hemp room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hemp"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tarpaulin tarpaulin", () => {
  assert.ok(world.rooms.rust_tarpaulin, "rust_tarpaulin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tarpaulin"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-yarn yarn", () => {
  assert.ok(world.rooms.rust_yarn, "rust_yarn room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the yarn"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sisal sisal", () => {
  assert.ok(world.rooms.rust_sisal, "rust_sisal room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sisal"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-roping roping", () => {
  assert.ok(world.rooms.rust_roping, "rust_roping room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the roping"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-canvas canvas", () => {
  assert.ok(world.rooms.rust_canvas, "rust_canvas room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the canvas"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sailcloth sailcloth", () => {
  assert.ok(world.rooms.rust_sailcloth, "rust_sailcloth room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sailcloth"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-halyardgasket halyardgasket", () => {
  assert.ok(world.rooms.rust_halyardgasket, "rust_halyardgasket room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the halyardgasket"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-jibgasket jibgasket", () => {
  assert.ok(world.rooms.rust_jibgasket, "rust_jibgasket room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the jibgasket"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-staygasket staygasket", () => {
  assert.ok(world.rooms.rust_staygasket, "rust_staygasket room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the staygasket"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-spangasket spangasket", () => {
  assert.ok(world.rooms.rust_spangasket, "rust_spangasket room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the spangasket"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-clewgasket clewgasket", () => {
  assert.ok(world.rooms.rust_clewgasket, "rust_clewgasket room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the clewgasket"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-boomgasket boomgasket", () => {
  assert.ok(world.rooms.rust_boomgasket, "rust_boomgasket room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the boomgasket"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mastgasket mastgasket", () => {
  assert.ok(world.rooms.rust_mastgasket, "rust_mastgasket room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mastgasket"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-yardgasket yardgasket", () => {
  assert.ok(world.rooms.rust_yardgasket, "rust_yardgasket room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the yardgasket"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-parrelbead parrelbead", () => {
  assert.ok(world.rooms.rust_parrelbead, "rust_parrelbead room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the parrelbead"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sailrope sailrope", () => {
  assert.ok(world.rooms.rust_sailrope, "rust_sailrope room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sailrope"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-headcringle headcringle", () => {
  assert.ok(world.rooms.rust_headcringle, "rust_headcringle room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the headcringle"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tackline tackline", () => {
  assert.ok(world.rooms.rust_tackline, "rust_tackline room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tackline"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-leechgasket leechgasket", () => {
  assert.ok(world.rooms.rust_leechgasket, "rust_leechgasket room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the leechgasket"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-buntgasket buntgasket", () => {
  assert.ok(world.rooms.rust_buntgasket, "rust_buntgasket room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the buntgasket"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-reefgasket reefgasket", () => {
  assert.ok(world.rooms.rust_reefgasket, "rust_reefgasket room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the reefgasket"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sailgasket sailgasket", () => {
  assert.ok(world.rooms.rust_sailgasket, "rust_sailgasket room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sailgasket"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-footline footline", () => {
  assert.ok(world.rooms.rust_footline, "rust_footline room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the footline"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-boltline boltline", () => {
  assert.ok(world.rooms.rust_boltline, "rust_boltline room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the boltline"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sailtwine sailtwine", () => {
  assert.ok(world.rooms.rust_sailtwine, "rust_sailtwine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sailtwine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-clewcringle clewcringle", () => {
  assert.ok(world.rooms.rust_clewcringle, "rust_clewcringle room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the clewcringle"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tackcringle tackcringle", () => {
  assert.ok(world.rooms.rust_tackcringle, "rust_tackcringle room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tackcringle"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-reefcringle reefcringle", () => {
  assert.ok(world.rooms.rust_reefcringle, "rust_reefcringle room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the reefcringle"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-throatrope throatrope", () => {
  assert.ok(world.rooms.rust_throatrope, "rust_throatrope room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the throatrope"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-peakrope peakrope", () => {
  assert.ok(world.rooms.rust_peakrope, "rust_peakrope room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the peakrope"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-clewrope clewrope", () => {
  assert.ok(world.rooms.rust_clewrope, "rust_clewrope room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the clewrope"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-buntrope buntrope", () => {
  assert.ok(world.rooms.rust_buntrope, "rust_buntrope room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the buntrope"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tackrope tackrope", () => {
  assert.ok(world.rooms.rust_tackrope, "rust_tackrope room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tackrope"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-footband footband", () => {
  assert.ok(world.rooms.rust_footband, "rust_footband room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the footband"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-leechrope leechrope", () => {
  assert.ok(world.rooms.rust_leechrope, "rust_leechrope room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the leechrope"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-headrope headrope", () => {
  assert.ok(world.rooms.rust_headrope, "rust_headrope room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the headrope"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-reefband reefband", () => {
  assert.ok(world.rooms.rust_reefband, "rust_reefband room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the reefband"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hanks hanks", () => {
  assert.ok(world.rooms.rust_hanks, "rust_hanks room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hanks"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-slings slings", () => {
  assert.ok(world.rooms.rust_slings, "rust_slings room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the slings"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-reefearring reefearring", () => {
  assert.ok(world.rooms.rust_reefearring, "rust_reefearring room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the reefearring"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-yardsling yardsling", () => {
  assert.ok(world.rooms.rust_yardsling, "rust_yardsling room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the yardsling"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-woolding woolding", () => {
  assert.ok(world.rooms.rust_woolding, "rust_woolding room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the woolding"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-backrope backrope", () => {
  assert.ok(world.rooms.rust_backrope, "rust_backrope room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the backrope"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-clewgarnet clewgarnet", () => {
  assert.ok(world.rooms.rust_clewgarnet, "rust_clewgarnet room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the clewgarnet"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-jigger jigger", () => {
  assert.ok(world.rooms.rust_jigger, "rust_jigger room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the jigger"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-crowfoot crowfoot", () => {
  assert.ok(world.rooms.rust_crowfoot, "rust_crowfoot room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the crowfoot"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-futtockband futtockband", () => {
  assert.ok(world.rooms.rust_futtockband, "rust_futtockband room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the futtockband"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-chainwale chainwale", () => {
  assert.ok(world.rooms.rust_chainwale, "rust_chainwale room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the chainwale"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-houndband houndband", () => {
  assert.ok(world.rooms.rust_houndband, "rust_houndband room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the houndband"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rackseizing rackseizing", () => {
  assert.ok(world.rooms.rust_rackseizing, "rust_rackseizing room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rackseizing"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-throatseizing throatseizing", () => {
  assert.ok(world.rooms.rust_throatseizing, "rust_throatseizing room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the throatseizing"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mastcap mastcap", () => {
  assert.ok(world.rooms.rust_mastcap, "rust_mastcap room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mastcap"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-roundseizing roundseizing", () => {
  assert.ok(world.rooms.rust_roundseizing, "rust_roundseizing room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the roundseizing"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-heavingknot heavingknot", () => {
  assert.ok(world.rooms.rust_heavingknot, "rust_heavingknot room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the heavingknot"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-wagoners wagoners", () => {
  assert.ok(world.rooms.rust_wagoners, "rust_wagoners room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the wagoners"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-packers packers", () => {
  assert.ok(world.rooms.rust_packers, "rust_packers room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the packers"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-thief thief", () => {
  assert.ok(world.rooms.rust_thief, "rust_thief room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the thief"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bagknot bagknot", () => {
  assert.ok(world.rooms.rust_bagknot, "rust_bagknot room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bagknot"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tomfool tomfool", () => {
  assert.ok(world.rooms.rust_tomfool, "rust_tomfool room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tomfool"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-millers millers", () => {
  assert.ok(world.rooms.rust_millers, "rust_millers room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the millers"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-surgeon surgeon", () => {
  assert.ok(world.rooms.rust_surgeon, "rust_surgeon room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the surgeon"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-palstek palstek", () => {
  assert.ok(world.rooms.rust_palstek, "rust_palstek room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the palstek"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-midshipman midshipman", () => {
  assert.ok(world.rooms.rust_midshipman, "rust_midshipman room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the midshipman"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-icicle icicle", () => {
  assert.ok(world.rooms.rust_icicle, "rust_icicle room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the icicle"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-running running", () => {
  assert.ok(world.rooms.rust_running, "rust_running room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the running"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-trucker trucker", () => {
  assert.ok(world.rooms.rust_trucker, "rust_trucker room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the trucker"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-italian italian", () => {
  assert.ok(world.rooms.rust_italian, "rust_italian room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the italian"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bachmann bachmann", () => {
  assert.ok(world.rooms.rust_bachmann, "rust_bachmann room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bachmann"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-blake blake", () => {
  assert.ok(world.rooms.rust_blake, "rust_blake room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the blake"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-alpine alpine", () => {
  assert.ok(world.rooms.rust_alpine, "rust_alpine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the alpine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-munter munter", () => {
  assert.ok(world.rooms.rust_munter, "rust_munter room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the munter"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-klemheist klemheist", () => {
  assert.ok(world.rooms.rust_klemheist, "rust_klemheist room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the klemheist"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-roundturn roundturn", () => {
  assert.ok(world.rooms.rust_roundturn, "rust_roundturn room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the roundturn"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-stopperknot stopperknot", () => {
  assert.ok(world.rooms.rust_stopperknot, "rust_stopperknot room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the stopperknot"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-diamondknot diamondknot", () => {
  assert.ok(world.rooms.rust_diamondknot, "rust_diamondknot room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the diamondknot"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-barrelknot barrelknot", () => {
  assert.ok(world.rooms.rust_barrelknot, "rust_barrelknot room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the barrelknot"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-waterknot waterknot", () => {
  assert.ok(world.rooms.rust_waterknot, "rust_waterknot room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the waterknot"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bloodknot bloodknot", () => {
  assert.ok(world.rooms.rust_bloodknot, "rust_bloodknot room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bloodknot"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tautline tautline", () => {
  assert.ok(world.rooms.rust_tautline, "rust_tautline room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tautline"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-prusik prusik", () => {
  assert.ok(world.rooms.rust_prusik, "rust_prusik room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the prusik"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-palomar palomar", () => {
  assert.ok(world.rooms.rust_palomar, "rust_palomar room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the palomar"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-butterfly butterfly", () => {
  assert.ok(world.rooms.rust_butterfly, "rust_butterfly room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the butterfly"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ashley ashley", () => {
  assert.ok(world.rooms.rust_ashley, "rust_ashley room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ashley"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-zeppelin zeppelin", () => {
  assert.ok(world.rooms.rust_zeppelin, "rust_zeppelin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the zeppelin"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-fisherman fisherman", () => {
  assert.ok(world.rooms.rust_fisherman, "rust_fisherman room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the fisherman"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-squareknot squareknot", () => {
  assert.ok(world.rooms.rust_squareknot, "rust_squareknot room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the squareknot"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-overhand overhand", () => {
  assert.ok(world.rooms.rust_overhand, "rust_overhand room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the overhand"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-figureeight figureeight", () => {
  assert.ok(world.rooms.rust_figureeight, "rust_figureeight room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the figureeight"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-granny granny", () => {
  assert.ok(world.rooms.rust_granny, "rust_granny room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the granny"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-reefknot reefknot", () => {
  assert.ok(world.rooms.rust_reefknot, "rust_reefknot room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the reefknot"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-marlinespike marlinespike", () => {
  assert.ok(world.rooms.rust_marlinespike, "rust_marlinespike room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the marlinespike"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-blackwall blackwall", () => {
  assert.ok(world.rooms.rust_blackwall, "rust_blackwall room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the blackwall"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-timberhitch timberhitch", () => {
  assert.ok(world.rooms.rust_timberhitch, "rust_timberhitch room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the timberhitch"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rollinghitch rollinghitch", () => {
  assert.ok(world.rooms.rust_rollinghitch, "rust_rollinghitch room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rollinghitch"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-constrictor constrictor", () => {
  assert.ok(world.rooms.rust_constrictor, "rust_constrictor room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the constrictor"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-carrick carrick", () => {
  assert.ok(world.rooms.rust_carrick, "rust_carrick room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the carrick"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-halfhitch halfhitch", () => {
  assert.ok(world.rooms.rust_halfhitch, "rust_halfhitch room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the halfhitch"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cowhitch cowhitch", () => {
  assert.ok(world.rooms.rust_cowhitch, "rust_cowhitch room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cowhitch"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-larkhead larkhead", () => {
  assert.ok(world.rooms.rust_larkhead, "rust_larkhead room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the larkhead"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-belaying belaying", () => {
  assert.ok(world.rooms.rust_belaying, "rust_belaying room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the belaying"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-coiling coiling", () => {
  assert.ok(world.rooms.rust_coiling, "rust_coiling room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the coiling"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-fid fid", () => {
  assert.ok(world.rooms.rust_fid, "rust_fid room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the fid"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-racking racking", () => {
  assert.ok(world.rooms.rust_racking, "rust_racking room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the racking"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-frapping frapping", () => {
  assert.ok(world.rooms.rust_frapping, "rust_frapping room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the frapping"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bending bending", () => {
  assert.ok(world.rooms.rust_bending, "rust_bending room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bending"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-reeving reeving", () => {
  assert.ok(world.rooms.rust_reeving, "rust_reeving room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the reeving"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-catspaw catspaw", () => {
  assert.ok(world.rooms.rust_catspaw, "rust_catspaw room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the catspaw"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sheepshank sheepshank", () => {
  assert.ok(world.rooms.rust_sheepshank, "rust_sheepshank room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sheepshank"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sheetbend sheetbend", () => {
  assert.ok(world.rooms.rust_sheetbend, "rust_sheetbend room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sheetbend"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-clove clove", () => {
  assert.ok(world.rooms.rust_clove, "rust_clove room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the clove"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-stevedore stevedore", () => {
  assert.ok(world.rooms.rust_stevedore, "rust_stevedore room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the stevedore"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-walker walker", () => {
  assert.ok(world.rooms.rust_walker, "rust_walker room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the walker"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-turkshead turkshead", () => {
  assert.ok(world.rooms.rust_turkshead, "rust_turkshead room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the turkshead"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-wallknot wallknot", () => {
  assert.ok(world.rooms.rust_wallknot, "rust_wallknot room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the wallknot"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-shortsplice shortsplice", () => {
  assert.ok(world.rooms.rust_shortsplice, "rust_shortsplice room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the shortsplice"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-eyeplice eyeplice", () => {
  assert.ok(world.rooms.rust_eyeplice, "rust_eyeplice room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the eyeplice"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-splice splice", () => {
  assert.ok(world.rooms.rust_splice, "rust_splice room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the splice"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hitch hitch", () => {
  assert.ok(world.rooms.rust_hitch, "rust_hitch room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hitch"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-paunch paunch", () => {
  assert.ok(world.rooms.rust_paunch, "rust_paunch room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the paunch"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mouse mouse", () => {
  assert.ok(world.rooms.rust_mouse, "rust_mouse room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mouse"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-whipping whipping", () => {
  assert.ok(world.rooms.rust_whipping, "rust_whipping room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the whipping"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pointing pointing", () => {
  assert.ok(world.rooms.rust_pointing, "rust_pointing room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pointing"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-keckling keckling", () => {
  assert.ok(world.rooms.rust_keckling, "rust_keckling room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the keckling"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rounding rounding", () => {
  assert.ok(world.rooms.rust_rounding, "rust_rounding room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rounding"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-serving serving", () => {
  assert.ok(world.rooms.rust_serving, "rust_serving room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the serving"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-nock nock", () => {
  assert.ok(world.rooms.rust_nock, "rust_nock room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the nock"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hambroline hambroline", () => {
  assert.ok(world.rooms.rust_hambroline, "rust_hambroline room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hambroline"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-foxes foxes", () => {
  assert.ok(world.rooms.rust_foxes, "rust_foxes room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the foxes"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lashing lashing", () => {
  assert.ok(world.rooms.rust_lashing, "rust_lashing room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lashing"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-stopper stopper", () => {
  assert.ok(world.rooms.rust_stopper, "rust_stopper room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the stopper"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-messenger messenger", () => {
  assert.ok(world.rooms.rust_messenger, "rust_messenger room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the messenger"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-warp warp", () => {
  assert.ok(world.rooms.rust_warp, "rust_warp room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the warp"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-breastline breastline", () => {
  assert.ok(world.rooms.rust_breastline, "rust_breastline room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the breastline"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-heavingline heavingline", () => {
  assert.ok(world.rooms.rust_heavingline, "rust_heavingline room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the heavingline"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sternfast sternfast", () => {
  assert.ok(world.rooms.rust_sternfast, "rust_sternfast room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sternfast"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-headfast headfast", () => {
  assert.ok(world.rooms.rust_headfast, "rust_headfast room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the headfast"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-towline towline", () => {
  assert.ok(world.rooms.rust_towline, "rust_towline room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the towline"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-leadline leadline", () => {
  assert.ok(world.rooms.rust_leadline, "rust_leadline room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the leadline"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-logline logline", () => {
  assert.ok(world.rooms.rust_logline, "rust_logline room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the logline"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-roundline roundline", () => {
  assert.ok(world.rooms.rust_roundline, "rust_roundline room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the roundline"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-marling marling", () => {
  assert.ok(world.rooms.rust_marling, "rust_marling room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the marling"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-thimble thimble", () => {
  assert.ok(world.rooms.rust_thimble, "rust_thimble room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the thimble"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sennit sennit", () => {
  assert.ok(world.rooms.rust_sennit, "rust_sennit room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sennit"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-nettles nettles", () => {
  assert.ok(world.rooms.rust_nettles, "rust_nettles room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the nettles"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-seizing seizing", () => {
  assert.ok(world.rooms.rust_seizing, "rust_seizing room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the seizing"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-roband roband", () => {
  assert.ok(world.rooms.rust_roband, "rust_roband room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the roband"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lugsail lugsail", () => {
  assert.ok(world.rooms.rust_lugsail, "rust_lugsail room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lugsail"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lateen lateen", () => {
  assert.ok(world.rooms.rust_lateen, "rust_lateen room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lateen"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-spencer spencer", () => {
  assert.ok(world.rooms.rust_spencer, "rust_spencer room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the spencer"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-yardarm yardarm", () => {
  assert.ok(world.rooms.rust_yardarm, "rust_yardarm room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the yardarm"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lazyjack lazyjack", () => {
  assert.ok(world.rooms.rust_lazyjack, "rust_lazyjack room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lazyjack"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bridle bridle", () => {
  assert.ok(world.rooms.rust_bridle, "rust_bridle room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bridle"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bowline bowline", () => {
  assert.ok(world.rooms.rust_bowline, "rust_bowline room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bowline"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-earing earing", () => {
  assert.ok(world.rooms.rust_earing, "rust_earing room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the earing"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tabling tabling", () => {
  assert.ok(world.rooms.rust_tabling, "rust_tabling room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tabling"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-boltrope boltrope", () => {
  assert.ok(world.rooms.rust_boltrope, "rust_boltrope room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the boltrope"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-houseline houseline", () => {
  assert.ok(world.rooms.rust_houseline, "rust_houseline room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the houseline"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-spunyarn spunyarn", () => {
  assert.ok(world.rooms.rust_spunyarn, "rust_spunyarn room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the spunyarn"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-worming worming", () => {
  assert.ok(world.rooms.rust_worming, "rust_worming room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the worming"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-parcelling parcelling", () => {
  assert.ok(world.rooms.rust_parcelling, "rust_parcelling room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the parcelling"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-girtline girtline", () => {
  assert.ok(world.rooms.rust_girtline, "rust_girtline room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the girtline"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-stemson stemson", () => {
  assert.ok(world.rooms.rust_stemson, "rust_stemson room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the stemson"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sternpost sternpost", () => {
  assert.ok(world.rooms.rust_sternpost, "rust_sternpost room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sternpost"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-footwale footwale", () => {
  assert.ok(world.rooms.rust_footwale, "rust_footwale room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the footwale"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-scarph scarph", () => {
  assert.ok(world.rooms.rust_scarph, "rust_scarph room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the scarph"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-eyebolt eyebolt", () => {
  assert.ok(world.rooms.rust_eyebolt, "rust_eyebolt room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the eyebolt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ringbolt ringbolt", () => {
  assert.ok(world.rooms.rust_ringbolt, "rust_ringbolt room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ringbolt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-swivel swivel", () => {
  assert.ok(world.rooms.rust_swivel, "rust_swivel room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the swivel"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-fluke fluke", () => {
  assert.ok(world.rooms.rust_fluke, "rust_fluke room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the fluke"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kedge kedge", () => {
  assert.ok(world.rooms.rust_kedge, "rust_kedge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kedge"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hawser hawser", () => {
  assert.ok(world.rooms.rust_hawser, "rust_hawser room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hawser"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-nipper nipper", () => {
  assert.ok(world.rooms.rust_nipper, "rust_nipper room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the nipper"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-gantline gantline", () => {
  assert.ok(world.rooms.rust_gantline, "rust_gantline room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the gantline"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-masthead masthead", () => {
  assert.ok(world.rooms.rust_masthead, "rust_masthead room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the masthead"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-checkstay checkstay", () => {
  assert.ok(world.rooms.rust_checkstay, "rust_checkstay room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the checkstay"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sheerpole sheerpole", () => {
  assert.ok(world.rooms.rust_sheerpole, "rust_sheerpole room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sheerpole"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-catharpin catharpin", () => {
  assert.ok(world.rooms.rust_catharpin, "rust_catharpin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the catharpin"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-marline marline", () => {
  assert.ok(world.rooms.rust_marline, "rust_marline room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the marline"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lizard lizard", () => {
  assert.ok(world.rooms.rust_lizard, "rust_lizard room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lizard"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sling sling", () => {
  assert.ok(world.rooms.rust_sling, "rust_sling room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sling"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-truss truss", () => {
  assert.ok(world.rooms.rust_truss, "rust_truss room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the truss"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tye tye", () => {
  assert.ok(world.rooms.rust_tye, "rust_tye room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tye"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-jeer jeer", () => {
  assert.ok(world.rooms.rust_jeer, "rust_jeer room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the jeer"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pendant pendant", () => {
  assert.ok(world.rooms.rust_pendant, "rust_pendant room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pendant"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-guy guy", () => {
  assert.ok(world.rooms.rust_guy, "rust_guy room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the guy"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-brace brace", () => {
  assert.ok(world.rooms.rust_brace, "rust_brace room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the brace"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-topping topping", () => {
  assert.ok(world.rooms.rust_topping, "rust_topping room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the topping"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-inhaul inhaul", () => {
  assert.ok(world.rooms.rust_inhaul, "rust_inhaul room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the inhaul"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-skysail skysail", () => {
  assert.ok(world.rooms.rust_skysail, "rust_skysail room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the skysail"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-topgallant topgallant", () => {
  assert.ok(world.rooms.rust_topgallant, "rust_topgallant room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the topgallant"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-jibboom jibboom", () => {
  assert.ok(world.rooms.rust_jibboom, "rust_jibboom room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the jibboom"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-brail brail", () => {
  assert.ok(world.rooms.rust_brail, "rust_brail room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the brail"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-clewline clewline", () => {
  assert.ok(world.rooms.rust_clewline, "rust_clewline room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the clewline"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-leechline leechline", () => {
  assert.ok(world.rooms.rust_leechline, "rust_leechline room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the leechline"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-buntline buntline", () => {
  assert.ok(world.rooms.rust_buntline, "rust_buntline room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the buntline"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-driver driver", () => {
  assert.ok(world.rooms.rust_driver, "rust_driver room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the driver"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-spanker spanker", () => {
  assert.ok(world.rooms.rust_spanker, "rust_spanker room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the spanker"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-stunsail stunsail", () => {
  assert.ok(world.rooms.rust_stunsail, "rust_stunsail room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the stunsail"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lazarette lazarette", () => {
  assert.ok(world.rooms.rust_lazarette, "rust_lazarette room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lazarette"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-orlop orlop", () => {
  assert.ok(world.rooms.rust_orlop, "rust_orlop room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the orlop"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-skylight skylight", () => {
  assert.ok(world.rooms.rust_skylight, "rust_skylight room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the skylight"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-deadlight deadlight", () => {
  assert.ok(world.rooms.rust_deadlight, "rust_deadlight room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the deadlight"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-scuttle scuttle", () => {
  assert.ok(world.rooms.rust_scuttle, "rust_scuttle room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the scuttle"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-companion companion", () => {
  assert.ok(world.rooms.rust_companion, "rust_companion room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the companion"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-grating grating", () => {
  assert.ok(world.rooms.rust_grating, "rust_grating room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the grating"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-coaming coaming", () => {
  assert.ok(world.rooms.rust_coaming, "rust_coaming room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the coaming"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kevel kevel", () => {
  assert.ok(world.rooms.rust_kevel, "rust_kevel room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kevel"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-timberhead timberhead", () => {
  assert.ok(world.rooms.rust_timberhead, "rust_timberhead room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the timberhead"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-fiferail fiferail", () => {
  assert.ok(world.rooms.rust_fiferail, "rust_fiferail room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the fiferail"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-trestle trestle", () => {
  assert.ok(world.rooms.rust_trestle, "rust_trestle room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the trestle"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-crosstree crosstree", () => {
  assert.ok(world.rooms.rust_crosstree, "rust_crosstree room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the crosstree"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tabernacle tabernacle", () => {
  assert.ok(world.rooms.rust_tabernacle, "rust_tabernacle room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tabernacle"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-chainplate chainplate", () => {
  assert.ok(world.rooms.rust_chainplate, "rust_chainplate room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the chainplate"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-taffrail taffrail", () => {
  assert.ok(world.rooms.rust_taffrail, "rust_taffrail room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the taffrail"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-fish fish", () => {
  assert.ok(world.rooms.rust_fish, "rust_fish room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the fish"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-covering covering", () => {
  assert.ok(world.rooms.rust_covering, "rust_covering room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the covering"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-topsail topsail", () => {
  assert.ok(world.rooms.rust_topsail, "rust_topsail room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the topsail"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-course course", () => {
  assert.ok(world.rooms.rust_course, "rust_course room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the course"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-royal royal", () => {
  assert.ok(world.rooms.rust_royal, "rust_royal room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the royal"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bumpkin bumpkin", () => {
  assert.ok(world.rooms.rust_bumpkin, "rust_bumpkin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bumpkin"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hawsepipe hawsepipe", () => {
  assert.ok(world.rooms.rust_hawsepipe, "rust_hawsepipe room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hawsepipe"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-staysail staysail", () => {
  assert.ok(world.rooms.rust_staysail, "rust_staysail room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the staysail"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-floor floor", () => {
  assert.ok(world.rooms.rust_floor, "rust_floor room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the floor"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pinrail pinrail", () => {
  assert.ok(world.rooms.rust_pinrail, "rust_pinrail room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pinrail"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rider rider", () => {
  assert.ok(world.rooms.rust_rider, "rust_rider room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rider"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bonnet bonnet", () => {
  assert.ok(world.rooms.rust_bonnet, "rust_bonnet room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bonnet"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-triatic triatic", () => {
  assert.ok(world.rooms.rust_triatic, "rust_triatic room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the triatic"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-striker striker", () => {
  assert.ok(world.rooms.rust_striker, "rust_striker room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the striker"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-dolphin dolphin", () => {
  assert.ok(world.rooms.rust_dolphin, "rust_dolphin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the dolphin"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-knighthead knighthead", () => {
  assert.ok(world.rooms.rust_knighthead, "rust_knighthead room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the knighthead"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-frame frame", () => {
  assert.ok(world.rooms.rust_frame, "rust_frame room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the frame"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-timber timber", () => {
  assert.ok(world.rooms.rust_timber, "rust_timber room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the timber"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-trysail trysail", () => {
  assert.ok(world.rooms.rust_trysail, "rust_trysail room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the trysail"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sprit sprit", () => {
  assert.ok(world.rooms.rust_sprit, "rust_sprit room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sprit"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mizzen mizzen", () => {
  assert.ok(world.rooms.rust_mizzen, "rust_mizzen room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mizzen"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-boomkin boomkin", () => {
  assert.ok(world.rooms.rust_boomkin, "rust_boomkin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the boomkin"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-partner partner", () => {
  assert.ok(world.rooms.rust_partner, "rust_partner room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the partner"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-carling carling", () => {
  assert.ok(world.rooms.rust_carling, "rust_carling room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the carling"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-zinc zinc", () => {
  assert.ok(world.rooms.rust_zinc, "rust_zinc room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the zinc"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-flemish flemish", () => {
  assert.ok(world.rooms.rust_flemish, "rust_flemish room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the flemish"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-horse horse", () => {
  assert.ok(world.rooms.rust_horse, "rust_horse room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the horse"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-felt felt", () => {
  assert.ok(world.rooms.rust_felt, "rust_felt room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the felt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ceiling ceiling", () => {
  assert.ok(world.rooms.rust_ceiling, "rust_ceiling room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ceiling"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-clamp clamp", () => {
  assert.ok(world.rooms.rust_clamp, "rust_clamp room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the clamp"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hog hog", () => {
  assert.ok(world.rooms.rust_hog, "rust_hog room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hog"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rabbet rabbet", () => {
  assert.ok(world.rooms.rust_rabbet, "rust_rabbet room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rabbet"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sheer sheer", () => {
  assert.ok(world.rooms.rust_sheer, "rust_sheer room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sheer"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-burton burton", () => {
  assert.ok(world.rooms.rust_burton, "rust_burton room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the burton"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-runner runner", () => {
  assert.ok(world.rooms.rust_runner, "rust_runner room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the runner"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-gripe gripe", () => {
  assert.ok(world.rooms.rust_gripe, "rust_gripe room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the gripe"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-deadwood deadwood", () => {
  assert.ok(world.rooms.rust_deadwood, "rust_deadwood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the deadwood"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-apron apron", () => {
  assert.ok(world.rooms.rust_apron, "rust_apron room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the apron"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-stringer stringer", () => {
  assert.ok(world.rooms.rust_stringer, "rust_stringer room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the stringer"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-limber limber", () => {
  assert.ok(world.rooms.rust_limber, "rust_limber room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the limber"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-jackstay jackstay", () => {
  assert.ok(world.rooms.rust_jackstay, "rust_jackstay room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the jackstay"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-wale wale", () => {
  assert.ok(world.rooms.rust_wale, "rust_wale room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the wale"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-oakum oakum", () => {
  assert.ok(world.rooms.rust_oakum, "rust_oakum room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the oakum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-stirrup stirrup", () => {
  assert.ok(world.rooms.rust_stirrup, "rust_stirrup room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the stirrup"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-jumper jumper", () => {
  assert.ok(world.rooms.rust_jumper, "rust_jumper room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the jumper"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-whisker whisker", () => {
  assert.ok(world.rooms.rust_whisker, "rust_whisker room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the whisker"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bowsprit bowsprit", () => {
  assert.ok(world.rooms.rust_bowsprit, "rust_bowsprit room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bowsprit"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-footrope footrope", () => {
  assert.ok(world.rooms.rust_footrope, "rust_footrope room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the footrope"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-helm helm", () => {
  assert.ok(world.rooms.rust_helm, "rust_helm room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the helm"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-stem stem", () => {
  assert.ok(world.rooms.rust_stem, "rust_stem room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the stem"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-garboard garboard", () => {
  assert.ok(world.rooms.rust_garboard, "rust_garboard room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the garboard"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-keelson keelson", () => {
  assert.ok(world.rooms.rust_keelson, "rust_keelson room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the keelson"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-yard yard", () => {
  assert.ok(world.rooms.rust_yard, "rust_yard room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the yard"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bunt bunt", () => {
  assert.ok(world.rooms.rust_bunt, "rust_bunt room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bunt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-luff luff", () => {
  assert.ok(world.rooms.rust_luff, "rust_luff room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the luff"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-leech leech", () => {
  assert.ok(world.rooms.rust_leech, "rust_leech room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the leech"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-gammon gammon", () => {
  assert.ok(world.rooms.rust_gammon, "rust_gammon room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the gammon"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-martingale martingale", () => {
  assert.ok(world.rooms.rust_martingale, "rust_martingale room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the martingale"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-reefpoint reefpoint", () => {
  assert.ok(world.rooms.rust_reefpoint, "rust_reefpoint room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the reefpoint"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-truck truck", () => {
  assert.ok(world.rooms.rust_truck, "rust_truck room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the truck"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-becket becket", () => {
  assert.ok(world.rooms.rust_becket, "rust_becket room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the becket"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-toggle toggle", () => {
  assert.ok(world.rooms.rust_toggle, "rust_toggle room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the toggle"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-gasket gasket", () => {
  assert.ok(world.rooms.rust_gasket, "rust_gasket room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the gasket"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-jib jib", () => {
  assert.ok(world.rooms.rust_jib, "rust_jib room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the jib"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hounds hounds", () => {
  assert.ok(world.rooms.rust_hounds, "rust_hounds room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hounds"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-spreader spreader", () => {
  assert.ok(world.rooms.rust_spreader, "rust_spreader room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the spreader"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-samson samson", () => {
  assert.ok(world.rooms.rust_samson, "rust_samson room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the samson"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cranse cranse", () => {
  assert.ok(world.rooms.rust_cranse, "rust_cranse room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cranse"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-parrel parrel", () => {
  assert.ok(world.rooms.rust_parrel, "rust_parrel room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the parrel"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bobstay bobstay", () => {
  assert.ok(world.rooms.rust_bobstay, "rust_bobstay room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bobstay"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-backstay backstay", () => {
  assert.ok(world.rooms.rust_backstay, "rust_backstay room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the backstay"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-forestay forestay", () => {
  assert.ok(world.rooms.rust_forestay, "rust_forestay room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the forestay"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-preventer preventer", () => {
  assert.ok(world.rooms.rust_preventer, "rust_preventer room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the preventer"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-downhaul downhaul", () => {
  assert.ok(world.rooms.rust_downhaul, "rust_downhaul room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the downhaul"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-outhaul outhaul", () => {
  assert.ok(world.rooms.rust_outhaul, "rust_outhaul room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the outhaul"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-yoke yoke", () => {
  assert.ok(world.rooms.rust_yoke, "rust_yoke room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the yoke"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-clew clew", () => {
  assert.ok(world.rooms.rust_clew, "rust_clew room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the clew"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-trunnel trunnel", () => {
  assert.ok(world.rooms.rust_trunnel, "rust_trunnel room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the trunnel"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rudder rudder", () => {
  assert.ok(world.rooms.rust_rudder, "rust_rudder room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rudder"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-skeg skeg", () => {
  assert.ok(world.rooms.rust_skeg, "rust_skeg room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the skeg"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cathead cathead", () => {
  assert.ok(world.rooms.rust_cathead, "rust_cathead room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cathead"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-futtock futtock", () => {
  assert.ok(world.rooms.rust_futtock, "rust_futtock room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the futtock"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-vang vang", () => {
  assert.ok(world.rooms.rust_vang, "rust_vang room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the vang"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-halyard halyard", () => {
  assert.ok(world.rooms.rust_halyard, "rust_halyard room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the halyard"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ratline ratline", () => {
  assert.ok(world.rooms.rust_ratline, "rust_ratline room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ratline"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-windlass windlass", () => {
  assert.ok(world.rooms.rust_windlass, "rust_windlass room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the windlass"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lanyard lanyard", () => {
  assert.ok(world.rooms.rust_lanyard, "rust_lanyard room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lanyard"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-gooseneck gooseneck", () => {
  assert.ok(world.rooms.rust_gooseneck, "rust_gooseneck room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the gooseneck"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bollard bollard", () => {
  assert.ok(world.rooms.rust_bollard, "rust_bollard room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bollard"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pawl pawl", () => {
  assert.ok(world.rooms.rust_pawl, "rust_pawl room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pawl"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-capstan capstan", () => {
  assert.ok(world.rooms.rust_capstan, "rust_capstan room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the capstan"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-winch winch", () => {
  assert.ok(world.rooms.rust_winch, "rust_winch room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the winch"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cringle cringle", () => {
  assert.ok(world.rooms.rust_cringle, "rust_cringle room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cringle"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-davit davit", () => {
  assert.ok(world.rooms.rust_davit, "rust_davit room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the davit"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hawse hawse", () => {
  assert.ok(world.rooms.rust_hawse, "rust_hawse room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hawse"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bitt bitt", () => {
  assert.ok(world.rooms.rust_bitt, "rust_bitt room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bitt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-deadeye deadeye", () => {
  assert.ok(world.rooms.rust_deadeye, "rust_deadeye room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the deadeye"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-shroud shroud", () => {
  assert.ok(world.rooms.rust_shroud, "rust_shroud room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the shroud"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-stay stay", () => {
  assert.ok(world.rooms.rust_stay, "rust_stay room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the stay"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mast mast", () => {
  assert.ok(world.rooms.rust_mast, "rust_mast room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mast"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-gaff gaff", () => {
  assert.ok(world.rooms.rust_gaff, "rust_gaff room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the gaff"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-boom boom", () => {
  assert.ok(world.rooms.rust_boom, "rust_boom room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the boom"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sheave sheave", () => {
  assert.ok(world.rooms.rust_sheave, "rust_sheave room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sheave"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-fairlead fairlead", () => {
  assert.ok(world.rooms.rust_fairlead, "rust_fairlead room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the fairlead"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-chock chock", () => {
  assert.ok(world.rooms.rust_chock, "rust_chock room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the chock"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-strake strake", () => {
  assert.ok(world.rooms.rust_strake, "rust_strake room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the strake"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-transom transom", () => {
  assert.ok(world.rooms.rust_transom, "rust_transom room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the transom"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-gunnel gunnel", () => {
  assert.ok(world.rooms.rust_gunnel, "rust_gunnel room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the gunnel"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-thwart thwart", () => {
  assert.ok(world.rooms.rust_thwart, "rust_thwart room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the thwart"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tiller tiller", () => {
  assert.ok(world.rooms.rust_tiller, "rust_tiller room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tiller"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-gudgeon gudgeon", () => {
  assert.ok(world.rooms.rust_gudgeon, "rust_gudgeon room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the gudgeon"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pintle pintle", () => {
  assert.ok(world.rooms.rust_pintle, "rust_pintle room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pintle"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bit bit", () => {
  assert.ok(world.rooms.rust_bit, "rust_bit room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bit"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hasp hasp", () => {
  assert.ok(world.rooms.rust_hasp, "rust_hasp room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hasp"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-eyelet eyelet", () => {
  assert.ok(world.rooms.rust_eyelet, "rust_eyelet room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the eyelet"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-knee knee", () => {
  assert.ok(world.rooms.rust_knee, "rust_knee room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the knee"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-oar oar", () => {
  assert.ok(world.rooms.rust_oar, "rust_oar room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the oar"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-thole thole", () => {
  assert.ok(world.rooms.rust_thole, "rust_thole room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the thole"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cleat cleat", () => {
  assert.ok(world.rooms.rust_cleat, "rust_cleat room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cleat"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-eye eye", () => {
  assert.ok(world.rooms.rust_eye, "rust_eye room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the eye"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lath lath", () => {
  assert.ok(world.rooms.rust_lath, "rust_lath room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lath"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-joist joist", () => {
  assert.ok(world.rooms.rust_joist, "rust_joist room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the joist"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-beam beam", () => {
  assert.ok(world.rooms.rust_beam, "rust_beam room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the beam"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-keel keel", () => {
  assert.ok(world.rooms.rust_keel, "rust_keel room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the keel"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-spar spar", () => {
  assert.ok(world.rooms.rust_spar, "rust_spar room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the spar"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-grommet grommet", () => {
  assert.ok(world.rooms.rust_grommet, "rust_grommet room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the grommet"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bush bush", () => {
  assert.ok(world.rooms.rust_bush, "rust_bush room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bush"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-nut nut", () => {
  assert.ok(world.rooms.rust_nut, "rust_nut room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the nut"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cuff cuff", () => {
  assert.ok(world.rooms.rust_cuff, "rust_cuff room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cuff"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sleeve sleeve", () => {
  assert.ok(world.rooms.rust_sleeve, "rust_sleeve room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sleeve"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-shim shim", () => {
  assert.ok(world.rooms.rust_shim, "rust_shim room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the shim"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-wedge wedge", () => {
  assert.ok(world.rooms.rust_wedge, "rust_wedge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the wedge"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pommel pommel", () => {
  assert.ok(world.rooms.rust_pommel, "rust_pommel room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pommel"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-stack stack", () => {
  assert.ok(world.rooms.rust_stack, "rust_stack room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the stack"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-flue flue", () => {
  assert.ok(world.rooms.rust_flue, "rust_flue room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the flue"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-guard guard", () => {
  assert.ok(world.rooms.rust_guard, "rust_guard room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the guard"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hilt hilt", () => {
  assert.ok(world.rooms.rust_hilt, "rust_hilt room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hilt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-socket socket", () => {
  assert.ok(world.rooms.rust_socket, "rust_socket room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the socket"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-coat coat", () => {
  assert.ok(world.rooms.rust_coat, "rust_coat room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the coat"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pelt pelt", () => {
  assert.ok(world.rooms.rust_pelt, "rust_pelt room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pelt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-dross dross", () => {
  assert.ok(world.rooms.rust_dross, "rust_dross room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the dross"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-belt belt", () => {
  assert.ok(world.rooms.rust_belt, "rust_belt room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the belt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hide hide", () => {
  assert.ok(world.rooms.rust_hide, "rust_hide room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hide"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-fang fang", () => {
  assert.ok(world.rooms.rust_fang, "rust_fang room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the fang"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tooth tooth", () => {
  assert.ok(world.rooms.rust_tooth, "rust_tooth room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tooth"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-brow brow", () => {
  assert.ok(world.rooms.rust_brow, "rust_brow room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the brow"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-chin chin", () => {
  assert.ok(world.rooms.rust_chin, "rust_chin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the chin"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mill mill", () => {
  assert.ok(world.rooms.rust_mill, "rust_mill room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mill"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hull hull", () => {
  assert.ok(world.rooms.rust_hull, "rust_hull room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hull"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bore bore", () => {
  assert.ok(world.rooms.rust_bore, "rust_bore room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bore"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-core core", () => {
  assert.ok(world.rooms.rust_core, "rust_core room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the core"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-axle axle", () => {
  assert.ok(world.rooms.rust_axle, "rust_axle room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the axle"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hub hub", () => {
  assert.ok(world.rooms.rust_hub, "rust_hub room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hub"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-spoke spoke", () => {
  assert.ok(world.rooms.rust_spoke, "rust_spoke room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the spoke"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-strap strap", () => {
  assert.ok(world.rooms.rust_strap, "rust_strap room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the strap"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-loop loop", () => {
  assert.ok(world.rooms.rust_loop, "rust_loop room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the loop"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-shaft shaft", () => {
  assert.ok(world.rooms.rust_shaft, "rust_shaft room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the shaft"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-duct duct", () => {
  assert.ok(world.rooms.rust_duct, "rust_duct room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the duct"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-vent vent", () => {
  assert.ok(world.rooms.rust_vent, "rust_vent room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the vent"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pipe pipe", () => {
  assert.ok(world.rooms.rust_pipe, "rust_pipe room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pipe"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rod rod", () => {
  assert.ok(world.rooms.rust_rod, "rust_rod room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rod"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-band band", () => {
  assert.ok(world.rooms.rust_band, "rust_band room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the band"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-claw claw", () => {
  assert.ok(world.rooms.rust_claw, "rust_claw room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the claw"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-horn horn", () => {
  assert.ok(world.rooms.rust_horn, "rust_horn room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the horn"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-jaw wire", () => {
  assert.ok(world.rooms.rust_jaw, "rust_jaw room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the wire"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-leaf coil", () => {
  assert.ok(world.rooms.rust_leaf, "rust_leaf room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the coil"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sheet lug", () => {
  assert.ok(world.rooms.rust_sheet, "rust_sheet room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lug"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-plate boss", () => {
  assert.ok(world.rooms.rust_plate, "rust_plate room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the boss"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-grid tab", () => {
  assert.ok(world.rooms.rust_grid, "rust_grid room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tab"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mesh stud", () => {
  assert.ok(world.rooms.rust_mesh, "rust_mesh room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the stud"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-web foil", () => {
  assert.ok(world.rooms.rust_web, "rust_web room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the foil"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rib spec", () => {
  assert.ok(world.rooms.rust_rib, "rust_rib room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the spec"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-edge trace", () => {
  assert.ok(world.rooms.rust_edge, "rust_edge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the trace"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-plank line", () => {
  assert.ok(world.rooms.rust_plank, "rust_plank room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the line"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-post dash", () => {
  assert.ok(world.rooms.rust_post, "rust_post room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the dash"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-flap dot", () => {
  assert.ok(world.rooms.rust_flap, "rust_flap room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the dot"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cover streak", () => {
  assert.ok(world.rooms.rust_cover, "rust_cover room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the streak"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-brim smudge", () => {
  assert.ok(world.rooms.rust_brim, "rust_brim room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the smudge"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tip mark", () => {
  assert.ok(world.rooms.rust_tip, "rust_tip room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mark"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hole spot", () => {
  assert.ok(world.rooms.rust_hole, "rust_hole room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the spot"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pit patch", () => {
  assert.ok(world.rooms.rust_pit, "rust_pit room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the patch"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-toe blob", () => {
  assert.ok(world.rooms.rust_toe, "rust_toe room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the blob"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lid dab", () => {
  assert.ok(world.rooms.rust_lid, "rust_lid room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the dab"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rail bar", () => {
  assert.ok(world.rooms.rust_rail, "rust_rail room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bar"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-heel nick", () => {
  assert.ok(world.rooms.rust_heel, "rust_heel room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the nick"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pan crumb", () => {
  assert.ok(world.rooms.rust_pan, "rust_pan room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the crumb"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bank knot", () => {
  assert.ok(world.rooms.rust_bank, "rust_bank room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the knot"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-step bead", () => {
  assert.ok(world.rooms.rust_step, "rust_step room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bead"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-flank slab", () => {
  assert.ok(world.rooms.rust_flank, "rust_flank room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the slab"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-crown", () => {
  assert.ok(world.rooms.rust_crown, "rust_crown room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the crown"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-fin spur", () => {
  assert.ok(world.rooms.rust_fin, "rust_fin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the spur"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-spur crest", () => {
  assert.ok(world.rooms.rust_spur, "rust_spur room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the crest"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hood knob", () => {
  assert.ok(world.rooms.rust_hood, "rust_hood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the knob"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rim wad", () => {
  assert.ok(world.rooms.rust_rim, "rust_rim room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the wad"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-peak fleck", () => {
  assert.ok(world.rooms.rust_peak, "rust_peak room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the fleck"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the oxide-hood lime", () => {
  assert.ok(world.rooms.oxide_hood, "oxide_hood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lime"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bay mud", () => {
  assert.ok(world.rooms.rust_bay, "rust_bay room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mud"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the oxide-step clay", () => {
  assert.ok(world.rooms.oxide_step, "oxide_step room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the clay"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the oxide-bay peel", () => {
  assert.ok(world.rooms.oxide_bay, "oxide_bay room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the peel"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-well skin", () => {
  assert.ok(world.rooms.rust_well, "rust_well room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the skin"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-drop slag", () => {
  assert.ok(world.rooms.rust_drop, "rust_drop room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the slag"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the oxide-stoop clod", () => {
  assert.ok(world.rooms.oxide_stoop, "oxide_stoop room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the clod"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-shelf curl", () => {
  assert.ok(world.rooms.rust_shelf, "rust_shelf room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the curl"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cap nub", () => {
  assert.ok(world.rooms.rust_cap, "rust_cap room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the nub"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ledge pit", () => {
  assert.ok(world.rooms.rust_ledge, "rust_ledge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pit"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the oxide-sump pock", () => {
  assert.ok(world.rooms.oxide_sump, "oxide_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pock"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-stoop rust", () => {
  assert.ok(world.rooms.rust_stoop, "rust_stoop room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rust"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the oxide-ridge scar", () => {
  assert.ok(world.rooms.oxide_ridge, "oxide_ridge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the scar"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the flange-nook washer", () => {
  assert.ok(world.rooms.flange_nook, "flange_nook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the washer"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the salt-sump rime", () => {
  assert.ok(world.rooms.salt_sump, "salt_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rime"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the flange-lip brass", () => {
  assert.ok(world.rooms.flange_lip, "flange_lip room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the brass"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the oxide-nook rind", () => {
  assert.ok(world.rooms.oxide_nook, "oxide_nook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rind"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the salt-ridge cake", () => {
  assert.ok(world.rooms.salt_ridge, "salt_ridge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cake"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the link-sump split", () => {
  assert.ok(world.rooms.link_sump, "link_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the split"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the salt-nook lump", () => {
  assert.ok(world.rooms.salt_nook, "salt_nook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lump"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the iron-sump sliver", () => {
  assert.ok(world.rooms.iron_sump, "iron_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sliver"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the gum-sump sap", () => {
  assert.ok(world.rooms.gum_sump, "gum_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sap"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the salt-sill grain", () => {
  assert.ok(world.rooms.salt_sill, "salt_sill room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the grain"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the link-ridge cotter", () => {
  assert.ok(world.rooms.link_ridge, "link_ridge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cotter"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the iron-ridge bits", () => {
  assert.ok(world.rooms.iron_ridge, "iron_ridge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bits"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the gum-ridge sludge", () => {
  assert.ok(world.rooms.gum_ridge, "gum_ridge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sludge"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the salt-lip salt", () => {
  assert.ok(world.rooms.salt_lip, "salt_lip room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the salt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the link-nook catch", () => {
  assert.ok(world.rooms.link_nook, "link_nook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the catch"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the iron-nook filings", () => {
  assert.ok(world.rooms.iron_nook, "iron_nook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the filings"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the gum-nook paste", () => {
  assert.ok(world.rooms.gum_nook, "gum_nook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the paste"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the oxide-sill scab", () => {
  assert.ok(world.rooms.oxide_sill, "oxide_sill room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the scab"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the link-sill clip", () => {
  assert.ok(world.rooms.link_sill, "link_sill room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the clip"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the iron-sill speck", () => {
  assert.ok(world.rooms.iron_sill, "iron_sill room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the speck"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the gum-sill grease", () => {
  assert.ok(world.rooms.gum_sill, "gum_sill room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the grease"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the oxide-lip bloom", () => {
  assert.ok(world.rooms.oxide_lip, "oxide_lip room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bloom"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the link-lip pin", () => {
  assert.ok(world.rooms.link_lip, "link_lip room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pin"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the iron-lip crust", () => {
  assert.ok(world.rooms.iron_lip, "iron_lip room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the crust"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the gum-lip oil", () => {
  assert.ok(world.rooms.gum_lip, "gum_lip room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the oil"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the chain-sump spike", () => {
  assert.ok(world.rooms.chain_sump, "chain_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the spike"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the hook-sump barb", () => {
  assert.ok(world.rooms.hook_sump, "hook_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the barb"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the snip-sump rivet", () => {
  assert.ok(world.rooms.snip_sump, "snip_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rivet"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sump powder", () => {
  assert.ok(world.rooms.rust_sump, "rust_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the powder"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the chain-ridge staple", () => {
  assert.ok(world.rooms.chain_ridge, "chain_ridge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the staple"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the hook-ridge collar", () => {
  assert.ok(world.rooms.hook_ridge, "hook_ridge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the collar"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the snip-ridge spring", () => {
  assert.ok(world.rooms.snip_ridge, "snip_ridge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the spring"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ridge stain", () => {
  assert.ok(world.rooms.rust_ridge, "rust_ridge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the stain"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the keg-sump tap", () => {
  assert.ok(world.rooms.keg_sump, "keg_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tap"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the pick-sump tang", () => {
  assert.ok(world.rooms.pick_sump, "pick_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tang"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the torch-sump ash", () => {
  assert.ok(world.rooms.torch_sump, "torch_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ash"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the chain-stoop weld", () => {
  assert.ok(world.rooms.chain_stoop, "chain_stoop room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the weld"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the hook-sill shank", () => {
  assert.ok(world.rooms.hook_sill, "hook_sill room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the shank"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the snip-sill blade", () => {
  assert.ok(world.rooms.snip_sill, "snip_sill room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the blade"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sill smear", () => {
  assert.ok(world.rooms.rust_sill, "rust_sill room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the smear"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the keg-ridge peg", () => {
  assert.ok(world.rooms.keg_ridge, "keg_ridge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the peg"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the pick-ridge ferrule", () => {
  assert.ok(world.rooms.pick_ridge, "pick_ridge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ferrule"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the torch-ridge ember", () => {
  assert.ok(world.rooms.torch_ridge, "torch_ridge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ember"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the chain-lip shackle", () => {
  assert.ok(world.rooms.chain_lip, "chain_lip room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the shackle"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the hook-lip ring", () => {
  assert.ok(world.rooms.hook_lip, "hook_lip room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ring"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the snip-lip pivot", () => {
  assert.ok(world.rooms.snip_lip, "snip_lip room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pivot"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-nook flange", () => {
  assert.ok(world.rooms.rust_nook, "rust_nook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the flange"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the pick-sill wrap", () => {
  assert.ok(world.rooms.pick_sill, "pick_sill room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the wrap"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the torch-sill resin", () => {
  assert.ok(world.rooms.torch_sill, "torch_sill room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the resin"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the keg-sill head", () => {
  assert.ok(world.rooms.keg_sill, "keg_sill room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the head"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the pick-lip haft", () => {
  assert.ok(world.rooms.pick_lip, "pick_lip room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the haft"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the torch-lip char", () => {
  assert.ok(world.rooms.torch_lip, "torch_lip room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the char"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the tide-sump muck", () => {
  assert.ok(world.rooms.tide_sump, "tide_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the muck"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the keg-nook chime", () => {
  assert.ok(world.rooms.keg_nook, "keg_nook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the chime"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the pick-nook burr", () => {
  assert.ok(world.rooms.pick_nook, "pick_nook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the burr"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the tide-ridge scum", () => {
  assert.ok(world.rooms.tide_ridge, "tide_ridge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the scum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the cache-sump lees", () => {
  assert.ok(world.rooms.cache_sump, "cache_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lees"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the hook-nook iron", () => {
  assert.ok(world.rooms.hook_nook, "hook_nook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the iron"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the snip-nook gum", () => {
  assert.ok(world.rooms.snip_nook, "snip_nook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the gum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lip oxide", () => {
  assert.ok(world.rooms.rust_lip, "rust_lip room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the oxide"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the torch-nook cinder", () => {
  assert.ok(world.rooms.torch_nook, "torch_nook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cinder"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the tide-nook foam", () => {
  assert.ok(world.rooms.tide_nook, "tide_nook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the foam"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the keg-lip pitch", () => {
  assert.ok(world.rooms.keg_lip, "keg_lip room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pitch"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the chain-sill link", () => {
  assert.ok(world.rooms.chain_sill, "chain_sill room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the link"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the tide-lip kelp", () => {
  assert.ok(world.rooms.tide_lip, "tide_lip room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kelp"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the cache-nook slat", () => {
  assert.ok(world.rooms.cache_nook, "cache_nook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the slat"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the oil-ridge bung", () => {
  assert.ok(world.rooms.oil_ridge, "oil_ridge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bung"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the tide-sill brine", () => {
  assert.ok(world.rooms.tide_sill, "tide_sill room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the brine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the lamp-ridge wick", () => {
  assert.ok(world.rooms.lamp_ridge, "lamp_ridge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the wick"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the cache-lip crate", () => {
  assert.ok(world.rooms.cache_lip, "cache_lip room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the crate"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the stair-sump stone", () => {
  assert.ok(world.rooms.stair_sump, "stair_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the stone"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the oil-sump drip", () => {
  assert.ok(world.rooms.oil_sump, "oil_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the drip"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the lamp-lip soot", () => {
  assert.ok(world.rooms.lamp_lip, "lamp_lip room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the soot"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the stair-lip mortar", () => {
  assert.ok(world.rooms.stair_lip, "stair_lip room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mortar"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the oil-lip stave", () => {
  assert.ok(world.rooms.oil_lip, "oil_lip room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the stave"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the gallery-lip paint", () => {
  assert.ok(world.rooms.gallery_lip, "gallery_lip room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the paint"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the cache-sill straw", () => {
  assert.ok(world.rooms.cache_sill, "cache_sill room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the straw"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes scraping the stair-sill grit", () => {
  assert.ok(world.rooms.stair_sill, "stair_sill room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("scrape the grit"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the oil-sill hoop", () => {
  assert.ok(world.rooms.oil_sill, "oil_sill room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hoop"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the lamp-sill film", () => {
  assert.ok(world.rooms.lamp_sill, "lamp_sill room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the film"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the gallery-sill scale", () => {
  assert.ok(world.rooms.gallery_sill, "gallery_sill room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the scale"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes scraping the hold-stoop plank", () => {
  assert.ok(world.rooms.hold_stoop, "hold_stoop room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("scrape the plank"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the ice-ridge frost", () => {
  assert.ok(world.rooms.ice_ridge, "ice_ridge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the frost"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes scraping the cellar-stoop flag", () => {
  assert.ok(world.rooms.cellar_stoop, "cellar_stoop room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("scrape the flag"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the cleft-ridge silt", () => {
  assert.ok(world.rooms.cleft_ridge, "cleft_ridge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the silt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the strand-ridge weed", () => {
  assert.ok(world.rooms.strand_ridge, "strand_ridge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the weed"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the oar-ridge leather", () => {
  assert.ok(world.rooms.oar_ridge, "oar_ridge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the leather"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the net-ridge tar", () => {
  assert.ok(world.rooms.net_ridge, "net_ridge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tar"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes scraping the door-lintel grit", () => {
  assert.ok(world.rooms.door_lintel, "door_lintel room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("scrape the lintel"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes scraping the crypt-stoop joint", () => {
  assert.ok(world.rooms.crypt_stoop, "crypt_stoop room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("scrape the joint"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the oar-nook loom", () => {
  assert.ok(world.rooms.oar_nook, "oar_nook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the loom"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes scraping the door-sill salt", () => {
  assert.ok(world.rooms.door_sill, "door_sill room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("scrape the salt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the net-sill twine", () => {
  assert.ok(world.rooms.net_sill, "net_sill room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the twine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes thumbing the cellar-nook brick", () => {
  assert.ok(world.rooms.cellar_nook, "cellar_nook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("thumb the brick"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the hold-lip oak", () => {
  assert.ok(world.rooms.hold_lip, "hold_lip room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the oak"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes scraping the ice-sill sand", () => {
  assert.ok(world.rooms.ice_sill, "ice_sill room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("scrape the sand"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes thumbing the cleft-ledge slime", () => {
  assert.ok(world.rooms.cleft_ledge, "cleft_ledge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("thumb the slime"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes thumbing the crypt-nook mortar", () => {
  assert.ok(world.rooms.crypt_nook, "crypt_nook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("thumb the mortar"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the strand-lip bladder", () => {
  assert.ok(world.rooms.strand_lip, "strand_lip room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bladder"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes easing the door-hinge pin", () => {
  assert.ok(world.rooms.door_hinge, "door_hinge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("ease the pin"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes scraping the lamp-nook rust", () => {
  assert.ok(world.rooms.lamp_nook, "lamp_nook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("scrape the rust"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the gallery-sump bolt", () => {
  assert.ok(world.rooms.gallery_sump, "gallery_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bolt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the cellar-sump nail", () => {
  assert.ok(world.rooms.cellar_sump, "cellar_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the nail"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes twisting the hold-nook trenail", () => {
  assert.ok(world.rooms.hold_nook, "hold_nook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("twist the trenail"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the net-nook float", () => {
  assert.ok(world.rooms.net_nook, "net_nook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the float"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes scraping the oar-sump blade", () => {
  assert.ok(world.rooms.oar_sump, "oar_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("scrape the blade"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the crypt-sump chip", () => {
  assert.ok(world.rooms.crypt_sump, "crypt_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the chip"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes scraping the cleft-nook nick", () => {
  assert.ok(world.rooms.cleft_nook, "cleft_nook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("scrape the nick"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the ice-sump flake", () => {
  assert.ok(world.rooms.ice_sump, "ice_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the flake"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the strand-sump shard", () => {
  assert.ok(world.rooms.strand_sump, "strand_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the shard"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes scraping the cove-sump rib", () => {
  assert.ok(world.rooms.cove_sump, "cove_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("scrape the rib"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the grave-hood lichen", () => {
  assert.ok(world.rooms.grave_hood, "grave_hood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lichen"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes thumbing the vestry-loft cassock", () => {
  assert.ok(world.rooms.vestry_loft, "vestry_loft room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("thumb the cassock"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the grave-sump grit", () => {
  assert.ok(world.rooms.grave_sump, "grave_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the grit"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes wiping the tavern-porch rail", () => {
  assert.ok(world.rooms.tavern_porch, "tavern_porch room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("wipe the rail"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes scraping the vestry-stoop step", () => {
  assert.ok(world.rooms.vestry_stoop, "vestry_stoop room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("scrape the step"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the cairn-hood moss", () => {
  assert.ok(world.rooms.cairn_hood, "cairn_hood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the moss"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes scraping the wharf-sump pile", () => {
  assert.ok(world.rooms.wharf_sump, "wharf_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("scrape the pile"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes rapping the boat-ridge", () => {
  assert.ok(world.rooms.boat_ridge, "boat_ridge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("rap the ridge"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pressing the cairn-sump sod", () => {
  assert.ok(world.rooms.cairn_sump, "cairn_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("press the sod"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes thumbing the pit-sump ember", () => {
  assert.ok(world.rooms.pit_sump, "pit_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("thumb the ember"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes cupping the dory-sump silt", () => {
  assert.ok(world.rooms.dory_sump, "dory_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("cup the silt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the nest-pit dirt", () => {
  assert.ok(world.rooms.nest_pit, "nest_pit room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the dirt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes scraping the inn-stoop tread", () => {
  assert.ok(world.rooms.inn_stoop, "inn_stoop room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("scrape the tread"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes picking the sexton-cellar shard", () => {
  assert.ok(world.rooms.sexton_cellar, "sexton_cellar room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pick the shard"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes tapping the chapel-cellar flag", () => {
  assert.ok(world.rooms.chapel_cellar, "chapel_cellar room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("tap the flag"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes lifting the pit-hood cowl", () => {
  assert.ok(world.rooms.pit_hood, "pit_hood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("lift the cowl"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes gripping the headland turf", () => {
  assert.ok(world.rooms.headland_lip, "headland_lip room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("grip the turf"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes thumbing the nest-loft lint", () => {
  assert.ok(world.rooms.nest_loft, "nest_loft room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("thumb the lint"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes rapping the dory transom", () => {
  assert.ok(world.rooms.dory_keel, "dory_keel room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("rap the transom"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the sexton-loft thatch", () => {
  assert.ok(world.rooms.sexton_loft, "sexton_loft room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the thatch"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes plucking the chapel-loft rope", () => {
  assert.ok(world.rooms.chapel_loft, "chapel_loft room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pluck the rope"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes tapping the inn-room lath", () => {
  assert.ok(world.rooms.inn_loft, "inn_loft room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("tap the lath"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes tapping the wreck-cabin rafter", () => {
  assert.ok(world.rooms.cabin_beam, "cabin_beam room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("tap the rafter"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes picking the mouse-run pellet", () => {
  assert.ok(world.rooms.mouse_pit, "mouse_pit room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pick the pellet"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes seating the peat-crate cap", () => {
  assert.ok(world.rooms.peat_lid, "peat_lid room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("seat the cap"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the nest-nook fluff", () => {
  assert.ok(world.rooms.nest_fluff, "nest_fluff room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the fluff"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes gripping the scraper post", () => {
  assert.ok(world.rooms.scraper_post, "scraper_post room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("grip the post"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pressing the peat-crate stave", () => {
  assert.ok(world.rooms.peat_wall, "peat_wall room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("press the stave"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes lifting the nest-nook tuft", () => {
  assert.ok(world.rooms.nest_rim, "nest_rim room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("lift the tuft"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes picking the oat-sack hull", () => {
  assert.ok(world.rooms.oat_floor, "oat_floor room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pick the hull"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes thumbing the scraper-sump mud", () => {
  assert.ok(world.rooms.scraper_sump, "scraper_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("thumb the mud"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the peat-crate dust", () => {
  assert.ok(world.rooms.peat_pit, "peat_pit room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the dust"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes feeling the mouse-loft beam", () => {
  assert.ok(world.rooms.mouse_loft, "mouse_loft room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("feel the beam"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes rapping the oat-sack beam", () => {
  assert.ok(world.rooms.sack_beam, "sack_beam room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("rap the beam"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes thumbing the feed-bin dregs", () => {
  assert.ok(world.rooms.oat_dregs, "oat_dregs room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("thumb the dregs"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes tracing the mouse-run husk trail", () => {
  assert.ok(world.rooms.husk_trail, "husk_trail room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("trace the husk"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes lifting the feed-bin hatch cover", () => {
  assert.ok(world.rooms.bin_hatch, "bin_hatch room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("lift the cover"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes lifting the oat-sack spill", () => {
  assert.ok(world.rooms.oat_spill, "oat_spill room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("lift the spill"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes knocking grit from the scraper tray", () => {
  assert.ok(world.rooms.grit_tray, "grit_tray room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("knock the grit"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes thumbing the tack-room crack", () => {
  assert.ok(world.rooms.tack_crack, "tack_crack room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("thumb the crack"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes feeling the mouse-run gnaw", () => {
  assert.ok(world.rooms.gnaw_rail, "gnaw_rail room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("feel the gnaw"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes picking the feed-bin husk", () => {
  assert.ok(world.rooms.bin_foot, "bin_foot room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pick the husk"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pressing the scraper heel-iron", () => {
  assert.ok(world.rooms.heel_iron, "heel_iron room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("press the iron"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes folding the oat-sack lip", () => {
  assert.ok(world.rooms.sack_lip, "sack_lip room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("fold the flap"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes lifting the tack-loft numnah", () => {
  assert.ok(world.rooms.tack_loft, "tack_loft room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("lift the numnah"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes flexing the peat-crate slat", () => {
  assert.ok(world.rooms.peat_slat, "peat_slat room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("flex the slat"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes prising the boot-scraper clay", () => {
  assert.ok(world.rooms.clay_pan, "clay_pan room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("prise the clay"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes scraping the feed-bin chew", () => {
  assert.ok(world.rooms.bin_rim, "bin_rim room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("scrape the chew"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes bracing the cliff-stair drop", () => {
  assert.ok(world.rooms.path_drop, "path_drop room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("brace the step"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes seating the tack-room girth", () => {
  assert.ok(world.rooms.girth_peg, "girth_peg room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("seat the girth"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes brushing the peat-crate crumb", () => {
  assert.ok(world.rooms.peat_edge, "peat_edge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("brush the crumb"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes tracing the path-nook nick", () => {
  assert.ok(world.rooms.path_nook, "path_nook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("trace the nick"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes hanging the tack-room bit", () => {
  assert.ok(world.rooms.bit_hook, "bit_hook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("hang the bit"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes lifting the cottage-nook slate", () => {
  assert.ok(world.rooms.cottage_nook, "cottage_nook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("lift the slate"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes chipping the well-apron lime", () => {
  assert.ok(world.rooms.well_apron, "well_apron room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("chip the lime"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes raking the cottage-cellar ash", () => {
  assert.ok(world.rooms.cottage_cellar, "cottage_cellar room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("rake the ash"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the herb-loft bundle", () => {
  assert.ok(world.rooms.herb_loft, "herb_loft room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bundle"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes seating the garden trellis lath", () => {
  assert.ok(world.rooms.trellis, "trellis room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("seat the lath"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes lifting the well-lid", () => {
  assert.ok(world.rooms.well_lid, "well_lid room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("lift the lid"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes sifting the herb-bin stalks", () => {
  assert.ok(world.rooms.herb_bin, "herb_bin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("sift the stalks"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes turning the garden compost heap", () => {
  assert.ok(world.rooms.compost, "compost room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("turn the heap"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes thumbing the well-silt pebble", () => {
  assert.ok(world.rooms.well_silt, "well_silt room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("thumb the pebble"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes brushing the paddock salt-rail", () => {
  assert.ok(world.rooms.salt_rail, "salt_rail room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("brush the salt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes wiping the still-vent lip", () => {
  assert.ok(world.rooms.still_vent, "still_vent room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("wipe the lip"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes lifting the trough pump-arm", () => {
  assert.ok(world.rooms.pump_arm, "pump_arm room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("lift the arm"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes feeling the ridge-vent draft", () => {
  assert.ok(world.rooms.ridge_vent, "ridge_vent room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("feel the draft"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes crushing the still-ash flake", () => {
  assert.ok(world.rooms.still_ash, "still_ash room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("crush the flake"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes picking the trough-foot silt", () => {
  assert.ok(world.rooms.trough_foot, "trough_foot room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pick the silt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes chipping the paddock post-hole crust", () => {
  assert.ok(world.rooms.post_hole, "post_hole room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("chip the crust"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes poking the stall-drain grate", () => {
  assert.ok(world.rooms.stall_drain, "stall_drain room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("poke the grate"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes scraping the inkwell dregs", () => {
  assert.ok(world.rooms.ink_dregs, "ink_dregs room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("scrape the dregs"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes stirring the ledger-bin scraps", () => {
  assert.ok(world.rooms.ledger_bin, "ledger_bin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("stir the scraps"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes working the blot-press screw", () => {
  assert.ok(world.rooms.blot_press, "blot_press room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("work the screw"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes thumbing the scale-pan dent", () => {
  assert.ok(world.rooms.scale_pan, "scale_pan room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("thumb the dent"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes raking the sack-pit dust", () => {
  assert.ok(world.rooms.sack_pit, "sack_pit room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("rake the dust"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes rolling the inkwell spare pen", () => {
  assert.ok(world.rooms.pen_rest, "pen_rest room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("roll the pen"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes knotting the sack-loft twine", () => {
  assert.ok(world.rooms.sack_loft, "sack_loft room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("knot the twine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes sliding the blotter spare sheet", () => {
  assert.ok(world.rooms.blot_shelf, "blot_shelf room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("slide the sheet"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes rapping the ledger loft joist", () => {
  assert.ok(world.rooms.ledger_loft, "ledger_loft room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("rap the joist"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes sorting the inkwell nib box", () => {
  assert.ok(world.rooms.nib_box, "nib_box room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("sort the nibs"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes twirling the ledger pencil stub", () => {
  assert.ok(world.rooms.pencil_box, "pencil_box room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("twirl the stub"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes honing the blotter letter-knife", () => {
  assert.ok(world.rooms.letter_knife, "letter_knife room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("hone the edge"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes scraping the chute pan", () => {
  assert.ok(world.rooms.chute_pan, "chute_pan room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("scrape the pan"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes packing the hopper boot seam", () => {
  assert.ok(world.rooms.hopper_boot, "hopper_boot room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pack the seam"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes rattling the spare flue", () => {
  assert.ok(world.rooms.spare_flue, "spare_flue room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("rattle the flue"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes scoring the sack-bay tally board", () => {
  assert.ok(world.rooms.tally_board, "tally_board room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("score the tally"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes nicking the sealing-wax stick", () => {
  assert.ok(world.rooms.sealing_wax, "sealing_wax room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("nick the stick"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes stirring the bunker sump", () => {
  assert.ok(world.rooms.bunker_sump, "bunker_sump room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("stir the sump"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes tossing a wisp in the hay loft", () => {
  assert.ok(world.rooms.hay_loft, "hay_loft room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("toss a wisp"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes tapping the chute collar", () => {
  assert.ok(world.rooms.chute_collar, "chute_collar room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("tap the collar"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes seating the hopper lid", () => {
  assert.ok(world.rooms.hopper_lid, "hopper_lid room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("seat the lid"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes sifting the inkwell pounce pot", () => {
  assert.ok(world.rooms.pounce_pot, "pounce_pot room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("sift the pounce"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pressing the ledger stamp pad", () => {
  assert.ok(world.rooms.stamp_pad, "stamp_pad room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("press the pad"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes testing the sack-bay hook", () => {
  assert.ok(world.rooms.sack_hook, "sack_hook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("test the hook"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes tracing a date in the weigh loft", () => {
  assert.ok(world.rooms.weigh_loft, "weigh_loft room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("trace a date"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes kicking slack at the chute heap", () => {
  assert.ok(world.rooms.slack_heap, "slack_heap room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("kick the slack"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pulling a ticket from the weigh-house spike", () => {
  assert.ok(world.rooms.ticket_spike, "ticket_spike room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pull the ticket"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes gripping a rung on the coal chute", () => {
  assert.ok(world.rooms.chute_rung, "chute_rung room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("grip the rung"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes throwing the bunker hatch bolt", () => {
  assert.ok(world.rooms.coal_hatch, "coal_hatch room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("throw the bolt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes seating the lean-to vent flap", () => {
  assert.ok(world.rooms.vent_flap, "vent_flap room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("seat the flap"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes lifting the stable hay fork", () => {
  assert.ok(world.rooms.hay_fork, "hay_fork room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("lift the fork"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes wiping the attic dormer sill", () => {
  assert.ok(world.rooms.dormer_sill, "dormer_sill room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("wipe the sill"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes shaking the hopper's clinker tray", () => {
  assert.ok(world.rooms.clinker_tray, "clinker_tray room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("shake the tray"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes kicking the stub of the missing post", () => {
  assert.ok(world.rooms.missing_post, "missing_post room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("kick the stub"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes rattling the hitch ring at the trough", () => {
  assert.ok(world.rooms.hitch_ring, "hitch_ring room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("rattle the ring"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes turning the still-room spirit tap", () => {
  assert.ok(world.rooms.spirit_tap, "spirit_tap room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("turn the tap"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes lifting a weight on the scale", () => {
  assert.ok(world.rooms.scale_weight, "scale_weight room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("lift the weight"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes working the bunker coal slide", () => {
  assert.ok(world.rooms.coal_slide, "coal_slide room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("work the slide"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes prising the lid on the wick tin", () => {
  assert.ok(world.rooms.wick_tin, "wick_tin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("prise the lid"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes rubbing the chew on the manger rail", () => {
  assert.ok(world.rooms.manger_rail, "manger_rail room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("rub the chew"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes plucking the paddock fence wire", () => {
  assert.ok(world.rooms.fence_wire, "fence_wire room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pluck the wire"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes seating the trough bung", () => {
  assert.ok(world.rooms.trough_bung, "trough_bung room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("seat the bung"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes twisting a nail in the rafters", () => {
  assert.ok(world.rooms.rafter_nail, "rafter_nail room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("twist the nail"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes easing the hopper coal gate", () => {
  assert.ok(world.rooms.coal_gate, "coal_gate room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("ease the gate"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes turning the well crank", () => {
  assert.ok(world.rooms.well_crank, "well_crank room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("turn the crank"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes thumbing wax on the spirit jar", () => {
  assert.ok(world.rooms.spirit_jar, "spirit_jar room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("thumb the wax"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes teasing a strand in the hemp bin", () => {
  assert.ok(world.rooms.hemp_bin, "hemp_bin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("tease a strand"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes straightening the inn-room peg", () => {
  assert.ok(world.rooms.peg_rail, "peg_rail room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("straighten the peg"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes seating a nut on the gallery rail", () => {
  assert.ok(world.rooms.rail_bolt, "rail_bolt room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("seat the nut"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes counting beads on the string", () => {
  assert.ok(world.rooms.bead_string, "bead_string room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("count the beads"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes tipping the ash bucket", () => {
  assert.ok(world.rooms.ash_bucket, "ash_bucket room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("tip the bucket"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pressing the prie-dieu cushion", () => {
  assert.ok(world.rooms.prie_dieu, "prie_dieu room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("press the cushion"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes rapping the cabin bulkhead", () => {
  assert.ok(world.rooms.bulkhead, "bulkhead room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("rap the plank"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes nudging the tavern spittoon", () => {
  assert.ok(world.rooms.spittoon, "spittoon room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("nudge the tin"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes splitting a brick in the peat crate", () => {
  assert.ok(world.rooms.peat_crate, "peat_crate room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("split a brick"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes working the wick scissors", () => {
  assert.ok(world.rooms.wick_scissors, "wick_scissors room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("work the snips"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes tilting the grave vase", () => {
  assert.ok(world.rooms.grave_vase, "grave_vase room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("tilt the vase"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes turning the pall ring", () => {
  assert.ok(world.rooms.pall_ring, "pall_ring room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("turn the ring"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes snapping a stem on the drying rack", () => {
  assert.ok(world.rooms.drying_rack, "drying_rack room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("snap a stem"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes scraping a boot at the stair foot", () => {
  assert.ok(world.rooms.boot_scraper, "boot_scraper room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("scrape a boot"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes twisting the rowlock horn", () => {
  assert.ok(world.rooms.rowlock, "rowlock room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("twist the horn"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes testing the ice pick", () => {
  assert.ok(world.rooms.ice_pick, "ice_pick room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("test the pick"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes wiping the wreck-cabin porthole", () => {
  assert.ok(world.rooms.porthole, "porthole room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("wipe the glass"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes lifting the cold-frame pane", () => {
  assert.ok(world.rooms.cold_frame, "cold_frame room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("lift the pane"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes gripping the shovel haft", () => {
  assert.ok(world.rooms.shovel_haft, "shovel_haft room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("grip the haft"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes feeling the hook on the landing", () => {
  assert.ok(world.rooms.key_hook, "key_hook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("feel the hook"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pressing the stud at the door", () => {
  assert.ok(world.rooms.door_stud, "door_stud room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("press the stud"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes working the hasp on the plate", () => {
  assert.ok(world.rooms.hasp_plate, "hasp_plate room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("work the hasp"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes tapping a knee in the hold", () => {
  assert.ok(world.rooms.rib_knee, "rib_knee room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("tap the knee"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes counting stones at the cairn base", () => {
  assert.ok(world.rooms.cairn_base, "cairn_base room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("count the stones"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes hanging a link on the chain hook", () => {
  assert.ok(world.rooms.chain_hook, "chain_hook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("hang a link"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes seating a brand on the torch rest", () => {
  assert.ok(world.rooms.torch_rest, "torch_rest room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("seat the brand"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes drawing a fid from the rack", () => {
  assert.ok(world.rooms.fid_rack, "fid_rack room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("draw a fid"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes throwing the window catch", () => {
  assert.ok(world.rooms.window_latch, "window_latch room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("throw the catch"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes turning a leaf on the lectern", () => {
  assert.ok(world.rooms.lectern, "lectern room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("turn a leaf"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes licking salt on the gallery pan", () => {
  assert.ok(world.rooms.salt_pan, "salt_pan room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("lick the salt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes rapping the kettle lid", () => {
  assert.ok(world.rooms.kettle_lid, "kettle_lid room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("rap the lid"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes knocking soot from the brush", () => {
  assert.ok(world.rooms.soot_brush, "soot_brush room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("knock the soot"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes touching the stoup rim", () => {
  assert.ok(world.rooms.stoup, "stoup room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("touch the rim"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes lifting the lych-gate latch", () => {
  assert.ok(world.rooms.lych_gate, "lych_gate room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("lift the latch"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes rattling the seed tin", () => {
  assert.ok(world.rooms.seed_tin, "seed_tin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("rattle the tin"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes counting wicks in the wick box", () => {
  assert.ok(world.rooms.wick_box, "wick_box room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("count the wicks"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes seating a thole in the pin hole", () => {
  assert.ok(world.rooms.thole_pin, "thole_pin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("seat the thole"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes cupping water from the tide pool", () => {
  assert.ok(world.rooms.tide_pool, "tide_pool room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("cup the water"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes spinning the binnacle card", () => {
  assert.ok(world.rooms.binnacle, "binnacle room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("spin the card"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes tracing a burn on the lightning rod", () => {
  assert.ok(world.rooms.lightning_rod, "lightning_rod room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("trace the burn"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes twisting a bung on the keg", () => {
  assert.ok(world.rooms.keg_bung, "keg_bung room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("twist the bung"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes unrolling a chart from the tube", () => {
  assert.ok(world.rooms.chart_tube, "chart_tube room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("unroll the chart"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes thumbing copper on the cutwater", () => {
  assert.ok(world.rooms.cutwater, "cutwater room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("thumb the copper"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes wiping the snuff-spoon bowl", () => {
  assert.ok(world.rooms.snuff_spoon, "snuff_spoon room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("wipe the bowl"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes stretching mesh on the malt riddle", () => {
  assert.ok(world.rooms.malt_riddle, "malt_riddle room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("stretch the mesh"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes peeling the palette knife", () => {
  assert.ok(world.rooms.palette_knife, "palette_knife room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("peel the knife"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes cracking a barnacle on the plate", () => {
  assert.ok(world.rooms.barnacle, "barnacle room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("crack a barnacle"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes knapping flint in the flint box", () => {
  assert.ok(world.rooms.flint_box, "flint_box room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("knap the flint"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes clearing a groove on the mash stone", () => {
  assert.ok(world.rooms.mash_stone, "mash_stone room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("clear the groove"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes rocking a runner on the ice sled", () => {
  assert.ok(world.rooms.ice_sled, "ice_sled room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("rock the runner"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes twisting the haul bar", () => {
  assert.ok(world.rooms.haul_bar, "haul_bar room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("twist the bar"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes closing a link on the drag chain", () => {
  assert.ok(world.rooms.drag_chain, "drag_chain room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("close the link"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pressing a slat on the block mold", () => {
  assert.ok(world.rooms.block_mold, "block_mold room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("press the slat"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes testing the ice-hook point", () => {
  assert.ok(world.rooms.ice_hook, "ice_hook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("test the point"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes rapping the ice-saw teeth", () => {
  assert.ok(world.rooms.ice_saw, "ice_saw room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("rap the teeth"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes scraping film from the wort pail", () => {
  assert.ok(world.rooms.wort_pail, "wort_pail room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("scrape the film"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes tugging a band on the packing straw", () => {
  assert.ok(world.rooms.packing_straw, "packing_straw room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("tug the band"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes striking a stick in the match tin", () => {
  assert.ok(world.rooms.match_tin, "match_tin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("strike the stick"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes sniffing the barm crock", () => {
  assert.ok(world.rooms.barm_crock, "barm_crock room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("sniff the barm"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes lifting a board in the sawdust bin", () => {
  assert.ok(world.rooms.sawdust_bin, "sawdust_bin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("lift the board"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes flexing the mash-paddle blade", () => {
  assert.ok(world.rooms.mash_paddle, "mash_paddle room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("flex the blade"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes seating a hoop on the worm tub", () => {
  assert.ok(world.rooms.worm_tub, "worm_tub room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("seat the hoop"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes closing the ice-tong jaws", () => {
  assert.ok(world.rooms.ice_tongs, "ice_tongs room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("close the jaws"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes tipping the sand shaker", () => {
  assert.ok(world.rooms.sand_shaker, "sand_shaker room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("tip the shaker"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pulling the straw plug", () => {
  assert.ok(world.rooms.straw_plug, "straw_plug room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pull the plug"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes shaking the ash-rake tines", () => {
  assert.ok(world.rooms.ash_rake, "ash_rake room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("shake the tines"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes picking a cork from the wrack line", () => {
  assert.ok(world.rooms.wrack_line, "wrack_line room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pick the cork"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes unfolding the oiled paper", () => {
  assert.ok(world.rooms.oiled_paper, "oiled_paper room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("unfold the paper"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes scraping a drop from the drip tray", () => {
  assert.ok(world.rooms.drip_tray, "drip_tray room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("scrape the drop"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes tugging a holdfast on the kelp mat", () => {
  assert.ok(world.rooms.kelp_mat, "kelp_mat room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("tug the holdfast"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes working the snuff-tin lid", () => {
  assert.ok(world.rooms.snuff_tin, "snuff_tin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("work the lid"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes prising a shell from the spray cup", () => {
  assert.ok(world.rooms.spray_cup, "spray_cup room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("prise the shell"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes teasing a shred in the nest nook", () => {
  assert.ok(world.rooms.nest_nook, "nest_nook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("tease the shred"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes squeezing the stopper-jar cork", () => {
  assert.ok(world.rooms.stopper, "stopper room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("squeeze the cork"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes rolling a button from the box", () => {
  assert.ok(world.rooms.button_box, "button_box room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("roll the button"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes listening at the mouse-run hole", () => {
  assert.ok(world.rooms.mouse_run, "mouse_run room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("listen at the hole"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes tilting the paint funnel", () => {
  assert.ok(world.rooms.funnel, "funnel room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("tilt the funnel"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes cracking a lump in the char pan", () => {
  assert.ok(world.rooms.char_pan, "char_pan room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("crack the lump"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes dipping a finger in the glass rest", () => {
  assert.ok(world.rooms.glass_rest, "glass_rest room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("dip a finger"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes drawing the pin from the thimble", () => {
  assert.ok(world.rooms.thimble, "thimble room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("draw the pin"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pressing a rivet on the hull plate", () => {
  assert.ok(world.rooms.hull_plate, "hull_plate room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("press the rivet"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the oat-sack seam", () => {
  assert.ok(world.rooms.oat_sack, "oat_sack room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the seam"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes loosening the turpentine cap", () => {
  assert.ok(world.rooms.turps, "turps room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("loosen the cap"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes tugging yarn in the darning box", () => {
  assert.ok(world.rooms.darning, "darning room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("tug the yarn"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes tapping the censer bowl", () => {
  assert.ok(world.rooms.censer, "censer room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("tap the bowl"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes wiping lichen in the spy notch", () => {
  assert.ok(world.rooms.spy_notch, "spy_notch room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("wipe the lichen"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes scraping crust in the scupper", () => {
  assert.ok(world.rooms.scupper, "scupper room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("scrape the crust"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes rattling the feed-bin scoop", () => {
  assert.ok(world.rooms.feed_bin, "feed_bin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("rattle the scoop"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes wringing a rag in the rag tin", () => {
  assert.ok(world.rooms.rag_tin, "rag_tin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("wring a rag"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes threading the mending-basket needle", () => {
  assert.ok(world.rooms.mending, "mending room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("thread the needle"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes peeling the inkwell blotter", () => {
  assert.ok(world.rooms.blotter, "blotter room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("peel the blotter"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes probing silt in the limber hole", () => {
  assert.ok(world.rooms.limber, "limber room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("probe the silt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes testing the inkwell nib", () => {
  assert.ok(world.rooms.inkwell, "inkwell room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("test the nib"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes smoothing the ledger's torn page", () => {
  assert.ok(world.rooms.ledger_nook, "ledger_nook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("smooth the torn page"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes lifting a shingle from the stack", () => {
  assert.ok(world.rooms.shingle_stack, "shingle_stack room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("lift a shingle"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes twisting the tar-pot stick", () => {
  assert.ok(world.rooms.tar_pot, "tar_pot room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("twist the stick"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes emptying the drip pail", () => {
  assert.ok(world.rooms.drip_pail, "drip_pail room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("empty the pail"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes nudging the weigh-house needle", () => {
  assert.ok(world.rooms.weigh_house, "weigh_house room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("nudge the needle"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes clearing the strum-box grate", () => {
  assert.ok(world.rooms.strum_box, "strum_box room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("clear the grate"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes untying the kindling-bin bundle", () => {
  assert.ok(world.rooms.kindling_bin, "kindling_bin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("untie the bundle"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pulling the wood-shed oak wedge", () => {
  assert.ok(world.rooms.wood_shed, "wood_shed room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pull the oak wedge"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pulling a stitch in the sack bay", () => {
  assert.ok(world.rooms.sack_bay, "sack_bay room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pull the stitch"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes working the bilge pump", () => {
  assert.ok(world.rooms.bilge, "bilge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("work the pump"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pressing the hopper's split board", () => {
  assert.ok(world.rooms.hopper, "hopper room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("press the split board"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes drawing the sawhorse saw", () => {
  assert.ok(world.rooms.sawhorse, "sawhorse room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("draw the saw"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes shaking the linen-shelf nightshirt", () => {
  assert.ok(world.rooms.linen, "linen room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("shake the nightshirt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes corking the reliquary bottle", () => {
  assert.ok(world.rooms.reliquary, "reliquary room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("cork the open bottle"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes twisting the keelson copper bolt", () => {
  assert.ok(world.rooms.keelson, "keelson room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("twist the copper bolt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes wiping a paint-locker brush", () => {
  assert.ok(world.rooms.brush_rack, "brush_rack room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("wipe a brush"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes rattling the coal chute", () => {
  assert.ok(world.rooms.chute, "chute room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("rattle the chute"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes working the chopping-block axe", () => {
  assert.ok(world.rooms.chopping_block, "chopping_block room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("work the axe"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes tracing boot-scuffs on the lookout ledge", () => {
  assert.ok(world.rooms.ledge, "ledge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("trace the boot-scuffs"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes lifting the tack-room curry-comb", () => {
  assert.ok(world.rooms.tack_room, "tack_room room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("lift the curry-comb"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes touching the stable bridle hook", () => {
  assert.ok(world.rooms.stable, "stable room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("touch the bridle hook"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes counting the paddock posts", () => {
  assert.ok(world.rooms.paddock, "paddock room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("count the posts"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes wiping moss from the horse trough", () => {
  assert.ok(world.rooms.trough, "trough room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("wipe the moss"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes hauling the cottage-well bucket", () => {
  assert.ok(world.rooms.well, "well room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("haul the bucket"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes turning a tin lid in the paint locker", () => {
  assert.ok(world.rooms.paint_locker, "paint_locker room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("turn a tin lid"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes tipping the ossuary keeper's cap", () => {
  assert.ok(world.rooms.ossuary, "ossuary room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("tip the keeper's cap"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes stirring the signal-pit ash", () => {
  assert.ok(world.rooms.fire_pit, "fire_pit room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("stir the cold ash"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes folding the attic oilskin lining", () => {
  assert.ok(world.rooms.trunk_nook, "trunk_nook room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("fold the oilskin lining"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pouring the inn washstand ewer", () => {
  assert.ok(world.rooms.washstand, "washstand room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pour the ewer"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes restacking the sexton woodpile", () => {
  assert.ok(world.rooms.woodpile, "woodpile room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("restack the wood"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes salvaging wax from the brig hold", () => {
  assert.ok(world.rooms.hold, "hold room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("salvage a handful of wax"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes banking coal in the bunker", () => {
  assert.ok(world.rooms.bunker, "bunker room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("bank the coal"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes freeing the weather vane", () => {
  assert.ok(world.rooms.vane, "vane room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("free the vane"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes stirring the smugglers' cache straw", () => {
  assert.ok(world.rooms.cache, "cache room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("stir the straw"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes sniffing the still-room copper worm", () => {
  assert.ok(world.rooms.still_room, "still_room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("sniff the copper worm"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes tasting the ice-pit melt", () => {
  assert.ok(world.rooms.ice_pit, "ice_pit room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("taste the melt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes lashing the cork fender in the oar loft", () => {
  assert.ok(world.rooms.oar_loft, "oar_loft room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("lash the cork fender"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes the sexton's prayer for the drowned", () => {
  assert.ok(world.rooms.sexton_hut, "sexton_hut room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("read the prayer for the drowned"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes tracing the brig's name-board", () => {
  assert.ok(world.rooms.brig_stem, "brig_stem room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("trace the name HESTER"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes fitting a spare chimney in the lean-to", () => {
  assert.ok(world.rooms.lean_to, "lean_to room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("fit a spare chimney"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes glassing the reef from the attic", () => {
  assert.ok(world.rooms.attic, "attic room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("glass the reef"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes bowing in the chapel crypt", () => {
  assert.ok(world.rooms.crypt, "crypt room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("bow at the empty niche"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes hoisting the wrecker's rag-flag", () => {
  assert.ok(world.rooms.wreck_post, "wreck_post room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("hoist the rag-flag"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes reading the smugglers' tide-marks", () => {
  assert.ok(world.rooms.cleft, "cleft room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("read the tide-marks"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes watching the reef from the inn window", () => {
  assert.ok(world.rooms.inn_room, "inn_room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("watch the reef from the window"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes looking out the net-loft hatch", () => {
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("look out the hatch"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes crushing fennel in the herb shed", () => {
  assert.ok(world.rooms.herb_shed, "herb_shed room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("crush a fennel head"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes polishing the lamp brass", () => {
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("polish the brass"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes knocking on the lighthouse door", () => {
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("knock on the oak door"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes the wreck-cabin cracked bell", () => {
  assert.ok(world.rooms.wreck_cabin, "wreck_cabin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("toll the cracked bell"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes lighting a vestry votive", () => {
  assert.ok(world.rooms.vestry, "vestry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("light a votive"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes splicing a warp and tapping the weather-glass", () => {
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("splice a spare warp"), `labels: ${labels.join(" | ")}`);
  assert.ok(labels.includes("tap the weather-glass"));
});

test("walkthrough includes lashing the oil-store chain and listening at the drop", () => {
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("lash the loose chain"), `labels: ${labels.join(" | ")}`);
  assert.ok(labels.includes("listen to the drop"));
});

test("walkthrough includes the keeper's garden rain-butt", () => {
  assert.ok(world.rooms.garden, "garden room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("drink from the rain-butt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes shouting a south bearing from the gallery", () => {
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("shout a south bearing"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes coiling spare lines and bracing the stair rail", () => {
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("coil the spare lines"), `labels: ${labels.join(" | ")}`);
  assert.ok(labels.includes("brace the loose rail"));
});

test("walkthrough includes winding the lamp mechanism", () => {
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("wind the mechanism"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes studying the reef charts", () => {
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("study the reef charts"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes kneeling in the chapel", () => {
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("kneel for the ships"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes bailing the dory", () => {
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("bail the dory"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes the drowned sailor's brig tale", () => {
  assert.ok(world.npcs.drowned, "drowned sailor npc missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("ask drowned sailor: the brig in the surf"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes the headland cairn", () => {
  assert.ok(world.rooms.headland, "headland room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("set a stone on the cairn"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes prying the tavern cellar chest", () => {
  assert.ok(world.rooms.cellar, "cellar room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pry the sea-chest"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes lighting the cottage hearth", () => {
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("light the hearth with the tinderbox"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes the net-loft wreck tale", () => {
  assert.ok(world.rooms.net_loft, "net_loft room missing");
  assert.ok(world.npcs.netmender, "netmender npc missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("ask net-mender: the wreck of '09"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes searching the oil-store casks", () => {
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("search the casks"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes asking the sexton about Maren's watch", () => {
  assert.ok(world.npcs.sexton, "sexton npc missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("ask sexton: Maren's watch"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes watching the reef from the lamp gallery", () => {
  assert.ok(world.rooms.gallery, "gallery room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("watch the reef"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes the ghost's lighthouse tale", () => {
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("ask keeper's ghost: her lighthouse"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes wiping the lamp mirrors", () => {
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("wipe the lamp mirrors"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes sounding the foghorn", () => {
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("sound the foghorn"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes the boathouse trumpet hail", () => {
  assert.ok(world.rooms.boathouse, "boathouse room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("take brass trumpet"), `labels: ${labels.join(" | ")}`);
  assert.ok(labels.includes("hail the reef with the trumpet"));
});

test("walkthrough includes the churchyard grave-stone", () => {
  assert.ok(world.rooms.churchyard, "churchyard room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("read the grave-stone"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes reading the keeper's log", () => {
  assert.ok(world.items.maren_log, "maren_log item missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("take keeper's log"), `labels: ${labels.join(" | ")}`);
  assert.ok(labels.includes("use keeper's log"));
});

test("walkthrough includes the strand signal-flare beat", () => {
  assert.ok(world.rooms.strand, "strand room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("take signal flare"), `labels: ${labels.join(" | ")}`);
  assert.ok(labels.includes("fire the signal flare"));
});

test("walkthrough visits more than the original 9 rooms and new labels are legal", () => {
  let { state } = newState(world, 1);
  const seen = new Set<string>([state.room]);
  const doLabel = (label: string) => {
    const a = actionByLabel(world, state, label);
    assert.ok(a, `legal action "${label}" at ${state.room} t${state.turn}`);
    state = step(world, state, a).state;
    seen.add(state.room);
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
  assert.ok(seen.size > 9, `visited ${seen.size} rooms: ${[...seen].join(",")}`);
});
