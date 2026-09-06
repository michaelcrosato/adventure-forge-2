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

test("walkthrough includes pinching the rust-teparybean teparybean", () => {
  assert.ok(world.rooms.rust_teparybean, "rust_teparybean room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the teparybean"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-haricotbean haricotbean", () => {
  assert.ok(world.rooms.rust_haricotbean, "rust_haricotbean room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the haricotbean"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-maize maize", () => {
  assert.ok(world.rooms.rust_maize, "rust_maize room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the maize"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-grits grits", () => {
  assert.ok(world.rooms.rust_grits, "rust_grits room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the grits"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hominy hominy", () => {
  assert.ok(world.rooms.rust_hominy, "rust_hominy room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hominy"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-polenta polenta", () => {
  assert.ok(world.rooms.rust_polenta, "rust_polenta room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the polenta"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-semolina semolina", () => {
  assert.ok(world.rooms.rust_semolina, "rust_semolina room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the semolina"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-wheatcorn wheatcorn", () => {
  assert.ok(world.rooms.rust_wheatcorn, "rust_wheatcorn room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the wheatcorn"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-groat groat", () => {
  assert.ok(world.rooms.rust_groat, "rust_groat room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the groat"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-fonio fonio", () => {
  assert.ok(world.rooms.rust_fonio, "rust_fonio room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the fonio"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-teff teff", () => {
  assert.ok(world.rooms.rust_teff, "rust_teff room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the teff"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-triticale triticale", () => {
  assert.ok(world.rooms.rust_triticale, "rust_triticale room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the triticale"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-einkorn einkorn", () => {
  assert.ok(world.rooms.rust_einkorn, "rust_einkorn room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the einkorn"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-emmer emmer", () => {
  assert.ok(world.rooms.rust_emmer, "rust_emmer room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the emmer"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-spelt spelt", () => {
  assert.ok(world.rooms.rust_spelt, "rust_spelt room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the spelt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-farro farro", () => {
  assert.ok(world.rooms.rust_farro, "rust_farro room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the farro"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-buckwheat buckwheat", () => {
  assert.ok(world.rooms.rust_buckwheat, "rust_buckwheat room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the buckwheat"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-gramflour gramflour", () => {
  assert.ok(world.rooms.rust_gramflour, "rust_gramflour room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the gramflour"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-soyflour soyflour", () => {
  assert.ok(world.rooms.rust_soyflour, "rust_soyflour room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the soyflour"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-peaflour peaflour", () => {
  assert.ok(world.rooms.rust_peaflour, "rust_peaflour room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the peaflour"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-azuki azuki", () => {
  assert.ok(world.rooms.rust_azuki, "rust_azuki room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the azuki"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-soymeal soymeal", () => {
  assert.ok(world.rooms.rust_soymeal, "rust_soymeal room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the soymeal"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-beanpod beanpod", () => {
  assert.ok(world.rooms.rust_beanpod, "rust_beanpod room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the beanpod"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cardamom cardamom", () => {
  assert.ok(world.rooms.rust_cardamom, "rust_cardamom room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cardamom"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-blackeye blackeye", () => {
  assert.ok(world.rooms.rust_blackeye, "rust_blackeye room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the blackeye"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-fieldpea fieldpea", () => {
  assert.ok(world.rooms.rust_fieldpea, "rust_fieldpea room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the fieldpea"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lentilbean lentilbean", () => {
  assert.ok(world.rooms.rust_lentilbean, "rust_lentilbean room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lentilbean"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mungbean mungbean", () => {
  assert.ok(world.rooms.rust_mungbean, "rust_mungbean room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mungbean"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-jackbean jackbean", () => {
  assert.ok(world.rooms.rust_jackbean, "rust_jackbean room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the jackbean"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-velvetbean velvetbean", () => {
  assert.ok(world.rooms.rust_velvetbean, "rust_velvetbean room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the velvetbean"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-yardlong yardlong", () => {
  assert.ok(world.rooms.rust_yardlong, "rust_yardlong room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the yardlong"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tepary tepary", () => {
  assert.ok(world.rooms.rust_tepary, "rust_tepary room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tepary"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-seabean seabean", () => {
  assert.ok(world.rooms.rust_seabean, "rust_seabean room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the seabean"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-glasswort glasswort", () => {
  assert.ok(world.rooms.rust_glasswort, "rust_glasswort room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the glasswort"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-splitpea splitpea", () => {
  assert.ok(world.rooms.rust_splitpea, "rust_splitpea room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the splitpea"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-marrowfat marrowfat", () => {
  assert.ok(world.rooms.rust_marrowfat, "rust_marrowfat room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the marrowfat"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cannellini cannellini", () => {
  assert.ok(world.rooms.rust_cannellini, "rust_cannellini room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cannellini"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-borlotti borlotti", () => {
  assert.ok(world.rooms.rust_borlotti, "rust_borlotti room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the borlotti"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-flageolet flageolet", () => {
  assert.ok(world.rooms.rust_flageolet, "rust_flageolet room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the flageolet"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-haricot haricot", () => {
  assert.ok(world.rooms.rust_haricot, "rust_haricot room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the haricot"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-samphire samphire", () => {
  assert.ok(world.rooms.rust_samphire, "rust_samphire room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the samphire"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-gram gram", () => {
  assert.ok(world.rooms.rust_gram, "rust_gram room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the gram"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-fenugreek fenugreek", () => {
  assert.ok(world.rooms.rust_fenugreek, "rust_fenugreek room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the fenugreek"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lupin lupin", () => {
  assert.ok(world.rooms.rust_lupin, "rust_lupin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lupin"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pigeonpea pigeonpea", () => {
  assert.ok(world.rooms.rust_pigeonpea, "rust_pigeonpea room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pigeonpea"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-blackbean blackbean", () => {
  assert.ok(world.rooms.rust_blackbean, "rust_blackbean room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the blackbean"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kidneybean kidneybean", () => {
  assert.ok(world.rooms.rust_kidneybean, "rust_kidneybean room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kidneybean"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pinto pinto", () => {
  assert.ok(world.rooms.rust_pinto, "rust_pinto room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pinto"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-navybean navybean", () => {
  assert.ok(world.rooms.rust_navybean, "rust_navybean room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the navybean"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lima lima", () => {
  assert.ok(world.rooms.rust_lima, "rust_lima room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lima"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cowpea cowpea", () => {
  assert.ok(world.rooms.rust_cowpea, "rust_cowpea room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cowpea"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-soybean soybean", () => {
  assert.ok(world.rooms.rust_soybean, "rust_soybean room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the soybean"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-adzuki adzuki", () => {
  assert.ok(world.rooms.rust_adzuki, "rust_adzuki room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the adzuki"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mung mung", () => {
  assert.ok(world.rooms.rust_mung, "rust_mung room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mung"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-fava fava", () => {
  assert.ok(world.rooms.rust_fava, "rust_fava room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the fava"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-chickpea chickpea", () => {
  assert.ok(world.rooms.rust_chickpea, "rust_chickpea room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the chickpea"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-goosefoot goosefoot", () => {
  assert.ok(world.rooms.rust_goosefoot, "rust_goosefoot room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the goosefoot"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-claytonia claytonia", () => {
  assert.ok(world.rooms.rust_claytonia, "rust_claytonia room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the claytonia"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mache mache", () => {
  assert.ok(world.rooms.rust_mache, "rust_mache room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mache"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-fennelseed fennelseed", () => {
  assert.ok(world.rooms.rust_fennelseed, "rust_fennelseed room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the fennelseed"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-malabar malabar", () => {
  assert.ok(world.rooms.rust_malabar, "rust_malabar room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the malabar"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lambsquarter lambsquarter", () => {
  assert.ok(world.rooms.rust_lambsquarter, "rust_lambsquarter room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lambsquarter"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-waterleaf waterleaf", () => {
  assert.ok(world.rooms.rust_waterleaf, "rust_waterleaf room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the waterleaf"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-amaranth amaranth", () => {
  assert.ok(world.rooms.rust_amaranth, "rust_amaranth room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the amaranth"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-orach orach", () => {
  assert.ok(world.rooms.rust_orach, "rust_orach room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the orach"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cilantro cilantro", () => {
  assert.ok(world.rooms.rust_cilantro, "rust_cilantro room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cilantro"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-dandelion dandelion", () => {
  assert.ok(world.rooms.rust_dandelion, "rust_dandelion room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the dandelion"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-purslane purslane", () => {
  assert.ok(world.rooms.rust_purslane, "rust_purslane room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the purslane"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bokchoy bokchoy", () => {
  assert.ok(world.rooms.rust_bokchoy, "rust_bokchoy room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bokchoy"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mustard mustard", () => {
  assert.ok(world.rooms.rust_mustard, "rust_mustard room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mustard"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cress cress", () => {
  assert.ok(world.rooms.rust_cress, "rust_cress room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cress"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sprout sprout", () => {
  assert.ok(world.rooms.rust_sprout, "rust_sprout room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sprout"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tatsoi tatsoi", () => {
  assert.ok(world.rooms.rust_tatsoi, "rust_tatsoi room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tatsoi"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mizuna mizuna", () => {
  assert.ok(world.rooms.rust_mizuna, "rust_mizuna room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mizuna"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-chicory chicory", () => {
  assert.ok(world.rooms.rust_chicory, "rust_chicory room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the chicory"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-romaine romaine", () => {
  assert.ok(world.rooms.rust_romaine, "rust_romaine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the romaine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-radicchio radicchio", () => {
  assert.ok(world.rooms.rust_radicchio, "rust_radicchio room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the radicchio"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-arugula arugula", () => {
  assert.ok(world.rooms.rust_arugula, "rust_arugula room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the arugula"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-escarole escarole", () => {
  assert.ok(world.rooms.rust_escarole, "rust_escarole room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the escarole"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-endive endive", () => {
  assert.ok(world.rooms.rust_endive, "rust_endive room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the endive"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lettuce lettuce", () => {
  assert.ok(world.rooms.rust_lettuce, "rust_lettuce room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lettuce"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-brussels brussels", () => {
  assert.ok(world.rooms.rust_brussels, "rust_brussels room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the brussels"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cauliflower cauliflower", () => {
  assert.ok(world.rooms.rust_cauliflower, "rust_cauliflower room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cauliflower"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-broccoli broccoli", () => {
  assert.ok(world.rooms.rust_broccoli, "rust_broccoli room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the broccoli"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-collard collard", () => {
  assert.ok(world.rooms.rust_collard, "rust_collard room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the collard"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kale kale", () => {
  assert.ok(world.rooms.rust_kale, "rust_kale room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kale"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-chard chard", () => {
  assert.ok(world.rooms.rust_chard, "rust_chard room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the chard"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-spinach spinach", () => {
  assert.ok(world.rooms.rust_spinach, "rust_spinach room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the spinach"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cabbage cabbage", () => {
  assert.ok(world.rooms.rust_cabbage, "rust_cabbage room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cabbage"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kohlrabi kohlrabi", () => {
  assert.ok(world.rooms.rust_kohlrabi, "rust_kohlrabi room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kohlrabi"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rutabaga rutabaga", () => {
  assert.ok(world.rooms.rust_rutabaga, "rust_rutabaga room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rutabaga"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-swede swede", () => {
  assert.ok(world.rooms.rust_swede, "rust_swede room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the swede"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-carrot carrot", () => {
  assert.ok(world.rooms.rust_carrot, "rust_carrot room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the carrot"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-radish radish", () => {
  assert.ok(world.rooms.rust_radish, "rust_radish room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the radish"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-beetroot beetroot", () => {
  assert.ok(world.rooms.rust_beetroot, "rust_beetroot room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the beetroot"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-turnip turnip", () => {
  assert.ok(world.rooms.rust_turnip, "rust_turnip room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the turnip"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-parsnip parsnip", () => {
  assert.ok(world.rooms.rust_parsnip, "rust_parsnip room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the parsnip"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-celeriac celeriac", () => {
  assert.ok(world.rooms.rust_celeriac, "rust_celeriac room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the celeriac"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ramson ramson", () => {
  assert.ok(world.rooms.rust_ramson, "rust_ramson room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ramson"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-scallion scallion", () => {
  assert.ok(world.rooms.rust_scallion, "rust_scallion room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the scallion"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-leek leek", () => {
  assert.ok(world.rooms.rust_leek, "rust_leek room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the leek"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sorrel sorrel", () => {
  assert.ok(world.rooms.rust_sorrel, "rust_sorrel room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sorrel"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lemonbalm lemonbalm", () => {
  assert.ok(world.rooms.rust_lemonbalm, "rust_lemonbalm room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lemonbalm"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-wintersavory wintersavory", () => {
  assert.ok(world.rooms.rust_wintersavory, "rust_wintersavory room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the wintersavory"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-shallot shallot", () => {
  assert.ok(world.rooms.rust_shallot, "rust_shallot room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the shallot"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-onion onion", () => {
  assert.ok(world.rooms.rust_onion, "rust_onion room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the onion"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-garlic garlic", () => {
  assert.ok(world.rooms.rust_garlic, "rust_garlic room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the garlic"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-chives chives", () => {
  assert.ok(world.rooms.rust_chives, "rust_chives room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the chives"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sage sage", () => {
  assert.ok(world.rooms.rust_sage, "rust_sage room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sage"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-basil basil", () => {
  assert.ok(world.rooms.rust_basil, "rust_basil room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the basil"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mint mint", () => {
  assert.ok(world.rooms.rust_mint, "rust_mint room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mint"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-thyme thyme", () => {
  assert.ok(world.rooms.rust_thyme, "rust_thyme room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the thyme"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rosemary rosemary", () => {
  assert.ok(world.rooms.rust_rosemary, "rust_rosemary room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rosemary"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-parsley parsley", () => {
  assert.ok(world.rooms.rust_parsley, "rust_parsley room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the parsley"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-anise anise", () => {
  assert.ok(world.rooms.rust_anise, "rust_anise room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the anise"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-caraway caraway", () => {
  assert.ok(world.rooms.rust_caraway, "rust_caraway room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the caraway"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-coriander coriander", () => {
  assert.ok(world.rooms.rust_coriander, "rust_coriander room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the coriander"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cumin cumin", () => {
  assert.ok(world.rooms.rust_cumin, "rust_cumin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cumin"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-dill dill", () => {
  assert.ok(world.rooms.rust_dill, "rust_dill room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the dill"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-fennel fennel", () => {
  assert.ok(world.rooms.rust_fennel, "rust_fennel room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the fennel"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hyssop hyssop", () => {
  assert.ok(world.rooms.rust_hyssop, "rust_hyssop room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hyssop"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-borage borage", () => {
  assert.ok(world.rooms.rust_borage, "rust_borage room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the borage"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lovage lovage", () => {
  assert.ok(world.rooms.rust_lovage, "rust_lovage room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lovage"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-chervil chervil", () => {
  assert.ok(world.rooms.rust_chervil, "rust_chervil room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the chervil"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tarragon tarragon", () => {
  assert.ok(world.rooms.rust_tarragon, "rust_tarragon room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tarragon"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-savory savory", () => {
  assert.ok(world.rooms.rust_savory, "rust_savory room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the savory"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-oregano oregano", () => {
  assert.ok(world.rooms.rust_oregano, "rust_oregano room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the oregano"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-marjoram marjoram", () => {
  assert.ok(world.rooms.rust_marjoram, "rust_marjoram room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the marjoram"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pistia pistia", () => {
  assert.ok(world.rooms.rust_pistia, "rust_pistia room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pistia"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-wolffia wolffia", () => {
  assert.ok(world.rooms.rust_wolffia, "rust_wolffia room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the wolffia"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lemna lemna", () => {
  assert.ok(world.rooms.rust_lemna, "rust_lemna room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lemna"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-riccia riccia", () => {
  assert.ok(world.rooms.rust_riccia, "rust_riccia room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the riccia"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-nitella nitella", () => {
  assert.ok(world.rooms.rust_nitella, "rust_nitella room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the nitella"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-chara chara", () => {
  assert.ok(world.rooms.rust_chara, "rust_chara room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the chara"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hydrilla hydrilla", () => {
  assert.ok(world.rooms.rust_hydrilla, "rust_hydrilla room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hydrilla"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-vallisneria vallisneria", () => {
  assert.ok(world.rooms.rust_vallisneria, "rust_vallisneria room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the vallisneria"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-elodea elodea", () => {
  assert.ok(world.rooms.rust_elodea, "rust_elodea room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the elodea"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-naiad naiad", () => {
  assert.ok(world.rooms.rust_naiad, "rust_naiad room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the naiad"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-watermeal watermeal", () => {
  assert.ok(world.rooms.rust_watermeal, "rust_watermeal room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the watermeal"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-salvinia salvinia", () => {
  assert.ok(world.rooms.rust_salvinia, "rust_salvinia room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the salvinia"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-azolla azolla", () => {
  assert.ok(world.rooms.rust_azolla, "rust_azolla room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the azolla"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-frogbit frogbit", () => {
  assert.ok(world.rooms.rust_frogbit, "rust_frogbit room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the frogbit"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tapegrass tapegrass", () => {
  assert.ok(world.rooms.rust_tapegrass, "rust_tapegrass room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tapegrass"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-spikegrass spikegrass", () => {
  assert.ok(world.rooms.rust_spikegrass, "rust_spikegrass room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the spikegrass"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-reedmace reedmace", () => {
  assert.ok(world.rooms.rust_reedmace, "rust_reedmace room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the reedmace"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bladderwort bladderwort", () => {
  assert.ok(world.rooms.rust_bladderwort, "rust_bladderwort room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bladderwort"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bulrush bulrush", () => {
  assert.ok(world.rooms.rust_bulrush, "rust_bulrush room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bulrush"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cattail cattail", () => {
  assert.ok(world.rooms.rust_cattail, "rust_cattail room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cattail"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-waterlily waterlily", () => {
  assert.ok(world.rooms.rust_waterlily, "rust_waterlily room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the waterlily"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-watercress watercress", () => {
  assert.ok(world.rooms.rust_watercress, "rust_watercress room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the watercress"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-millfoil millfoil", () => {
  assert.ok(world.rooms.rust_millfoil, "rust_millfoil room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the millfoil"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pondweed pondweed", () => {
  assert.ok(world.rooms.rust_pondweed, "rust_pondweed room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pondweed"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-duckweed duckweed", () => {
  assert.ok(world.rooms.rust_duckweed, "rust_duckweed room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the duckweed"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hornwort hornwort", () => {
  assert.ok(world.rooms.rust_hornwort, "rust_hornwort room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hornwort"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-arame arame", () => {
  assert.ok(world.rooms.rust_arame, "rust_arame room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the arame"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hijiki hijiki", () => {
  assert.ok(world.rooms.rust_hijiki, "rust_hijiki room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hijiki"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kombu kombu", () => {
  assert.ok(world.rooms.rust_kombu, "rust_kombu room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kombu"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-wakame wakame", () => {
  assert.ok(world.rooms.rust_wakame, "rust_wakame room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the wakame"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-laminaria laminaria", () => {
  assert.ok(world.rooms.rust_laminaria, "rust_laminaria room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the laminaria"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-seagrass seagrass", () => {
  assert.ok(world.rooms.rust_seagrass, "rust_seagrass room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the seagrass"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-eelgrass eelgrass", () => {
  assert.ok(world.rooms.rust_eelgrass, "rust_eelgrass room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the eelgrass"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sargassum sargassum", () => {
  assert.ok(world.rooms.rust_sargassum, "rust_sargassum room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sargassum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-irishmoss irishmoss", () => {
  assert.ok(world.rooms.rust_irishmoss, "rust_irishmoss room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the irishmoss"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rockweed rockweed", () => {
  assert.ok(world.rooms.rust_rockweed, "rust_rockweed room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rockweed"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bladderwrack bladderwrack", () => {
  assert.ok(world.rooms.rust_bladderwrack, "rust_bladderwrack room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bladderwrack"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-holdfast holdfast", () => {
  assert.ok(world.rooms.rust_holdfast, "rust_holdfast room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the holdfast"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-stipe stipe", () => {
  assert.ok(world.rooms.rust_stipe, "rust_stipe room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the stipe"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-spore spore", () => {
  assert.ok(world.rooms.rust_spore, "rust_spore room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the spore"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-frond frond", () => {
  assert.ok(world.rooms.rust_frond, "rust_frond room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the frond"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-fern fern", () => {
  assert.ok(world.rooms.rust_fern, "rust_fern room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the fern"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-turf turf", () => {
  assert.ok(world.rooms.rust_turf, "rust_turf room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the turf"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hay hay", () => {
  assert.ok(world.rooms.rust_hay, "rust_hay room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hay"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-furze furze", () => {
  assert.ok(world.rooms.rust_furze, "rust_furze room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the furze"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cane cane", () => {
  assert.ok(world.rooms.rust_cane, "rust_cane room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cane"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-agar agar", () => {
  assert.ok(world.rooms.rust_agar, "rust_agar room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the agar"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-nori nori", () => {
  assert.ok(world.rooms.rust_nori, "rust_nori room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the nori"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-fucus fucus", () => {
  assert.ok(world.rooms.rust_fucus, "rust_fucus room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the fucus"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-wrack wrack", () => {
  assert.ok(world.rooms.rust_wrack, "rust_wrack room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the wrack"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-dulse dulse", () => {
  assert.ok(world.rooms.rust_dulse, "rust_dulse room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the dulse"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-heather heather", () => {
  assert.ok(world.rooms.rust_heather, "rust_heather room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the heather"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bracken bracken", () => {
  assert.ok(world.rooms.rust_bracken, "rust_bracken room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bracken"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-osier osier", () => {
  assert.ok(world.rooms.rust_osier, "rust_osier room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the osier"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-reed reed", () => {
  assert.ok(world.rooms.rust_reed, "rust_reed room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the reed"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-broom broom", () => {
  assert.ok(world.rooms.rust_broom, "rust_broom room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the broom"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-gorse gorse", () => {
  assert.ok(world.rooms.rust_gorse, "rust_gorse room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the gorse"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rush rush", () => {
  assert.ok(world.rooms.rust_rush, "rust_rush room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rush"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-papyrus papyrus", () => {
  assert.ok(world.rooms.rust_papyrus, "rust_papyrus room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the papyrus"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sedge sedge", () => {
  assert.ok(world.rooms.rust_sedge, "rust_sedge room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sedge"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pina pina", () => {
  assert.ok(world.rooms.rust_pina, "rust_pina room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pina"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-alfa alfa", () => {
  assert.ok(world.rooms.rust_alfa, "rust_alfa room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the alfa"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-piassava piassava", () => {
  assert.ok(world.rooms.rust_piassava, "rust_piassava room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the piassava"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-esparto esparto", () => {
  assert.ok(world.rooms.rust_esparto, "rust_esparto room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the esparto"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-harakeke harakeke", () => {
  assert.ok(world.rooms.rust_harakeke, "rust_harakeke room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the harakeke"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-phormium phormium", () => {
  assert.ok(world.rooms.rust_phormium, "rust_phormium room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the phormium"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-yucca yucca", () => {
  assert.ok(world.rooms.rust_yucca, "rust_yucca room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the yucca"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-agave agave", () => {
  assert.ok(world.rooms.rust_agave, "rust_agave room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the agave"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pita pita", () => {
  assert.ok(world.rooms.rust_pita, "rust_pita room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pita"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-maguey maguey", () => {
  assert.ok(world.rooms.rust_maguey, "rust_maguey room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the maguey"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-istle istle", () => {
  assert.ok(world.rooms.rust_istle, "rust_istle room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the istle"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-henequen henequen", () => {
  assert.ok(world.rooms.rust_henequen, "rust_henequen room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the henequen"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sunn sunn", () => {
  assert.ok(world.rooms.rust_sunn, "rust_sunn room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sunn"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kenaf kenaf", () => {
  assert.ok(world.rooms.rust_kenaf, "rust_kenaf room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kenaf"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-abaca abaca", () => {
  assert.ok(world.rooms.rust_abaca, "rust_abaca room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the abaca"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-nettle nettle", () => {
  assert.ok(world.rooms.rust_nettle, "rust_nettle room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the nettle"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ramie ramie", () => {
  assert.ok(world.rooms.rust_ramie, "rust_ramie room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ramie"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kapok kapok", () => {
  assert.ok(world.rooms.rust_kapok, "rust_kapok room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kapok"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bast bast", () => {
  assert.ok(world.rooms.rust_bast, "rust_bast room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bast"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-raffia raffia", () => {
  assert.ok(world.rooms.rust_raffia, "rust_raffia room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the raffia"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-quinoa quinoa", () => {
  assert.ok(world.rooms.rust_quinoa, "rust_quinoa room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the quinoa"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sorghum sorghum", () => {
  assert.ok(world.rooms.rust_sorghum, "rust_sorghum room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sorghum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-millet millet", () => {
  assert.ok(world.rooms.rust_millet, "rust_millet room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the millet"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rye rye", () => {
  assert.ok(world.rooms.rust_rye, "rust_rye room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rye"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-oats oats", () => {
  assert.ok(world.rooms.rust_oats, "rust_oats room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the oats"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-barley barley", () => {
  assert.ok(world.rooms.rust_barley, "rust_barley room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the barley"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-wheat wheat", () => {
  assert.ok(world.rooms.rust_wheat, "rust_wheat room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the wheat"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rice rice", () => {
  assert.ok(world.rooms.rust_rice, "rust_rice room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rice"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lentil lentil", () => {
  assert.ok(world.rooms.rust_lentil, "rust_lentil room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lentil"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pea pea", () => {
  assert.ok(world.rooms.rust_pea, "rust_pea room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pea"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bean bean", () => {
  assert.ok(world.rooms.rust_bean, "rust_bean room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bean"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-corn corn", () => {
  assert.ok(world.rooms.rust_corn, "rust_corn room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the corn"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-okra okra", () => {
  assert.ok(world.rooms.rust_okra, "rust_okra room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the okra"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-eggplant eggplant", () => {
  assert.ok(world.rooms.rust_eggplant, "rust_eggplant room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the eggplant"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pepper pepper", () => {
  assert.ok(world.rooms.rust_pepper, "rust_pepper room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pepper"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tomato tomato", () => {
  assert.ok(world.rooms.rust_tomato, "rust_tomato room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tomato"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-delicata delicata", () => {
  assert.ok(world.rooms.rust_delicata, "rust_delicata room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the delicata"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pattypan pattypan", () => {
  assert.ok(world.rooms.rust_pattypan, "rust_pattypan room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pattypan"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-marrow marrow", () => {
  assert.ok(world.rooms.rust_marrow, "rust_marrow room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the marrow"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-gourd gourd", () => {
  assert.ok(world.rooms.rust_gourd, "rust_gourd room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the gourd"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cucumber cucumber", () => {
  assert.ok(world.rooms.rust_cucumber, "rust_cucumber room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cucumber"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-zucchini zucchini", () => {
  assert.ok(world.rooms.rust_zucchini, "rust_zucchini room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the zucchini"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-squash squash", () => {
  assert.ok(world.rooms.rust_squash, "rust_squash room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the squash"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pumpkin pumpkin", () => {
  assert.ok(world.rooms.rust_pumpkin, "rust_pumpkin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pumpkin"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-canary canary", () => {
  assert.ok(world.rooms.rust_canary, "rust_canary room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the canary"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-charentais charentais", () => {
  assert.ok(world.rooms.rust_charentais, "rust_charentais room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the charentais"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-galia galia", () => {
  assert.ok(world.rooms.rust_galia, "rust_galia room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the galia"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-crenshaw crenshaw", () => {
  assert.ok(world.rooms.rust_crenshaw, "rust_crenshaw room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the crenshaw"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-casaba casaba", () => {
  assert.ok(world.rooms.rust_casaba, "rust_casaba room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the casaba"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-honeydew honeydew", () => {
  assert.ok(world.rooms.rust_honeydew, "rust_honeydew room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the honeydew"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cantaloupe cantaloupe", () => {
  assert.ok(world.rooms.rust_cantaloupe, "rust_cantaloupe room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cantaloupe"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-watermelon watermelon", () => {
  assert.ok(world.rooms.rust_watermelon, "rust_watermelon room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the watermelon"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kiwi kiwi", () => {
  assert.ok(world.rooms.rust_kiwi, "rust_kiwi room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kiwi"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-dragonfruit dragonfruit", () => {
  assert.ok(world.rooms.rust_dragonfruit, "rust_dragonfruit room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the dragonfruit"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-starfruit starfruit", () => {
  assert.ok(world.rooms.rust_starfruit, "rust_starfruit room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the starfruit"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-passionfruit passionfruit", () => {
  assert.ok(world.rooms.rust_passionfruit, "rust_passionfruit room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the passionfruit"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pineapple pineapple", () => {
  assert.ok(world.rooms.rust_pineapple, "rust_pineapple room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pineapple"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-coconut coconut", () => {
  assert.ok(world.rooms.rust_coconut, "rust_coconut room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the coconut"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-plantain plantain", () => {
  assert.ok(world.rooms.rust_plantain, "rust_plantain room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the plantain"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-banana banana", () => {
  assert.ok(world.rooms.rust_banana, "rust_banana room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the banana"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sweetsop sweetsop", () => {
  assert.ok(world.rooms.rust_sweetsop, "rust_sweetsop room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sweetsop"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-soursop soursop", () => {
  assert.ok(world.rooms.rust_soursop, "rust_soursop room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the soursop"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-breadfruit breadfruit", () => {
  assert.ok(world.rooms.rust_breadfruit, "rust_breadfruit room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the breadfruit"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-jackfruit jackfruit", () => {
  assert.ok(world.rooms.rust_jackfruit, "rust_jackfruit room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the jackfruit"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-durian durian", () => {
  assert.ok(world.rooms.rust_durian, "rust_durian room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the durian"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-longan longan", () => {
  assert.ok(world.rooms.rust_longan, "rust_longan room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the longan"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rambutan rambutan", () => {
  assert.ok(world.rooms.rust_rambutan, "rust_rambutan room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rambutan"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lychee lychee", () => {
  assert.ok(world.rooms.rust_lychee, "rust_lychee room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lychee"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sapodilla sapodilla", () => {
  assert.ok(world.rooms.rust_sapodilla, "rust_sapodilla room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sapodilla"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cherimoya cherimoya", () => {
  assert.ok(world.rooms.rust_cherimoya, "rust_cherimoya room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cherimoya"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-feijoa feijoa", () => {
  assert.ok(world.rooms.rust_feijoa, "rust_feijoa room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the feijoa"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-guava guava", () => {
  assert.ok(world.rooms.rust_guava, "rust_guava room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the guava"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-papaya papaya", () => {
  assert.ok(world.rooms.rust_papaya, "rust_papaya room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the papaya"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mango mango", () => {
  assert.ok(world.rooms.rust_mango, "rust_mango room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mango"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-avocado avocado", () => {
  assert.ok(world.rooms.rust_avocado, "rust_avocado room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the avocado"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-olive olive", () => {
  assert.ok(world.rooms.rust_olive, "rust_olive room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the olive"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-yuzu yuzu", () => {
  assert.ok(world.rooms.rust_yuzu, "rust_yuzu room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the yuzu"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-calamondin calamondin", () => {
  assert.ok(world.rooms.rust_calamondin, "rust_calamondin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the calamondin"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kumquat kumquat", () => {
  assert.ok(world.rooms.rust_kumquat, "rust_kumquat room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kumquat"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bergamot bergamot", () => {
  assert.ok(world.rooms.rust_bergamot, "rust_bergamot room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bergamot"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-citron citron", () => {
  assert.ok(world.rooms.rust_citron, "rust_citron room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the citron"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pomegranate pomegranate", () => {
  assert.ok(world.rooms.rust_pomegranate, "rust_pomegranate room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pomegranate"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-date date", () => {
  assert.ok(world.rooms.rust_date, "rust_date room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the date"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-fig fig", () => {
  assert.ok(world.rooms.rust_fig, "rust_fig room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the fig"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-gean gean", () => {
  assert.ok(world.rooms.rust_gean, "rust_gean room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the gean"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-morello morello", () => {
  assert.ok(world.rooms.rust_morello, "rust_morello room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the morello"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bullace bullace", () => {
  assert.ok(world.rooms.rust_bullace, "rust_bullace room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bullace"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mirabelle mirabelle", () => {
  assert.ok(world.rooms.rust_mirabelle, "rust_mirabelle room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mirabelle"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-damson damson", () => {
  assert.ok(world.rooms.rust_damson, "rust_damson room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the damson"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-greengage greengage", () => {
  assert.ok(world.rooms.rust_greengage, "rust_greengage room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the greengage"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-nectarine nectarine", () => {
  assert.ok(world.rooms.rust_nectarine, "rust_nectarine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the nectarine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-apricot apricot", () => {
  assert.ok(world.rooms.rust_apricot, "rust_apricot room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the apricot"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hawtree hawtree", () => {
  assert.ok(world.rooms.rust_hawtree, "rust_hawtree room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hawtree"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-jujube jujube", () => {
  assert.ok(world.rooms.rust_jujube, "rust_jujube room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the jujube"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-loquat loquat", () => {
  assert.ok(world.rooms.rust_loquat, "rust_loquat room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the loquat"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-quince quince", () => {
  assert.ok(world.rooms.rust_quince, "rust_quince room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the quince"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-medlar medlar", () => {
  assert.ok(world.rooms.rust_medlar, "rust_medlar room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the medlar"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sloe sloe", () => {
  assert.ok(world.rooms.rust_sloe, "rust_sloe room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sloe"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-blackthorn blackthorn", () => {
  assert.ok(world.rooms.rust_blackthorn, "rust_blackthorn room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the blackthorn"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hawthorn hawthorn", () => {
  assert.ok(world.rooms.rust_hawthorn, "rust_hawthorn room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hawthorn"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mulberry mulberry", () => {
  assert.ok(world.rooms.rust_mulberry, "rust_mulberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mulberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-wintergreen wintergreen", () => {
  assert.ok(world.rooms.rust_wintergreen, "rust_wintergreen room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the wintergreen"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-barberry barberry", () => {
  assert.ok(world.rooms.rust_barberry, "rust_barberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the barberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-juneberry juneberry", () => {
  assert.ok(world.rooms.rust_juneberry, "rust_juneberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the juneberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-blackberry blackberry", () => {
  assert.ok(world.rooms.rust_blackberry, "rust_blackberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the blackberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-currant currant", () => {
  assert.ok(world.rooms.rust_currant, "rust_currant room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the currant"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-blueberry blueberry", () => {
  assert.ok(world.rooms.rust_blueberry, "rust_blueberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the blueberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-strawberry strawberry", () => {
  assert.ok(world.rooms.rust_strawberry, "rust_strawberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the strawberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-foxberry foxberry", () => {
  assert.ok(world.rooms.rust_foxberry, "rust_foxberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the foxberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cowberry cowberry", () => {
  assert.ok(world.rooms.rust_cowberry, "rust_cowberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cowberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-crowberry crowberry", () => {
  assert.ok(world.rooms.rust_crowberry, "rust_crowberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the crowberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lingonberry lingonberry", () => {
  assert.ok(world.rooms.rust_lingonberry, "rust_lingonberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lingonberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-marionberry marionberry", () => {
  assert.ok(world.rooms.rust_marionberry, "rust_marionberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the marionberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-boysenberry boysenberry", () => {
  assert.ok(world.rooms.rust_boysenberry, "rust_boysenberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the boysenberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-raspberry raspberry", () => {
  assert.ok(world.rooms.rust_raspberry, "rust_raspberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the raspberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bilberry bilberry", () => {
  assert.ok(world.rooms.rust_bilberry, "rust_bilberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bilberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-dewberry dewberry", () => {
  assert.ok(world.rooms.rust_dewberry, "rust_dewberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the dewberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-salmonberry salmonberry", () => {
  assert.ok(world.rooms.rust_salmonberry, "rust_salmonberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the salmonberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-thimbleberry thimbleberry", () => {
  assert.ok(world.rooms.rust_thimbleberry, "rust_thimbleberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the thimbleberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cloudberry cloudberry", () => {
  assert.ok(world.rooms.rust_cloudberry, "rust_cloudberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cloudberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-loganberry loganberry", () => {
  assert.ok(world.rooms.rust_loganberry, "rust_loganberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the loganberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-huckleberry huckleberry", () => {
  assert.ok(world.rooms.rust_huckleberry, "rust_huckleberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the huckleberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-gooseberry gooseberry", () => {
  assert.ok(world.rooms.rust_gooseberry, "rust_gooseberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the gooseberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cranberry cranberry", () => {
  assert.ok(world.rooms.rust_cranberry, "rust_cranberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cranberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bayberry bayberry", () => {
  assert.ok(world.rooms.rust_bayberry, "rust_bayberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bayberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bearberry bearberry", () => {
  assert.ok(world.rooms.rust_bearberry, "rust_bearberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bearberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-chokeberry chokeberry", () => {
  assert.ok(world.rooms.rust_chokeberry, "rust_chokeberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the chokeberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-inkberry inkberry", () => {
  assert.ok(world.rooms.rust_inkberry, "rust_inkberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the inkberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-winterberry winterberry", () => {
  assert.ok(world.rooms.rust_winterberry, "rust_winterberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the winterberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-coralberry coralberry", () => {
  assert.ok(world.rooms.rust_coralberry, "rust_coralberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the coralberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-snowberry snowberry", () => {
  assert.ok(world.rooms.rust_snowberry, "rust_snowberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the snowberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-elderberry elderberry", () => {
  assert.ok(world.rooms.rust_elderberry, "rust_elderberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the elderberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-buttonbush buttonbush", () => {
  assert.ok(world.rooms.rust_buttonbush, "rust_buttonbush room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the buttonbush"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-spicebush spicebush", () => {
  assert.ok(world.rooms.rust_spicebush, "rust_spicebush room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the spicebush"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-witchhazel witchhazel", () => {
  assert.ok(world.rooms.rust_witchhazel, "rust_witchhazel room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the witchhazel"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hophorn hophorn", () => {
  assert.ok(world.rooms.rust_hophorn, "rust_hophorn room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hophorn"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-serviceberry serviceberry", () => {
  assert.ok(world.rooms.rust_serviceberry, "rust_serviceberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the serviceberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pawpaw pawpaw", () => {
  assert.ok(world.rooms.rust_pawpaw, "rust_pawpaw room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pawpaw"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-buckeye buckeye", () => {
  assert.ok(world.rooms.rust_buckeye, "rust_buckeye room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the buckeye"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-redbud redbud", () => {
  assert.ok(world.rooms.rust_redbud, "rust_redbud room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the redbud"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sweetgum sweetgum", () => {
  assert.ok(world.rooms.rust_sweetgum, "rust_sweetgum room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sweetgum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tupelo tupelo", () => {
  assert.ok(world.rooms.rust_tupelo, "rust_tupelo room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tupelo"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sourwood sourwood", () => {
  assert.ok(world.rooms.rust_sourwood, "rust_sourwood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sourwood"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hackberry hackberry", () => {
  assert.ok(world.rooms.rust_hackberry, "rust_hackberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hackberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-persimmon persimmon", () => {
  assert.ok(world.rooms.rust_persimmon, "rust_persimmon room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the persimmon"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ailanthus ailanthus", () => {
  assert.ok(world.rooms.rust_ailanthus, "rust_ailanthus room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ailanthus"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-paulownia paulownia", () => {
  assert.ok(world.rooms.rust_paulownia, "rust_paulownia room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the paulownia"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-catalpa catalpa", () => {
  assert.ok(world.rooms.rust_catalpa, "rust_catalpa room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the catalpa"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-robinia robinia", () => {
  assert.ok(world.rooms.rust_robinia, "rust_robinia room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the robinia"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-samanea samanea", () => {
  assert.ok(world.rooms.rust_samanea, "rust_samanea room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the samanea"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-calliandra calliandra", () => {
  assert.ok(world.rooms.rust_calliandra, "rust_calliandra room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the calliandra"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-gliricidia gliricidia", () => {
  assert.ok(world.rooms.rust_gliricidia, "rust_gliricidia room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the gliricidia"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-leucaena leucaena", () => {
  assert.ok(world.rooms.rust_leucaena, "rust_leucaena room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the leucaena"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sesbania sesbania", () => {
  assert.ok(world.rooms.rust_sesbania, "rust_sesbania room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sesbania"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-albizia albizia", () => {
  assert.ok(world.rooms.rust_albizia, "rust_albizia room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the albizia"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-falcata falcata", () => {
  assert.ok(world.rooms.rust_falcata, "rust_falcata room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the falcata"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kiei kiei", () => {
  assert.ok(world.rooms.rust_kiei, "rust_kiei room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kiei"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pahala pahala", () => {
  assert.ok(world.rooms.rust_pahala, "rust_pahala room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pahala"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-olopua olopua", () => {
  assert.ok(world.rooms.rust_olopua, "rust_olopua room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the olopua"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-neleau neleau", () => {
  assert.ok(world.rooms.rust_neleau, "rust_neleau room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the neleau"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-akoko akoko", () => {
  assert.ok(world.rooms.rust_akoko, "rust_akoko room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the akoko"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lonomea lonomea", () => {
  assert.ok(world.rooms.rust_lonomea, "rust_lonomea room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lonomea"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kalia kalia", () => {
  assert.ok(world.rooms.rust_kalia, "rust_kalia room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kalia"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-alahee alahee", () => {
  assert.ok(world.rooms.rust_alahee, "rust_alahee room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the alahee"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-alani alani", () => {
  assert.ok(world.rooms.rust_alani, "rust_alani room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the alani"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mehame mehame", () => {
  assert.ok(world.rooms.rust_mehame, "rust_mehame room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mehame"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-koaia koaia", () => {
  assert.ok(world.rooms.rust_koaia, "rust_koaia room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the koaia"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kauila kauila", () => {
  assert.ok(world.rooms.rust_kauila, "rust_kauila room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kauila"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-uhiuhi uhiuhi", () => {
  assert.ok(world.rooms.rust_uhiuhi, "rust_uhiuhi room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the uhiuhi"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pukiawe pukiawe", () => {
  assert.ok(world.rooms.rust_pukiawe, "rust_pukiawe room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pukiawe"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-olona olona", () => {
  assert.ok(world.rooms.rust_olona, "rust_olona room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the olona"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-wauke wauke", () => {
  assert.ok(world.rooms.rust_wauke, "rust_wauke room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the wauke"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ohai ohai", () => {
  assert.ok(world.rooms.rust_ohai, "rust_ohai room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ohai"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ilima ilima", () => {
  assert.ok(world.rooms.rust_ilima, "rust_ilima room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ilima"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-naupaka naupaka", () => {
  assert.ok(world.rooms.rust_naupaka, "rust_naupaka room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the naupaka"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-aiea aiea", () => {
  assert.ok(world.rooms.rust_aiea, "rust_aiea room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the aiea"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pilo pilo", () => {
  assert.ok(world.rooms.rust_pilo, "rust_pilo room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pilo"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ohelo ohelo", () => {
  assert.ok(world.rooms.rust_ohelo, "rust_ohelo room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ohelo"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ieie ieie", () => {
  assert.ok(world.rooms.rust_ieie, "rust_ieie room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ieie"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-maile maile", () => {
  assert.ok(world.rooms.rust_maile, "rust_maile room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the maile"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ulei ulei", () => {
  assert.ok(world.rooms.rust_ulei, "rust_ulei room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ulei"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-akia akia", () => {
  assert.ok(world.rooms.rust_akia, "rust_akia room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the akia"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mamaki mamaki", () => {
  assert.ok(world.rooms.rust_mamaki, "rust_mamaki room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mamaki"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-papala papala", () => {
  assert.ok(world.rooms.rust_papala, "rust_papala room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the papala"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kopiko kopiko", () => {
  assert.ok(world.rooms.rust_kopiko, "rust_kopiko room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kopiko"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kolea kolea", () => {
  assert.ok(world.rooms.rust_kolea, "rust_kolea room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kolea"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-olapa olapa", () => {
  assert.ok(world.rooms.rust_olapa, "rust_olapa room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the olapa"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-niu niu", () => {
  assert.ok(world.rooms.rust_niu, "rust_niu room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the niu"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-iliahi iliahi", () => {
  assert.ok(world.rooms.rust_iliahi, "rust_iliahi room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the iliahi"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-noni noni", () => {
  assert.ok(world.rooms.rust_noni, "rust_noni room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the noni"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kukui kukui", () => {
  assert.ok(world.rooms.rust_kukui, "rust_kukui room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kukui"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-naio naio", () => {
  assert.ok(world.rooms.rust_naio, "rust_naio room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the naio"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mamane mamane", () => {
  assert.ok(world.rooms.rust_mamane, "rust_mamane room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mamane"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lehua lehua", () => {
  assert.ok(world.rooms.rust_lehua, "rust_lehua room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lehua"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-aalii aalii", () => {
  assert.ok(world.rooms.rust_aalii, "rust_aalii room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the aalii"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lama lama", () => {
  assert.ok(world.rooms.rust_lama, "rust_lama room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lama"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hapuu hapuu", () => {
  assert.ok(world.rooms.rust_hapuu, "rust_hapuu room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hapuu"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-wiliwili wiliwili", () => {
  assert.ok(world.rooms.rust_wiliwili, "rust_wiliwili room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the wiliwili"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kamani kamani", () => {
  assert.ok(world.rooms.rust_kamani, "rust_kamani room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kamani"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-milo milo", () => {
  assert.ok(world.rooms.rust_milo, "rust_milo room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the milo"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-koa koa", () => {
  assert.ok(world.rooms.rust_koa, "rust_koa room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the koa"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-toropapa toropapa", () => {
  assert.ok(world.rooms.rust_toropapa, "rust_toropapa room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the toropapa"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kumarahou kumarahou", () => {
  assert.ok(world.rooms.rust_kumarahou, "rust_kumarahou room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kumarahou"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ramarama ramarama", () => {
  assert.ok(world.rooms.rust_ramarama, "rust_ramarama room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ramarama"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ohia ohia", () => {
  assert.ok(world.rooms.rust_ohia, "rust_ohia room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ohia"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-broadleaf broadleaf", () => {
  assert.ok(world.rooms.rust_broadleaf, "rust_broadleaf room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the broadleaf"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-marbleleaf marbleleaf", () => {
  assert.ok(world.rooms.rust_marbleleaf, "rust_marbleleaf room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the marbleleaf"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-wineberry wineberry", () => {
  assert.ok(world.rooms.rust_wineberry, "rust_wineberry room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the wineberry"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lancewood lancewood", () => {
  assert.ok(world.rooms.rust_lancewood, "rust_lancewood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lancewood"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hangehange hangehange", () => {
  assert.ok(world.rooms.rust_hangehange, "rust_hangehange room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hangehange"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-makomako makomako", () => {
  assert.ok(world.rooms.rust_makomako, "rust_makomako room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the makomako"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-houpara houpara", () => {
  assert.ok(world.rooms.rust_houpara, "rust_houpara room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the houpara"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-whau whau", () => {
  assert.ok(world.rooms.rust_whau, "rust_whau room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the whau"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-puka puka", () => {
  assert.ok(world.rooms.rust_puka, "rust_puka room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the puka"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kohia kohia", () => {
  assert.ok(world.rooms.rust_kohia, "rust_kohia room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kohia"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tarata tarata", () => {
  assert.ok(world.rooms.rust_tarata, "rust_tarata room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tarata"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mapou mapou", () => {
  assert.ok(world.rooms.rust_mapou, "rust_mapou room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mapou"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kohuhu kohuhu", () => {
  assert.ok(world.rooms.rust_kohuhu, "rust_kohuhu room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kohuhu"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-karamu karamu", () => {
  assert.ok(world.rooms.rust_karamu, "rust_karamu room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the karamu"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kawakawa kawakawa", () => {
  assert.ok(world.rooms.rust_kawakawa, "rust_kawakawa room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kawakawa"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-nikau nikau", () => {
  assert.ok(world.rooms.rust_nikau, "rust_nikau room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the nikau"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rangiora rangiora", () => {
  assert.ok(world.rooms.rust_rangiora, "rust_rangiora room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rangiora"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kaikomako kaikomako", () => {
  assert.ok(world.rooms.rust_kaikomako, "rust_kaikomako room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kaikomako"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-houhere houhere", () => {
  assert.ok(world.rooms.rust_houhere, "rust_houhere room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the houhere"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-akeake akeake", () => {
  assert.ok(world.rooms.rust_akeake, "rust_akeake room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the akeake"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-horopito horopito", () => {
  assert.ok(world.rooms.rust_horopito, "rust_horopito room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the horopito"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tawhai tawhai", () => {
  assert.ok(world.rooms.rust_tawhai, "rust_tawhai room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tawhai"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pukatea pukatea", () => {
  assert.ok(world.rooms.rust_pukatea, "rust_pukatea room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pukatea"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mahoe mahoe", () => {
  assert.ok(world.rooms.rust_mahoe, "rust_mahoe room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mahoe"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-karaka karaka", () => {
  assert.ok(world.rooms.rust_karaka, "rust_karaka room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the karaka"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ngaio ngaio", () => {
  assert.ok(world.rooms.rust_ngaio, "rust_ngaio room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ngaio"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kanuka kanuka", () => {
  assert.ok(world.rooms.rust_kanuka, "rust_kanuka room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kanuka"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-manuka manuka", () => {
  assert.ok(world.rooms.rust_manuka, "rust_manuka room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the manuka"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kowhai kowhai", () => {
  assert.ok(world.rooms.rust_kowhai, "rust_kowhai room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kowhai"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-titoki titoki", () => {
  assert.ok(world.rooms.rust_titoki, "rust_titoki room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the titoki"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hinau hinau", () => {
  assert.ok(world.rooms.rust_hinau, "rust_hinau room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hinau"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-maire maire", () => {
  assert.ok(world.rooms.rust_maire, "rust_maire room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the maire"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kamahi kamahi", () => {
  assert.ok(world.rooms.rust_kamahi, "rust_kamahi room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kamahi"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rata rata", () => {
  assert.ok(world.rooms.rust_rata, "rust_rata room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rata"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rewarewa rewarewa", () => {
  assert.ok(world.rooms.rust_rewarewa, "rust_rewarewa room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rewarewa"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kohekohe kohekohe", () => {
  assert.ok(world.rooms.rust_kohekohe, "rust_kohekohe room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kohekohe"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-puriri puriri", () => {
  assert.ok(world.rooms.rust_puriri, "rust_puriri room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the puriri"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tawa tawa", () => {
  assert.ok(world.rooms.rust_tawa, "rust_tawa room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tawa"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-taraire taraire", () => {
  assert.ok(world.rooms.rust_taraire, "rust_taraire room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the taraire"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pokaka pokaka", () => {
  assert.ok(world.rooms.rust_pokaka, "rust_pokaka room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pokaka"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-toatoa toatoa", () => {
  assert.ok(world.rooms.rust_toatoa, "rust_toatoa room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the toatoa"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tanekaha tanekaha", () => {
  assert.ok(world.rooms.rust_tanekaha, "rust_tanekaha room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tanekaha"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kahikatea kahikatea", () => {
  assert.ok(world.rooms.rust_kahikatea, "rust_kahikatea room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kahikatea"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-miro miro", () => {
  assert.ok(world.rooms.rust_miro, "rust_miro room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the miro"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-matai matai", () => {
  assert.ok(world.rooms.rust_matai, "rust_matai room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the matai"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-totara totara", () => {
  assert.ok(world.rooms.rust_totara, "rust_totara room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the totara"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rimu rimu", () => {
  assert.ok(world.rooms.rust_rimu, "rust_rimu room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rimu"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cryptomeria cryptomeria", () => {
  assert.ok(world.rooms.rust_cryptomeria, "rust_cryptomeria room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cryptomeria"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-taiwania taiwania", () => {
  assert.ok(world.rooms.rust_taiwania, "rust_taiwania room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the taiwania"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cunninghamia cunninghamia", () => {
  assert.ok(world.rooms.rust_cunninghamia, "rust_cunninghamia room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cunninghamia"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-keteleeria keteleeria", () => {
  assert.ok(world.rooms.rust_keteleeria, "rust_keteleeria room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the keteleeria"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-morrison morrison", () => {
  assert.ok(world.rooms.rust_morrison, "rust_morrison room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the morrison"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-formosana formosana", () => {
  assert.ok(world.rooms.rust_formosana, "rust_formosana room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the formosana"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-asunaro asunaro", () => {
  assert.ok(world.rooms.rust_asunaro, "rust_asunaro room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the asunaro"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hiba hiba", () => {
  assert.ok(world.rooms.rust_hiba, "rust_hiba room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hiba"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sieboldii sieboldii", () => {
  assert.ok(world.rooms.rust_sieboldii, "rust_sieboldii room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sieboldii"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-firma firma", () => {
  assert.ok(world.rooms.rust_firma, "rust_firma room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the firma"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-nephrolepis nephrolepis", () => {
  assert.ok(world.rooms.rust_nephrolepis, "rust_nephrolepis room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the nephrolepis"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-koreana koreana", () => {
  assert.ok(world.rooms.rust_koreana, "rust_koreana room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the koreana"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sachalin sachalin", () => {
  assert.ok(world.rooms.rust_sachalin, "rust_sachalin room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sachalin"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-homolepis homolepis", () => {
  assert.ok(world.rooms.rust_homolepis, "rust_homolepis room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the homolepis"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-maries maries", () => {
  assert.ok(world.rooms.rust_maries, "rust_maries room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the maries"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kawakami kawakami", () => {
  assert.ok(world.rooms.rust_kawakami, "rust_kawakami room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kawakami"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cephalonica cephalonica", () => {
  assert.ok(world.rooms.rust_cephalonica, "rust_cephalonica room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cephalonica"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pinsapo pinsapo", () => {
  assert.ok(world.rooms.rust_pinsapo, "rust_pinsapo room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pinsapo"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-numidica numidica", () => {
  assert.ok(world.rooms.rust_numidica, "rust_numidica room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the numidica"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-spanishfir spanishfir", () => {
  assert.ok(world.rooms.rust_spanishfir, "rust_spanishfir room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the spanishfir"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-greekfir greekfir", () => {
  assert.ok(world.rooms.rust_greekfir, "rust_greekfir room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the greekfir"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bornmueller bornmueller", () => {
  assert.ok(world.rooms.rust_bornmueller, "rust_bornmueller room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bornmueller"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cilician cilician", () => {
  assert.ok(world.rooms.rust_cilician, "rust_cilician room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cilician"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-oyamel oyamel", () => {
  assert.ok(world.rooms.rust_oyamel, "rust_oyamel room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the oyamel"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-subalpine subalpine", () => {
  assert.ok(world.rooms.rust_subalpine, "rust_subalpine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the subalpine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-shastafir shastafir", () => {
  assert.ok(world.rooms.rust_shastafir, "rust_shastafir room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the shastafir"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-momifir momifir", () => {
  assert.ok(world.rooms.rust_momifir, "rust_momifir room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the momifir"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-nikkofir nikkofir", () => {
  assert.ok(world.rooms.rust_nikkofir, "rust_nikkofir room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the nikkofir"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-veitchfir veitchfir", () => {
  assert.ok(world.rooms.rust_veitchfir, "rust_veitchfir room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the veitchfir"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-corkbark corkbark", () => {
  assert.ok(world.rooms.rust_corkbark, "rust_corkbark room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the corkbark"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-nordmann nordmann", () => {
  assert.ok(world.rooms.rust_nordmann, "rust_nordmann room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the nordmann"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sitka sitka", () => {
  assert.ok(world.rooms.rust_sitka, "rust_sitka room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sitka"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-alaskan alaskan", () => {
  assert.ok(world.rooms.rust_alaskan, "rust_alaskan room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the alaskan"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-westernred westernred", () => {
  assert.ok(world.rooms.rust_westernred, "rust_westernred room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the westernred"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pondcypress pondcypress", () => {
  assert.ok(world.rooms.rust_pondcypress, "rust_pondcypress room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pondcypress"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-baldcypress baldcypress", () => {
  assert.ok(world.rooms.rust_baldcypress, "rust_baldcypress room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the baldcypress"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-dawnredwood dawnredwood", () => {
  assert.ok(world.rooms.rust_dawnredwood, "rust_dawnredwood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the dawnredwood"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lawson lawson", () => {
  assert.ok(world.rooms.rust_lawson, "rust_lawson room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lawson"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cypruscedar cypruscedar", () => {
  assert.ok(world.rooms.rust_cypruscedar, "rust_cypruscedar room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cypruscedar"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lebanoncedar lebanoncedar", () => {
  assert.ok(world.rooms.rust_lebanoncedar, "rust_lebanoncedar room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lebanoncedar"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-atlascedar atlascedar", () => {
  assert.ok(world.rooms.rust_atlascedar, "rust_atlascedar room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the atlascedar"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sawara sawara", () => {
  assert.ok(world.rooms.rust_sawara, "rust_sawara room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sawara"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sugi sugi", () => {
  assert.ok(world.rooms.rust_sugi, "rust_sugi room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sugi"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hinoki hinoki", () => {
  assert.ok(world.rooms.rust_hinoki, "rust_hinoki room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hinoki"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-yellowcedar yellowcedar", () => {
  assert.ok(world.rooms.rust_yellowcedar, "rust_yellowcedar room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the yellowcedar"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-redcedar redcedar", () => {
  assert.ok(world.rooms.rust_redcedar, "rust_redcedar room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the redcedar"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-amabilis amabilis", () => {
  assert.ok(world.rooms.rust_amabilis, "rust_amabilis room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the amabilis"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-fraserfir fraserfir", () => {
  assert.ok(world.rooms.rust_fraserfir, "rust_fraserfir room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the fraserfir"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-arborvitae arborvitae", () => {
  assert.ok(world.rooms.rust_arborvitae, "rust_arborvitae room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the arborvitae"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-alerce alerce", () => {
  assert.ok(world.rooms.rust_alerce, "rust_alerce room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the alerce"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-portorford portorford", () => {
  assert.ok(world.rooms.rust_portorford, "rust_portorford room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the portorford"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-incensecedar incensecedar", () => {
  assert.ok(world.rooms.rust_incensecedar, "rust_incensecedar room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the incensecedar"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-nobelfir nobelfir", () => {
  assert.ok(world.rooms.rust_nobelfir, "rust_nobelfir room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the nobelfir"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-grandfir grandfir", () => {
  assert.ok(world.rooms.rust_grandfir, "rust_grandfir room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the grandfir"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-whitefir whitefir", () => {
  assert.ok(world.rooms.rust_whitefir, "rust_whitefir room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the whitefir"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-balsamfir balsamfir", () => {
  assert.ok(world.rooms.rust_balsamfir, "rust_balsamfir room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the balsamfir"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lacebark lacebark", () => {
  assert.ok(world.rooms.rust_lacebark, "rust_lacebark room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lacebark"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-umbrellapine umbrellapine", () => {
  assert.ok(world.rooms.rust_umbrellapine, "rust_umbrellapine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the umbrellapine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-siberian siberian", () => {
  assert.ok(world.rooms.rust_siberian, "rust_siberian room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the siberian"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-koreanpine koreanpine", () => {
  assert.ok(world.rooms.rust_koreanpine, "rust_koreanpine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the koreanpine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-serbianspruce serbianspruce", () => {
  assert.ok(world.rooms.rust_serbianspruce, "rust_serbianspruce room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the serbianspruce"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-norwayspruce norwayspruce", () => {
  assert.ok(world.rooms.rust_norwayspruce, "rust_norwayspruce room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the norwayspruce"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-blackspruce blackspruce", () => {
  assert.ok(world.rooms.rust_blackspruce, "rust_blackspruce room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the blackspruce"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bluespruce bluespruce", () => {
  assert.ok(world.rooms.rust_bluespruce, "rust_bluespruce room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bluespruce"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-blackhills blackhills", () => {
  assert.ok(world.rooms.rust_blackhills, "rust_blackhills room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the blackhills"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-engelmann engelmann", () => {
  assert.ok(world.rooms.rust_engelmann, "rust_engelmann room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the engelmann"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-whitespruce whitespruce", () => {
  assert.ok(world.rooms.rust_whitespruce, "rust_whitespruce room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the whitespruce"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-redspruce redspruce", () => {
  assert.ok(world.rooms.rust_redspruce, "rust_redspruce room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the redspruce"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-austrianpine austrianpine", () => {
  assert.ok(world.rooms.rust_austrianpine, "rust_austrianpine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the austrianpine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sprucepine sprucepine", () => {
  assert.ok(world.rooms.rust_sprucepine, "rust_sprucepine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sprucepine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-shortleaf shortleaf", () => {
  assert.ok(world.rooms.rust_shortleaf, "rust_shortleaf room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the shortleaf"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sandpine sandpine", () => {
  assert.ok(world.rooms.rust_sandpine, "rust_sandpine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sandpine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pondpine pondpine", () => {
  assert.ok(world.rooms.rust_pondpine, "rust_pondpine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pondpine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-torrey torrey", () => {
  assert.ok(world.rooms.rust_torrey, "rust_torrey room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the torrey"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tablemountain tablemountain", () => {
  assert.ok(world.rooms.rust_tablemountain, "rust_tablemountain room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tablemountain"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-westernwhite westernwhite", () => {
  assert.ok(world.rooms.rust_westernwhite, "rust_westernwhite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the westernwhite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-greypine greypine", () => {
  assert.ok(world.rooms.rust_greypine, "rust_greypine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the greypine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-knobcone knobcone", () => {
  assert.ok(world.rooms.rust_knobcone, "rust_knobcone room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the knobcone"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bishoppine bishoppine", () => {
  assert.ok(world.rooms.rust_bishoppine, "rust_bishoppine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bishoppine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-coulter coulter", () => {
  assert.ok(world.rooms.rust_coulter, "rust_coulter room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the coulter"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-virginiapine virginiapine", () => {
  assert.ok(world.rooms.rust_virginiapine, "rust_virginiapine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the virginiapine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-longleaf longleaf", () => {
  assert.ok(world.rooms.rust_longleaf, "rust_longleaf room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the longleaf"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-jackpine jackpine", () => {
  assert.ok(world.rooms.rust_jackpine, "rust_jackpine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the jackpine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-foxtail foxtail", () => {
  assert.ok(world.rooms.rust_foxtail, "rust_foxtail room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the foxtail"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-limberpine limberpine", () => {
  assert.ok(world.rooms.rust_limberpine, "rust_limberpine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the limberpine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-macedonian macedonian", () => {
  assert.ok(world.rooms.rust_macedonian, "rust_macedonian room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the macedonian"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-arolla arolla", () => {
  assert.ok(world.rooms.rust_arolla, "rust_arolla room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the arolla"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pinyon pinyon", () => {
  assert.ok(world.rooms.rust_pinyon, "rust_pinyon room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pinyon"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-monterey monterey", () => {
  assert.ok(world.rooms.rust_monterey, "rust_monterey room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the monterey"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-corsican corsican", () => {
  assert.ok(world.rooms.rust_corsican, "rust_corsican room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the corsican"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-maritime maritime", () => {
  assert.ok(world.rooms.rust_maritime, "rust_maritime room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the maritime"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-aleppo aleppo", () => {
  assert.ok(world.rooms.rust_aleppo, "rust_aleppo room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the aleppo"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bristlecone bristlecone", () => {
  assert.ok(world.rooms.rust_bristlecone, "rust_bristlecone room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bristlecone"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-jeffreypine jeffreypine", () => {
  assert.ok(world.rooms.rust_jeffreypine, "rust_jeffreypine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the jeffreypine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lodgepole lodgepole", () => {
  assert.ok(world.rooms.rust_lodgepole, "rust_lodgepole room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lodgepole"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-stonepine stonepine", () => {
  assert.ok(world.rooms.rust_stonepine, "rust_stonepine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the stonepine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-norfolkpine norfolkpine", () => {
  assert.ok(world.rooms.rust_norfolkpine, "rust_norfolkpine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the norfolkpine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sitkaspruce sitkaspruce", () => {
  assert.ok(world.rooms.rust_sitkaspruce, "rust_sitkaspruce room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sitkaspruce"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-douglasfir douglasfir", () => {
  assert.ok(world.rooms.rust_douglasfir, "rust_douglasfir room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the douglasfir"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-scotspine scotspine", () => {
  assert.ok(world.rooms.rust_scotspine, "rust_scotspine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the scotspine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-yellowpine yellowpine", () => {
  assert.ok(world.rooms.rust_yellowpine, "rust_yellowpine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the yellowpine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-redpine redpine", () => {
  assert.ok(world.rooms.rust_redpine, "rust_redpine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the redpine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-whitepine whitepine", () => {
  assert.ok(world.rooms.rust_whitepine, "rust_whitepine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the whitepine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pencilpine pencilpine", () => {
  assert.ok(world.rooms.rust_pencilpine, "rust_pencilpine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pencilpine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kingbilly kingbilly", () => {
  assert.ok(world.rooms.rust_kingbilly, "rust_kingbilly room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kingbilly"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kauripine kauripine", () => {
  assert.ok(world.rooms.rust_kauripine, "rust_kauripine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kauripine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sugarpine sugarpine", () => {
  assert.ok(world.rooms.rust_sugarpine, "rust_sugarpine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sugarpine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ponderosa ponderosa", () => {
  assert.ok(world.rooms.rust_ponderosa, "rust_ponderosa room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ponderosa"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-loblolly loblolly", () => {
  assert.ok(world.rooms.rust_loblolly, "rust_loblolly room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the loblolly"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-slashpine slashpine", () => {
  assert.ok(world.rooms.rust_slashpine, "rust_slashpine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the slashpine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-radiatapine radiatapine", () => {
  assert.ok(world.rooms.rust_radiatapine, "rust_radiatapine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the radiatapine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-blackpine blackpine", () => {
  assert.ok(world.rooms.rust_blackpine, "rust_blackpine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the blackpine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-leatherwood leatherwood", () => {
  assert.ok(world.rooms.rust_leatherwood, "rust_leatherwood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the leatherwood"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-myrtlebeech myrtlebeech", () => {
  assert.ok(world.rooms.rust_myrtlebeech, "rust_myrtlebeech room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the myrtlebeech"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sassafras sassafras", () => {
  assert.ok(world.rooms.rust_sassafras, "rust_sassafras room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sassafras"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-celerytop celerytop", () => {
  assert.ok(world.rooms.rust_celerytop, "rust_celerytop room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the celerytop"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-huonpine huonpine", () => {
  assert.ok(world.rooms.rust_huonpine, "rust_huonpine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the huonpine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cypresspine cypresspine", () => {
  assert.ok(world.rooms.rust_cypresspine, "rust_cypresspine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cypresspine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-macadamia macadamia", () => {
  assert.ok(world.rooms.rust_macadamia, "rust_macadamia room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the macadamia"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hooppine hooppine", () => {
  assert.ok(world.rooms.rust_hooppine, "rust_hooppine room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hooppine"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bunya bunya", () => {
  assert.ok(world.rooms.rust_bunya, "rust_bunya room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bunya"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-quandong quandong", () => {
  assert.ok(world.rooms.rust_quandong, "rust_quandong room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the quandong"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-silverwattle silverwattle", () => {
  assert.ok(world.rooms.rust_silverwattle, "rust_silverwattle room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the silverwattle"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-blackwattle blackwattle", () => {
  assert.ok(world.rooms.rust_blackwattle, "rust_blackwattle room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the blackwattle"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-belah belah", () => {
  assert.ok(world.rooms.rust_belah, "rust_belah room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the belah"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-brigalow brigalow", () => {
  assert.ok(world.rooms.rust_brigalow, "rust_brigalow room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the brigalow"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-myall myall", () => {
  assert.ok(world.rooms.rust_myall, "rust_myall room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the myall"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mulga mulga", () => {
  assert.ok(world.rooms.rust_mulga, "rust_mulga room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mulga"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-geebung geebung", () => {
  assert.ok(world.rooms.rust_geebung, "rust_geebung room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the geebung"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kurrajong kurrajong", () => {
  assert.ok(world.rooms.rust_kurrajong, "rust_kurrajong room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kurrajong"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-gympie gympie", () => {
  assert.ok(world.rooms.rust_gympie, "rust_gympie room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the gympie"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lillypilly lillypilly", () => {
  assert.ok(world.rooms.rust_lillypilly, "rust_lillypilly room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lillypilly"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-waratah waratah", () => {
  assert.ok(world.rooms.rust_waratah, "rust_waratah room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the waratah"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-callistemon callistemon", () => {
  assert.ok(world.rooms.rust_callistemon, "rust_callistemon room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the callistemon"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bottlebrush bottlebrush", () => {
  assert.ok(world.rooms.rust_bottlebrush, "rust_bottlebrush room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bottlebrush"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-acacia acacia", () => {
  assert.ok(world.rooms.rust_acacia, "rust_acacia room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the acacia"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-grevillea grevillea", () => {
  assert.ok(world.rooms.rust_grevillea, "rust_grevillea room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the grevillea"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hakea hakea", () => {
  assert.ok(world.rooms.rust_hakea, "rust_hakea room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hakea"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-redoak redoak", () => {
  assert.ok(world.rooms.rust_redoak, "rust_redoak room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the redoak"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-blackoak blackoak", () => {
  assert.ok(world.rooms.rust_blackoak, "rust_blackoak room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the blackoak"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-swampbox swampbox", () => {
  assert.ok(world.rooms.rust_swampbox, "rust_swampbox room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the swampbox"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-melaleuca melaleuca", () => {
  assert.ok(world.rooms.rust_melaleuca, "rust_melaleuca room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the melaleuca"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-teatree teatree", () => {
  assert.ok(world.rooms.rust_teatree, "rust_teatree room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the teatree"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-banksia banksia", () => {
  assert.ok(world.rooms.rust_banksia, "rust_banksia room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the banksia"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-casuarina casuarina", () => {
  assert.ok(world.rooms.rust_casuarina, "rust_casuarina room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the casuarina"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-forestoak forestoak", () => {
  assert.ok(world.rooms.rust_forestoak, "rust_forestoak room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the forestoak"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-swampoak swampoak", () => {
  assert.ok(world.rooms.rust_swampoak, "rust_swampoak room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the swampoak"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-spottedironbark spottedironbark", () => {
  assert.ok(world.rooms.rust_spottedironbark, "rust_spottedironbark room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the spottedironbark"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-silverleaf silverleaf", () => {
  assert.ok(world.rooms.rust_silverleaf, "rust_silverleaf room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the silverleaf"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-angophora angophora", () => {
  assert.ok(world.rooms.rust_angophora, "rust_angophora room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the angophora"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mallet mallet", () => {
  assert.ok(world.rooms.rust_mallet, "rust_mallet room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mallet"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-yate yate", () => {
  assert.ok(world.rooms.rust_yate, "rust_yate room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the yate"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sheoak sheoak", () => {
  assert.ok(world.rooms.rust_sheoak, "rust_sheoak room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sheoak"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-paperbark paperbark", () => {
  assert.ok(world.rooms.rust_paperbark, "rust_paperbark room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the paperbark"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lemongum lemongum", () => {
  assert.ok(world.rooms.rust_lemongum, "rust_lemongum room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lemongum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-whitemahogany whitemahogany", () => {
  assert.ok(world.rooms.rust_whitemahogany, "rust_whitemahogany room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the whitemahogany"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-brownbarrel brownbarrel", () => {
  assert.ok(world.rooms.rust_brownbarrel, "rust_brownbarrel room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the brownbarrel"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cidergum cidergum", () => {
  assert.ok(world.rooms.rust_cidergum, "rust_cidergum room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cidergum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ribbongum ribbongum", () => {
  assert.ok(world.rooms.rust_ribbongum, "rust_ribbongum room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ribbongum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-shininggum shininggum", () => {
  assert.ok(world.rooms.rust_shininggum, "rust_shininggum room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the shininggum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-scribblygum scribblygum", () => {
  assert.ok(world.rooms.rust_scribblygum, "rust_scribblygum room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the scribblygum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-applebox applebox", () => {
  assert.ok(world.rooms.rust_applebox, "rust_applebox room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the applebox"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-redbox redbox", () => {
  assert.ok(world.rooms.rust_redbox, "rust_redbox room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the redbox"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-blackbox blackbox", () => {
  assert.ok(world.rooms.rust_blackbox, "rust_blackbox room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the blackbox"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bangalay bangalay", () => {
  assert.ok(world.rooms.rust_bangalay, "rust_bangalay room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bangalay"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tuart tuart", () => {
  assert.ok(world.rooms.rust_tuart, "rust_tuart room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tuart"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-marri marri", () => {
  assert.ok(world.rooms.rust_marri, "rust_marri room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the marri"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-coolibah coolibah", () => {
  assert.ok(world.rooms.rust_coolibah, "rust_coolibah room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the coolibah"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mugga mugga", () => {
  assert.ok(world.rooms.rust_mugga, "rust_mugga room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mugga"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-wandoo wandoo", () => {
  assert.ok(world.rooms.rust_wandoo, "rust_wandoo room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the wandoo"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-gimlet gimlet", () => {
  assert.ok(world.rooms.rust_gimlet, "rust_gimlet room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the gimlet"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-yorkgum yorkgum", () => {
  assert.ok(world.rooms.rust_yorkgum, "rust_yorkgum room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the yorkgum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-salmongum salmongum", () => {
  assert.ok(world.rooms.rust_salmongum, "rust_salmongum room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the salmongum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-whitebox whitebox", () => {
  assert.ok(world.rooms.rust_whitebox, "rust_whitebox room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the whitebox"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-redironbark redironbark", () => {
  assert.ok(world.rooms.rust_redironbark, "rust_redironbark room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the redironbark"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-greyironbark greyironbark", () => {
  assert.ok(world.rooms.rust_greyironbark, "rust_greyironbark room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the greyironbark"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-swampmahogany swampmahogany", () => {
  assert.ok(world.rooms.rust_swampmahogany, "rust_swampmahogany room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the swampmahogany"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-floodedgum floodedgum", () => {
  assert.ok(world.rooms.rust_floodedgum, "rust_floodedgum room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the floodedgum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sugargum sugargum", () => {
  assert.ok(world.rooms.rust_sugargum, "rust_sugargum room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sugargum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mannagum mannagum", () => {
  assert.ok(world.rooms.rust_mannagum, "rust_mannagum room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mannagum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-woollybutt woollybutt", () => {
  assert.ok(world.rooms.rust_woollybutt, "rust_woollybutt room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the woollybutt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-candlebark candlebark", () => {
  assert.ok(world.rooms.rust_candlebark, "rust_candlebark room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the candlebark"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-snowgum snowgum", () => {
  assert.ok(world.rooms.rust_snowgum, "rust_snowgum room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the snowgum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-riverredgum riverredgum", () => {
  assert.ok(world.rooms.rust_riverredgum, "rust_riverredgum room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the riverredgum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-yellowbox yellowbox", () => {
  assert.ok(world.rooms.rust_yellowbox, "rust_yellowbox room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the yellowbox"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-greybox greybox", () => {
  assert.ok(world.rooms.rust_greybox, "rust_greybox room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the greybox"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-redgum redgum", () => {
  assert.ok(world.rooms.rust_redgum, "rust_redgum room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the redgum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-swampgum swampgum", () => {
  assert.ok(world.rooms.rust_swampgum, "rust_swampgum room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the swampgum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-peppermint peppermint", () => {
  assert.ok(world.rooms.rust_peppermint, "rust_peppermint room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the peppermint"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-silvertop silvertop", () => {
  assert.ok(world.rooms.rust_silvertop, "rust_silvertop room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the silvertop"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mountainash mountainash", () => {
  assert.ok(world.rooms.rust_mountainash, "rust_mountainash room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mountainash"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-alpineash alpineash", () => {
  assert.ok(world.rooms.rust_alpineash, "rust_alpineash room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the alpineash"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bluegum bluegum", () => {
  assert.ok(world.rooms.rust_bluegum, "rust_bluegum room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bluegum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-stringybark stringybark", () => {
  assert.ok(world.rooms.rust_stringybark, "rust_stringybark room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the stringybark"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-messmate messmate", () => {
  assert.ok(world.rooms.rust_messmate, "rust_messmate room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the messmate"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ironbark ironbark", () => {
  assert.ok(world.rooms.rust_ironbark, "rust_ironbark room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ironbark"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-blackbutt blackbutt", () => {
  assert.ok(world.rooms.rust_blackbutt, "rust_blackbutt room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the blackbutt"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-spottedgum spottedgum", () => {
  assert.ok(world.rooms.rust_spottedgum, "rust_spottedgum room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the spottedgum"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tallowwood tallowwood", () => {
  assert.ok(world.rooms.rust_tallowwood, "rust_tallowwood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tallowwood"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-karri karri", () => {
  assert.ok(world.rooms.rust_karri, "rust_karri room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the karri"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-narig narig", () => {
  assert.ok(world.rooms.rust_narig, "rust_narig room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the narig"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-gisok gisok", () => {
  assert.ok(world.rooms.rust_gisok, "rust_gisok room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the gisok"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-malugai malugai", () => {
  assert.ok(world.rooms.rust_malugai, "rust_malugai room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the malugai"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tiaong tiaong", () => {
  assert.ok(world.rooms.rust_tiaong, "rust_tiaong room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tiaong"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-redlauan redlauan", () => {
  assert.ok(world.rooms.rust_redlauan, "rust_redlauan room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the redlauan"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bagras bagras", () => {
  assert.ok(world.rooms.rust_bagras, "rust_bagras room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bagras"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-whiteapo whiteapo", () => {
  assert.ok(world.rooms.rust_whiteapo, "rust_whiteapo room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the whiteapo"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-dao dao", () => {
  assert.ok(world.rooms.rust_dao, "rust_dao room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the dao"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-salai salai", () => {
  assert.ok(world.rooms.rust_salai, "rust_salai room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the salai"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tendu tendu", () => {
  assert.ok(world.rooms.rust_tendu, "rust_tendu room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tendu"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bija bija", () => {
  assert.ok(world.rooms.rust_bija, "rust_bija room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bija"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-arjun arjun", () => {
  assert.ok(world.rooms.rust_arjun, "rust_arjun room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the arjun"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-palash palash", () => {
  assert.ok(world.rooms.rust_palash, "rust_palash room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the palash"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-siris siris", () => {
  assert.ok(world.rooms.rust_siris, "rust_siris room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the siris"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-babul babul", () => {
  assert.ok(world.rooms.rust_babul, "rust_babul room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the babul"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-khair khair", () => {
  assert.ok(world.rooms.rust_khair, "rust_khair room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the khair"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-neem neem", () => {
  assert.ok(world.rooms.rust_neem, "rust_neem room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the neem"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-palmyra palmyra", () => {
  assert.ok(world.rooms.rust_palmyra, "rust_palmyra room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the palmyra"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-champak champak", () => {
  assert.ok(world.rooms.rust_champak, "rust_champak room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the champak"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-toon toon", () => {
  assert.ok(world.rooms.rust_toon, "rust_toon room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the toon"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-haldu haldu", () => {
  assert.ok(world.rooms.rust_haldu, "rust_haldu room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the haldu"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-salwood salwood", () => {
  assert.ok(world.rooms.rust_salwood, "rust_salwood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the salwood"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sissoo sissoo", () => {
  assert.ok(world.rooms.rust_sissoo, "rust_sissoo room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sissoo"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-shisham shisham", () => {
  assert.ok(world.rooms.rust_shisham, "rust_shisham room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the shisham"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-deodar deodar", () => {
  assert.ok(world.rooms.rust_deodar, "rust_deodar room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the deodar"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kalantas kalantas", () => {
  assert.ok(world.rooms.rust_kalantas, "rust_kalantas room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kalantas"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kekatong kekatong", () => {
  assert.ok(world.rooms.rust_kekatong, "rust_kekatong room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kekatong"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sesendok sesendok", () => {
  assert.ok(world.rooms.rust_sesendok, "rust_sesendok room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sesendok"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-terap terap", () => {
  assert.ok(world.rooms.rust_terap, "rust_terap room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the terap"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-palosapis palosapis", () => {
  assert.ok(world.rooms.rust_palosapis, "rust_palosapis room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the palosapis"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mayapis mayapis", () => {
  assert.ok(world.rooms.rust_mayapis, "rust_mayapis room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mayapis"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bagtikan bagtikan", () => {
  assert.ok(world.rooms.rust_bagtikan, "rust_bagtikan room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bagtikan"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-almon almon", () => {
  assert.ok(world.rooms.rust_almon, "rust_almon room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the almon"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tanguile tanguile", () => {
  assert.ok(world.rooms.rust_tanguile, "rust_tanguile room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tanguile"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kamagong kamagong", () => {
  assert.ok(world.rooms.rust_kamagong, "rust_kamagong room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kamagong"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-molave molave", () => {
  assert.ok(world.rooms.rust_molave, "rust_molave room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the molave"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ipil ipil", () => {
  assert.ok(world.rooms.rust_ipil, "rust_ipil room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ipil"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-narra narra", () => {
  assert.ok(world.rooms.rust_narra, "rust_narra room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the narra"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-yakal yakal", () => {
  assert.ok(world.rooms.rust_yakal, "rust_yakal room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the yakal"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-apitong apitong", () => {
  assert.ok(world.rooms.rust_apitong, "rust_apitong room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the apitong"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-petaling petaling", () => {
  assert.ok(world.rooms.rust_petaling, "rust_petaling room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the petaling"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-keranji keranji", () => {
  assert.ok(world.rooms.rust_keranji, "rust_keranji room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the keranji"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tembesu tembesu", () => {
  assert.ok(world.rooms.rust_tembesu, "rust_tembesu room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tembesu"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tualang tualang", () => {
  assert.ok(world.rooms.rust_tualang, "rust_tualang room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tualang"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-keladan keladan", () => {
  assert.ok(world.rooms.rust_keladan, "rust_keladan room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the keladan"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-gerutu gerutu", () => {
  assert.ok(world.rooms.rust_gerutu, "rust_gerutu room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the gerutu"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-merpauh merpauh", () => {
  assert.ok(world.rooms.rust_merpauh, "rust_merpauh room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the merpauh"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-selangan selangan", () => {
  assert.ok(world.rooms.rust_selangan, "rust_selangan room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the selangan"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-punah punah", () => {
  assert.ok(world.rooms.rust_punah, "rust_punah room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the punah"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-belian belian", () => {
  assert.ok(world.rooms.rust_belian, "rust_belian room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the belian"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-chengal chengal", () => {
  assert.ok(world.rooms.rust_chengal, "rust_chengal room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the chengal"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-resak resak", () => {
  assert.ok(world.rooms.rust_resak, "rust_resak room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the resak"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-merawan merawan", () => {
  assert.ok(world.rooms.rust_merawan, "rust_merawan room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the merawan"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sepetir sepetir", () => {
  assert.ok(world.rooms.rust_sepetir, "rust_sepetir room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sepetir"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kempas kempas", () => {
  assert.ok(world.rooms.rust_kempas, "rust_kempas room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kempas"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-balau balau", () => {
  assert.ok(world.rooms.rust_balau, "rust_balau room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the balau"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mersawa mersawa", () => {
  assert.ok(world.rooms.rust_mersawa, "rust_mersawa room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mersawa"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-geronggang geronggang", () => {
  assert.ok(world.rooms.rust_geronggang, "rust_geronggang room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the geronggang"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bintangor bintangor", () => {
  assert.ok(world.rooms.rust_bintangor, "rust_bintangor room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bintangor"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-nyatoh nyatoh", () => {
  assert.ok(world.rooms.rust_nyatoh, "rust_nyatoh room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the nyatoh"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-seraya seraya", () => {
  assert.ok(world.rooms.rust_seraya, "rust_seraya room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the seraya"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kapur kapur", () => {
  assert.ok(world.rooms.rust_kapur, "rust_kapur room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kapur"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-keruing keruing", () => {
  assert.ok(world.rooms.rust_keruing, "rust_keruing room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the keruing"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-merbau merbau", () => {
  assert.ok(world.rooms.rust_merbau, "rust_merbau room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the merbau"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bocote bocote", () => {
  assert.ok(world.rooms.rust_bocote, "rust_bocote room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bocote"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ziricote ziricote", () => {
  assert.ok(world.rooms.rust_ziricote, "rust_ziricote room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ziricote"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-palosanto palosanto", () => {
  assert.ok(world.rooms.rust_palosanto, "rust_palosanto room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the palosanto"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-primavera primavera", () => {
  assert.ok(world.rooms.rust_primavera, "rust_primavera room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the primavera"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-nargusta nargusta", () => {
  assert.ok(world.rooms.rust_nargusta, "rust_nargusta room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the nargusta"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-missanda missanda", () => {
  assert.ok(world.rooms.rust_missanda, "rust_missanda room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the missanda"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-okan okan", () => {
  assert.ok(world.rooms.rust_okan, "rust_okan room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the okan"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-dahoma dahoma", () => {
  assert.ok(world.rooms.rust_dahoma, "rust_dahoma room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the dahoma"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-breu breu", () => {
  assert.ok(world.rooms.rust_breu, "rust_breu room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the breu"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-virola virola", () => {
  assert.ok(world.rooms.rust_virola, "rust_virola room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the virola"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-quaruba quaruba", () => {
  assert.ok(world.rooms.rust_quaruba, "rust_quaruba room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the quaruba"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cedrorosa cedrorosa", () => {
  assert.ok(world.rooms.rust_cedrorosa, "rust_cedrorosa room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cedrorosa"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cambara cambara", () => {
  assert.ok(world.rooms.rust_cambara, "rust_cambara room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cambara"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-itauba itauba", () => {
  assert.ok(world.rooms.rust_itauba, "rust_itauba room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the itauba"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-goncalo goncalo", () => {
  assert.ok(world.rooms.rust_goncalo, "rust_goncalo room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the goncalo"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-muiracatiara muiracatiara", () => {
  assert.ok(world.rooms.rust_muiracatiara, "rust_muiracatiara room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the muiracatiara"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ucuuba ucuuba", () => {
  assert.ok(world.rooms.rust_ucuuba, "rust_ucuuba room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ucuuba"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-marupa marupa", () => {
  assert.ok(world.rooms.rust_marupa, "rust_marupa room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the marupa"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cancharana cancharana", () => {
  assert.ok(world.rooms.rust_cancharana, "rust_cancharana room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cancharana"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-louropreto louropreto", () => {
  assert.ok(world.rooms.rust_louropreto, "rust_louropreto room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the louropreto"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-faveira faveira", () => {
  assert.ok(world.rooms.rust_faveira, "rust_faveira room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the faveira"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-arariba arariba", () => {
  assert.ok(world.rooms.rust_arariba, "rust_arariba room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the arariba"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-jequitiba jequitiba", () => {
  assert.ok(world.rooms.rust_jequitiba, "rust_jequitiba room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the jequitiba"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-amendoim amendoim", () => {
  assert.ok(world.rooms.rust_amendoim, "rust_amendoim room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the amendoim"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cupiuba cupiuba", () => {
  assert.ok(world.rooms.rust_cupiuba, "rust_cupiuba room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cupiuba"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tauari tauari", () => {
  assert.ok(world.rooms.rust_tauari, "rust_tauari room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tauari"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-vinhatico vinhatico", () => {
  assert.ok(world.rooms.rust_vinhatico, "rust_vinhatico room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the vinhatico"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-freijo freijo", () => {
  assert.ok(world.rooms.rust_freijo, "rust_freijo room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the freijo"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-peroba peroba", () => {
  assert.ok(world.rooms.rust_peroba, "rust_peroba room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the peroba"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-guatambu guatambu", () => {
  assert.ok(world.rooms.rust_guatambu, "rust_guatambu room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the guatambu"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cabreuva cabreuva", () => {
  assert.ok(world.rooms.rust_cabreuva, "rust_cabreuva room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cabreuva"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pauferro pauferro", () => {
  assert.ok(world.rooms.rust_pauferro, "rust_pauferro room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pauferro"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-angelim angelim", () => {
  assert.ok(world.rooms.rust_angelim, "rust_angelim room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the angelim"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-massaranduba massaranduba", () => {
  assert.ok(world.rooms.rust_massaranduba, "rust_massaranduba room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the massaranduba"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tatajuba tatajuba", () => {
  assert.ok(world.rooms.rust_tatajuba, "rust_tatajuba room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tatajuba"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-courbaril courbaril", () => {
  assert.ok(world.rooms.rust_courbaril, "rust_courbaril room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the courbaril"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-andiroba andiroba", () => {
  assert.ok(world.rooms.rust_andiroba, "rust_andiroba room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the andiroba"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sucupira sucupira", () => {
  assert.ok(world.rooms.rust_sucupira, "rust_sucupira room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sucupira"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cumaru cumaru", () => {
  assert.ok(world.rooms.rust_cumaru, "rust_cumaru room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cumaru"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-jatoba jatoba", () => {
  assert.ok(world.rooms.rust_jatoba, "rust_jatoba room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the jatoba"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-aniegre aniegre", () => {
  assert.ok(world.rooms.rust_aniegre, "rust_aniegre room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the aniegre"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-gmelina gmelina", () => {
  assert.ok(world.rooms.rust_gmelina, "rust_gmelina room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the gmelina"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ovangkol ovangkol", () => {
  assert.ok(world.rooms.rust_ovangkol, "rust_ovangkol room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ovangkol"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kosipo kosipo", () => {
  assert.ok(world.rooms.rust_kosipo, "rust_kosipo room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kosipo"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-dibetou dibetou", () => {
  assert.ok(world.rooms.rust_dibetou, "rust_dibetou room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the dibetou"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bosse bosse", () => {
  assert.ok(world.rooms.rust_bosse, "rust_bosse room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bosse"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tiama tiama", () => {
  assert.ok(world.rooms.rust_tiama, "rust_tiama room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tiama"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sipo sipo", () => {
  assert.ok(world.rooms.rust_sipo, "rust_sipo room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sipo"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-okoume okoume", () => {
  assert.ok(world.rooms.rust_okoume, "rust_okoume room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the okoume"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-movingui movingui", () => {
  assert.ok(world.rooms.rust_movingui, "rust_movingui room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the movingui"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mansonia mansonia", () => {
  assert.ok(world.rooms.rust_mansonia, "rust_mansonia room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mansonia"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-idigbo idigbo", () => {
  assert.ok(world.rooms.rust_idigbo, "rust_idigbo room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the idigbo"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-framire framire", () => {
  assert.ok(world.rooms.rust_framire, "rust_framire room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the framire"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-anigre anigre", () => {
  assert.ok(world.rooms.rust_anigre, "rust_anigre room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the anigre"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-avodire avodire", () => {
  assert.ok(world.rooms.rust_avodire, "rust_avodire room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the avodire"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-agba agba", () => {
  assert.ok(world.rooms.rust_agba, "rust_agba room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the agba"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-makore makore", () => {
  assert.ok(world.rooms.rust_makore, "rust_makore room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the makore"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-afzelia afzelia", () => {
  assert.ok(world.rooms.rust_afzelia, "rust_afzelia room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the afzelia"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-opepe opepe", () => {
  assert.ok(world.rooms.rust_opepe, "rust_opepe room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the opepe"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-danta danta", () => {
  assert.ok(world.rooms.rust_danta, "rust_danta room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the danta"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-niangon niangon", () => {
  assert.ok(world.rooms.rust_niangon, "rust_niangon room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the niangon"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-utile utile", () => {
  assert.ok(world.rooms.rust_utile, "rust_utile room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the utile"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-koto koto", () => {
  assert.ok(world.rooms.rust_koto, "rust_koto room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the koto"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-abachi abachi", () => {
  assert.ok(world.rooms.rust_abachi, "rust_abachi room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the abachi"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-obeche obeche", () => {
  assert.ok(world.rooms.rust_obeche, "rust_obeche room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the obeche"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-limba limba", () => {
  assert.ok(world.rooms.rust_limba, "rust_limba room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the limba"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lacewood lacewood", () => {
  assert.ok(world.rooms.rust_lacewood, "rust_lacewood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lacewood"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bloodwood bloodwood", () => {
  assert.ok(world.rooms.rust_bloodwood, "rust_bloodwood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bloodwood"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-snakewood snakewood", () => {
  assert.ok(world.rooms.rust_snakewood, "rust_snakewood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the snakewood"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-satinwood satinwood", () => {
  assert.ok(world.rooms.rust_satinwood, "rust_satinwood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the satinwood"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tulipwood tulipwood", () => {
  assert.ok(world.rooms.rust_tulipwood, "rust_tulipwood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tulipwood"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-kingwood kingwood", () => {
  assert.ok(world.rooms.rust_kingwood, "rust_kingwood room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the kingwood"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-arsenopyrite arsenopyrite", () => {
  assert.ok(world.rooms.rust_arsenopyrite, "rust_arsenopyrite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the arsenopyrite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lollingite lollingite", () => {
  assert.ok(world.rooms.rust_lollingite, "rust_lollingite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lollingite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ullmannite ullmannite", () => {
  assert.ok(world.rooms.rust_ullmannite, "rust_ullmannite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ullmannite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-gersdorffite gersdorffite", () => {
  assert.ok(world.rooms.rust_gersdorffite, "rust_gersdorffite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the gersdorffite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-skutterudite skutterudite", () => {
  assert.ok(world.rooms.rust_skutterudite, "rust_skutterudite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the skutterudite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-safflorite safflorite", () => {
  assert.ok(world.rooms.rust_safflorite, "rust_safflorite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the safflorite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rammelsbergite rammelsbergite", () => {
  assert.ok(world.rooms.rust_rammelsbergite, "rust_rammelsbergite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rammelsbergite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-maucherite maucherite", () => {
  assert.ok(world.rooms.rust_maucherite, "rust_maucherite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the maucherite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-breithauptite breithauptite", () => {
  assert.ok(world.rooms.rust_breithauptite, "rust_breithauptite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the breithauptite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-violarite violarite", () => {
  assert.ok(world.rooms.rust_violarite, "rust_violarite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the violarite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mackinawite mackinawite", () => {
  assert.ok(world.rooms.rust_mackinawite, "rust_mackinawite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mackinawite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-valleriite valleriite", () => {
  assert.ok(world.rooms.rust_valleriite, "rust_valleriite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the valleriite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cubanite cubanite", () => {
  assert.ok(world.rooms.rust_cubanite, "rust_cubanite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cubanite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pyrrhotite pyrrhotite", () => {
  assert.ok(world.rooms.rust_pyrrhotite, "rust_pyrrhotite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pyrrhotite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pentlandite pentlandite", () => {
  assert.ok(world.rooms.rust_pentlandite, "rust_pentlandite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pentlandite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-nickeline nickeline", () => {
  assert.ok(world.rooms.rust_nickeline, "rust_nickeline room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the nickeline"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-millerite millerite", () => {
  assert.ok(world.rooms.rust_millerite, "rust_millerite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the millerite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hawleyite hawleyite", () => {
  assert.ok(world.rooms.rust_hawleyite, "rust_hawleyite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hawleyite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-greenockite greenockite", () => {
  assert.ok(world.rooms.rust_greenockite, "rust_greenockite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the greenockite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-wurtzite wurtzite", () => {
  assert.ok(world.rooms.rust_wurtzite, "rust_wurtzite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the wurtzite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-franklinite franklinite", () => {
  assert.ok(world.rooms.rust_franklinite, "rust_franklinite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the franklinite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hydrozincite hydrozincite", () => {
  assert.ok(world.rooms.rust_hydrozincite, "rust_hydrozincite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hydrozincite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-gahnite gahnite", () => {
  assert.ok(world.rooms.rust_gahnite, "rust_gahnite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the gahnite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-zincite zincite", () => {
  assert.ok(world.rooms.rust_zincite, "rust_zincite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the zincite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-polianite polianite", () => {
  assert.ok(world.rooms.rust_polianite, "rust_polianite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the polianite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-psilomelane psilomelane", () => {
  assert.ok(world.rooms.rust_psilomelane, "rust_psilomelane room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the psilomelane"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-manganite manganite", () => {
  assert.ok(world.rooms.rust_manganite, "rust_manganite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the manganite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-braunite braunite", () => {
  assert.ok(world.rooms.rust_braunite, "rust_braunite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the braunite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hausmannite hausmannite", () => {
  assert.ok(world.rooms.rust_hausmannite, "rust_hausmannite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hausmannite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-crednerite crednerite", () => {
  assert.ok(world.rooms.rust_crednerite, "rust_crednerite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the crednerite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-delafossite delafossite", () => {
  assert.ok(world.rooms.rust_delafossite, "rust_delafossite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the delafossite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-paramelaconite paramelaconite", () => {
  assert.ok(world.rooms.rust_paramelaconite, "rust_paramelaconite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the paramelaconite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-eriochalcite eriochalcite", () => {
  assert.ok(world.rooms.rust_eriochalcite, "rust_eriochalcite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the eriochalcite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-anthonyite anthonyite", () => {
  assert.ok(world.rooms.rust_anthonyite, "rust_anthonyite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the anthonyite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-calumetite calumetite", () => {
  assert.ok(world.rooms.rust_calumetite, "rust_calumetite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the calumetite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-percylite percylite", () => {
  assert.ok(world.rooms.rust_percylite, "rust_percylite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the percylite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cumengeite cumengeite", () => {
  assert.ok(world.rooms.rust_cumengeite, "rust_cumengeite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cumengeite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-clinoatacamite clinoatacamite", () => {
  assert.ok(world.rooms.rust_clinoatacamite, "rust_clinoatacamite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the clinoatacamite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-paratacamite paratacamite", () => {
  assert.ok(world.rooms.rust_paratacamite, "rust_paratacamite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the paratacamite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-botallackite botallackite", () => {
  assert.ok(world.rooms.rust_botallackite, "rust_botallackite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the botallackite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-nantokite nantokite", () => {
  assert.ok(world.rooms.rust_nantokite, "rust_nantokite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the nantokite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-spangolite spangolite", () => {
  assert.ok(world.rooms.rust_spangolite, "rust_spangolite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the spangolite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-posnjakite posnjakite", () => {
  assert.ok(world.rooms.rust_posnjakite, "rust_posnjakite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the posnjakite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-connellite connellite", () => {
  assert.ok(world.rooms.rust_connellite, "rust_connellite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the connellite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-diaboleite diaboleite", () => {
  assert.ok(world.rooms.rust_diaboleite, "rust_diaboleite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the diaboleite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-plancheite plancheite", () => {
  assert.ok(world.rooms.rust_plancheite, "rust_plancheite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the plancheite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-shattuckite shattuckite", () => {
  assert.ok(world.rooms.rust_shattuckite, "rust_shattuckite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the shattuckite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-libethenite libethenite", () => {
  assert.ok(world.rooms.rust_libethenite, "rust_libethenite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the libethenite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-olivenite olivenite", () => {
  assert.ok(world.rooms.rust_olivenite, "rust_olivenite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the olivenite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tetrahedrite tetrahedrite", () => {
  assert.ok(world.rooms.rust_tetrahedrite, "rust_tetrahedrite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tetrahedrite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-enargite enargite", () => {
  assert.ok(world.rooms.rust_enargite, "rust_enargite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the enargite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-chalcocite chalcocite", () => {
  assert.ok(world.rooms.rust_chalcocite, "rust_chalcocite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the chalcocite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sphalerite sphalerite", () => {
  assert.ok(world.rooms.rust_sphalerite, "rust_sphalerite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sphalerite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-willemite willemite", () => {
  assert.ok(world.rooms.rust_willemite, "rust_willemite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the willemite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-hemimorphite hemimorphite", () => {
  assert.ok(world.rooms.rust_hemimorphite, "rust_hemimorphite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the hemimorphite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-smithsonite smithsonite", () => {
  assert.ok(world.rooms.rust_smithsonite, "rust_smithsonite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the smithsonite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-aurichalcite aurichalcite", () => {
  assert.ok(world.rooms.rust_aurichalcite, "rust_aurichalcite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the aurichalcite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-linarite linarite", () => {
  assert.ok(world.rooms.rust_linarite, "rust_linarite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the linarite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-tenorite tenorite", () => {
  assert.ok(world.rooms.rust_tenorite, "rust_tenorite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the tenorite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cuprite cuprite", () => {
  assert.ok(world.rooms.rust_cuprite, "rust_cuprite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cuprite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bornite bornite", () => {
  assert.ok(world.rooms.rust_bornite, "rust_bornite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bornite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-covellite covellite", () => {
  assert.ok(world.rooms.rust_covellite, "rust_covellite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the covellite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-chalcanthite chalcanthite", () => {
  assert.ok(world.rooms.rust_chalcanthite, "rust_chalcanthite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the chalcanthite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-antlerite antlerite", () => {
  assert.ok(world.rooms.rust_antlerite, "rust_antlerite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the antlerite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-langite langite", () => {
  assert.ok(world.rooms.rust_langite, "rust_langite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the langite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-smaltite smaltite", () => {
  assert.ok(world.rooms.rust_smaltite, "rust_smaltite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the smaltite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-mayanblue mayanblue", () => {
  assert.ok(world.rooms.rust_mayanblue, "rust_mayanblue room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the mayanblue"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-brochantite brochantite", () => {
  assert.ok(world.rooms.rust_brochantite, "rust_brochantite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the brochantite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-atacamite atacamite", () => {
  assert.ok(world.rooms.rust_atacamite, "rust_atacamite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the atacamite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-dioptase dioptase", () => {
  assert.ok(world.rooms.rust_dioptase, "rust_dioptase room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the dioptase"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-chrysocolla chrysocolla", () => {
  assert.ok(world.rooms.rust_chrysocolla, "rust_chrysocolla room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the chrysocolla"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-turquoise turquoise", () => {
  assert.ok(world.rooms.rust_turquoise, "rust_turquoise room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the turquoise"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-cobaltite cobaltite", () => {
  assert.ok(world.rooms.rust_cobaltite, "rust_cobaltite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the cobaltite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rhodochrosite rhodochrosite", () => {
  assert.ok(world.rooms.rust_rhodochrosite, "rust_rhodochrosite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rhodochrosite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pyrolusite pyrolusite", () => {
  assert.ok(world.rooms.rust_pyrolusite, "rust_pyrolusite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pyrolusite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-glauconite glauconite", () => {
  assert.ok(world.rooms.rust_glauconite, "rust_glauconite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the glauconite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-celadonite celadonite", () => {
  assert.ok(world.rooms.rust_celadonite, "rust_celadonite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the celadonite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-vivianite vivianite", () => {
  assert.ok(world.rooms.rust_vivianite, "rust_vivianite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the vivianite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-prussian prussian", () => {
  assert.ok(world.rooms.rust_prussian, "rust_prussian room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the prussian"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-egyptianblue egyptianblue", () => {
  assert.ok(world.rooms.rust_egyptianblue, "rust_egyptianblue room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the egyptianblue"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-lapis lapis", () => {
  assert.ok(world.rooms.rust_lapis, "rust_lapis room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the lapis"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-bice bice", () => {
  assert.ok(world.rooms.rust_bice, "rust_bice room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the bice"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sapgreen sapgreen", () => {
  assert.ok(world.rooms.rust_sapgreen, "rust_sapgreen room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sapgreen"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-greenearth greenearth", () => {
  assert.ok(world.rooms.rust_greenearth, "rust_greenearth room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the greenearth"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-burntsienna burntsienna", () => {
  assert.ok(world.rooms.rust_burntsienna, "rust_burntsienna room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the burntsienna"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-rawsienna rawsienna", () => {
  assert.ok(world.rooms.rust_rawsienna, "rust_rawsienna room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the rawsienna"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-burntumber burntumber", () => {
  assert.ok(world.rooms.rust_burntumber, "rust_burntumber room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the burntumber"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-yellowochre yellowochre", () => {
  assert.ok(world.rooms.rust_yellowochre, "rust_yellowochre room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the yellowochre"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-redochre redochre", () => {
  assert.ok(world.rooms.rust_redochre, "rust_redochre room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the redochre"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-ruddle ruddle", () => {
  assert.ok(world.rooms.rust_ruddle, "rust_ruddle room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the ruddle"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-manganese manganese", () => {
  assert.ok(world.rooms.rust_manganese, "rust_manganese room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the manganese"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-stibnite stibnite", () => {
  assert.ok(world.rooms.rust_stibnite, "rust_stibnite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the stibnite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-galena galena", () => {
  assert.ok(world.rooms.rust_galena, "rust_galena room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the galena"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-goethite goethite", () => {
  assert.ok(world.rooms.rust_goethite, "rust_goethite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the goethite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-limonite limonite", () => {
  assert.ok(world.rooms.rust_limonite, "rust_limonite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the limonite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-siderite siderite", () => {
  assert.ok(world.rooms.rust_siderite, "rust_siderite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the siderite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-infusorial infusorial", () => {
  assert.ok(world.rooms.rust_infusorial, "rust_infusorial room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the infusorial"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-glasspaper glasspaper", () => {
  assert.ok(world.rooms.rust_glasspaper, "rust_glasspaper room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the glasspaper"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-sandpaper sandpaper", () => {
  assert.ok(world.rooms.rust_sandpaper, "rust_sandpaper room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the sandpaper"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-oilstone oilstone", () => {
  assert.ok(world.rooms.rust_oilstone, "rust_oilstone room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the oilstone"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-honestone honestone", () => {
  assert.ok(world.rooms.rust_honestone, "rust_honestone room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the honestone"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-novaculite novaculite", () => {
  assert.ok(world.rooms.rust_novaculite, "rust_novaculite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the novaculite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-pyrite pyrite", () => {
  assert.ok(world.rooms.rust_pyrite, "rust_pyrite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the pyrite"), `labels: ${labels.join(" | ")}`);
});

test("walkthrough includes pinching the rust-magnetite magnetite", () => {
  assert.ok(world.rooms.rust_magnetite, "rust_magnetite room missing");
  const labels = world.walkthrough.filter((w): w is string => typeof w === "string");
  assert.ok(labels.includes("pinch the magnetite"), `labels: ${labels.join(" | ")}`);
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
