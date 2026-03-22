#!/bin/bash
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Install root dependencies (includes husky)
npm_config_engine_strict=false npm install --prefix "$CLAUDE_PROJECT_DIR"

# Install backend dependencies
npm_config_engine_strict=false npm install --prefix "$CLAUDE_PROJECT_DIR/backend"

# Activate husky hooks
npm_config_engine_strict=false npm run prepare --prefix "$CLAUDE_PROJECT_DIR"
