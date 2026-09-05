import assert from "node:assert/strict";
import test from "node:test";
import type { TestContext } from "node:test";
import { apiProvider } from "../src/player.ts";

function provider(t: TestContext) {
  const previous = process.env.ANTHROPIC_API_KEY;
  process.env.ANTHROPIC_API_KEY = "local-test-placeholder";
  t.after(() => {
    if (previous === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = previous;
  });
  return apiProvider("local-test-model");
}

function skipBackoff(t: TestContext): number[] {
  const delays: number[] = [];
  t.mock.method(globalThis, "setTimeout", ((callback: () => void, delay?: number) => {
    delays.push(delay ?? 0);
    queueMicrotask(callback);
    return {} as NodeJS.Timeout;
  }) as typeof setTimeout);
  return delays;
}

const success = () => Response.json({
  content: [{ type: "text", text: "2" }],
  usage: { input_tokens: 7, output_tokens: 1, cache_read_input_tokens: 4 },
});

test("provider cancels failed response bodies before retrying and retains successful usage", async (t) => {
  const ask = provider(t);
  const delays = skipBackoff(t);
  const cancelled: number[] = [];
  let requests = 0;
  t.mock.method(globalThis, "fetch", async (_url: Parameters<typeof fetch>[0], options?: RequestInit) => {
    assert.ok(options?.signal, "requests must have a deadline");
    const attempt = requests++;
    assert.equal(cancelled.length, attempt, "previous failed body was canceled before another request");
    return attempt < 2
      ? new Response(new ReadableStream({ cancel: () => { cancelled.push(attempt); } }), { status: attempt ? 503 : 429 })
      : success();
  });
  assert.deepEqual(await ask("system", [{ role: "user", content: "menu" }], 60), {
    text: "2", usage: { in: 7, out: 1, cacheRead: 4, cacheWrite: 0 },
  });
  assert.equal(requests, 3);
  assert.deepEqual(cancelled, [0, 1]);
  assert.deepEqual(delays, [1500, 3000]);
});

test("provider stops after five retryable responses and releases the last body", async (t) => {
  const ask = provider(t);
  skipBackoff(t);
  let requests = 0;
  let cancelled = 0;
  t.mock.method(globalThis, "fetch", async () => {
    requests++;
    return new Response(new ReadableStream({ cancel: () => { cancelled++; } }), { status: 503 });
  });
  await assert.rejects(ask("system", [], 60), /API 503 after retries/);
  assert.equal(requests, 5);
  assert.equal(cancelled, 5);
});

test("provider rejects permanent HTTP errors without retrying", async (t) => {
  const ask = provider(t);
  let requests = 0;
  t.mock.method(globalThis, "fetch", async () => {
    requests++;
    return new Response("Invalid request", { status: 400 });
  });
  await assert.rejects(ask("system", [], 60), /API 400: Invalid request/);
  assert.equal(requests, 1);
});

test("provider deadline aborts a stalled fetch and a stalled response body", async (t) => {
  const ask = provider(t);
  const nativeTimeout = AbortSignal.timeout;
  const deadlines: number[] = [];
  // Exercise the native abort deadline immediately while checking the production
  // duration. The keepalive prevents its unref'ed timer from ending the test early.
  const keepalive = setInterval(() => {}, 100);
  t.after(() => clearInterval(keepalive));
  t.mock.method(AbortSignal, "timeout", (milliseconds: number) => {
    deadlines.push(milliseconds);
    return nativeTimeout(1);
  });
  let stallBody = false;
  t.mock.method(globalThis, "fetch", async (_url: Parameters<typeof fetch>[0], options?: RequestInit) => {
    const signal = options?.signal;
    assert.ok(signal);
    if (!stallBody) return await new Promise<Response>((_resolve, reject) => {
      signal.addEventListener("abort", () => reject(signal.reason), { once: true });
    });
    return new Response(new ReadableStream({ start(controller) {
      signal.addEventListener("abort", () => controller.error(signal.reason), { once: true });
    } }));
  });
  await assert.rejects(ask("system", [], 60), { name: "TimeoutError" });
  stallBody = true;
  await assert.rejects(ask("system", [], 60), { name: "TimeoutError" });
  assert.deepEqual(deadlines, [30_000, 30_000]);
});
