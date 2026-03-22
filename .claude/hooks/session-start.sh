#!/bin/bash
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Install root dependencies (includes husky)
(
  cd "$CLAUDE_PROJECT_DIR"
  npm_config_engine_strict=false npm install
)

# Install backend dependencies
(
  cd "$CLAUDE_PROJECT_DIR/backend"
  npm_config_engine_strict=false npm install
)

# Activate husky hooks
(
  cd "$CLAUDE_PROJECT_DIR"
  npm run prepare
)
