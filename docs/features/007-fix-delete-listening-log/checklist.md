# 007-fix-delete-listening-log チェックリスト

## 概要

Issue #233「鑑賞記録を削除できない」のバグ修正。

`ListeningLogDetailTemplate.vue` に削除ボタンが存在しなかったため、APIの削除エンドポイントはあるにもかかわらずUIから削除できなかった。

## 受け入れ条件

- [x] 鑑賞記録詳細ページに「削除」ボタンが表示される
- [x] 削除ボタンをクリックすると確認ダイアログが表示される
- [x] 確認でOKを選択すると記録が削除され、一覧ページへ遷移する
- [x] 確認でキャンセルを選択すると削除されない

## 変更ファイル

| ファイル                                                      | 変更内容                             |
| ------------------------------------------------------------- | ------------------------------------ |
| `app/components/templates/ListeningLogDetailTemplate.vue`     | 削除ボタン（`ButtonDanger`）を追加   |
| `app/components/templates/ListeningLogDetailTemplate.test.ts` | Templateのユニットテスト追加（新規） |
| `app/pages/listening-logs/[id]/index.test.ts`                 | ページ結合テスト追加（新規）         |

## テスト

| 種別     | ファイル                                  | 内容                                                   |
| -------- | ----------------------------------------- | ------------------------------------------------------ |
| ユニット | `ListeningLogDetailTemplate.test.ts`      | 削除ボタン表示・confirm・deleteLog呼び出し・遷移を検証 |
| 結合     | `pages/listening-logs/[id]/index.test.ts` | PageがTemplateと結合した状態で削除フローを検証         |

## 受け入れ

- [x] 実装完了
- [x] ユニットテスト通過（245/245）
- [x] 結合テスト通過
