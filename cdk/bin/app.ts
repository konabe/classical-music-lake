#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ClassicalMusicLakeStack } from "../lib/classical-music-lake-stack";
import { DnsStack } from "../lib/dns-stack";
import { MigrationsStack } from "../lib/migrations-stack";

const app = new cdk.App();

// -------------------------
// DNS スタック（us-east-1）
// CloudFront 用の ACM 証明書は us-east-1 に作成する必要がある
// 初回デプロイ時は手動で実行: npx cdk deploy NocturneAppDnsStack
// ※ ACM 証明書の DNS 検証が完了するまで CloudFormation がペンディングになるため、
//    先にこのスタックだけデプロイし、お名前.comで NS レコードを設定してから
//    メインスタックをデプロイすること
// -------------------------
const dnsStack = new DnsStack(app, "NocturneAppDnsStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-east-1",
  },
  crossRegionReferences: true,
});

// -------------------------
// 本番（prod）単一スタック。dev / stg 環境は廃止済み。
// -------------------------
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? "ap-northeast-1",
};

// prettier-ignore
new ClassicalMusicLakeStack(app, "ClassicalMusicLakeStack", { // NOSONAR: CDK はスタックのインスタンス化時に app へ自動登録されるため戻り値は不要
  hostedZone: dnsStack.hostedZone,
  certificate: dnsStack.certificate,
  env,
  crossRegionReferences: true,
  terminationProtection: true,
});

// 移行 Lambda は専用スタックに分離。本番スタックのデプロイ後に
// `cdk deploy MigrationsStack` で個別にデプロイする運用。
// 移行完了後はスタックごと破棄できる。
// prettier-ignore
new MigrationsStack(app, "MigrationsStack", { // NOSONAR
  env,
  terminationProtection: true,
});
