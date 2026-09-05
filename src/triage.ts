/**
 * tinyforge triage — deterministic Tier-3 in ~150 lines.
 *
 * Raw session reports (reports/*.json) are EVIDENCE; the dev loop should eat
 * ISSUES. Triage explodes each report into atomic units (one bug / confusion /
 * suggestion each), clusters near-duplicates across the wave (word-overlap
 * coefficient — no model, no randomness), counts corroboration, and files one
 * queue item per cluster. Rules: a P0 bug promotes alone; a P1 bug promotes
 * alone; subjective units (confusions, suggestions) file at P2 and rise to P1
 * only when 2+ independent reports corroborate. Consumed reports move to
 * reports/triaged/. Re-running is idempotent: an issue id already present in
 * queue/, queue/failed/ or done/ is not re-filed.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

type Unit = {
  kind: "bug" | "confusion" | "suggestion";
  sev: "P0" | "P1" | "P2";
  title: string;
  where?: string;
  report: string; // filename
  seed?: number;
  model?: string;
  build?: unknown;
  verified?: boolean;
};

const STOP = new Set(
  "the a an to of in on for and or is was are it that this with at be as i you your it's not no never would should could".split(" "),
);

function bag(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
    .map((w) => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w));
  return new Set(words);
}

/** Overlap coefficient |A∩B| / min(|A|,|B|) — robust to one side being wordier. */
function overlap(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  return inter / Math.min(a.size, b.size);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isBug(value: unknown): value is { sev?: "P0" | "P1" | "P2"; what: string; where?: string } {
  return isRecord(value) && hasText(value.what) &&
    (value.where === undefined || typeof value.where === "string") &&
    (value.sev === undefined || value.sev === "P0" || value.sev === "P1" || value.sev === "P2");
}

function isReport(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value) || value.kind !== "playtest") return false;
  return (value.bugs === undefined || (Array.isArray(value.bugs) && value.bugs.every(isBug))) &&
    [value.confusions, value.suggestions].every((v) => v === undefined || (Array.isArray(v) && v.every(hasText)));
}

export function unitsFromReport(file: string, r: unknown): Unit[] {
  if (!isRecord(r)) return [];
  const meta = {
    report: file,
    seed: typeof r.seed === "number" && Number.isFinite(r.seed) ? r.seed : undefined,
    model: typeof r.model === "string" ? r.model : undefined,
    build: r.build,
    verified: r.verified === true,
  };
  const out: Unit[] = [];
  for (const b of Array.isArray(r.bugs) ? r.bugs : []) {
    if (!isBug(b)) continue;
    out.push({ kind: "bug", sev: b.sev ?? "P1", title: b.what.trim(), where: b.where, ...meta });
  }
  for (const c of Array.isArray(r.confusions) ? r.confusions : [])
    if (hasText(c)) out.push({ kind: "confusion", sev: "P2", title: c.trim(), ...meta });
  for (const s of Array.isArray(r.suggestions) ? r.suggestions : [])
    if (hasText(s)) out.push({ kind: "suggestion", sev: "P2", title: s.trim(), ...meta });
  return out;
}

export type Issue = {
  schema: 1;
  kind: "issue";
  id: string;
  priority: "P0" | "P1" | "P2";
  unit_kind: Unit["kind"];
  title: string;
  where?: string;
  corroboration: number; // distinct reports in the cluster
  verified_reports: number;
  evidence: { report: string; seed?: number; model?: string; quote: string }[];
  builds: unknown[];
  created: string;
};

function titleKey(title: string): string {
  // Preserve meaningful identity even when a title has no English word tokens.
  return [...bag(title)].sort().join("-") || title.trim().toLowerCase();
}

function issueId(kind: Unit["kind"], title: string): string {
  return createHash("sha256").update(`${kind}:${titleKey(title)}`).digest("hex").slice(0, 8);
}

