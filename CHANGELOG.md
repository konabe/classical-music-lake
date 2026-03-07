# Changelog

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
