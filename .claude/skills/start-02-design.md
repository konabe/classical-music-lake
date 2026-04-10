---
name: start-02-design
description: ワークの設計・design.md作成・レビュー反映を行う開発フローのStep 2。要件定義完了後に設計フェーズを開始するときに使う。
disable-model-invocation: true
argument-hint: "[work name or path]"
---

# 設計について

## 1. 事前準備

- 設計したいワークを尋ねる。

## 2. 設計

- `Explore` エージェントを使って、設計対象に関連する既存コードのパターン・構造を調査する
- `Plan` エージェントを使って、設計方針とトレードオフを検討する
- 上記の調査・検討結果をもとに、`work.md` と同じディレクトリに `design.md` を作成する。
- `design.md`にレビュー結果の記載を求める。

## 3. レビュー結果の反映

- `design.md`に記載されたレビュー結果をもとに修正する。
- `/docs/features/{index}-{feature-title}/checklist.md` に現状を記録する。

## 4. mainブランチへPRを発行

- mainブランチに対して PRを発行する

## `design.md`の扱い

- 設計内容を記載する
- 最後にレビュー結果を記載する欄を作成する。
- 具体的なコードの記載はレビュー負荷が高いため禁止する。
