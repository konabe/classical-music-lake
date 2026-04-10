---
name: start-04-accept
description: ワークの検収・SPEC.md/ARCHITECTURE.md更新を行う開発フローのStep 4（最終）。実装のPRがマージされた後にドキュメントを更新するときに使う。
disable-model-invocation: true
argument-hint: "[work name or path]"
---

# 検収について

## 1. 事前準備

- 受け入れしたいワークを確認する。

## 2. ドキュメンテーション

- `spec-updater` エージェントを使って `docs/SPEC.md` を更新する
- `Explore` エージェントを使って、以下のドキュメントの現状と実装内容の差分を調査し反映する
  - `docs/ARCHITECTURE.md` アーキテクチャ設計書
  - `docs/OPERATIONS.md` 運用ドキュメント

`/docs/features/{index}-{feature-title}/checklist.md` に現状を記録する。
