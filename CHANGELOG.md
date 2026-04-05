# Changelog

## [1.7.0](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v1.6.2...classical-music-lake-v1.7.0) (2026-04-05)


### Features

* add @codecov/vite-plugin for bundle analysis ([d733a0c](https://github.com/konabe/classical-music-lake/commit/d733a0c5040f4ccd761284609cac908484741397))
* add program (piece link) to concert logs ([0e859ff](https://github.com/konabe/classical-music-lake/commit/0e859ff458f269c80cbb17086fa48e0fea9c6ca6))
* npm から pnpm へパッケージマネージャーを移行 ([c196fc7](https://github.com/konabe/classical-music-lake/commit/c196fc717597ae66f7bf3a37f9fc264a14dd0a30)), closes [#379](https://github.com/konabe/classical-music-lake/issues/379)
* コンサート記録の作成・一覧機能を追加（012-01） ([b93c772](https://github.com/konabe/classical-music-lake/commit/b93c772f64f03b330c342ce484b00e6a1283b6b1))
* コンサート記録の作成・一覧機能を追加（ワーク012-01） ([7e78e0c](https://github.com/konabe/classical-music-lake/commit/7e78e0c7843cff31837bde5606a97b7ca1963944))
* コンサート記録の詳細・編集・削除機能を実装 ([4b60721](https://github.com/konabe/classical-music-lake/commit/4b60721596e825553403868a6fff29c1d797ad2f))
* コンサート記録の詳細・編集・削除機能を実装 (012-02) ([12cdc86](https://github.com/konabe/classical-music-lake/commit/12cdc8653187255e695fef58513f2fafeb4d5ffe))


### Bug Fixes

* concert-logs functions to end of arrays to prevent CloudWatch alarm ID conflicts ([9d45fc4](https://github.com/konabe/classical-music-lake/commit/9d45fc415ed219300c09235d44fd135f9a8419a0))
* formGroupのラベル関連付けをinputId/id明示方式に変更 ([62e70a7](https://github.com/konabe/classical-music-lake/commit/62e70a7cdf0e9f1b849c76180282a86abe682157))
* improve text contrast to meet WCAG AA requirements ([68591e5](https://github.com/konabe/classical-music-lake/commit/68591e5576326c82644ffa93c21ac5891edac53b))
* memo の trim を考慮した filter を追加しプロパティテストの偽陰性を修正 ([a60d697](https://github.com/konabe/classical-music-lake/commit/a60d697f3b2cb8e0f20d23e7c10ca03405670aee))
* override undici to &gt;=6.24.0 to resolve high severity vulnerability ([002f1c6](https://github.com/konabe/classical-music-lake/commit/002f1c6c87a7080d7e36285e687056c95ef9208d))
* resolve SonarQube warnings in VideoPlayer (S1848, S7764, S7735) ([#390](https://github.com/konabe/classical-music-lake/issues/390)) ([3d2d9a4](https://github.com/konabe/classical-music-lake/commit/3d2d9a48218e1aafe55acde2263c9983529f3953))
* session-start.sh に corepack enable を追加 ([24292e7](https://github.com/konabe/classical-music-lake/commit/24292e7228b33f9139158059e55f3730799c59c7))
* sonarqube指摘対応 ([efefbc1](https://github.com/konabe/classical-music-lake/commit/efefbc1026ab17d1bd600097b225cba1c800b40c))
* sonarqube指摘対応 - ワークフローセキュリティとHTML構造修正 ([658844e](https://github.com/konabe/classical-music-lake/commit/658844ecd44dd03244051563a7ce772bade460f5))
* suppress SonarQube false positive for li inside vuedraggable ([212f780](https://github.com/konabe/classical-music-lake/commit/212f7809a8e038a7b226fefb40c97d26f057b33d))
* フォームラベルのアクセシビリティを改善し eslint-plugin-vuejs-accessibility を追加 ([216e5d1](https://github.com/konabe/classical-music-lake/commit/216e5d19c736be0c6a1429bca74ae768cc95efe6))
* プロパティ述語をヘルパー関数経由に変更しESLintエラーを修正 ([90c3351](https://github.com/konabe/classical-music-lake/commit/90c335120981043d0d45959da76dbd234cfa785b))

## [1.6.2](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v1.6.1...classical-music-lake-v1.6.2) (2026-04-04)


### Bug Fixes

* defu の高severity脆弱性を npm audit fix で修正 ([c13402f](https://github.com/konabe/classical-music-lake/commit/c13402ff0405116a077a276d738fa41942de0530))

## [1.6.1](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v1.6.0...classical-music-lake-v1.6.1) (2026-04-04)


### Bug Fixes

* build frontend after CDK deploy to resolve empty Cognito domain in prod ([#366](https://github.com/konabe/classical-music-lake/issues/366)) ([7dc11ec](https://github.com/konabe/classical-music-lake/commit/7dc11ec9f2fb7261413231a90ad50d0bbd913193))

## [1.6.0](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v1.5.0...classical-music-lake-v1.6.0) (2026-04-04)


### Features

* claude code カスタムエージェントを追加 ([3584c18](https://github.com/konabe/classical-music-lake/commit/3584c18473665d2b7cb3af2d7cd0e5d6edeec449))
* claude code カスタムエージェントを追加 ([ec5fbe8](https://github.com/konabe/classical-music-lake/commit/ec5fbe84b19c60cdcbed0b08231438288d0d92a2))
* Google OAuth 認証を追加 (closes [#286](https://github.com/konabe/classical-music-lake/issues/286)) ([f16e654](https://github.com/konabe/classical-music-lake/commit/f16e654706c08c62534fd6f0d01da9b6cba52922))
* Google OAuth 認証を追加 (closes [#286](https://github.com/konabe/classical-music-lake/issues/286)) ([d1a2881](https://github.com/konabe/classical-music-lake/commit/d1a2881ba4a4aa561de418d3501b117aac394ecf))
* google oauth 認証を追加（closes [#286](https://github.com/konabe/classical-music-lake/issues/286)） ([919dd5b](https://github.com/konabe/classical-music-lake/commit/919dd5b756bccecf2889041bf0815bb7e5ffdbea))
* pre-signupトリガーでGoogleアカウントと既存ユーザーを自動リンク ([bc7ce03](https://github.com/konabe/classical-music-lake/commit/bc7ce036c3a97e3b286092cbefa0c3315c126eeb))
* pre-signupトリガーでGoogleアカウントと既存ユーザーを自動リンク ([accf1f9](https://github.com/konabe/classical-music-lake/commit/accf1f9691fa0f17c4cdc2b146144777a9bf64a0))


### Bug Fixes

* add shebang to husky hooks for Windows compatibility ([4e0e893](https://github.com/konabe/classical-music-lake/commit/4e0e8937ad6261571515126eb76df7c7e64bb8c8))
* authPreSignUpのcommonEnvからCognito参照を除去して循環依存を解消 ([8ebd91b](https://github.com/konabe/classical-music-lake/commit/8ebd91bbc92d02f402b56ac90644e47ad40b7aca))
* authPreSignUpのcommonEnvからCognito参照を除去して循環依存を解消 ([7066de0](https://github.com/konabe/classical-music-lake/commit/7066de050cba18ae5b5c78e581384a9eb7d0a8fc))
* callbackページでCognitoのerrorパラメーターを処理してエラー詳細を表示 ([75bcd99](https://github.com/konabe/classical-music-lake/commit/75bcd99e323fcbbf07eaaf3cb59b9f85d5dd7394))
* callbackページでCognitoのerrorパラメーターを処理してエラー詳細を表示 ([87bc165](https://github.com/konabe/classical-music-lake/commit/87bc1654a51a8256f228f49f714f9810fedae61a))
* deploy時にCognito環境変数をNuxtビルドに渡すよう修正 ([830feb2](https://github.com/konabe/classical-music-lake/commit/830feb2519280e26f9e5686b5ac6209553eef028))
* deploy時にCognito環境変数をビルドに渡すよう修正 ([1861d6f](https://github.com/konabe/classical-music-lake/commit/1861d6f5c6e76622f7afa47a080edb96683484f3))
* deploy時にGoogle OAuth認証情報をCDKへ渡すよう修正 ([35d6cd7](https://github.com/konabe/classical-music-lake/commit/35d6cd7c920d7b49d1553e8e3db578f731d89a6a))
* deploy時にGoogle OAuth認証情報をCDKへ渡すよう修正 ([90d9bca](https://github.com/konabe/classical-music-lake/commit/90d9bcafdd3193f26f55a0627f84508e677a5583))
* HomeTemplate のヒーロー全幅表示を viewport-width 方式に変更 ([14cb137](https://github.com/konabe/classical-music-lake/commit/14cb13701d7f8cda7d1c75736ccbd16aa485df8d)), closes [#255](https://github.com/konabe/classical-music-lake/issues/255)
* lint-staged に markdown の ESLint チェックを追加 ([0b69ee3](https://github.com/konabe/classical-music-lake/commit/0b69ee3114c13452fb8b7485d5465aa2eb723fec))
* pre-signupトリガーでGoogleプロバイダー名の大文字小文字を正規化 ([b49a646](https://github.com/konabe/classical-music-lake/commit/b49a646fcb858f5023aa1ae2449583b5ab26f757))
* pre-signupトリガーでGoogleプロバイダー名の大文字小文字を正規化 ([349903a](https://github.com/konabe/classical-music-lake/commit/349903ae310cf1c4beba14320456624fe08835d7))
* pre-signupトリガーのIAMポリシーで循環依存を解消 ([4902585](https://github.com/konabe/classical-music-lake/commit/49025856f4303f9ffaf69853c4c2fa1576d1f186))
* pre-signupトリガーのIAMポリシーで循環依存を解消 ([cd684d1](https://github.com/konabe/classical-music-lake/commit/cd684d1e1f867e7495dab45aba7b4cb4559de1e1))
* prod・stg 環境での CORS オリジンを CloudFront URL のみに制限 ([6f288e6](https://github.com/konabe/classical-music-lake/commit/6f288e61864f8345937e85a1d829b9fdb8028c60)), closes [#287](https://github.com/konabe/classical-music-lake/issues/287)
* prod・stg 環境での CORS オリジンを CloudFront URL のみに制限 ([#287](https://github.com/konabe/classical-music-lake/issues/287)) ([784b366](https://github.com/konabe/classical-music-lake/commit/784b3665f1ae88a118868e56d5dd81d00642919f))
* エージェントファイルのコードブロックに言語タグを追加 ([42c766c](https://github.com/konabe/classical-music-lake/commit/42c766c6681cb714fab89040882376700ef3d6ca))


### Reverts

* homeTemplate.vue のヒーロー全幅表示変更を取り消し ([615bee3](https://github.com/konabe/classical-music-lake/commit/615bee379506fde9fc34d3a9f2e73a26196ce5c2))

## [1.5.0](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v1.4.0...classical-music-lake-v1.5.0) (2026-04-02)


### Features

* add custom ESLint rule to ban :deep() selector in Vue SFCs ([3c48572](https://github.com/konabe/classical-music-lake/commit/3c485720bde8cb143ed9be1172094fdf2d1fa128)), closes [#280](https://github.com/konabe/classical-music-lake/issues/280)
* claude_args に Edit, Read, Write ツールを許可設定 ([c5563f5](https://github.com/konabe/classical-music-lake/commit/c5563f5de7d80859974f14ca6c05bccb7fec4214))
* if文に波かっこを必須化し、不要なboolean比較を禁止 ([2d1402b](https://github.com/konabe/classical-music-lake/commit/2d1402bf79051e9bfac92d4545208144a3d63d29))
* トークンリフレッシュ機能を追加して再訪時の認証エラーを解消 ([9c0fc39](https://github.com/konabe/classical-music-lake/commit/9c0fc399d24bde842827e576a48d7bc24ce6d305)), closes [#254](https://github.com/konabe/classical-music-lake/issues/254)


### Bug Fixes

* claude.yml の末尾空行を修正して prettier チェックを通す ([1477169](https://github.com/konabe/classical-music-lake/commit/147716934fdd76986b9c9922a417ab856867f0c7))
* coderabbitレビューコメントへの対応（PR [#301](https://github.com/konabe/classical-music-lake/issues/301)） ([5cd220b](https://github.com/konabe/classical-music-lake/commit/5cd220b116a4192dff64eedd7cb983045803224b))
* lodash の高severity脆弱性を npm audit fix で修正 ([852cb51](https://github.com/konabe/classical-music-lake/commit/852cb517c4c54ec4d06b5b338cdeef5df9784b2a))
* middleware の isTokenExpired 重複を解消し refreshTokens のレース条件を修正 ([755873c](https://github.com/konabe/classical-music-lake/commit/755873cd71d588ed82dc545b6bac826a6a417499))
* middleware.ts の error.expose を明示比較に修正 ([3ff82bf](https://github.com/konabe/classical-music-lake/commit/3ff82bfa6e0acc511da72b332a639e6a824ba80d))
* pageHeader テストで useAuth をモックし vitest ワーカー終了時のエラーを解消 ([ea5853f](https://github.com/konabe/classical-music-lake/commit/ea5853ff10143fb70dcc4fb4ecc3a18b6e6011f6))
* refreshTokens の並行呼び出し時の競合を防止 ([dc5bef8](https://github.com/konabe/classical-music-lake/commit/dc5bef8fa82597108e18cbe18248cf26e6a52036))
* setup-test-db.mjs の波かっこなしif文を修正 ([22e1848](https://github.com/konabe/classical-music-lake/commit/22e1848fbaaa336d3c7866f7787c321cda573706))
* shared/ に tsconfig.json を追加して CI のバックエンドテストを修正 ([19634f9](https://github.com/konabe/classical-music-lake/commit/19634f9130ed22e28a66cb42de84200319b6c753))
* strict-boolean-expressions と no-unnecessary-boolean-literal-compare の競合を解消 ([df8ea1a](https://github.com/konabe/classical-music-lake/commit/df8ea1aa8f3daa0d1550af42863930cc655b72d5))
* suppress EnvironmentTeardownError for vitest 4.1 compatibility ([cdd5da6](https://github.com/konabe/classical-music-lake/commit/cdd5da6b3ea79220788ef1f1d843493207b6ac4e))
* vitest config に shared/ ディレクトリへのアクセス許可を追加 ([d8f6eaa](https://github.com/konabe/classical-music-lake/commit/d8f6eaa5126bb4a5efecffbab23707e2f7e87ba5))
* vitest から .claude/worktrees を除外 ([709453b](https://github.com/konabe/classical-music-lake/commit/709453b5232c37e3129c2e0cfc1fd0fd50bf14f9))
* vitest の vite root をプロジェクトルートに設定 ([5de3864](https://github.com/konabe/classical-music-lake/commit/5de3864ad294938ea5acb1a0c2793ce397c16183))
* トークンリフレッシュ機能を追加して再訪時の認証エラーを解消 ([3b2ab1c](https://github.com/konabe/classical-music-lake/commit/3b2ab1cc5b8ec7104ab5f450aecf9e784d1d2b0b))

## [1.4.0](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v1.3.0...classical-music-lake-v1.4.0) (2026-03-30)


### Features

* prod→stg DynamoDB 同期ワークフローを追加 ([0c41568](https://github.com/konabe/classical-music-lake/commit/0c41568636c2c3b711cd774007a2f5c72f7e9708))
* youtube embed に rel=0・fs=0 を追加して関連動画と全画面ボタンを制限する ([4ab266b](https://github.com/konabe/classical-music-lake/commit/4ab266b69ce72414f63b5ef2777b15d6add0d990)), closes [#235](https://github.com/konabe/classical-music-lake/issues/235)
* ステージング環境と開発環境のデプロイを追加 (issue [#239](https://github.com/konabe/classical-music-lake/issues/239)) ([8d63625](https://github.com/konabe/classical-music-lake/commit/8d636257daebcb1de1be29e9f55f8c4443700051))
* テストでのtoBeTruthy/toBeFalsy使用をESLintで禁止 ([b355d15](https://github.com/konabe/classical-music-lake/commit/b355d156456b47d5e2afb1dcb030ce9d3e7468b5))
* 楽曲マスタにカテゴリ（ジャンル・時代・編成・地域）を追加 ([359d54a](https://github.com/konabe/classical-music-lake/commit/359d54a2a27ace3218488f5ea76a2f20e22a0fc2))
* 楽曲マスタにカテゴリ（ジャンル・時代・編成・地域）を追加 ([a793029](https://github.com/konabe/classical-music-lake/commit/a793029062c153b87e3d6d2c783f9f3b202658f6))
* 楽曲一覧・詳細画面にカテゴリバッジを表示する ([41bd0f5](https://github.com/konabe/classical-music-lake/commit/41bd0f518cb0ef970f15b39d9ae0abfff4eac964))


### Bug Fixes

* cdk デプロイを api url 取得より前に実行するよう順序を修正 ([04c7a84](https://github.com/konabe/classical-music-lake/commit/04c7a84187d425cc6fec7fa05557c9d708e64699))
* coderabbit レビュー指摘の修正 ([4be3e6e](https://github.com/konabe/classical-music-lake/commit/4be3e6e674c2f5c8c963697dec7495829991ccc3))
* happy-dom を 20.8.9 に更新して高深刻度脆弱性を修正 ([c561e2e](https://github.com/konabe/classical-music-lake/commit/c561e2e6eed2fde80f260f9d3cf61797233ad418))
* parsing.ts の strict-boolean-expressions エラーを修正 ([c7d2de6](https://github.com/konabe/classical-music-lake/commit/c7d2de6bd1151933524f6d78f1715cb501280b29))
* truthy/falsy依存を明示的な比較に修正しESLintルールを追加 ([a255092](https://github.com/konabe/classical-music-lake/commit/a255092b047e6c89828b8c205761257d1e058040)), closes [#252](https://github.com/konabe/classical-music-lake/issues/252)
* テストのtoBeTruthy()をtoBeDefined()に修正 ([339a402](https://github.com/konabe/classical-music-lake/commit/339a40285eceeb609ec7c1d8e6eeb94c290d0907))
* ログイン後に戻るボタンで無限ループが発生するバグを修正 ([db13d66](https://github.com/konabe/classical-music-lake/commit/db13d66e4aae60e3118f6b887270098a3323ada0))
* ログイン後に戻るボタンで無限ループが発生するバグを修正 ([#253](https://github.com/konabe/classical-music-lake/issues/253)) ([01c09e9](https://github.com/konabe/classical-music-lake/commit/01c09e9de2e146750f43ea1cc85180dbcf4d031a))
* 初回デプロイ時にスタック未存在でも継続できるよう api url 取得を非必須化 ([9f19d24](https://github.com/konabe/classical-music-lake/commit/9f19d24e8c768e1b24fbf57760166c58488c2f89))


### Performance Improvements

* cdk deploy を高速化（hotswap-fallback + BucketDeployment 並列化） ([61cd87f](https://github.com/konabe/classical-music-lake/commit/61cd87f43e756a373f934cfcfc404dc3c7dadc93))
* デプロイワークフローの npm インストールを高速化 ([7034e8a](https://github.com/konabe/classical-music-lake/commit/7034e8a63c878ad3ed6e1d43b7797cd883207a06))
* デプロイワークフローの npm インストールを高速化 ([c820b5b](https://github.com/konabe/classical-music-lake/commit/c820b5b325f13b7dff1eac96f444b688a50aae29))


### Reverts

* cdk bootstrap の条件付き実行を元に戻す ([663546a](https://github.com/konabe/classical-music-lake/commit/663546ab54ac8b792cb854edf4e816bb37dfcbde))
* deploy.yml のステップ順序を元に戻す ([692eec0](https://github.com/konabe/classical-music-lake/commit/692eec0f0ddeca78542a8fff8f759b290c89f43e))

## [1.3.0](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v1.2.1...classical-music-lake-v1.3.0) (2026-03-28)


### Features

* ホームページをクラシック探索型に刷新 ([48bae5e](https://github.com/konabe/classical-music-lake/commit/48bae5e8cd94846be8982331076b52dd1723fc7a))
* ローカル開発環境から本番 API に接続できるよう CORS を拡張 ([4af0782](https://github.com/konabe/classical-music-lake/commit/4af078296f03553ce11e708cf3b346d5ff2e52ce))
* ローカル開発環境から本番 API に接続できるよう CORS を拡張 ([1041b97](https://github.com/konabe/classical-music-lake/commit/1041b9750bec0a885d1825450c505c9bddfed98e))


### Bug Fixes

* dev サーバーのポートを 3000 から 3010 に変更 ([e52cd17](https://github.com/konabe/classical-music-lake/commit/e52cd17ea0bb645d71e0c7237958031726e346d5))
* dev サーバーのポートを 3000 から 3010 に変更 ([d7fba83](https://github.com/konabe/classical-music-lake/commit/d7fba83c9e8c6897092c1abf313b9c49e8bdc2f2))
* npm audit で検出された high 脆弱性を修正 ([02f90dd](https://github.com/konabe/classical-music-lake/commit/02f90dd294bc1e5b250107b6e89f1634eb57af28))
* npm audit の high 脆弱性を修正 ([6f327e7](https://github.com/konabe/classical-music-lake/commit/6f327e7eeb5a96c3a63f899feda7a88734804110))
* レスポンシブデザインとトンマナの違和感を修正 ([c1dab89](https://github.com/konabe/classical-music-lake/commit/c1dab89ceaf89c3f86d609b8b5ee2ab420531ca4))
* レスポンシブデザインとトンマナの違和感を修正 ([fc1d012](https://github.com/konabe/classical-music-lake/commit/fc1d01288c12fc17a9adce1d6f32f39473fee1eb))

## [1.2.1](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v1.2.0...classical-music-lake-v1.2.1) (2026-03-26)


### Bug Fixes

* **#233:** 一覧ページの削除ボタンが機能しない問題を修正 ([9ac5c1a](https://github.com/konabe/classical-music-lake/commit/9ac5c1aff0e6d5f7f0d81fbf525cdd8a2452b46b))
* **#233:** 鑑賞記録詳細ページに削除ボタンを追加 ([78f3ea9](https://github.com/konabe/classical-music-lake/commit/78f3ea9eb9cd12bbdcb5c2a8cd83714d589ec856))
* **#233:** 鑑賞記録詳細ページに削除ボタンを追加 ([485cfb7](https://github.com/konabe/classical-music-lake/commit/485cfb72769c3a33a557f598a0708f1c7e51e480)), closes [#233](https://github.com/konabe/classical-music-lake/issues/233)
* vitest worker 終了時の useAuth fetch pending エラーを修正 ([db3af56](https://github.com/konabe/classical-music-lake/commit/db3af567c7f369db6e84cad3aae3ec4031d91391))
* vitest worker 終了時の useAuth fetch pending エラーを修正 ([050573a](https://github.com/konabe/classical-music-lake/commit/050573a14eab5f23fc91d9f2aceb3f2fb386dfb5))

## [1.2.0](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v1.1.4...classical-music-lake-v1.2.0) (2026-03-25)


### Features

* **006-001:** piece に videoUrl フィールドを追加し楽曲フォームに動画 URL 入力欄を追加 ([eabc4cd](https://github.com/konabe/classical-music-lake/commit/eabc4cd9031a022002f9d6353eb163640658cc98))
* **006-001:** piece に videoUrl フィールドを追加し楽曲フォームに動画 URL 入力欄を追加 ([d24faad](https://github.com/konabe/classical-music-lake/commit/d24faadb7a5b99be5c0331c8f23da5db92e7e290))
* **006-002:** 楽曲詳細ページでのクイックログ記録機能を実装 ([a08da6c](https://github.com/konabe/classical-music-lake/commit/a08da6c1599b9c95671903286f9e2a19dc54846d))
* **006-002:** 楽曲詳細ページで動画を視聴しながらログを記録できる ([fb0549c](https://github.com/konabe/classical-music-lake/commit/fb0549cf2d4f59f1e11ce3556540cf22dfdd8954))
* **006-003:** 視聴ログフォームで楽曲選択時に動画プレビューを表示 ([db94b34](https://github.com/konabe/classical-music-lake/commit/db94b34493e0fb98d518d6bfa15ab3395f28d0f0))
* **006-003:** 視聴ログフォームで楽曲選択時に動画プレビューを表示 ([516d2f1](https://github.com/konabe/classical-music-lake/commit/516d2f191419e0500d5ba9c9756beb2b60e7bd85))
* **eslint:** vue auto-imports・vitest globals・MD040 の検出ルールを追加 ([45ab8c4](https://github.com/konabe/classical-music-lake/commit/45ab8c4e7a4f69e3f9a4c57c6f37c0fe9d34e90a))


### Bug Fixes

* **cdk:** add @types/node for TypeScript 6.0 compatibility ([#230](https://github.com/konabe/classical-music-lake/issues/230)) ([9b9177b](https://github.com/konabe/classical-music-lake/commit/9b9177b417ac3c58873962c44e837f13874ac3ae))
* picomatch・h3 の security 脆弱性を修正 (npm audit fix) ([2c88d5c](https://github.com/konabe/classical-music-lake/commit/2c88d5c5c16fc0498ca711cdd26bc525f3f2534c))
* ref の不要インポート削除・ARCHITECTURE.md コードブロックに言語タグ追加 ([cb19dc9](https://github.com/konabe/classical-music-lake/commit/cb19dc994a58ea3fd694689af6a587a015a239c8))

## [1.1.4](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v1.1.3...classical-music-lake-v1.1.4) (2026-03-24)


### Bug Fixes

* add type="button" to ButtonSecondary to prevent unintended form submissions ([b956aef](https://github.com/konabe/classical-music-lake/commit/b956aefb18602e0d2b6455cc31509677c33e44f0))

## [1.1.3](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v1.1.2...classical-music-lake-v1.1.3) (2026-03-23)


### Bug Fixes

* useFetch の 401 エラー時にログイン画面へリダイレクトされない問題を修正 ([#147](https://github.com/konabe/classical-music-lake/issues/147)) ([2bb6960](https://github.com/konabe/classical-music-lake/commit/2bb6960c73d4b96ad66616bfceb3ed9d809da58f))
* useFetch の onResponseError で 401 時にログイン画面へリダイレクト ([#147](https://github.com/konabe/classical-music-lake/issues/147)) ([89aa57b](https://github.com/konabe/classical-music-lake/commit/89aa57b27d541b8ad7b507794709e3d61efda5f2))

## [1.1.2](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v1.1.1...classical-music-lake-v1.1.2) (2026-03-23)


### Bug Fixes

* register/login の COGNITO_CLIENT_ID をハンドラー内で読み込みオプション対応 ([238b86d](https://github.com/konabe/classical-music-lake/commit/238b86d9962ddf3d1a6952f3c1e3b9f1182ea5fe)), closes [#163](https://github.com/konabe/classical-music-lake/issues/163)

## [1.1.1](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v1.1.0...classical-music-lake-v1.1.1) (2026-03-22)


### Bug Fixes

* id token を使用して cognito authorizer の 401 エラーを解消 ([9d58667](https://github.com/konabe/classical-music-lake/commit/9d586677401e61c4251c0c8509a61b1360d40d6c))
* id token を使用して cognito authorizer の 401 エラーを解消 ([#146](https://github.com/konabe/classical-music-lake/issues/146)) ([f643190](https://github.com/konabe/classical-music-lake/commit/f6431906791d3726b292d21709a3a5bbca1408a2))
* listenedAt を ISO 8601 UTC 形式に変換してから送信する ([0d11938](https://github.com/konabe/classical-music-lake/commit/0d119380ba580970324b0ad35d144c648a42bc27))

## [1.1.0](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v1.0.0...classical-music-lake-v1.1.0) (2026-03-22)


### Features

* **003-2:** implement user registration with Cognito ([f517a3b](https://github.com/konabe/classical-music-lake/commit/f517a3b606c0ab7ec1fa40247b5c02442198e7b9))
* 004-001 認証コード入力画面・登録後の自動遷移を実装 ([67f0f66](https://github.com/konabe/classical-music-lake/commit/67f0f6627d40ca0116c80b2999962ba23731fb72))
* atomic design の layouts 層を導入 ([2d3f9c0](https://github.com/konabe/classical-music-lake/commit/2d3f9c0d06c4ea44e82cfa2772834b33634b898a))
* atomic design の layouts 層を導入し app.vue から抽出 ([2767016](https://github.com/konabe/classical-music-lake/commit/2767016ec3a3aa30928b6e01f859bf2334675131))
* atomic design の organisms 層を導入 ([96410cb](https://github.com/konabe/classical-music-lake/commit/96410cb4632be90cdfefb5182c5fc605b9818535))
* atomic design の organisms 層を導入し templates から抽出 ([949dbdb](https://github.com/konabe/classical-music-lake/commit/949dbdb8797f051fa7425385fa73c03dae4fb909))
* atomic design の templates 層を導入 ([7a0aba3](https://github.com/konabe/classical-music-lake/commit/7a0aba30b6766f359cc1f390fae9a6cdefa74793))
* atomic design の templates 層を導入し全ページから抽出 ([eb8770e](https://github.com/konabe/classical-music-lake/commit/eb8770e5887fa986d801ef8ce3d46e2797bd0516))
* atomic design の templates 層導入と Storybook 公開 ([be13fee](https://github.com/konabe/classical-music-lake/commit/be13fee0edf27dbb3cb3eeef4680f4fdc50ca0aa))
* atoms 層を導入し requiredMark・errorMessage・emptyState を抽出 ([7bfb868](https://github.com/konabe/classical-music-lake/commit/7bfb8688bd41037323f7df517717bb26398b40aa))
* atoms 層を導入し requiredMark・errorMessage・emptyState を抽出 ([20eb9b8](https://github.com/konabe/classical-music-lake/commit/20eb9b86ef8fef99a30508e5bb027052716052ac))
* AWS CDK デプロイ設定を追加 ([47220d4](https://github.com/konabe/classical-music-lake/commit/47220d4cbb82fcb207f9a8b2a7c0d14e6503968b))
* GitHub Actions デプロイワークフローを追加 ([49663f1](https://github.com/konabe/classical-music-lake/commit/49663f1fc7263d11698618e9e3404c68ad375cc5))
* Lambda バックエンドソースを追加 ([94a271c](https://github.com/konabe/classical-music-lake/commit/94a271c3702bef1090e88b3b283342176cdcc16f))
* molecules 層を導入（RatingDisplay・FavoriteIndicator・RatingSelector） ([8f7039f](https://github.com/konabe/classical-music-lake/commit/8f7039f21a0be1633ede121d531af77a0572e5ee))
* molecules 層を導入し ratingDisplay・favoriteIndicator・ratingSelector を抽出 ([cd041f5](https://github.com/konabe/classical-music-lake/commit/cd041f5f081009683318a497a50c328a709f4161))
* Node.js 24対応とシステム仕様書の追加 ([0b0fb2a](https://github.com/konabe/classical-music-lake/commit/0b0fb2a9f4bb0c3a30e932646340fe3a01371f40))
* Node.js 24対応と仕様書の追加 ([acbb658](https://github.com/konabe/classical-music-lake/commit/acbb6586a0d0c8f851416c3dbad49226c4e6cc06))
* rebrand to Nocturne ([9eb446b](https://github.com/konabe/classical-music-lake/commit/9eb446b95269d1f11482bffd096c7cd43fb4d2ef))
* response ヘルパーの CORS・JSON シリアライズを middy に移譲 ([b6c6cd3](https://github.com/konabe/classical-music-lake/commit/b6c6cd3cc6f7f0da7d152e1464fd6852052677b0))
* response ヘルパーの cors・json を middy に移譲（issue [#8](https://github.com/konabe/classical-music-lake/issues/8)） ([e1b1331](https://github.com/konabe/classical-music-lake/commit/e1b1331174c2742f5101d78de0e38aaa5b7b6fe0))
* setup AWS Cognito User Pool and App Client ([17a0ef0](https://github.com/konabe/classical-music-lake/commit/17a0ef0b54556ef13176f7912e4c1ebccb75abf7))
* setup AWS Cognito User Pool and App Client ([fc43559](https://github.com/konabe/classical-music-lake/commit/fc43559731bf2d8c70606b09b03cbdcafaeeffa2))
* setup AWS Cognito User Pool and App Client for user authentication ([50ad995](https://github.com/konabe/classical-music-lake/commit/50ad995e1acaf91e1723d43b47df319ebf417e56))
* SPA モードに変更 ([82eecb4](https://github.com/konabe/classical-music-lake/commit/82eecb44d2435142c6944a062020c688c031bff2))
* storybook 静的ファイルを S3+CloudFront の /storybook/ で公開 ([54f197e](https://github.com/konabe/classical-music-lake/commit/54f197e8a88322c9e8647d8b1b7bd7e404775ecf))
* templates 層の Storybook stories を追加 ([e6179a8](https://github.com/konabe/classical-music-lake/commit/e6179a8c29b365dc48cd2cf3a7132d15a2686287))
* top画面に管理者向けリンクセクションを追加 ([aeff851](https://github.com/konabe/classical-music-lake/commit/aeff8515d9af2d724fdd88620ea979d72a6a6ed9))
* top画面に管理者向けリンクセクションを追加（楽曲マスタ導線） ([099ada9](https://github.com/konabe/classical-music-lake/commit/099ada999c33a68747a60056bee258ba3e257767))
* TOP画面への管理者向けリンクセクション追加 ([ca94b53](https://github.com/konabe/classical-music-lake/commit/ca94b53e2c75517a928cf39d9f029d936bdf0789))
* upgrade to Nuxt 4 ([ab000d9](https://github.com/konabe/classical-music-lake/commit/ab000d983ed7f72240c12b37e6ee56d2ef635e16))
* Zodを使ってリクエストボディのパース処理にバリデーションを統合 (issue [#88](https://github.com/konabe/classical-music-lake/issues/88)) ([63f770a](https://github.com/konabe/classical-music-lake/commit/63f770a5f8f2c33d73b8849d1c24807979af9143))
* Zodを使ってリクエストボディのパース処理にバリデーションを統合 (issue [#88](https://github.com/konabe/classical-music-lake/issues/88)) ([f6496b1](https://github.com/konabe/classical-music-lake/commit/f6496b1da2a6d1ea493e11bd4d53b2427a9c8315))
* インフラパフォーマンス・コスト最適化（チェックリスト8.3） ([a1eba03](https://github.com/konabe/classical-music-lake/commit/a1eba03d0c1510a21b785d1cb1101290cccac355))
* クラシック音楽鑑賞記録アプリの初期実装 ([1bd4f63](https://github.com/konabe/classical-music-lake/commit/1bd4f6313967f1778037e8702c5d143ba977c757))
* コードレビュー基盤を整備（チェックリスト6.3） ([25d016f](https://github.com/konabe/classical-music-lake/commit/25d016f9c332a7a37d4ee14e8691cd1afb05d2c6))
* コード品質・セキュリティ強化（チェックリスト6.1〜7.1） ([dc77f79](https://github.com/konabe/classical-music-lake/commit/dc77f795454e6d0e1f0d1ced918aa0c57513dba1))
* コード品質強化（チェックリスト6.1〜6.3） ([3342cfb](https://github.com/konabe/classical-music-lake/commit/3342cfbd4dd10bb11998607bb397db616ca9caf1))
* セキュリティヘッダを cloudfront に追加（チェックリスト7.3） ([3f2b436](https://github.com/konabe/classical-music-lake/commit/3f2b43622c345b2c7007f43b1d748848e7c30594))
* セキュリティ強化（チェックリスト7.1〜7.2） ([5f998ce](https://github.com/konabe/classical-music-lake/commit/5f998ce2766f8c5c0cbc7c35c4e9f42afc7dfee8))
* セキュリティ監査対応（チェックリスト7.3） ([2e1808a](https://github.com/konabe/classical-music-lake/commit/2e1808a823f1f4f283b0adfa9c05c62160a5d036))
* トップページの admin-links に Storybook リンクを追加 ([8585141](https://github.com/konabe/classical-music-lake/commit/85851413e6f36492aba4a53e6b8733aef56aced3))
* バックエンドパフォーマンス改善（チェックリスト8.2） ([f5b8a7c](https://github.com/konabe/classical-music-lake/commit/f5b8a7c7b04fbbd72fa07222b2ad4c71c2a810fa))
* バックエンドを API Gateway + Lambda 構成に変更 ([8d52471](https://github.com/konabe/classical-music-lake/commit/8d52471dccb77092a959be2ba440837dce5f88f3))
* パフォーマンス・監視・データ管理を整備（チェックリスト8〜11） ([76e3f69](https://github.com/konabe/classical-music-lake/commit/76e3f699f79fbe945c0fe87aab3ad4a8f12f5d76))
* フロントエンドパフォーマンス改善（チェックリスト8.1） ([e7522f6](https://github.com/konabe/classical-music-lake/commit/e7522f64cbd9ca68b6c66426ab787226fbce254b))
* フロントエンドパフォーマンス改善（チェックリスト8.1） ([b381d6c](https://github.com/konabe/classical-music-lake/commit/b381d6c0cc9048e5303159d278367b62c0e5ce34))
* ヘッダーに未ログイン/ログイン済み時の導線を追加（005-001/005-002） ([dc3fcf3](https://github.com/konabe/classical-music-lake/commit/dc3fcf3b3d70c8b5229f58a4ca97a11b0bcdafc8))
* ヘッダーに未ログイン時の新規登録・ログインリンクを追加（005-001/005-002） ([f8e2f83](https://github.com/konabe/classical-music-lake/commit/f8e2f8316fcbbebfbc9988a0b1e8e58ff48581fb))
* メール未確認ユーザーのログイン時に verify-email へリダイレクト ([71b5911](https://github.com/konabe/classical-music-lake/commit/71b5911ae7690f693420c1ef44405919e7db4ee8))
* ユーザーログアウト機能を実装 (003-4) ([2876667](https://github.com/konabe/classical-music-lake/commit/2876667e7eaba4680a155b7b8902bb3fbdaa4c06))
* ユーザーログアウト機能を実装 (003-4) ([5488026](https://github.com/konabe/classical-music-lake/commit/5488026ae690d3c366c09842d5127d9a386d106a))
* ユーザーログイン機能を実装 (003-3) ([e69fb3f](https://github.com/konabe/classical-music-lake/commit/e69fb3f5e60e755ad698e53cf47dbb22b2048a75))
* ユーザーログイン機能を実装 (003-3) ([dea1e71](https://github.com/konabe/classical-music-lake/commit/dea1e7126a48bcd846fc26a231d8d2a6fafc0a0c))
* ユーザー認証機能の設計・要件定義ドキュメント追加 ([#123](https://github.com/konabe/classical-music-lake/issues/123)) ([a175eec](https://github.com/konabe/classical-music-lake/commit/a175eec55091fbe128dc7087d41686fe26715d1b))
* ログ収集を整備（チェックリスト10.1） ([8d825e8](https://github.com/konabe/classical-music-lake/commit/8d825e86dcf4e462954aa2b707d397126aa3b707))
* ワーク1 楽曲一覧 ([1d0198f](https://github.com/konabe/classical-music-lake/commit/1d0198fcd6d6a8b048ccacff07b3c4a588c29844))
* ワーク1 楽曲一覧の実装 ([1e141cc](https://github.com/konabe/classical-music-lake/commit/1e141cc4cb3dff6b5f0a5160df54b9457fefb2af))
* ワーク2 楽曲登録の実装 ([92be6bf](https://github.com/konabe/classical-music-lake/commit/92be6bf820189cffd3d43cb14e24e8fe0c1b17d2))
* ワーク4 楽曲削除の実装 ([e6ed915](https://github.com/konabe/classical-music-lake/commit/e6ed915417f3d921b779e90f7b75d3df2ea4573e))
* ワーク5 鑑賞ログ連携（楽曲マスタからの自動入力） ([b9eaa76](https://github.com/konabe/classical-music-lake/commit/b9eaa7694bdcc77fa0c57eb9ea875c63980e7adf))
* ワーク5 鑑賞ログ連携（楽曲マスタからの自動入力） ([91a3afc](https://github.com/konabe/classical-music-lake/commit/91a3afca67c5ec8be32511006ea7eab3d8cc5540))
* 作曲家・指揮者フィールドを削除 ([302ccb5](https://github.com/konabe/classical-music-lake/commit/302ccb5696c4e0c3c69d46cd9439eb302c98b6b8))
* 型定義の充実・共通型の整合（チェックリスト6.2） ([43c32f3](https://github.com/konabe/classical-music-lake/commit/43c32f3adcd490137ae3d7109947e872dbac53da))
* 型定義の充実・共通型の整合（チェックリスト6.2） ([a127892](https://github.com/konabe/classical-music-lake/commit/a127892ae75d201a115fd923713b56525785c359))
* 楽曲削除機能の実装 ([0227584](https://github.com/konabe/classical-music-lake/commit/02275844eb58d46c9641c93d3d8e32408c187f4f))
* 楽曲編集機能を実装（GET/PUT /pieces/{id}） ([0f8ef96](https://github.com/konabe/classical-music-lake/commit/0f8ef961c7ea27ba4923c92b2603c9ef9643f322))
* 楽曲編集機能を実装（GET/PUT /pieces/{id}） ([a220c38](https://github.com/konabe/classical-music-lake/commit/a220c3897ab8a852c163f43863f0a9e336e8b4ad))
* 監視・アラートとデータ管理を整備（チェックリスト10.2〜11.3） ([415ad53](https://github.com/konabe/classical-music-lake/commit/415ad536625f41fda31492747661917133ff8f77))
* 視聴ログ API に認証保護を追加 (003-5) ([21568f2](https://github.com/konabe/classical-music-lake/commit/21568f216e7b541c42c6a07df696089465265e04))
* 視聴ログ API に認証保護を追加 (003-5) ([5ba099f](https://github.com/konabe/classical-music-lake/commit/5ba099f8e5b1412013b3132b576823b935d48fa4))
* 静的解析の強化（チェックリスト6.1） ([1f892e9](https://github.com/konabe/classical-music-lake/commit/1f892e97ae2fda4da2a1b3bf0b59d237b6e6c098))
* 静的解析の強化（チェックリスト6.1） ([77c1b08](https://github.com/konabe/classical-music-lake/commit/77c1b08431b556a0b2d96085ac348c25106c9a32))


### Bug Fixes

* .btn-secondary に cursor: pointer と border: none を追加し他ボタンと統一 ([91fb158](https://github.com/konabe/classical-music-lake/commit/91fb158ee1abd547745ffe8e25f88c17fb1c0f07))
* accessToken の存在チェックを追加してフォルス認証状態を防止 ([f5f9dd9](https://github.com/konabe/classical-music-lake/commit/f5f9dd9c481114eb4c288dd5ac8cac5e95206f16))
* add auth/login Lambda and API Gateway route to CDK stack ([61a868f](https://github.com/konabe/classical-music-lake/commit/61a868fb715eff33abfbd2d2aad248a97076c340))
* add auth/login Lambda and API Gateway route to CDK stack ([05e21aa](https://github.com/konabe/classical-music-lake/commit/05e21aac1c0461f7e419af263eaae2b6b3abedf3))
* add role validation and CORS_ALLOW_ORIGIN for auth lambdas, remove unused authorizer ([d8be4a7](https://github.com/konabe/classical-music-lake/commit/d8be4a790049fcdbba6e15c558e19b7e7d1318f0))
* address code review findings ([a01be5a](https://github.com/konabe/classical-music-lake/commit/a01be5ad701db7bdb50e6b2e0d26be5ce40d83af))
* address coderabbit review comments on PR [#94](https://github.com/konabe/classical-music-lake/issues/94) ([f082d24](https://github.com/konabe/classical-music-lake/commit/f082d24ad720624f833358047811c41bf2fb97d4))
* api gateway アクセスログ用 cloudwatch ロールをアカウントに設定 ([f2f0da9](https://github.com/konabe/classical-music-lake/commit/f2f0da9ef0c3eaa2169717e679352314417662f3))
* api gateway アクセスログ用 cloudwatch ロールを設定 ([a5aa1be](https://github.com/konabe/classical-music-lake/commit/a5aa1be0cb139ef4f2383089eb173da00c5b1776))
* auth register API URL construction ([16ebc13](https://github.com/konabe/classical-music-lake/commit/16ebc1354bb49c8d8683e815bdd7632fcd82f201))
* bootstrap 前に ecr リポジトリを再作成しデプロイを修正 ([c574a92](https://github.com/konabe/classical-music-lake/commit/c574a92c45b4a2eedb132a0670a6c8b898231e71))
* bootstrap 前に ecr リポジトリを再作成するステップを追加 ([aaeacf0](https://github.com/konabe/classical-music-lake/commit/aaeacf0099d3cee9ce5d8b4eecc0b81d5c4bc55e))
* cdk bootstrap を ci に追加し deprecated api を修正 ([5828767](https://github.com/konabe/classical-music-lake/commit/582876713945247c63d656584bc6bbcbc36fd65a))
* cdk bootstrap を ci に追加しデプロイエラーを修正 ([81caa47](https://github.com/konabe/classical-music-lake/commit/81caa47278d1602996c2ecfee338595f5f202097))
* CDK Bootstrapをデプロイワークフローから削除し、env変数名を修正 ([1d4871d](https://github.com/konabe/classical-music-lake/commit/1d4871d67e991f0d1f94dc120a0baeaf30e945f1))
* CI でバックエンド依存関係をインストールするステップを追加 ([634e3f0](https://github.com/konabe/classical-music-lake/commit/634e3f0a28f801cc5a88374a280026b9520a0ddc))
* cloudwatch alarm metrics exceed aws limit ([47b7973](https://github.com/konabe/classical-music-lake/commit/47b79736d0baacdedd6eda61417f4071dbc2eba6))
* CodeRabbitのレビューコメントに対応 ([0a3af9c](https://github.com/konabe/classical-music-lake/commit/0a3af9c5bc79ec3fee475b92a79d08b96e29d9fd))
* coderabbitレビューコメントへの対応（PR [#162](https://github.com/konabe/classical-music-lake/issues/162)） ([df3f042](https://github.com/konabe/classical-music-lake/commit/df3f0425065808ed49a6cfff1b175fbaf52521ad))
* coderabbitレビューコメントへの対応（PR [#23](https://github.com/konabe/classical-music-lake/issues/23)） ([bfb1cb7](https://github.com/konabe/classical-music-lake/commit/bfb1cb7f7542de0cb0fa36ad71087591cf296a7f))
* coderabbitレビューコメントへの対応（PR [#26](https://github.com/konabe/classical-music-lake/issues/26)） ([9e9d348](https://github.com/konabe/classical-music-lake/commit/9e9d3484833966591db02a55ea12dc0a058d5ccd))
* coderabbitレビューコメントへの対応（PR [#28](https://github.com/konabe/classical-music-lake/issues/28)） ([3cca3ae](https://github.com/konabe/classical-music-lake/commit/3cca3ae34602bb556d1a32a684b1d1ff9f2d8f22))
* coderabbitレビューコメントへの対応（PR [#47](https://github.com/konabe/classical-music-lake/issues/47) 第2弾） ([3383b01](https://github.com/konabe/classical-music-lake/commit/3383b01fb00cc954c12abd788873d8ad19979fa6))
* coderabbitレビューコメントへの対応（PR [#47](https://github.com/konabe/classical-music-lake/issues/47)） ([6f5f681](https://github.com/konabe/classical-music-lake/commit/6f5f681e73d6fb897aedecdc161e5574ddb6ca27))
* coderabbitレビューコメントへの対応（PR [#49](https://github.com/konabe/classical-music-lake/issues/49)） ([0b601fe](https://github.com/konabe/classical-music-lake/commit/0b601fea49ff99d5378a738338335be5dfce2088))
* coderabbitレビューコメントへの対応（PR [#7](https://github.com/konabe/classical-music-lake/issues/7) 第2弾） ([977f051](https://github.com/konabe/classical-music-lake/commit/977f051b72aa4b49f60af858439ee47a19d5566f))
* coderabbitレビューコメントへの対応（PR [#7](https://github.com/konabe/classical-music-lake/issues/7) 第3弾） ([57fea10](https://github.com/konabe/classical-music-lake/commit/57fea109f7931237173fd4e03ae31f07c5cc109e))
* coderabbitレビューコメントへの対応（PR [#7](https://github.com/konabe/classical-music-lake/issues/7)） ([2140689](https://github.com/konabe/classical-music-lake/commit/2140689f56294698cb6c68ae229d4b03f4b896aa))
* coderabbitレビューコメントへの対応（PR [#75](https://github.com/konabe/classical-music-lake/issues/75)） ([28d1dc7](https://github.com/konabe/classical-music-lake/commit/28d1dc70a5fff793155c181d9a5ddaa5b58ca2ad))
* correct Cognito SDK v3 client name and add missing dependency ([f632903](https://github.com/konabe/classical-music-lake/commit/f63290383638c7f89501434483833a69b9f93d4f))
* correct Cognito SDK v3 client name and add missing dependency ([d3f1bb0](https://github.com/konabe/classical-music-lake/commit/d3f1bb0b930bd4b7e1d02cb604543a1a0caa0dc0))
* cors オリジンを cloudfront URL に限定（チェックリスト7.1） ([d6702cc](https://github.com/konabe/classical-music-lake/commit/d6702ccaf2b3bd9810e124ab20f2150f5ba14797))
* Create入力の実体バリデーション強化（issue [#22](https://github.com/konabe/classical-music-lake/issues/22)） ([3d2627f](https://github.com/konabe/classical-music-lake/commit/3d2627f025319197e4a53d85d2373aca64c00d37))
* deploy ワークフローに Storybook ビルドステップを追加 ([5307123](https://github.com/konabe/classical-music-lake/commit/530712311ede7a70a8fd057fb2e6bcc272547068))
* Deploy ワークフローの TypeScript エラーを修正 ([3774d4e](https://github.com/konabe/classical-music-lake/commit/3774d4e7892f5b03539dca83e064d1a8fadff290))
* deployワークフローにconcurrencyを追加して同時デプロイを防止 ([ab88d60](https://github.com/konabe/classical-music-lake/commit/ab88d603090baff3637c1e52cf448dd66af06191))
* deployワークフローにconcurrencyを追加して同時デプロイを防止 ([f468423](https://github.com/konabe/classical-music-lake/commit/f468423818a2c6131f7b57684ea60e4a3398c529))
* eslint-plugin-storybook を flat config に正しく追加 ([88710a7](https://github.com/konabe/classical-music-lake/commit/88710a715be6c6bdc753c64c17384b8dbb72f5eb))
* feature/piece-create とのコンフリクトを解消 ([3e5379e](https://github.com/konabe/classical-music-lake/commit/3e5379e3cdc9bea8a34bf17ee45195f539539a35))
* fix AWS SDK v3 import and useApiBase missing import ([d12428d](https://github.com/konabe/classical-music-lake/commit/d12428df751652f6d0e4f122e1ae7b68e8004f64))
* fix AWS SDK v3 import and useApiBase missing import ([1318800](https://github.com/konabe/classical-music-lake/commit/1318800264e0b1a524309b00c8ea6ba12600ff3d))
* GitHub Actions のアクションバージョンを v6 から v4 に修正 ([ab36295](https://github.com/konabe/classical-music-lake/commit/ab362959b91024fccef4ee02443c8475eb29230e))
* GitHub Actions のアクションバージョンを v6 から v4 に修正 ([044efdd](https://github.com/konabe/classical-music-lake/commit/044efdd843164b0820cdb7c2ff4e91aaf1950639))
* GitHub Actionsのアクションバージョンをv6からv4に修正 ([4166b3e](https://github.com/konabe/classical-music-lake/commit/4166b3ecf42bf627608221eb49d091d6a8f76cc4))
* GitHub OIDC + IAM AssumeRole によるキーレス認証に移行 (issue [#9](https://github.com/konabe/classical-music-lake/issues/9)) ([eb38b8a](https://github.com/konabe/classical-music-lake/commit/eb38b8a8eede5388fba8780bf42dea7725b80cf1))
* isLoading時の重複リクエストを防止（VerifyEmailForm） ([9d99e34](https://github.com/konabe/classical-music-lake/commit/9d99e34a1a60ce5c5b333464f57993bfce806bac))
* legacy-peer-deps を .npmrc に追加して CI のインストールエラーを解消 ([95edc12](https://github.com/konabe/classical-music-lake/commit/95edc128f657e16bf8d62777900e0e071e0393ba))
* move auth pages and composables to app directory ([462013a](https://github.com/konabe/classical-music-lake/commit/462013a61da86ea3cb556358162e6938c7c827e9))
* move auth pages and composables to app directory ([486aa6f](https://github.com/konabe/classical-music-lake/commit/486aa6f96659a4ce4fbca8c6e58fa55e88c9cc9c))
* NodejsFunction の addToPrincipalPolicy を addToRolePolicy に修正 ([ff51836](https://github.com/konabe/classical-music-lake/commit/ff5183625e60d76433880021752ac0f585e3aa13))
* npm install --prefix による不要ディレクトリ生成を防ぐためサブシェルに変更 ([825a06c](https://github.com/konabe/classical-music-lake/commit/825a06ca584c0d982810f86b4eb93446da19b42d))
* parsing.test.ts の Prettier フォーマット違反を修正 ([3fee8a0](https://github.com/konabe/classical-music-lake/commit/3fee8a0bd01bcdd494a0a3cd2327d3b9386e8bc5))
* parsing.tsのzodインポートをimport typeに変更 ([044d249](https://github.com/konabe/classical-music-lake/commit/044d249b1880214149789b7f3d50448025cfd549))
* performer を削除し composer を復元 ([a28b59b](https://github.com/konabe/classical-music-lake/commit/a28b59bd25b20bcb4169d263d3fffdcf5f5b1e4e))
* pieceList のエラー表示を emptyState から errorMessage に分離 ([146a8ea](https://github.com/konabe/classical-music-lake/commit/146a8ea8d03b1be21cb65c2bf046a3d302531f4e))
* PR レビュー対応 - シークレット検証・OIDC 信頼ポリシー詳細化・Prettier 整形 ([fee6a6b](https://github.com/konabe/classical-music-lake/commit/fee6a6b8332ceebfbe033006b9a5cf82a07b29ed))
* PR[#5](https://github.com/konabe/classical-music-lake/issues/5)レビューコメント修正 - SPEC.mdのDYNAMO_TABLE_CONCERTSを削除 ([cb2c1ca](https://github.com/konabe/classical-music-lake/commit/cb2c1caacaf1b1e3c893a3bd3b100f876b1848da))
* PRレビュー指摘を修正（get/update/edit.vue） ([5ad8571](https://github.com/konabe/classical-music-lake/commit/5ad85711be064752076595bca99f7072bb46c725))
* rating のランタイムバリデーションを追加（coderabbit対応） ([0c2c497](https://github.com/konabe/classical-music-lake/commit/0c2c497032d17d835736192852086f29bdb5a118))
* ratingSelector の星ボタンに aria-label と aria-pressed を追加 ([b8290de](https://github.com/konabe/classical-music-lake/commit/b8290deb563a97845e362616f0473f7784314396))
* regenerate package-lock.json for Nuxt 4 ([f031c8e](https://github.com/konabe/classical-music-lake/commit/f031c8e7127f7667fb0e96bbf4e0808dc3f9bb6b))
* remove auth Lambda references from CDK until implementation ([4fcda5a](https://github.com/konabe/classical-music-lake/commit/4fcda5a3168c633df202a9cfced366213dda6e7c))
* remove read-only email_verified attribute from cognito signup ([3b4fc4c](https://github.com/konabe/classical-music-lake/commit/3b4fc4ceca373b59956eff5a4f5d8c702152fb4c))
* remove read-only email_verified attribute from cognito signup ([c702a7c](https://github.com/konabe/classical-music-lake/commit/c702a7c17fb827815506a89b81eb6923a8c1d342))
* remove trailing slash in useApiBase to prevent double slashes ([05fa2c9](https://github.com/konabe/classical-music-lake/commit/05fa2c976438be6d753b86c2d8d1df6b48ad772a))
* schemas.tsのPrettierフォーマットを修正 ([2f61d77](https://github.com/konabe/classical-music-lake/commit/2f61d774db21ce3e1c7d3d6c4c35dafaab2148bf))
* **security:** fix npm audit vulnerability in flatted ([32d58e9](https://github.com/konabe/classical-music-lake/commit/32d58e92c89a7165447af13d4eea05ef315b3cff))
* **security:** pin fast-xml-parser override to exact version 5.5.6 ([f7c35ac](https://github.com/konabe/classical-music-lake/commit/f7c35ac3a9c83b40fc5fad80477a65ff657e7560))
* **security:** pin fast-xml-parser to 5.5.6 via overrides to fix CVE-2026-26278 ([17cc1e6](https://github.com/konabe/classical-music-lake/commit/17cc1e6da74dff69ef8e96cfdab5096ffd197cde))
* settings.jsonのマージ、slash commandの作成、releaseパイプラインのエラー修正 ([ca8fedd](https://github.com/konabe/classical-music-lake/commit/ca8feddd3525da59df72ef401cf1dae37f46e5dc))
* simplify auth register API URL construction ([15b0b07](https://github.com/konabe/classical-music-lake/commit/15b0b07f647e9a03ce35ffb7d399596e890b0062))
* SPEC.mdからDYNAMO_TABLE_CONCERTSの記述を削除 ([3fad92c](https://github.com/konabe/classical-music-lake/commit/3fad92c299cc2a661867d1f0650b6502a301d56d))
* storybook デプロイ後に SPA デプロイでファイルが削除される問題を修正 ([5dd7741](https://github.com/konabe/classical-music-lake/commit/5dd77410023779843eb98bd1c4c882df55f2e48e))
* storybook の CloudFront behavior をキャッシュ無効に変更 ([57b7995](https://github.com/konabe/classical-music-lake/commit/57b7995baeb6e5f9e4ecd1aebcdbcddf069fa75e))
* storybook の iframe プレビューが X-Frame-Options: DENY でブロックされる問題を修正 ([420f76f](https://github.com/konabe/classical-music-lake/commit/420f76f029c8d87d6f85fb5c4459f6f66f324571))
* storybook の iframe プレビューをブロックする x-frame-options: deny を除外 ([f3a61e2](https://github.com/konabe/classical-music-lake/commit/f3a61e2f2a91551417531e37f70dc1a523c28d77))
* storybook ヘッダーポリシーに frame-ancestors 'self' の CSP を追加 ([09f4e12](https://github.com/konabe/classical-music-lake/commit/09f4e120885830b9e69b88dd1984001c39dcfb8f))
* storybookDeployment が spaDeployment の後に実行されるよう依存関係を追加 ([b27f058](https://github.com/konabe/classical-music-lake/commit/b27f05805eb4b8f57e4055ea5cad0a509bbb356c))
* temporarily remove auth Lambda functions from CDK until implementation ([1f5d097](https://github.com/konabe/classical-music-lake/commit/1f5d0971f04ea6b1d479f84f56db0a8e4939d90d))
* typescript エラーを修正（mockCallback 型・middleware 型キャスト・performer フィールド削除） ([b480615](https://github.com/konabe/classical-music-lake/commit/b4806158881a56ec36780ea2772c963892a24233))
* update Cognito error handling to use AWS SDK v3 error shape ([f21a75b](https://github.com/konabe/classical-music-lake/commit/f21a75b2c4d8a6c622eed1062a5f88c3be1ed22d))
* update useAuth import path in test file ([1a7ed68](https://github.com/konabe/classical-music-lake/commit/1a7ed68686fa6f5cb4d473306cf7348e5014b315))
* use useApiBase and consistent URL pattern in useAuth ([c4a7892](https://github.com/konabe/classical-music-lake/commit/c4a7892a64d4c0161dd803e5169935513c5a9018))
* useListeningLogs のエラーハンドリングを改善 ([8be0324](https://github.com/konabe/classical-music-lake/commit/8be03245bf37871d4bcd47cf297edeb303834208))
* usePieces の await を削除しフォームを即時レンダリング可能にする ([050c79b](https://github.com/konabe/classical-music-lake/commit/050c79b449e83812e849eae42a99409fd0eef36d))
* vitest.d.ts の ESLint エラーを抑制 ([933e588](https://github.com/konabe/classical-music-lake/commit/933e5888ba6062d566ebfc10416bd36e9c0f29ea))
* vitest.d.ts の no-empty-object-type のみをファイル単位で off に変更 ([9a64452](https://github.com/konabe/classical-music-lake/commit/9a64452eecfda27469cca56aa6c5e1b5e61bf2c7))
* スキーマバリデーションの厳密化 ([c927daa](https://github.com/konabe/classical-music-lake/commit/c927daab7fba2babe0a045c0452c77557f02dc35))
* フロントエンドテストとセキュリティスキャンの失敗を修正 ([eef988c](https://github.com/konabe/classical-music-lake/commit/eef988cd0c957ccec5917699d06aee03328ed978))
* フロントエンドの脆弱性パッケージを修正（npm audit fix） ([9ec5920](https://github.com/konabe/classical-music-lake/commit/9ec59207880441643457b62f3ea9bd56735def75))
* フロントエンド依存関係の脆弱性を修正（svgo, tar） ([11afba6](https://github.com/konabe/classical-music-lake/commit/11afba6fe088e594ed256bd46bdea6e33defa5d9))
* ロールバック後の孤立ロググループによるデプロイ失敗を修正 ([84a7e07](https://github.com/konabe/classical-music-lake/commit/84a7e07d84ce559f8b2ee6fed7e69cb0975bffa3))
* 孤立ロググループによるデプロイ失敗を修正 ([5b2161e](https://github.com/konabe/classical-music-lake/commit/5b2161ee57ba1adbf27c6b7231a74925ff9a5467))


### Reverts

* login.vue の実装変更を取り消し（設計書のみ変更すべきだった） ([8da9863](https://github.com/konabe/classical-music-lake/commit/8da9863d30ffe5227b115f51a86934763cca121d))

## [0.1.20](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v0.1.19...classical-music-lake-v0.1.20) (2026-03-22)


### Features

* 004-001 認証コード入力画面・登録後の自動遷移を実装 ([67f0f66](https://github.com/konabe/classical-music-lake/commit/67f0f6627d40ca0116c80b2999962ba23731fb72))
* rebrand to Nocturne ([9eb446b](https://github.com/konabe/classical-music-lake/commit/9eb446b95269d1f11482bffd096c7cd43fb4d2ef))
* ヘッダーに未ログイン/ログイン済み時の導線を追加（005-001/005-002） ([dc3fcf3](https://github.com/konabe/classical-music-lake/commit/dc3fcf3b3d70c8b5229f58a4ca97a11b0bcdafc8))
* ヘッダーに未ログイン時の新規登録・ログインリンクを追加（005-001/005-002） ([f8e2f83](https://github.com/konabe/classical-music-lake/commit/f8e2f8316fcbbebfbc9988a0b1e8e58ff48581fb))
* メール未確認ユーザーのログイン時に verify-email へリダイレクト ([71b5911](https://github.com/konabe/classical-music-lake/commit/71b5911ae7690f693420c1ef44405919e7db4ee8))


### Bug Fixes

* coderabbitレビューコメントへの対応（PR [#162](https://github.com/konabe/classical-music-lake/issues/162)） ([df3f042](https://github.com/konabe/classical-music-lake/commit/df3f0425065808ed49a6cfff1b175fbaf52521ad))
* isLoading時の重複リクエストを防止（VerifyEmailForm） ([9d99e34](https://github.com/konabe/classical-music-lake/commit/9d99e34a1a60ce5c5b333464f57993bfce806bac))
* npm install --prefix による不要ディレクトリ生成を防ぐためサブシェルに変更 ([825a06c](https://github.com/konabe/classical-music-lake/commit/825a06ca584c0d982810f86b4eb93446da19b42d))


### Reverts

* login.vue の実装変更を取り消し（設計書のみ変更すべきだった） ([8da9863](https://github.com/konabe/classical-music-lake/commit/8da9863d30ffe5227b115f51a86934763cca121d))

## [0.1.19](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v0.1.18...classical-music-lake-v0.1.19) (2026-03-21)


### Features

* **003-2:** implement user registration with Cognito ([f517a3b](https://github.com/konabe/classical-music-lake/commit/f517a3b606c0ab7ec1fa40247b5c02442198e7b9))
* atomic design の layouts 層を導入 ([2d3f9c0](https://github.com/konabe/classical-music-lake/commit/2d3f9c0d06c4ea44e82cfa2772834b33634b898a))
* atomic design の layouts 層を導入し app.vue から抽出 ([2767016](https://github.com/konabe/classical-music-lake/commit/2767016ec3a3aa30928b6e01f859bf2334675131))
* atomic design の organisms 層を導入 ([96410cb](https://github.com/konabe/classical-music-lake/commit/96410cb4632be90cdfefb5182c5fc605b9818535))
* atomic design の organisms 層を導入し templates から抽出 ([949dbdb](https://github.com/konabe/classical-music-lake/commit/949dbdb8797f051fa7425385fa73c03dae4fb909))
* atomic design の templates 層を導入 ([7a0aba3](https://github.com/konabe/classical-music-lake/commit/7a0aba30b6766f359cc1f390fae9a6cdefa74793))
* atomic design の templates 層を導入し全ページから抽出 ([eb8770e](https://github.com/konabe/classical-music-lake/commit/eb8770e5887fa986d801ef8ce3d46e2797bd0516))
* atomic design の templates 層導入と Storybook 公開 ([be13fee](https://github.com/konabe/classical-music-lake/commit/be13fee0edf27dbb3cb3eeef4680f4fdc50ca0aa))
* molecules 層を導入（RatingDisplay・FavoriteIndicator・RatingSelector） ([8f7039f](https://github.com/konabe/classical-music-lake/commit/8f7039f21a0be1633ede121d531af77a0572e5ee))
* molecules 層を導入し ratingDisplay・favoriteIndicator・ratingSelector を抽出 ([cd041f5](https://github.com/konabe/classical-music-lake/commit/cd041f5f081009683318a497a50c328a709f4161))
* setup AWS Cognito User Pool and App Client ([17a0ef0](https://github.com/konabe/classical-music-lake/commit/17a0ef0b54556ef13176f7912e4c1ebccb75abf7))
* setup AWS Cognito User Pool and App Client ([fc43559](https://github.com/konabe/classical-music-lake/commit/fc43559731bf2d8c70606b09b03cbdcafaeeffa2))
* setup AWS Cognito User Pool and App Client for user authentication ([50ad995](https://github.com/konabe/classical-music-lake/commit/50ad995e1acaf91e1723d43b47df319ebf417e56))
* storybook 静的ファイルを S3+CloudFront の /storybook/ で公開 ([54f197e](https://github.com/konabe/classical-music-lake/commit/54f197e8a88322c9e8647d8b1b7bd7e404775ecf))
* templates 層の Storybook stories を追加 ([e6179a8](https://github.com/konabe/classical-music-lake/commit/e6179a8c29b365dc48cd2cf3a7132d15a2686287))
* トップページの admin-links に Storybook リンクを追加 ([8585141](https://github.com/konabe/classical-music-lake/commit/85851413e6f36492aba4a53e6b8733aef56aced3))
* ユーザーログアウト機能を実装 (003-4) ([2876667](https://github.com/konabe/classical-music-lake/commit/2876667e7eaba4680a155b7b8902bb3fbdaa4c06))
* ユーザーログアウト機能を実装 (003-4) ([5488026](https://github.com/konabe/classical-music-lake/commit/5488026ae690d3c366c09842d5127d9a386d106a))
* ユーザーログイン機能を実装 (003-3) ([e69fb3f](https://github.com/konabe/classical-music-lake/commit/e69fb3f5e60e755ad698e53cf47dbb22b2048a75))
* ユーザーログイン機能を実装 (003-3) ([dea1e71](https://github.com/konabe/classical-music-lake/commit/dea1e7126a48bcd846fc26a231d8d2a6fafc0a0c))
* 視聴ログ API に認証保護を追加 (003-5) ([21568f2](https://github.com/konabe/classical-music-lake/commit/21568f216e7b541c42c6a07df696089465265e04))
* 視聴ログ API に認証保護を追加 (003-5) ([5ba099f](https://github.com/konabe/classical-music-lake/commit/5ba099f8e5b1412013b3132b576823b935d48fa4))


### Bug Fixes

* accessToken の存在チェックを追加してフォルス認証状態を防止 ([f5f9dd9](https://github.com/konabe/classical-music-lake/commit/f5f9dd9c481114eb4c288dd5ac8cac5e95206f16))
* add auth/login Lambda and API Gateway route to CDK stack ([61a868f](https://github.com/konabe/classical-music-lake/commit/61a868fb715eff33abfbd2d2aad248a97076c340))
* add auth/login Lambda and API Gateway route to CDK stack ([05e21aa](https://github.com/konabe/classical-music-lake/commit/05e21aac1c0461f7e419af263eaae2b6b3abedf3))
* add role validation and CORS_ALLOW_ORIGIN for auth lambdas, remove unused authorizer ([d8be4a7](https://github.com/konabe/classical-music-lake/commit/d8be4a790049fcdbba6e15c558e19b7e7d1318f0))
* auth register API URL construction ([16ebc13](https://github.com/konabe/classical-music-lake/commit/16ebc1354bb49c8d8683e815bdd7632fcd82f201))
* cloudwatch alarm metrics exceed aws limit ([47b7973](https://github.com/konabe/classical-music-lake/commit/47b79736d0baacdedd6eda61417f4071dbc2eba6))
* correct Cognito SDK v3 client name and add missing dependency ([f632903](https://github.com/konabe/classical-music-lake/commit/f63290383638c7f89501434483833a69b9f93d4f))
* correct Cognito SDK v3 client name and add missing dependency ([d3f1bb0](https://github.com/konabe/classical-music-lake/commit/d3f1bb0b930bd4b7e1d02cb604543a1a0caa0dc0))
* deploy ワークフローに Storybook ビルドステップを追加 ([5307123](https://github.com/konabe/classical-music-lake/commit/530712311ede7a70a8fd057fb2e6bcc272547068))
* Deploy ワークフローの TypeScript エラーを修正 ([3774d4e](https://github.com/konabe/classical-music-lake/commit/3774d4e7892f5b03539dca83e064d1a8fadff290))
* eslint-plugin-storybook を flat config に正しく追加 ([88710a7](https://github.com/konabe/classical-music-lake/commit/88710a715be6c6bdc753c64c17384b8dbb72f5eb))
* fix AWS SDK v3 import and useApiBase missing import ([d12428d](https://github.com/konabe/classical-music-lake/commit/d12428df751652f6d0e4f122e1ae7b68e8004f64))
* fix AWS SDK v3 import and useApiBase missing import ([1318800](https://github.com/konabe/classical-music-lake/commit/1318800264e0b1a524309b00c8ea6ba12600ff3d))
* legacy-peer-deps を .npmrc に追加して CI のインストールエラーを解消 ([95edc12](https://github.com/konabe/classical-music-lake/commit/95edc128f657e16bf8d62777900e0e071e0393ba))
* move auth pages and composables to app directory ([462013a](https://github.com/konabe/classical-music-lake/commit/462013a61da86ea3cb556358162e6938c7c827e9))
* move auth pages and composables to app directory ([486aa6f](https://github.com/konabe/classical-music-lake/commit/486aa6f96659a4ce4fbca8c6e58fa55e88c9cc9c))
* NodejsFunction の addToPrincipalPolicy を addToRolePolicy に修正 ([ff51836](https://github.com/konabe/classical-music-lake/commit/ff5183625e60d76433880021752ac0f585e3aa13))
* ratingSelector の星ボタンに aria-label と aria-pressed を追加 ([b8290de](https://github.com/konabe/classical-music-lake/commit/b8290deb563a97845e362616f0473f7784314396))
* remove auth Lambda references from CDK until implementation ([4fcda5a](https://github.com/konabe/classical-music-lake/commit/4fcda5a3168c633df202a9cfced366213dda6e7c))
* remove read-only email_verified attribute from cognito signup ([3b4fc4c](https://github.com/konabe/classical-music-lake/commit/3b4fc4ceca373b59956eff5a4f5d8c702152fb4c))
* remove read-only email_verified attribute from cognito signup ([c702a7c](https://github.com/konabe/classical-music-lake/commit/c702a7c17fb827815506a89b81eb6923a8c1d342))
* remove trailing slash in useApiBase to prevent double slashes ([05fa2c9](https://github.com/konabe/classical-music-lake/commit/05fa2c976438be6d753b86c2d8d1df6b48ad772a))
* **security:** fix npm audit vulnerability in flatted ([32d58e9](https://github.com/konabe/classical-music-lake/commit/32d58e92c89a7165447af13d4eea05ef315b3cff))
* simplify auth register API URL construction ([15b0b07](https://github.com/konabe/classical-music-lake/commit/15b0b07f647e9a03ce35ffb7d399596e890b0062))
* storybook デプロイ後に SPA デプロイでファイルが削除される問題を修正 ([5dd7741](https://github.com/konabe/classical-music-lake/commit/5dd77410023779843eb98bd1c4c882df55f2e48e))
* storybook の CloudFront behavior をキャッシュ無効に変更 ([57b7995](https://github.com/konabe/classical-music-lake/commit/57b7995baeb6e5f9e4ecd1aebcdbcddf069fa75e))
* storybook の iframe プレビューが X-Frame-Options: DENY でブロックされる問題を修正 ([420f76f](https://github.com/konabe/classical-music-lake/commit/420f76f029c8d87d6f85fb5c4459f6f66f324571))
* storybook の iframe プレビューをブロックする x-frame-options: deny を除外 ([f3a61e2](https://github.com/konabe/classical-music-lake/commit/f3a61e2f2a91551417531e37f70dc1a523c28d77))
* storybook ヘッダーポリシーに frame-ancestors 'self' の CSP を追加 ([09f4e12](https://github.com/konabe/classical-music-lake/commit/09f4e120885830b9e69b88dd1984001c39dcfb8f))
* storybookDeployment が spaDeployment の後に実行されるよう依存関係を追加 ([b27f058](https://github.com/konabe/classical-music-lake/commit/b27f05805eb4b8f57e4055ea5cad0a509bbb356c))
* temporarily remove auth Lambda functions from CDK until implementation ([1f5d097](https://github.com/konabe/classical-music-lake/commit/1f5d0971f04ea6b1d479f84f56db0a8e4939d90d))
* update Cognito error handling to use AWS SDK v3 error shape ([f21a75b](https://github.com/konabe/classical-music-lake/commit/f21a75b2c4d8a6c622eed1062a5f88c3be1ed22d))
* update useAuth import path in test file ([1a7ed68](https://github.com/konabe/classical-music-lake/commit/1a7ed68686fa6f5cb4d473306cf7348e5014b315))
* use useApiBase and consistent URL pattern in useAuth ([c4a7892](https://github.com/konabe/classical-music-lake/commit/c4a7892a64d4c0161dd803e5169935513c5a9018))
* useListeningLogs のエラーハンドリングを改善 ([8be0324](https://github.com/konabe/classical-music-lake/commit/8be03245bf37871d4bcd47cf297edeb303834208))

## [0.1.18](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v0.1.17...classical-music-lake-v0.1.18) (2026-03-19)


### Features

* Zodを使ってリクエストボディのパース処理にバリデーションを統合 (issue [#88](https://github.com/konabe/classical-music-lake/issues/88)) ([63f770a](https://github.com/konabe/classical-music-lake/commit/63f770a5f8f2c33d73b8849d1c24807979af9143))
* Zodを使ってリクエストボディのパース処理にバリデーションを統合 (issue [#88](https://github.com/konabe/classical-music-lake/issues/88)) ([f6496b1](https://github.com/konabe/classical-music-lake/commit/f6496b1da2a6d1ea493e11bd4d53b2427a9c8315))
* ユーザー認証機能の設計・要件定義ドキュメント追加 ([#123](https://github.com/konabe/classical-music-lake/issues/123)) ([a175eec](https://github.com/konabe/classical-music-lake/commit/a175eec55091fbe128dc7087d41686fe26715d1b))


### Bug Fixes

* address code review findings ([a01be5a](https://github.com/konabe/classical-music-lake/commit/a01be5ad701db7bdb50e6b2e0d26be5ce40d83af))
* Create入力の実体バリデーション強化（issue [#22](https://github.com/konabe/classical-music-lake/issues/22)） ([3d2627f](https://github.com/konabe/classical-music-lake/commit/3d2627f025319197e4a53d85d2373aca64c00d37))
* GitHub OIDC + IAM AssumeRole によるキーレス認証に移行 (issue [#9](https://github.com/konabe/classical-music-lake/issues/9)) ([eb38b8a](https://github.com/konabe/classical-music-lake/commit/eb38b8a8eede5388fba8780bf42dea7725b80cf1))
* parsing.tsのzodインポートをimport typeに変更 ([044d249](https://github.com/konabe/classical-music-lake/commit/044d249b1880214149789b7f3d50448025cfd549))
* PR レビュー対応 - シークレット検証・OIDC 信頼ポリシー詳細化・Prettier 整形 ([fee6a6b](https://github.com/konabe/classical-music-lake/commit/fee6a6b8332ceebfbe033006b9a5cf82a07b29ed))
* schemas.tsのPrettierフォーマットを修正 ([2f61d77](https://github.com/konabe/classical-music-lake/commit/2f61d774db21ce3e1c7d3d6c4c35dafaab2148bf))
* **security:** pin fast-xml-parser override to exact version 5.5.6 ([f7c35ac](https://github.com/konabe/classical-music-lake/commit/f7c35ac3a9c83b40fc5fad80477a65ff657e7560))
* **security:** pin fast-xml-parser to 5.5.6 via overrides to fix CVE-2026-26278 ([17cc1e6](https://github.com/konabe/classical-music-lake/commit/17cc1e6da74dff69ef8e96cfdab5096ffd197cde))
* スキーマバリデーションの厳密化 ([c927daa](https://github.com/konabe/classical-music-lake/commit/c927daab7fba2babe0a045c0452c77557f02dc35))

## [0.1.17](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v0.1.16...classical-music-lake-v0.1.17) (2026-03-15)


### Features

* upgrade to Nuxt 4 ([ab000d9](https://github.com/konabe/classical-music-lake/commit/ab000d983ed7f72240c12b37e6ee56d2ef635e16))


### Bug Fixes

* .btn-secondary に cursor: pointer と border: none を追加し他ボタンと統一 ([91fb158](https://github.com/konabe/classical-music-lake/commit/91fb158ee1abd547745ffe8e25f88c17fb1c0f07))
* address coderabbit review comments on PR [#94](https://github.com/konabe/classical-music-lake/issues/94) ([f082d24](https://github.com/konabe/classical-music-lake/commit/f082d24ad720624f833358047811c41bf2fb97d4))
* coderabbitレビューコメントへの対応（PR [#75](https://github.com/konabe/classical-music-lake/issues/75)） ([28d1dc7](https://github.com/konabe/classical-music-lake/commit/28d1dc70a5fff793155c181d9a5ddaa5b58ca2ad))
* GitHub Actions のアクションバージョンを v6 から v4 に修正 ([ab36295](https://github.com/konabe/classical-music-lake/commit/ab362959b91024fccef4ee02443c8475eb29230e))
* GitHub Actions のアクションバージョンを v6 から v4 に修正 ([044efdd](https://github.com/konabe/classical-music-lake/commit/044efdd843164b0820cdb7c2ff4e91aaf1950639))
* parsing.test.ts の Prettier フォーマット違反を修正 ([3fee8a0](https://github.com/konabe/classical-music-lake/commit/3fee8a0bd01bcdd494a0a3cd2327d3b9386e8bc5))
* regenerate package-lock.json for Nuxt 4 ([f031c8e](https://github.com/konabe/classical-music-lake/commit/f031c8e7127f7667fb0e96bbf4e0808dc3f9bb6b))
* フロントエンドの脆弱性パッケージを修正（npm audit fix） ([9ec5920](https://github.com/konabe/classical-music-lake/commit/9ec59207880441643457b62f3ea9bd56735def75))

## [0.1.16](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v0.1.15...classical-music-lake-v0.1.16) (2026-03-10)


### Features

* top画面に管理者向けリンクセクションを追加 ([aeff851](https://github.com/konabe/classical-music-lake/commit/aeff8515d9af2d724fdd88620ea979d72a6a6ed9))
* top画面に管理者向けリンクセクションを追加（楽曲マスタ導線） ([099ada9](https://github.com/konabe/classical-music-lake/commit/099ada999c33a68747a60056bee258ba3e257767))
* TOP画面への管理者向けリンクセクション追加 ([ca94b53](https://github.com/konabe/classical-music-lake/commit/ca94b53e2c75517a928cf39d9f029d936bdf0789))

## [0.1.15](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v0.1.14...classical-music-lake-v0.1.15) (2026-03-09)


### Features

* ワーク5 鑑賞ログ連携（楽曲マスタからの自動入力） ([b9eaa76](https://github.com/konabe/classical-music-lake/commit/b9eaa7694bdcc77fa0c57eb9ea875c63980e7adf))


### Bug Fixes

* usePieces の await を削除しフォームを即時レンダリング可能にする ([050c79b](https://github.com/konabe/classical-music-lake/commit/050c79b449e83812e849eae42a99409fd0eef36d))

## [0.1.14](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v0.1.13...classical-music-lake-v0.1.14) (2026-03-09)


### Bug Fixes

* deployワークフローにconcurrencyを追加して同時デプロイを防止 ([ab88d60](https://github.com/konabe/classical-music-lake/commit/ab88d603090baff3637c1e52cf448dd66af06191))
* deployワークフローにconcurrencyを追加して同時デプロイを防止 ([f468423](https://github.com/konabe/classical-music-lake/commit/f468423818a2c6131f7b57684ea60e4a3398c529))
* GitHub Actionsのアクションバージョンをv6からv4に修正 ([4166b3e](https://github.com/konabe/classical-music-lake/commit/4166b3ecf42bf627608221eb49d091d6a8f76cc4))

## [0.1.13](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v0.1.12...classical-music-lake-v0.1.13) (2026-03-08)


### Features

* ワーク4 楽曲削除の実装 ([e6ed915](https://github.com/konabe/classical-music-lake/commit/e6ed915417f3d921b779e90f7b75d3df2ea4573e))
* 楽曲削除機能の実装 ([0227584](https://github.com/konabe/classical-music-lake/commit/02275844eb58d46c9641c93d3d8e32408c187f4f))


### Bug Fixes

* typescript エラーを修正（mockCallback 型・middleware 型キャスト・performer フィールド削除） ([b480615](https://github.com/konabe/classical-music-lake/commit/b4806158881a56ec36780ea2772c963892a24233))

## [0.1.12](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v0.1.11...classical-music-lake-v0.1.12) (2026-03-08)


### Features

* ワーク2 楽曲登録の実装 ([92be6bf](https://github.com/konabe/classical-music-lake/commit/92be6bf820189cffd3d43cb14e24e8fe0c1b17d2))
* 楽曲編集機能を実装（GET/PUT /pieces/{id}） ([0f8ef96](https://github.com/konabe/classical-music-lake/commit/0f8ef961c7ea27ba4923c92b2603c9ef9643f322))
* 楽曲編集機能を実装（GET/PUT /pieces/{id}） ([a220c38](https://github.com/konabe/classical-music-lake/commit/a220c3897ab8a852c163f43863f0a9e336e8b4ad))


### Bug Fixes

* coderabbitレビューコメントへの対応（PR [#49](https://github.com/konabe/classical-music-lake/issues/49)） ([0b601fe](https://github.com/konabe/classical-music-lake/commit/0b601fea49ff99d5378a738338335be5dfce2088))
* feature/piece-create とのコンフリクトを解消 ([3e5379e](https://github.com/konabe/classical-music-lake/commit/3e5379e3cdc9bea8a34bf17ee45195f539539a35))
* PRレビュー指摘を修正（get/update/edit.vue） ([5ad8571](https://github.com/konabe/classical-music-lake/commit/5ad85711be064752076595bca99f7072bb46c725))
* vitest.d.ts の ESLint エラーを抑制 ([933e588](https://github.com/konabe/classical-music-lake/commit/933e5888ba6062d566ebfc10416bd36e9c0f29ea))
* vitest.d.ts の no-empty-object-type のみをファイル単位で off に変更 ([9a64452](https://github.com/konabe/classical-music-lake/commit/9a64452eecfda27469cca56aa6c5e1b5e61bf2c7))

## [0.1.11](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v0.1.10...classical-music-lake-v0.1.11) (2026-03-07)


### Features

* ワーク1 楽曲一覧 ([1d0198f](https://github.com/konabe/classical-music-lake/commit/1d0198fcd6d6a8b048ccacff07b3c4a588c29844))


### Bug Fixes

* coderabbitレビューコメントへの対応（PR [#47](https://github.com/konabe/classical-music-lake/issues/47) 第2弾） ([3383b01](https://github.com/konabe/classical-music-lake/commit/3383b01fb00cc954c12abd788873d8ad19979fa6))
* coderabbitレビューコメントへの対応（PR [#47](https://github.com/konabe/classical-music-lake/issues/47)） ([6f5f681](https://github.com/konabe/classical-music-lake/commit/6f5f681e73d6fb897aedecdc161e5574ddb6ca27))

## [0.1.10](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v0.1.9...classical-music-lake-v0.1.10) (2026-03-07)


### Bug Fixes

* CI でバックエンド依存関係をインストールするステップを追加 ([634e3f0](https://github.com/konabe/classical-music-lake/commit/634e3f0a28f801cc5a88374a280026b9520a0ddc))

## [0.1.9](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v0.1.8...classical-music-lake-v0.1.9) (2026-03-07)


### Features

* 作曲家・指揮者フィールドを削除 ([302ccb5](https://github.com/konabe/classical-music-lake/commit/302ccb5696c4e0c3c69d46cd9439eb302c98b6b8))


### Bug Fixes

* performer を削除し composer を復元 ([a28b59b](https://github.com/konabe/classical-music-lake/commit/a28b59bd25b20bcb4169d263d3fffdcf5f5b1e4e))

## [0.1.8](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v0.1.7...classical-music-lake-v0.1.8) (2026-03-07)


### Features

* response ヘルパーの CORS・JSON シリアライズを middy に移譲 ([b6c6cd3](https://github.com/konabe/classical-music-lake/commit/b6c6cd3cc6f7f0da7d152e1464fd6852052677b0))
* response ヘルパーの cors・json を middy に移譲（issue [#8](https://github.com/konabe/classical-music-lake/issues/8)） ([e1b1331](https://github.com/konabe/classical-music-lake/commit/e1b1331174c2742f5101d78de0e38aaa5b7b6fe0))

## [0.1.7](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v0.1.6...classical-music-lake-v0.1.7) (2026-03-07)


### Bug Fixes

* api gateway アクセスログ用 cloudwatch ロールをアカウントに設定 ([f2f0da9](https://github.com/konabe/classical-music-lake/commit/f2f0da9ef0c3eaa2169717e679352314417662f3))
* api gateway アクセスログ用 cloudwatch ロールを設定 ([a5aa1be](https://github.com/konabe/classical-music-lake/commit/a5aa1be0cb139ef4f2383089eb173da00c5b1776))
* ロールバック後の孤立ロググループによるデプロイ失敗を修正 ([84a7e07](https://github.com/konabe/classical-music-lake/commit/84a7e07d84ce559f8b2ee6fed7e69cb0975bffa3))
* 孤立ロググループによるデプロイ失敗を修正 ([5b2161e](https://github.com/konabe/classical-music-lake/commit/5b2161ee57ba1adbf27c6b7231a74925ff9a5467))

## [0.1.6](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v0.1.5...classical-music-lake-v0.1.6) (2026-03-07)


### Bug Fixes

* bootstrap 前に ecr リポジトリを再作成しデプロイを修正 ([c574a92](https://github.com/konabe/classical-music-lake/commit/c574a92c45b4a2eedb132a0670a6c8b898231e71))

## [0.1.5](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v0.1.4...classical-music-lake-v0.1.5) (2026-03-07)


### Bug Fixes

* cdk bootstrap を ci に追加し deprecated api を修正 ([5828767](https://github.com/konabe/classical-music-lake/commit/582876713945247c63d656584bc6bbcbc36fd65a))
* cdk bootstrap を ci に追加しデプロイエラーを修正 ([81caa47](https://github.com/konabe/classical-music-lake/commit/81caa47278d1602996c2ecfee338595f5f202097))

## [0.1.4](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v0.1.3...classical-music-lake-v0.1.4) (2026-03-07)


### Features

* パフォーマンス・監視・データ管理を整備（チェックリスト8〜11） ([76e3f69](https://github.com/konabe/classical-music-lake/commit/76e3f699f79fbe945c0fe87aab3ad4a8f12f5d76))

## [0.1.3](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v0.1.2...classical-music-lake-v0.1.3) (2026-03-07)


### Features

* インフラパフォーマンス・コスト最適化（チェックリスト8.3） ([a1eba03](https://github.com/konabe/classical-music-lake/commit/a1eba03d0c1510a21b785d1cb1101290cccac355))
* バックエンドパフォーマンス改善（チェックリスト8.2） ([f5b8a7c](https://github.com/konabe/classical-music-lake/commit/f5b8a7c7b04fbbd72fa07222b2ad4c71c2a810fa))
* フロントエンドパフォーマンス改善（チェックリスト8.1） ([e7522f6](https://github.com/konabe/classical-music-lake/commit/e7522f64cbd9ca68b6c66426ab787226fbce254b))

## [0.1.2](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v0.1.1...classical-music-lake-v0.1.2) (2026-03-07)


### Features

* セキュリティヘッダを cloudfront に追加（チェックリスト7.3） ([3f2b436](https://github.com/konabe/classical-music-lake/commit/3f2b43622c345b2c7007f43b1d748848e7c30594))
* セキュリティ強化（チェックリスト7.1〜7.2） ([5f998ce](https://github.com/konabe/classical-music-lake/commit/5f998ce2766f8c5c0cbc7c35c4e9f42afc7dfee8))
* セキュリティ監査対応（チェックリスト7.3） ([2e1808a](https://github.com/konabe/classical-music-lake/commit/2e1808a823f1f4f283b0adfa9c05c62160a5d036))


### Bug Fixes

* coderabbitレビューコメントへの対応（PR [#28](https://github.com/konabe/classical-music-lake/issues/28)） ([3cca3ae](https://github.com/konabe/classical-music-lake/commit/3cca3ae34602bb556d1a32a684b1d1ff9f2d8f22))

## [0.1.1](https://github.com/konabe/classical-music-lake/compare/classical-music-lake-v0.1.0...classical-music-lake-v0.1.1) (2026-03-07)

### Features

- AWS CDK デプロイ設定を追加 ([47220d4](https://github.com/konabe/classical-music-lake/commit/47220d4cbb82fcb207f9a8b2a7c0d14e6503968b))
- GitHub Actions デプロイワークフローを追加 ([49663f1](https://github.com/konabe/classical-music-lake/commit/49663f1fc7263d11698618e9e3404c68ad375cc5))
- Lambda バックエンドソースを追加 ([94a271c](https://github.com/konabe/classical-music-lake/commit/94a271c3702bef1090e88b3b283342176cdcc16f))
- Node.js 24対応とシステム仕様書の追加 ([0b0fb2a](https://github.com/konabe/classical-music-lake/commit/0b0fb2a9f4bb0c3a30e932646340fe3a01371f40))
- Node.js 24対応と仕様書の追加 ([acbb658](https://github.com/konabe/classical-music-lake/commit/acbb6586a0d0c8f851416c3dbad49226c4e6cc06))
- SPA モードに変更 ([82eecb4](https://github.com/konabe/classical-music-lake/commit/82eecb44d2435142c6944a062020c688c031bff2))
- クラシック音楽鑑賞記録アプリの初期実装 ([1bd4f63](https://github.com/konabe/classical-music-lake/commit/1bd4f6313967f1778037e8702c5d143ba977c757))
- コードレビュー基盤を整備（チェックリスト6.3） ([25d016f](https://github.com/konabe/classical-music-lake/commit/25d016f9c332a7a37d4ee14e8691cd1afb05d2c6))
- コード品質・セキュリティ強化（チェックリスト6.1〜7.1） ([dc77f79](https://github.com/konabe/classical-music-lake/commit/dc77f795454e6d0e1f0d1ced918aa0c57513dba1))
- コード品質強化（チェックリスト6.1〜6.3） ([3342cfb](https://github.com/konabe/classical-music-lake/commit/3342cfbd4dd10bb11998607bb397db616ca9caf1))
- バックエンドを API Gateway + Lambda 構成に変更 ([8d52471](https://github.com/konabe/classical-music-lake/commit/8d52471dccb77092a959be2ba440837dce5f88f3))
- 型定義の充実・共通型の整合（チェックリスト6.2） ([43c32f3](https://github.com/konabe/classical-music-lake/commit/43c32f3adcd490137ae3d7109947e872dbac53da))
- 型定義の充実・共通型の整合（チェックリスト6.2） ([a127892](https://github.com/konabe/classical-music-lake/commit/a127892ae75d201a115fd923713b56525785c359))
- 静的解析の強化（チェックリスト6.1） ([1f892e9](https://github.com/konabe/classical-music-lake/commit/1f892e97ae2fda4da2a1b3bf0b59d237b6e6c098))
- 静的解析の強化（チェックリスト6.1） ([77c1b08](https://github.com/konabe/classical-music-lake/commit/77c1b08431b556a0b2d96085ac348c25106c9a32))

### Bug Fixes

- CDK Bootstrapをデプロイワークフローから削除し、env変数名を修正 ([1d4871d](https://github.com/konabe/classical-music-lake/commit/1d4871d67e991f0d1f94dc120a0baeaf30e945f1))
- CodeRabbitのレビューコメントに対応 ([0a3af9c](https://github.com/konabe/classical-music-lake/commit/0a3af9c5bc79ec3fee475b92a79d08b96e29d9fd))
- coderabbitレビューコメントへの対応（PR [#23](https://github.com/konabe/classical-music-lake/issues/23)） ([bfb1cb7](https://github.com/konabe/classical-music-lake/commit/bfb1cb7f7542de0cb0fa36ad71087591cf296a7f))
- coderabbitレビューコメントへの対応（PR [#26](https://github.com/konabe/classical-music-lake/issues/26)） ([9e9d348](https://github.com/konabe/classical-music-lake/commit/9e9d3484833966591db02a55ea12dc0a058d5ccd))
- coderabbitレビューコメントへの対応（PR [#7](https://github.com/konabe/classical-music-lake/issues/7) 第2弾） ([977f051](https://github.com/konabe/classical-music-lake/commit/977f051b72aa4b49f60af858439ee47a19d5566f))
- coderabbitレビューコメントへの対応（PR [#7](https://github.com/konabe/classical-music-lake/issues/7) 第3弾） ([57fea10](https://github.com/konabe/classical-music-lake/commit/57fea109f7931237173fd4e03ae31f07c5cc109e))
- coderabbitレビューコメントへの対応（PR [#7](https://github.com/konabe/classical-music-lake/issues/7)） ([2140689](https://github.com/konabe/classical-music-lake/commit/2140689f56294698cb6c68ae229d4b03f4b896aa))
- cors オリジンを cloudfront URL に限定（チェックリスト7.1） ([d6702cc](https://github.com/konabe/classical-music-lake/commit/d6702ccaf2b3bd9810e124ab20f2150f5ba14797))
- PR[#5](https://github.com/konabe/classical-music-lake/issues/5)レビューコメント修正 - SPEC.mdのDYNAMO_TABLE_CONCERTSを削除 ([cb2c1ca](https://github.com/konabe/classical-music-lake/commit/cb2c1caacaf1b1e3c893a3bd3b100f876b1848da))
- rating のランタイムバリデーションを追加（coderabbit対応） ([0c2c497](https://github.com/konabe/classical-music-lake/commit/0c2c497032d17d835736192852086f29bdb5a118))
- settings.jsonのマージ、slash commandの作成、releaseパイプラインのエラー修正 ([ca8fedd](https://github.com/konabe/classical-music-lake/commit/ca8feddd3525da59df72ef401cf1dae37f46e5dc))
- SPEC.mdからDYNAMO_TABLE_CONCERTSの記述を削除 ([3fad92c](https://github.com/konabe/classical-music-lake/commit/3fad92c299cc2a661867d1f0650b6502a301d56d))
- フロントエンドテストとセキュリティスキャンの失敗を修正 ([eef988c](https://github.com/konabe/classical-music-lake/commit/eef988cd0c957ccec5917699d06aee03328ed978))
- フロントエンド依存関係の脆弱性を修正（svgo, tar） ([11afba6](https://github.com/konabe/classical-music-lake/commit/11afba6fe088e594ed256bd46bdea6e33defa5d9))

## Changelog

All notable changes to this project will be documented in this file.

This file is automatically generated by [release-please](https://github.com/googleapis/release-please).