export function clusterUnits(units: Unit[]): Issue[] {
  // deterministic union-find over same-kind units with word-overlap >= 0.5
  const parent = units.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i]!)));
  const bags = units.map((u) => bag(`${u.title} ${u.where ?? ""}`));
  const titles = units.map((u) => titleKey(u.title));
  for (let i = 0; i < units.length; i++)
    for (let j = i + 1; j < units.length; j++) {
      if (units[i]!.kind !== units[j]!.kind) continue;
      if (titles[i] === titles[j] || overlap(bags[i]!, bags[j]!) >= 0.5)
        parent[find(j)] = find(i);
    }
  const groups = new Map<number, Unit[]>();
  units.forEach((u, i) => {
    const r = find(i);
    if (!groups.has(r)) groups.set(r, []);
    groups.get(r)!.push(u);
  });

  const issues: Issue[] = [];
  for (const g of groups.values()) {
    g.sort((a, b) => b.title.length - a.title.length || a.title.localeCompare(b.title) ||
      a.report.localeCompare(b.report) || (a.where ?? "").localeCompare(b.where ?? ""));
    const reps = new Set(g.map((u) => u.report));
    const corr = reps.size;
    const worstSev = g.some((u) => u.sev === "P0") ? "P0" : g.some((u) => u.sev === "P1") ? "P1" : "P2";
    const priority: Issue["priority"] =
      worstSev !== "P2" ? worstSev : g[0]!.kind !== "bug" && corr >= 2 ? "P1" : "P2";
    const title = g[0]!.title;
    const id = issueId(g[0]!.kind, title);
    issues.push({
      schema: 1,
      kind: "issue",
      id,
      priority,
      unit_kind: g[0]!.kind,
      title,
      where: g.find((u) => u.where)?.where,
      corroboration: corr,
      verified_reports: new Set(g.filter((u) => u.verified).map((u) => u.report)).size,
      evidence: [...reps].slice(0, 3).map((report) => {
        const u = g.find((u) => u.report === report)!;
        return { report: u.report, seed: u.seed, model: u.model, quote: u.title };
      }),
      builds: [...new Set(g.map((u) => JSON.stringify(u.build ?? null)))].map((s) => JSON.parse(s)),
      created: new Date().toISOString(),
    });
  }
  // stable order: priority, then id
  return issues.sort((a, b) => a.priority.localeCompare(b.priority) || a.id.localeCompare(b.id));
}

export function triage(opts?: { reportsDir?: string; queueDir?: string; dedupeDirs?: string[] }): {
  consumed: number;
  filed: Issue[];
  skipped: number;
} {
  const reportsDir = opts?.reportsDir ?? join(ROOT, "reports");
  const queueDir = opts?.queueDir ?? join(ROOT, "queue");
  const dedupeDirs = opts?.dedupeDirs ?? [queueDir, join(queueDir, "failed"), join(ROOT, "done")];
  mkdirSync(join(reportsDir, "triaged"), { recursive: true });
  mkdirSync(queueDir, { recursive: true });

  const files = readdirSync(reportsDir, { withFileTypes: true })
    .filter((f) => f.isFile() && f.name.endsWith(".json")).map((f) => f.name).sort();
  const accepted: string[] = [];
  const units: Unit[] = [];
  for (const f of files) {
    // A reused filename must not overwrite previously archived evidence.
    if (existsSync(join(reportsDir, "triaged", f))) continue;
    try {
      const r: unknown = JSON.parse(readFileSync(join(reportsDir, f), "utf8"));
      if (!isReport(r)) continue;
      units.push(...unitsFromReport(f, r));
      accepted.push(f);
    } catch {
      /* unreadable or invalid report stays put */
    }
  }
  const existing = new Set<string>();
  for (const d of dedupeDirs) {
    if (!existsSync(d)) continue;
    for (const f of readdirSync(d)) {
      const m = /-issue-([0-9a-f]{8})\.json$/.exec(f);
      if (!m) continue;
      existing.add(m[1]!);
      try {
        // Older issue ids hashed only the title. Keep them deduplicated by
        // reading the kind, without suppressing another kind with that title.
        const issue: unknown = JSON.parse(readFileSync(join(d, f), "utf8"));
        if (isRecord(issue) && hasText(issue.title) &&
          (issue.unit_kind === "bug" || issue.unit_kind === "confusion" || issue.unit_kind === "suggestion"))
          existing.add(issueId(issue.unit_kind, issue.title));
      } catch {
        /* the filename still protects an existing issue with unreadable JSON */
      }
    }
  }
  const issues = clusterUnits(units);
  const filed: Issue[] = [];
  let skipped = 0;
  for (const issue of issues) {
    if (existing.has(issue.id)) { skipped++; continue; }
    writeFileSync(join(queueDir, `${issue.priority}-issue-${issue.id}.json`), JSON.stringify(issue, null, 2), { flag: "wx" });
    existing.add(issue.id);
    filed.push(issue);
  }
  for (const f of accepted) renameSync(join(reportsDir, f), join(reportsDir, "triaged", f));
  return { consumed: accepted.length, filed, skipped };
}

if (process.argv[1]?.endsWith("triage.ts")) {
  const r = triage();
  console.log(
    `triage: ${r.consumed} report(s) -> ${r.filed.length} new issue(s)${r.skipped ? `, ${r.skipped} already known` : ""}`,
  );
  for (const i of r.filed)
    console.log(`  ${i.priority} ${i.unit_kind} x${i.corroboration} (${i.verified_reports} verified): ${i.title.slice(0, 90)}`);
}
