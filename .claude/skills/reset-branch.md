---
name: reset-branch
description: mainブランチに切り替えて最新状態にpullする。新しい作業を始める前の準備として使う。
disable-model-invocation: true
allowed-tools: Bash(git checkout *) Bash(git pull *)
---

1. mainブランチにswitchして、pullする。
2. `tmp/` ディレクトリの中身を空にする（ディレクトリ自体は残す）。
