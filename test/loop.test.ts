import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { type TestContext } from "node:test";

const gitBash = join(process.env.ProgramFiles ?? "C:/Program Files", "Git", "bin", "bash.exe");
const bash = process.platform === "win32" && existsSync(gitBash) ? gitBash : "bash";
const bashAvailable = spawnSync(bash, ["--version"], { encoding: "utf8" }).status === 0;

function fixture(t: TestContext) {
  const root = mkdtempSync(join(tmpdir(), "tinyforge-loop-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const dir of ["bin", "loop", "queue", "reports", "src", "test"])
    mkdirSync(join(root, dir));
  for (const script of ["dev.sh", "playtest.sh"])
    copyFileSync(new URL(`../loop/${script}`, import.meta.url), join(root, "loop", script));
  const put = (file: string, content: string) => writeFileSync(join(root, file), content, { mode: 0o755 });
  put(".gitignore", "runs/\n");
  put("AGENT.md", "fixture charter\n");
  put("loop/dev-prompt.md", "{{FINDING}}\n");
  put("loop/player-prompt.md", "Seed {{SEED}}, turns {{MAX_GAME_TURNS}}\n");
  put("loop/report-check.mjs", "process.exit(Number(process.env.STUB_REPORT_EXIT ?? 0));\n");
  put("src/example.ts", "export const value = 1;\n");
  put("test/example.test.ts", "fixture test\n");
  put("reports/.gitkeep", "");
  put("queue/P1-issue-12345678.json", JSON.stringify({ kind: "issue", title: "fixture issue" }));
  put("bin/npm", "#!/usr/bin/env bash\nprintf '# pass 1\\n'\n");
  put("bin/npx", "#!/usr/bin/env bash\nexit \"${STUB_TRIAGE_EXIT:-0}\"\n");
  put("bin/claude", "#!/usr/bin/env bash\nprintf 'called\\n' >> runs/claude-called\nexit \"${STUB_CLAUDE_EXIT:-0}\"\n");
  const git = (...args: string[]) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
  git("init", "-q");
  git("config", "user.name", "Loop Test");
  git("config", "user.email", "loop-test@example.invalid");
  git("config", "core.autocrlf", "false");
  git("config", "commit.gpgsign", "false");
  git("add", "-A");
  git("commit", "-qm", "fixture");
  const run = (script: string, args: string[] = [], env: NodeJS.ProcessEnv = {}) => spawnSync(
    bash,
    ["-c", 'export PATH="$PWD/bin:$PATH"; exec bash "$@"', "loop-test", `loop/${script}`, ...args],
    { cwd: root, encoding: "utf8", timeout: 20_000, env: { ...process.env, ...env } },
  );
  return { root, put, git, run };
}

test("dev driver leaves unrelated untracked files and git history untouched", { skip: !bashAvailable }, (t) => {
  const f = fixture(t);
  const before = f.git("rev-parse", "HEAD");
  f.put("private-notes.txt", "user work\n");
  const result = f.run("dev.sh");
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stdout, /untracked files/);
  assert.equal(f.git("rev-parse", "HEAD"), before);
  assert.equal(readFileSync(join(f.root, "private-notes.txt"), "utf8"), "user work\n");
  assert.equal(existsSync(join(f.root, "runs", "claude-called")), false);
});

test("failed dev cycle restores staged edits and rejects new protected files", { skip: !bashAvailable }, (t) => {
  const f = fixture(t);
  f.put("bin/npx", "#!/usr/bin/env bash\nmkdir -p reports/triaged\nmv reports/fresh.json reports/triaged/fresh.json\n");
  f.put("bin/claude", `#!/usr/bin/env bash
printf 'bad staged code\\n' > src/example.ts
git add src/example.ts
printf 'forbidden addition\\n' > loop/injected.sh
printf 'cycle evidence\\n'
`);
  f.git("add", "bin/claude", "bin/npx");
  f.git("commit", "-qm", "test agent");
  f.put("reports/fresh.json", "raw report evidence\n");
  const result = f.run("dev.sh");
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stdout, /edited protected paths:.*injected/);
  assert.equal(readFileSync(join(f.root, "src", "example.ts"), "utf8"), "export const value = 1;\n");
  assert.equal(existsSync(join(f.root, "loop", "injected.sh")), false);
  assert.ok(existsSync(join(f.root, "queue", "failed", "P1-issue-12345678.json")));
  assert.equal(f.git("status", "--porcelain"), "");
  assert.equal(f.git("show", "HEAD:reports/triaged/fresh.json"), "raw report evidence");
  const runDir = readdirSync(join(f.root, "runs")).find((name) => name.startsWith("dev-"));
  assert.ok(runDir);
  assert.match(readFileSync(join(f.root, "runs", runDir, "cycle-1.json"), "utf8"), /cycle evidence/);
});

test("new source files satisfy the dev driver's meaningful-change gate", { skip: !bashAvailable }, (t) => {
  const f = fixture(t);
  f.put("bin/claude", "#!/usr/bin/env bash\nprintf 'export const added = true;\\n' > src/added.ts\n");
  f.git("add", "bin/claude");
  f.git("commit", "-qm", "test agent");
  const result = f.run("dev.sh");
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /cycle 1 landed/);
  assert.ok(existsSync(join(f.root, "done", "P1-issue-12345678.json")));
  assert.match(f.git("show", "HEAD:src/added.ts"), /added = true/);
});

test("triage failures stop the dev driver before a paid agent starts", { skip: !bashAvailable }, (t) => {
  const f = fixture(t);
  const before = f.git("rev-parse", "HEAD");
  const result = f.run("dev.sh", [], { STUB_TRIAGE_EXIT: "1" });
  assert.equal(result.status, 1);
  assert.equal(f.git("rev-parse", "HEAD"), before);
  assert.equal(existsSync(join(f.root, "runs", "claude-called")), false);
});

test("playtest rejects invalid parallelism and turn budgets before starting players", { skip: !bashAvailable }, (t) => {
  const f = fixture(t);
  for (const env of [{ TF_PARALLEL: "0" }, { TF_PARALLEL: "bad" }, { TF_MAX_GAME_TURNS: "-1" }]) {
    const result = f.run("playtest.sh", [], env);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stdout, /must be a positive integer/);
  }
  assert.equal(existsSync(join(f.root, "runs", "claude-called")), false);
});

test("playtest propagates player, report and triage failures and keeps separate wave evidence", { skip: !bashAvailable }, (t) => {
  const f = fixture(t);
  // Pin the timestamp so every wave exercises the same-second collision case.
  f.put("bin/date", "#!/usr/bin/env bash\nif [[ \"$1\" == '+%s' ]]; then echo 1000; else echo 20260904T120000; fi\n");
  for (const env of [{ STUB_CLAUDE_EXIT: "1" }, { STUB_REPORT_EXIT: "1" }, { STUB_TRIAGE_EXIT: "1" }]) {
    const result = f.run("playtest.sh", ["3"], { TF_PARALLEL: "2", ...env });
    assert.equal(result.status, 1, result.stderr);
    assert.equal(result.error, undefined);
  }
  const waveDirs = readdirSync(join(f.root, "runs", "playtest"));
  assert.equal(waveDirs.length, 3);
  for (const dir of waveDirs) {
    const wave = join(f.root, "runs", "playtest", dir);
    assert.equal(readdirSync(wave).filter((name) => /^player-.*\.json$/.test(name)).length, 3);
    const config = JSON.parse(readFileSync(join(wave, "mcp.json"), "utf8"));
    assert.equal(config.mcpServers.tinyforge.args.at(-1), join(f.root, "src", "mcp.ts"));
  }
});
