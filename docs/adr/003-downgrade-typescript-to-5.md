# ADR-003: TypeScript を 5.x にダウングレードする

- **ステータス**: 決定済み
- **日付**: 2026-04-05

## コンテキスト

プロジェクトでは TypeScript 6.0.2 を使用していたが、SonarQube が TypeScript 6 に非対応であり、静的解析が実行できない状態だった。

| 方式                     | メリット                       | デメリット                       |
| ------------------------ | ------------------------------ | -------------------------------- |
| A. TypeScript 6 を維持   | 最新の型チェック機能を利用可能 | SonarQube が非対応で静的解析不可 |
| B. TypeScript 5.x へ戻す | SonarQube で静的解析可能       | TypeScript 6 の新機能が使えない  |

## 決定

**TypeScript を 5.9.3（5.x 系の最新安定版）にダウングレードする。**

対象パッケージ:

- フロントエンド（`package.json`）
- バックエンド（`backend/package.json`）
- CDK（`cdk/package.json`）

## 理由

- SonarQube による静的解析（コード品質・セキュリティ）を有効にすることを優先した
- コードベースで TypeScript 6 固有の新機能は使用しておらず、ダウングレードによる機能的な影響はない
- TS5 → TS6 での型推論の厳格化により一部テストコードで型エラーが発生したが、型アノテーションの追加で対応済み

## 変更内容

- 全パッケージの `typescript` バージョンを `^6.0.2` → `~5.9.3` に変更
- middy の型キャスト修正（`middleware.ts`）
- Zod スキーマ出力型と Rating 型の互換性修正（`create.ts`, `update.ts`）
- テストコードの `this` 型アノテーション追加（auth テスト群）
- テストコードの型アサーション修正（`fixtures.ts`, `dynamodb.test.ts`）

## トレードオフ

- TypeScript 6 の新しい型チェック改善や新構文が利用できない
- SonarQube が TypeScript 6 に対応した時点でアップグレードを再検討する

## 再検討条件

SonarQube が TypeScript 6 をサポートした場合に再度アップグレードを検討する。
