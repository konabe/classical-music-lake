#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ClassicalMusicLakeStack, type StageName } from "../lib/classical-music-lake-stack";
import { DnsStack } from "../lib/dns-stack";

const app = new cdk.App();

const validStages: StageName[] = ["dev", "stg", "prod"];
const rawStageName = process.env.STAGE_NAME ?? "prod";
if (!validStages.includes(rawStageName as StageName)) {
  throw new Error(
    `Invalid STAGE_NAME: "${rawStageName}". Must be one of: ${validStages.join(", ")}`
  );
}

const stackNameFor = (stage: StageName): string => {
  return stage === "prod" ? "ClassicalMusicLakeStack" : `ClassicalMusicLakeStack-${stage}`;
};

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
// 全ステージの Consumer スタックを常に instantiate する
// DnsStack の cross-region SSM エクスポートは Consumer スタックごとに
// /cdk/exports/<ConsumerStackName>/... のパスで作成される。
// STAGE_NAME で分岐して 1 ステージ分だけ synth すると、DnsStack の
// テンプレートから他ステージ用の SSM エクスポートが消え、別ステージの
// deploy 時に "Parameters cannot be found" で失敗する。
// 3 環境分を常に synth し、CI/CD では `cdk deploy <stackName> --exclusively`
// で対象のみデプロイする運用とする。
// -------------------------
for (const stage of validStages) {
  // prettier-ignore
  new ClassicalMusicLakeStack(app, stackNameFor(stage), { // NOSONAR: CDK はスタックのインスタンス化時に app へ自動登録されるため戻り値は不要
    stageName: stage,
    hostedZone: dnsStack.hostedZone,
    certificate: dnsStack.certificate,
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION ?? "ap-northeast-1",
    },
    crossRegionReferences: true,
    terminationProtection: stage === "prod",
  });
}
