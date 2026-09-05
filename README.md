# tinyforge

A deterministic text RPG with a small TypeScript engine, a three-tool MCP server,
and two automated playtest lanes. Content lives in `world/lighthouse.json`; each
world carries a walkthrough that must reach a full-score win.

## Run locally

Requires Node 20+ and npm. Use the committed lockfile:

```bash
npm ci
npm run verify                     # typecheck, tests, validator, smoke crawler
npm run play -- 7                   # terminal game with a reproducible seed
npm run mcp                        # stdio MCP server
npm run mock                       # zero-token MCP wiring check
npm run measure                    # full-score walkthrough over real MCP
npm run fleet -- --mock --count 2   # full walkthroughs through the API driver, no API calls
```

There is no web server. The terminal accepts a menu number, an action label,
`look`, or `q`. MCP exposes `new_game`, `act`, and `look`; every action returns
its events, scene, inventory, and next numbered menu in one text block. `look`
costs no game turn. `.mcp.json` configures this server for Claude Code.

`npm run measure` prints current turn and response-size measurements and fails
unless the walkthrough wins with maximum score. Its default turn limit follows
the authored walkthrough, including bounded repeats. `--max-steps` can override
that limit. The random `mock` command is a wiring check and may lose normally.

## Verification

`npm run verify` checks:

- TypeScript types and all Node tests, including real MCP transport and isolated
  shell-driver regression tests when Bash is installed.
- World shapes, exact condition/effect tuples, references, identifiers, and a
  seed-1 full-score winning walkthrough with a maximum menu of 12 actions.
- Deterministic random walks for crashes, state mutation, replay consistency,
  legal-menu availability, health/score bounds, and turn progression.
- Observation limits along the walkthrough: average action response <=450
  characters, maximum <=1100, introduction <=1400.

Content assertions reuse an isolated copy of one recorded walkthrough. The
reducer determinism test still executes two independent runs and compares every
state hash. No tests or observation limits are removed to speed up verification.
The GitHub workflow runs verification and the real MCP measurement on Linux and
Windows with Node 20 and 22.

For a deeper mechanical crawl or a recorded trace:

```bash
npm exec -- tsx src/crawl.ts --deep
npm exec -- tsx src/crawl.ts --replay runs/<session>.json
```

A smoke crawl samples the graph; it does not prove every route is safe or that
every seed wins. The authored walkthrough supplies the separate winning witness.
Runtime entrypoints validate a world before starting a session. Trace replay
rejects a wrong world or an illegal action instead of silently ignoring it.

## Playtest and development loops

```text
blind players -> reports/*.json -> triage -> queue/*-issue-*.json
                                               |
                                      dev agent -> verify -> commit
```

The MCP lane uses Claude Code; the direct API lane sends only rendered game text
to Anthropic's Messages API. Both validate report fields and verify quoted
receipts by replay. Host fields such as build identity, seed, and verification
status cannot be overwritten by model output.

```bash
npm run playtest -- 3
npm run fleet -- --count 10 --parallel 5 --max-game-turns 80
npm run devloop -- 5
```

The shell loops require Bash and the Claude Code CLI. On Windows, use Git Bash.
The direct API lane requires `ANTHROPIC_API_KEY`; `--mock` needs no credentials.
API requests have a 30-second timeout, including response-body reads. Rate-limit
and server errors receive at most five HTTP attempts with exponential backoff.
The `api_calls` field counts completed provider exchanges, excluding those
internal HTTP retries; usage totals reflect successful API responses.
Live runs retain an 80-turn default budget and stop after 12 turns without a new
room or score gain. Increase the budget for longer exploration. Scripted mock
runs use the walkthrough bound and do not use the live stall cutoff.

The dev loop requires a clean worktree. Untracked raw reports are accepted as
inputs; other untracked files must be committed, stashed, or ignored. Each cycle
consumes one issue, protects `loop/` and `AGENT.md` from the content agent, forbids
deleted tests or reduced test counts, and requires verification before committing.
Failed cycles restore the baseline and quarantine the issue; three consecutive
failures stop the loop. Infrastructure maintenance outside that loop should keep
these integrity checks intact.

Triage preserves malformed/unreadable reports for inspection and archives only
accepted reports without overwriting existing evidence. It clusters findings by
word overlap and counts distinct reports. P0/P1 bugs promote alone; P2 bugs keep
their severity. Subjective findings start at P2 and rise to P1 with corroboration.
Existing issue identities in `queue/`, `queue/failed/`, and `done/` prevent exact
refiling, including legacy issue files. Similarity clustering applies within a
wave; it is not a semantic guarantee across separate waves.

## Configuration and files

| Setting | Purpose |
| --- | --- |
| `TF_WORLD` | Custom world JSON for runtime adapters, mock/checker, and replay |
| `TF_RUNS` | MCP trace directory; default `runs/` |
| `TF_REPORTS` | API/MCP report output directory; default `reports/` |
| `TF_PLAYER_MODEL` | Live player model override |
| `TF_PARALLEL`, `TF_SEED_BASE` | Shell playtest concurrency and initial seed |
| `TF_MAX_TURNS`, `TF_MAX_GAME_TURNS` | Shell agent and game turn budgets |
| `TF_DEV_MODEL`, `TF_DEV_MAX_TURNS`, `TF_DEV_FLAGS` | Development-agent configuration |

```text
src/engine.ts       pure reducer, seeded PRNG, legal actions, hashes and receipts
src/types.ts        world, condition/effect DSL, action and state contracts
src/format.ts       compact observations and menus
src/validate.ts     runtime schemas, references and walkthrough proof
src/crawl.ts        mechanical crawler and strict trace replay
src/mcp.ts          three-tool stdio adapter; records traces
src/play.ts         human terminal adapter
src/player.ts       API and mock fleet drivers; validated reports
src/triage.ts       raw reports to deduplicated issues
world/             authored content and winning walkthroughs
test/              engine, content, budgets, adapters and automation regressions
loop/              MCP mock, report checker and Bash playtest/dev drivers
runs/              ignored local traces and driver logs
reports/           raw and archived session evidence
queue/ done/       active findings and resolved-finding archive
AGENT.md           charter for the automated content dev agent
```

Build-stamped reports and archived launch-era examples describe the world at the
time of their capture. Their old scores, turn counts, costs, and code-size claims
are not benchmarks for the current expanded world. Run `measure` for current
transport measurements and `verify` for the current integrity checks.
