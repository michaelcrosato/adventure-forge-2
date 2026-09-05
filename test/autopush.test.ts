import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { type TestContext } from "node:test";

function fixture(t: TestContext, install = true) {
  const dir = mkdtempSync(join(tmpdir(), "tinyforge-push-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const config = join(dir, "gitconfig");
  writeFileSync(config, "");
  const env = { ...process.env, GIT_CONFIG_GLOBAL: config, GIT_CONFIG_NOSYSTEM: "1" };
  const root = join(dir, "checkout with spaces");
  const remote = join(dir, "origin.git");
  mkdirSync(root);
  execFileSync("git", ["init", "--bare", "-q", remote], { env });
  const git = (...args: string[]) => execFileSync("git", args, { cwd: root, env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  git("init", "-q", "-b", "main");
  git("config", "user.name", "Push Test");
  git("config", "user.email", "push-test@example.invalid");
  git("config", "commit.gpgsign", "false");
  git("config", "tag.gpgsign", "false");
  git("config", "core.autocrlf", "false");
  git("remote", "add", "origin", remote);
  const copyHooks = (target: string) => {
    mkdirSync(join(target, ".githooks"), { recursive: true });
    mkdirSync(join(target, "loop"), { recursive: true });
    for (const path of [".githooks/post-commit", ".githooks/post-merge", ".githooks/post-applypatch", ".githooks/post-rewrite",
      ".gitattributes", "loop/push.mjs", "loop/install-hooks.mjs"])
      copyFileSync(new URL(`../${path}`, import.meta.url), join(target, path));
  };
  copyHooks(root);
  const node = (script: string, cwd = root) => spawnSync(process.execPath, [join(cwd, script)], {
    cwd, env, encoding: "utf8", timeout: 20_000,
  });
  const commit = (message: string) => {
    writeFileSync(join(root, "content.txt"), message);
    git("add", "-A");
    return spawnSync("git", ["commit", "-qm", message], { cwd: root, env, encoding: "utf8", timeout: 20_000 });
  };
  const remoteHead = (branch = "main") => execFileSync("git", ["--git-dir", remote, "rev-parse", `refs/heads/${branch}`], { env, encoding: "utf8" }).trim();
  if (install) {
    const result = node("loop/install-hooks.mjs");
    assert.equal(result.status, 0, result.stderr);
    const first = commit("initial");
    assert.equal(first.status, 0, first.stderr);
    assert.equal(remoteHead(), git("rev-parse", "HEAD"));
  }
  return { dir, root, remote, env, git, node, commit, remoteHead, copyHooks };
}

test("post-commit pushes every commit and publishes new branches with explicit refspecs", (t) => {
  const f = fixture(t);
  assert.equal(f.git("rev-parse", "--abbrev-ref", "@{upstream}"), "origin/main");
  assert.equal(f.node("loop/install-hooks.mjs").status, 0, "installation is repeatable");
  f.git("tag", "-a", "main", "-m", "tag sharing branch name");
  const second = f.commit("second");
  assert.equal(second.status, 0, second.stderr);
  assert.match(second.stderr, /auto-push: publishing main/);
  assert.equal(f.remoteHead(), f.git("rev-parse", "HEAD"));
  const main = f.remoteHead();
  f.git("checkout", "-qb", "topic/autopush");
  f.git("config", "push.default", "nothing");
  f.git("config", "remote.origin.push", "HEAD:refs/heads/unrelated");
  f.git("config", "push.followTags", "true");
  f.git("tag", "-a", "local-only", "-m", "local tag");
  assert.equal(f.commit("topic").status, 0);
  assert.equal(f.remoteHead("topic/autopush"), f.git("rev-parse", "HEAD"));
  assert.equal(f.git("rev-parse", "--abbrev-ref", "@{upstream}"), "origin/topic/autopush");
  assert.equal(f.remoteHead(), main);
  assert.equal(f.git("ls-remote", "origin", "refs/heads/unrelated", "refs/tags/local-only"), "");
  f.git("checkout", "-q", "main");
  f.git("merge", "--no-ff", "-m", "merge topic", "topic/autopush");
  assert.equal(f.remoteHead(), f.git("rev-parse", "HEAD"), "merge commits are published too");
});

test("push rejection is visible and preserves both the local commit and remote history", (t) => {
  const f = fixture(t);
  const other = join(f.dir, "other");
  execFileSync("git", ["clone", "-q", "-b", "main", f.remote, other], { env: f.env });
  const otherGit = (...args: string[]) => execFileSync("git", args, { cwd: other, env: f.env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  otherGit("config", "user.name", "Other Test");
  otherGit("config", "user.email", "other-test@example.invalid");
  otherGit("config", "commit.gpgsign", "false");
  otherGit("commit", "--allow-empty", "-qm", "remote change");
  otherGit("push", "origin", "main");
  const remote = f.remoteHead();
  const result = f.commit("local change");
  assert.equal(result.status, 0, "post-commit failure cannot undo git commit");
  assert.match(result.stderr, /AUTO-PUSH FAILED/);
  assert.match(result.stderr, /local commit is preserved/);
  assert.equal(f.git("log", "-1", "--format=%s"), "local change");
  assert.notEqual(f.git("rev-parse", "HEAD"), remote);
  const retry = f.node("loop/push.mjs");
  assert.equal(retry.status, 1);
  assert.match(retry.stderr, /npm run push/);
  assert.equal(f.remoteHead(), remote);
});

test("missing origin and detached HEAD fail visibly without publishing to another branch", (t) => {
  const f = fixture(t);
  const remote = f.remoteHead();
  f.git("remote", "remove", "origin");
  assert.equal(f.node("loop/push.mjs").status, 1);
  f.git("remote", "add", "origin", f.remote);
  f.git("checkout", "--detach", "-q");
  const result = f.commit("detached change");
  assert.equal(result.status, 0);
  assert.match(result.stderr, /detached HEAD/);
  assert.equal(f.node("loop/push.mjs").status, 1);
  assert.equal(f.remoteHead(), remote);
});

test("hook installation preserves existing hook configurations and default hooks", (t) => {
  const f = fixture(t, false);
  f.git("config", "core.hooksPath", "custom-hooks");
  const custom = f.node("loop/install-hooks.mjs");
  assert.equal(custom.status, 1);
  assert.match(custom.stderr, /Existing core.hooksPath/);
  assert.equal(f.git("config", "--get", "core.hooksPath"), "custom-hooks");
  f.git("config", "--unset", "core.hooksPath");
  const oldHook = join(f.root, ".git", "hooks", "pre-commit");
  writeFileSync(oldHook, "#!/bin/sh\nexit 0\n");
  const defaults = f.node("loop/install-hooks.mjs");
  assert.equal(defaults.status, 1);
  assert.match(defaults.stderr, /Existing Git hooks were preserved/);
  assert.equal(readFileSync(oldHook, "utf8"), "#!/bin/sh\nexit 0\n");
  assert.equal(spawnSync("git", ["config", "--get", "core.hooksPath"], { cwd: f.root, env: f.env }).status, 1);
});

test("installing a nested source archive never configures its parent repository", (t) => {
  const f = fixture(t, false);
  const archive = join(f.root, "archive");
  f.copyHooks(archive);
  const result = f.node("loop/install-hooks.mjs", archive);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /source archive/);
  assert.equal(spawnSync("git", ["config", "--get", "core.hooksPath"], { cwd: f.root, env: f.env }).status, 1);
});
