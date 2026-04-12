#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ClassicalMusicLakeStack, type StageName } from "../lib/classical-music-lake-stack";
import { DnsStack } from "../lib/dns-stack";

const app = new cdk.App();

const rawStageName = process.env.STAGE_NAME ?? "prod";
const validStages: StageName[] = ["dev", "stg", "prod"];
if (!validStages.includes(rawStageName as StageName)) {
  throw new Error(
    `Invalid STAGE_NAME: "${rawStageName}". Must be one of: ${validStages.join(", ")}`
  );
}
const stageName = rawStageName as StageName;
const stackName =
  stageName === "prod" ? "ClassicalMusicLakeStack" : `ClassicalMusicLakeStack-${stageName}`;

// -------------------------
// DNS スタック（us-east-1）
// CloudFront 用の ACM 証明書は us-east-1 に作成する必要がある
// 初回デプロイ時は手動で実行: STAGE_NAME=prod npx cdk deploy NocturneAppDnsStack
// ※ ACM 証明書の DNS 検証が完了するまで CloudFormation がペンディングになるため、
//    先にこのスタックだけデプロイし、お名前.comで NS レコードを設定してから
//    メインスタックをデプロイすること
// -------------------------
new DnsStack(app, "NocturneAppDnsStack", {
  // NOSONAR
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-east-1",
  },
});

// CERTIFICATE_ARN / HOSTED_ZONE_ID は CI/CD で NocturneAppDnsStack の
// CloudFormation outputs から取得して環境変数として渡す
// ローカルで cdk synth/diff するときは環境変数を手動でセットすること
const certificateArn = process.env.CERTIFICATE_ARN ?? "";
const hostedZoneId = process.env.HOSTED_ZONE_ID ?? "";

// prettier-ignore
new ClassicalMusicLakeStack(app, stackName, { // NOSONAR: CDK はスタックのインスタンス化時に app へ自動登録されるため戻り値は不要
  stageName,
  certificateArn,
  hostedZoneId,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? "ap-northeast-1",
  },
  terminationProtection: stageName === "prod",
});
