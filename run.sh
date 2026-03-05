#!/bin/bash

# Simple launcher for the OpenClaw gateway and JS agents.
# This does not affect the existing Python MCP-based agents.

set -euo pipefail

export FLOCK_API_KEY="${FLOCK_API_KEY:-your-flock-key}"
export REDIS_URL="${REDIS_URL:-redis://localhost:6379}"
export TWILIO_ACCOUNT_SID="${TWILIO_ACCOUNT_SID:-your-twilio-sid}"
export TWILIO_AUTH_TOKEN="${TWILIO_AUTH_TOKEN:-your-twilio-token}"
export TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-your-telegram-token}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "Starting OpenClaw gateway..."
openclaw gateway start --config ./config/openclaw.json &
GATEWAY_PID=$!

sleep 5

echo "Starting Scout agent..."
node agents/scout/index.js &
SCOUT_PID=$!

echo "Starting Coordinator agent..."
node agents/coordinator/index.js &
COORD_PID=$!

echo "Starting Logistics agent..."
node agents/logistics/index.js &
LOG_PID=$!

echo "Gateway PID:    $GATEWAY_PID"
echo "Scout PID:      $SCOUT_PID"
echo "Coordinator PID:$COORD_PID"
echo "Logistics PID:  $LOG_PID"

echo "All OpenClaw components started. Press Ctrl+C to stop."
wait

