#!/usr/bin/env bash
# tinyforge playtest loop — waves of blind Claude players -> reports -> issues.
#
#   loop/playtest.sh              one wave of 1 player
#   loop/playtest.sh 5            one wave of 5 players
#   loop/playtest.sh 3 --mock     zero-token wiring check (structural mock player)
#
# Env: TF_PLAYER_MODEL (claude model id; default = CLI default)
#      TF_SEED_BASE (default: epoch seconds)   TF_MAX_TURNS (agent turns, default 100)
#      TF_MAX_GAME_TURNS (in-game turn budget told to the player, default 80)
#      TF_PARALLEL (players in flight, default 2)
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

COUNT=1
MOCK=0
COUNT_SET=0
for a in "$@"; do
  if [[ "$a" == "--mock" ]]; then MOCK=1
  elif [[ "$a" =~ ^[1-9][0-9]{0,8}$ && "$COUNT_SET" == 0 ]]; then COUNT="$a"; COUNT_SET=1
  else echo "usage: loop/playtest.sh [positive player count] [--mock]"; exit 1
  fi
done
SEED_BASE="${TF_SEED_BASE:-$(date +%s)}"
[[ "$SEED_BASE" =~ ^(0|[1-9][0-9]{0,15})$ ]] && (( SEED_BASE <= 9007199254740991 )) || {
  echo "TF_SEED_BASE must be a nonnegative safe integer"; exit 1;
}
SEED_BASE=$((SEED_BASE % 100000))
MAX_TURNS="${TF_MAX_TURNS:-100}"
MAX_GAME_TURNS="${TF_MAX_GAME_TURNS:-80}"
PARALLEL="${TF_PARALLEL:-2}"
for name in MAX_TURNS MAX_GAME_TURNS PARALLEL; do
  [[ "${!name}" =~ ^[1-9][0-9]{0,8}$ ]] || { echo "TF_$name must be a positive integer (at most 9 digits)"; exit 1; }
done
mkdir -p runs/playtest queue
WAVE_DIR="$(mktemp -d "runs/playtest/$(date +%Y%m%dT%H%M%S)-XXXXXX")"

if [[ "$MOCK" == "1" ]]; then
  echo "wave (mock): $COUNT structural player(s) — no tokens, nothing filed to queue/"
  for ((i = 0; i < COUNT; i++)); do
    node loop/mock-player.mjs --seed $((SEED_BASE + i)) || { echo "mock player $i FAILED"; exit 1; }
  done
  echo "wiring green."
  exit 0
fi

command -v claude >/dev/null || { echo "claude CLI not found — install Claude Code or run with --mock"; exit 1; }

# MCP config with absolute paths so the player can run from anywhere.
CFG="$WAVE_DIR/mcp.json"
node -e 'console.log(JSON.stringify({ mcpServers: { tinyforge: { command: "npx", args: ["--no-install", "tsx", require("node:path").resolve("src/mcp.ts")] } } }))' > "$CFG"

run_player() {
  local i="$1" seed=$((SEED_BASE + i))
  local out="$WAVE_DIR/player-$i-seed-$seed.json"
  local prompt
  prompt="$(sed -e "s/{{SEED}}/$seed/" -e "s/{{MAX_GAME_TURNS}}/$MAX_GAME_TURNS/" loop/player-prompt.md)"
  echo "  player $i (seed $seed) playing..."
  claude -p "$prompt" \
    --mcp-config "$CFG" --strict-mcp-config \
    --allowedTools "mcp__tinyforge__new_game,mcp__tinyforge__act,mcp__tinyforge__look" \
    --output-format json --max-turns "$MAX_TURNS" \
    ${TF_PLAYER_MODEL:+--model "$TF_PLAYER_MODEL"} \
    > "$out" 2> "$WAVE_DIR/player-$i.err" < /dev/null || { echo "  player $i: claude exited nonzero"; return 1; }
  node loop/report-check.mjs "$out" --seed "$seed" || { echo "  player $i: report rejected"; return 1; }
}

echo "wave: $COUNT player(s), seeds $SEED_BASE+, parallel $PARALLEL"
pids=()
FAILED=0
for ((i = 0; i < COUNT; i++)); do
  run_player "$i" &
  pids+=("$!")
  if (( ${#pids[@]} >= PARALLEL )); then
    wait "${pids[0]}" || FAILED=$((FAILED + 1))
    pids=("${pids[@]:1}")
  fi
done
for pid in "${pids[@]}"; do wait "$pid" || FAILED=$((FAILED + 1)); done

echo "── wave summary ──"
npx --no-install tsx src/triage.ts || { echo "triage failed; raw reports remain in reports/"; exit 1; }
echo "queue now: $(ls queue/*.json 2>/dev/null | wc -l | tr -d ' ') item(s). Next: npm run devloop"
if (( FAILED )); then echo "$FAILED player(s) failed or had rejected reports"; exit 1; fi
