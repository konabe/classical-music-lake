# 要件定義について

## 1. Gitの準備

- mainブランチの先頭にスイッチ
  - `git checkout main`
  - `git pull`

## 2. 何を開発するのかを収集

- 人間にどんな要件の内容を開発するかを尋ねる。
  - この際に不明点があれば最大３回繰り返し深堀すること
- 開発の内容からタイトル(`{feature-title}`)を確定する。
- フィーチャーブランチ`feature/{feature-title}`を作成
- `/docs/features/{index}-{feature-title}/requirement.md` を作成し、要件を記載する。

## ルール

- `requirement.md` は要件の情報のみに留め、具体的な設計までは記載しないこと。
  - 工程の前後でトレースするために使用する。
