#!/bin/bash
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Install / select Node.js 24 (package.json requires "node": ">=24.15.0")
export NVM_DIR=/opt/nvm
# nvm.sh は default alias が未解決の状態で読み込むと内部の nvm_auto が
# return 3 で抜けるため、`set -e` の元では即死する。失敗を許容して読み込む。
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh" || true

if ! nvm version 24 >/dev/null 2>&1; then
  nvm install 24 --no-progress
fi
nvm use 24 >/dev/null

NODE_BIN_DIR="$(dirname "$(nvm which 24)")"
export PATH="$NODE_BIN_DIR:$PATH"

# Persist Node 24 path for the rest of the session
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo "export PATH=\"$NODE_BIN_DIR:\$PATH\"" >> "$CLAUDE_ENV_FILE"
fi

# Enable corepack to use pnpm via packageManager field
corepack enable

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
