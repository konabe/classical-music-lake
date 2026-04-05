#!/bin/bash
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Install root dependencies (includes husky)
(
  cd "$CLAUDE_PROJECT_DIR"
  pnpm install
)

# Install backend dependencies
(
  cd "$CLAUDE_PROJECT_DIR/backend"
  pnpm install
)

# Activate husky hooks
(
  cd "$CLAUDE_PROJECT_DIR"
  pnpm run prepare
)
