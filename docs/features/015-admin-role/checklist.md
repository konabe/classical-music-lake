# 015-admin-role 進捗チェックリスト

関連 Issue: konabe/classical-music-lake#476

## Work 一覧

| #      | Work                                                                      | 設計 | 設計レビュー | 実装 | 受け入れ |
| ------ | ------------------------------------------------------------------------- | ---- | ------------ | ---- | -------- |
| 015-01 | [admin-group-provisioning](./015-01-admin-group-provisioning/work.md)     | ✅   | ✅           | ✅   | ✅       |
| 015-02 | [piece-write-admin-only-api](./015-02-piece-write-admin-only-api/work.md) | ✅   | ✅           | ✅   | ✅       |
| 015-03 | [admin-ui-gating](./015-03-admin-ui-gating/work.md)                       | ✅   | ☐            | ✅   | ☐        |

## 凡例

- ☐: 未着手
- 🛠: 作業中
- ✅: 完了

## 補足

- 受け入れは該当 Work の `work.md` 内の「受入テストケース」をすべて満たすことを指す。
- 追加の Work が発生した場合はこの表に行を追加する。
- 015-02 と 015-03 は 015-01（admin グループ作成）前提で動くが、実装・リリースは独立して進められる。
