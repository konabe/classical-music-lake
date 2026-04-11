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
const dnsStack = new DnsStack(app, "NocturneAppDnsStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-east-1",
  },
  crossRegionReferences: true,
});

// prettier-ignore
new ClassicalMusicLakeStack(app, stackName, { // NOSONAR: CDK はスタックのインスタンス化時に app へ自動登録されるため戻り値は不要
  stageName,
  hostedZone: dnsStack.hostedZone,
  certificate: dnsStack.certificate,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? "ap-northeast-1",
  },
  crossRegionReferences: true,
  terminationProtection: stageName === "prod",
});
