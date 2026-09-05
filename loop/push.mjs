#!/usr/bin/env node
import { spawnSync } from "node:child_process";

try {
  const head = spawnSync("git", ["symbolic-ref", "--quiet", "HEAD"], {
    encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
  });
  if (head.error || head.status !== 0) throw new Error("Cannot push detached HEAD; switch to a branch in this checkout first");
  const branchRef = head.stdout.trim();
  if (!branchRef.startsWith("refs/heads/")) throw new Error("HEAD does not name a local branch");
  const branch = branchRef.slice("refs/heads/".length);
  console.error(`auto-push: publishing ${branch} to origin...`);
  // An explicit refspec cannot be redirected by push.default or remote.push.
  // Never force: rejected pushes preserve both the remote and the local commit.
  const result = spawnSync("git", [
    "-c", "push.followTags=false", "push", "--set-upstream", "origin", `HEAD:${branchRef}`,
  ], { stdio: "inherit", timeout: 120_000, env: { ...process.env, GIT_TERMINAL_PROMPT: "0" } });
  if (result.error || result.status !== 0)
    throw new Error(result.error?.message ?? `git push exited ${result.status ?? result.signal}`);
} catch (error) {
  console.error(`AUTO-PUSH FAILED: ${error.message}`);
  console.error("The local commit is preserved. Check your branch, origin, credentials, and remote history, then retry: npm run push");
  process.exitCode = 1;
}
