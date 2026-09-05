#!/usr/bin/env node
// Node 20 on Windows does not expand test globs. Enumerate files without a shell.
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const files = readdirSync(new URL("../test/", import.meta.url), { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".test.ts"))
  .map((entry) => `test/${entry.name}`).sort();
if (!files.length) throw new Error("No test files found");
const result = spawnSync(process.execPath, [
  "--import", "tsx", "--test", "--test-reporter=tap", ...process.argv.slice(2), ...files,
], { cwd: root, stdio: "inherit" });
if (result.error) console.error(result.error.message);
process.exitCode = result.status ?? 1;
