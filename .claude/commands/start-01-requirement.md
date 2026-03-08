# 要件定義について

## 1. Gitの準備

- mainブランチの先頭にスイッチ

## 2. 何を開発するのかを収集

- 人間にどんな開発を実装するかを尋ねる。
  - この際に不明点があれば聞くこと
- 開発の内容からタイトル(`{feature-title}`)を確定する。
- フィーチャーブランチ`feature/{feature-title}`を作成
- `/docs/features/{index}-{feature-title}/requirement.md` を作成し、要件を記載する。

## ルール

- `requirement.md` は要件の情報のみに留め、具体的な設計までは記載しないこと。
  - 工程の前後でトレースするために使用する。
