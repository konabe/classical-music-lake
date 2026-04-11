# バックエンドのレイヤードアーキテクチャ化

現状の各 Lambda ファイルはHTTPパース・ビジネスロジック・DynamoDB操作が1ファイルに混在している。以下の3層に分離する。

```text
backend/src/
├── handlers/          # Lambda エントリーポイント（HTTPパース・レスポンス変換のみ）
│   ├── listening-logs/
│   └── concert-logs/
├── usecases/          # ビジネスロジック（ドメインルール・バリデーション）
│   ├── listening-logs/
│   └── concert-logs/
└── repositories/      # DynamoDB アクセス（データ永続化のみ）
    ├── ListeningLogRepository.ts
    └── ConcertLogRepository.ts
```

- [ ] `repositories/` 層の作成 — DynamoDB の GetItem / PutItem / UpdateItem / DeleteItem / Query を Repository クラスに集約
- [ ] `usecases/` 層の作成 — userId検証・UUID生成・createdAt/updatedAt付与などのビジネスロジックを UseCase クラスに集約
- [ ] `handlers/` 層のスリム化 — 既存の Lambda ファイルをエントリーポイント（イベントパース → UseCase呼び出し → レスポンス返却）のみに絞る
- [ ] 依存方向の徹底 — handler → usecase → repository の単方向依存を維持し、逆方向の参照を禁止する
