/**
 * Triage is deterministic Tier-3: reports in, atomic corroborated issues out.
 * These tests pin the promotion rules so a dev agent cannot quietly loosen them.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { type TestContext } from "node:test";
import { clusterUnits, triage, unitsFromReport } from "../src/triage.ts";

const report = (file: string, over: Record<string, unknown>) => ({
  file,
  r: { kind: "playtest", seed: 1, model: "m", verified: true, bugs: [], confusions: [], suggestions: [], ...over },
});

test("two corroborating suggestions from independent reports merge into one P1 issue", () => {
  const a = report("r1.json", { suggestions: ["hint that the spiral stair needs a lit lantern"] });
  const b = report("r2.json", { suggestions: ["the stair should hint that it needs the lantern lit"] });
  const units = [...unitsFromReport(a.file, a.r), ...unitsFromReport(b.file, b.r)];
  const issues = clusterUnits(units);
  assert.equal(issues.length, 1);
  assert.equal(issues[0]?.priority, "P1"); // subjective, but corroborated by 2 reports
  assert.equal(issues[0]?.corroboration, 2);
});

test("an uncorroborated suggestion stays P2; a P0 bug promotes alone", () => {
  const a = report("r1.json", {
    suggestions: ["add more scoring feedback after each quest beat"],
    bugs: [{ sev: "P0", what: "crash when attacking twice", where: "oil_store" }],
  });
  const issues = clusterUnits(unitsFromReport(a.file, a.r));
  assert.equal(issues.length, 2);
  assert.equal(issues[0]?.priority, "P0");
  assert.equal(issues[0]?.unit_kind, "bug");
  assert.equal(issues[1]?.priority, "P2");
});

test("unrelated units do not merge; issue ids are stable across runs", () => {
  const a = report("r1.json", { suggestions: ["brighten the tavern description"] });
  const b = report("r2.json", { suggestions: ["combat damage numbers feel opaque"] });
  const one = clusterUnits([...unitsFromReport(a.file, a.r), ...unitsFromReport(b.file, b.r)]);
  const two = clusterUnits([...unitsFromReport(a.file, a.r), ...unitsFromReport(b.file, b.r)]);
  assert.equal(one.length, 2);
  assert.deepEqual(one.map((i) => i.id), two.map((i) => i.id)); // deterministic
});

test("explicit P2 bugs retain their severity, even with corroboration", () => {
  const r = { bugs: [{ sev: "P2", what: "typo in tavern description" }] };
  const issues = clusterUnits([...unitsFromReport("a.json", r), ...unitsFromReport("b.json", r)]);
  assert.equal(issues.length, 1);
  assert.equal(issues[0]?.priority, "P2");
  assert.equal(clusterUnits(unitsFromReport("c.json", { bugs: [{ what: "missing severity" }] }))[0]?.priority, "P1");
});

test("duplicate findings from one report do not inflate verified corroboration or crowd out evidence", () => {
  const a = report("a.json", { suggestions: Array(4).fill("clarify the stair lantern hint") });
  const b = report("b.json", { suggestions: ["clarify the stair lantern hint"] });
  const c = report("c.json", { verified: false, suggestions: ["clarify the stair lantern hint"] });
  const issues = clusterUnits([a, b, c].flatMap(({ file, r }) => unitsFromReport(file, r)));
  assert.equal(issues[0]?.corroboration, 3);
  assert.equal(issues[0]?.verified_reports, 2);
  assert.deepEqual(issues[0]?.evidence.map((e) => e.report), ["a.json", "b.json", "c.json"]);
  const single = clusterUnits(unitsFromReport(a.file, a.r))[0]!;
  assert.equal(single.verified_reports, 1);
  assert.equal(single.priority, "P2");
});

test("equal-length cluster representatives are stable when report order changes", () => {
  const a = unitsFromReport("a.json", { suggestions: ["lantern stair hint unclear"] });
  const b = unitsFromReport("b.json", { suggestions: ["stair lantern hint unclear"] });
  const one = clusterUnits([...a, ...b])[0]!;
  const two = clusterUnits([...b, ...a])[0]!;
  assert.equal(one.id, two.id);
  assert.equal(one.title, two.title);
  assert.deepEqual(one.evidence, two.evidence);
});

test("non-English titles keep distinct identities and exact duplicates still merge", () => {
  const issues = clusterUnits(unitsFromReport("a.json", { suggestions: ["明るさ", "明るさ", "説明"] }));
  assert.equal(issues.length, 2);
  assert.equal(new Set(issues.map((i) => i.id)).size, 2);
});

test("malformed finding values cannot crash clustering or supply trusted metadata", () => {
  assert.deepEqual(unitsFromReport("null.json", null), []);
  const units = unitsFromReport("r.json", {
    seed: "123", model: {}, verified: "true",
    bugs: [null, false, { what: {} }, { what: "valid bug", where: 4 }, { what: " real bug " }],
    suggestions: [null, 7, {}, "", " ", " real suggestion "], confusions: "not an array",
  });
  const issues = clusterUnits(units);
  assert.equal(issues.length, 2);
  assert.deepEqual(new Set(issues.map((i) => i.title)), new Set(["real bug", "real suggestion"]));
  for (const issue of issues) {
    assert.equal(issue.verified_reports, 0);
    assert.equal(issue.evidence[0]?.seed, undefined);
    assert.equal(issue.evidence[0]?.model, undefined);
  }
});

function fixture(t: TestContext) {
  const root = mkdtempSync(join(tmpdir(), "tinyforge-triage-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const reportsDir = join(root, "reports");
  const queueDir = join(root, "queue");
  const doneDir = join(root, "done");
  mkdirSync(reportsDir);
  mkdirSync(queueDir);
  mkdirSync(doneDir);
  const options = { reportsDir, queueDir, dedupeDirs: [queueDir, join(queueDir, "failed"), doneDir] };
  const put = (file: string, value: unknown) => writeFileSync(join(reportsDir, file), JSON.stringify(value));
  return { reportsDir, queueDir, doneDir, options, put };
}

test("triage only archives valid reports and leaves malformed or unrelated evidence in place", (t) => {
  const f = fixture(t);
  const valid = report("valid.json", { suggestions: ["clarify stair lighting"] });
  f.put(valid.file, valid.r);
  f.put("empty.json", report("empty.json", {}).r);
  writeFileSync(join(f.reportsDir, "broken.json"), "{");
  f.put("null.json", null);
  f.put("other.json", { kind: "issue" });
  f.put("malformed.json", { kind: "playtest", suggestions: ["a useful finding", 4] });
  mkdirSync(join(f.reportsDir, "directory.json"));
  const result = triage(f.options);
  assert.equal(result.consumed, 2);
  assert.equal(result.filed.length, 1);
  assert.deepEqual(readdirSync(join(f.reportsDir, "triaged")).sort(), ["empty.json", "valid.json"]);
  for (const name of ["broken.json", "null.json", "other.json", "malformed.json", "directory.json"])
    assert.ok(existsSync(join(f.reportsDir, name)), `${name} retained`);
  assert.deepEqual(triage(f.options), { consumed: 0, filed: [], skipped: 0 });
});

test("triage preserves both copies when a raw report reuses an archived filename", (t) => {
  const f = fixture(t);
  mkdirSync(join(f.reportsDir, "triaged"));
  const archivedPath = join(f.reportsDir, "triaged", "same.json");
  writeFileSync(archivedPath, "original evidence");
  f.put("same.json", report("same.json", { suggestions: ["new evidence"] }).r);
  const originalNew = readFileSync(join(f.reportsDir, "same.json"), "utf8");
  assert.deepEqual(triage(f.options), { consumed: 0, filed: [], skipped: 0 });
  assert.equal(readFileSync(archivedPath, "utf8"), "original evidence");
  assert.equal(readFileSync(join(f.reportsDir, "same.json"), "utf8"), originalNew);
});

test("same wording in different finding kinds files separate issues without overwrites", (t) => {
  const f = fixture(t);
  f.put("r.json", report("r.json", {
    bugs: [{ what: "clarify stair lighting" }],
    confusions: ["clarify stair lighting"], suggestions: ["clarify stair lighting"],
  }).r);
  const result = triage(f.options);
  assert.equal(result.filed.length, 3);
  assert.equal(new Set(result.filed.map((i) => i.id)).size, 3);
  assert.equal(readdirSync(f.queueDir).length, 3);
});

test("queued, failed and completed legacy issue ids still deduplicate by kind", (t) => {
  const f = fixture(t);
  const title = "clarify stair lighting";
  const legacyId = createHash("sha256").update("clarify-lighting-stair").digest("hex").slice(0, 8);
  mkdirSync(join(f.queueDir, "failed"));
  for (const [index, dir] of f.options.dedupeDirs.entries()) {
    const path = join(dir, `P2-issue-${legacyId}.json`);
    writeFileSync(path, JSON.stringify({ kind: "issue", title, unit_kind: "suggestion", id: legacyId }));
    f.put(`r${index}.json`, report(`r${index}.json`, { suggestions: [title] }).r);
    const result = triage(f.options);
    assert.equal(result.consumed, 1);
    assert.equal(result.filed.length, 0);
    assert.equal(result.skipped, 1);
    rmSync(path);
  }
  writeFileSync(join(f.doneDir, `P2-issue-${legacyId}.json`), JSON.stringify({ title, unit_kind: "suggestion" }));
  f.put("different-kind.json", report("different-kind.json", { confusions: [title] }).r);
  assert.equal(triage(f.options).filed.length, 1);
});
