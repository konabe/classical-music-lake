# PR レビューコメント対応

現在のブランチに紐づく PR のレビューコメントを取得し、指摘事項を修正してコミット・プッシュする。

## 手順

1. **PR 番号の特定**

   `git branch --show-current` で現在のブランチ名を取得し、`mcp__github__list_pull_requests` ツールで該当する PR 番号を特定する。

2. **レビューコメントの取得**

   `mcp__github__pull_request_read` ツールで PR の詳細とレビューコメントを取得する。
   - owner: `konabe`
   - repo: `classical-music-lake`
   - pullNumber: 上記で特定した PR 番号

3. **コメントの分析と修正**
   `Explore` エージェントを使って、レビューコメントで指摘されたファイル群の現状・関連コードを一括調査する。
   各コメントの `path`（ファイルパス）・`line`（行番号）・`body`（内容）を確認し、以下の優先順位で対応する：
   - Critical（データ整合性・セキュリティ）を最優先
   - Major（バグ・仕様不一致）を次に対応
   - Minor（スタイル・ドキュメント）を最後に対応

   修正前に必ず対象ファイルを Read して現在の状態を確認すること。
   既に修正済みのコメントはスキップする。

4. **テストの実行**
   バックエンドのファイルを変更した場合:

   ```bash
   npm run test:backend
   ```

   フロントエンドのファイルを変更した場合:

   ```bash
   npm run test:frontend
   ```

   テストが失敗した場合は修正してから次へ進むこと。

5. **コミット・プッシュ**
   変更ファイルを git add して以下の形式でコミット:

   ```text
   fix: coderabbitレビューコメントへの対応（PR #<番号>）

   - <対応内容1>
   - <対応内容2>
   ...
   ```

   その後 `git push -u origin <branch>` でプッシュする。
