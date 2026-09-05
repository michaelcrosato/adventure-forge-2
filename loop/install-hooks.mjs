#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync, existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const git = (args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();

try {
  // Archives can live inside another repository; never configure that parent.
  if (!existsSync(join(root, ".git"))) {
    console.log("hooks: source archive without .git; nothing to install");
  } else {
    const config = spawnSync("git", ["config", "--get", "core.hooksPath"], { cwd: root, encoding: "utf8" });
    if (config.error || (config.status !== 0 && config.status !== 1))
      throw new Error(config.error?.message ?? config.stderr.trim() ?? "Cannot read Git hook configuration");
    const existing = config.stdout.trim();
    if (config.status === 0 && resolve(root, existing) !== resolve(root, ".githooks"))
      throw new Error(`Existing core.hooksPath (${existing || "empty"}) was preserved. Integrate its hooks with .githooks before installing.`);
    if (!existing) {
      const defaultHooks = resolve(root, git(["rev-parse", "--git-path", "hooks"]));
      const active = existsSync(defaultHooks) ? readdirSync(defaultHooks).filter((name) => !name.endsWith(".sample")) : [];
      if (active.length) throw new Error(`Existing Git hooks were preserved: ${active.join(", ")}. Integrate them with .githooks before installing.`);
    }
    for (const hook of ["post-commit", "post-merge", "post-applypatch", "post-rewrite"])
      chmodSync(join(root, ".githooks", hook), 0o755);
    git(["config", "--local", "core.hooksPath", ".githooks"]);
    console.log("hooks: installed automatic push after every commit");
  }
} catch (error) {
  console.error(`Hook installation failed: ${error.message}`);
  process.exitCode = 1;
}
