#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ClassicalMusicLakeStack, type StageName } from "../lib/classical-music-lake-stack";
import { DnsStack } from "../lib/dns-stack";
import { MigrationsStack } from "../lib/migrations-stack";
import { PreviewBudgetsStack } from "../lib/preview-budgets-stack";

const app = new cdk.App();

const fixedStages: StageName[] = ["dev", "stg", "prod"];
const rawStageName = process.env.STAGE_NAME ?? "prod";
const isPreviewName = /^pr-\d+$/.test(rawStageName);

if (!isPreviewName && !fixedStages.includes(rawStageName as StageName)) {
  throw new Error(
    `Invalid STAGE_NAME: "${rawStageName}". Must be one of: ${fixedStages.join(", ")}, or pr-{number}`
  );
}

const stackNameFor = (stage: StageName): string =>
  stage === "prod" ? "ClassicalMusicLakeStack" : `ClassicalMusicLakeStack-${stage}`;

const migrationsStackNameFor = (stage: StageName): string =>
  stage === "prod" ? "MigrationsStack" : `MigrationsStack-${stage}`;

if (isPreviewName) {
  // -------------------------
  // Preview スタック（pr-{番号}）
  // フロントエンドリソースと Cognito User Pool を持たないため
  // DnsStack に依存せず単独で synth/deploy できる
  // -------------------------
  const previewStageName = rawStageName as `pr-${number}`;
  const cognitoUserPoolId = app.node.tryGetContext("cognitoUserPoolId") as string | undefined;
  const cognitoClientId = app.node.tryGetContext("cognitoClientId") as string | undefined;
  if (!cognitoUserPoolId || !cognitoClientId) {
    throw new Error(
      "Preview stack requires --context cognitoUserPoolId=... --context cognitoClientId=..."
    );
  }
  const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? "ap-northeast-1",
  };
  // prettier-ignore
  new ClassicalMusicLakeStack(app, stackNameFor(previewStageName), { // NOSONAR
    stageName: previewStageName,
    isPreview: true,
    existingCognitoUserPoolId: cognitoUserPoolId,
    existingCognitoClientId: cognitoClientId,
    env,
    crossRegionReferences: false,
    terminationProtection: false,
  });
} else {
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
  for (const stage of fixedStages) {
    const env = {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION ?? "ap-northeast-1",
    };
    // prettier-ignore
    new ClassicalMusicLakeStack(app, stackNameFor(stage), { // NOSONAR: CDK はスタックのインスタンス化時に app へ自動登録されるため戻り値は不要
      stageName: stage,
      hostedZone: dnsStack.hostedZone,
      certificate: dnsStack.certificate,
      env,
      crossRegionReferences: true,
      terminationProtection: stage === "prod",
    });

    // 移行 Lambda は専用スタックに分離。本番スタックのデプロイ後に
    // `cdk deploy MigrationsStack[-<stage>]` で個別にデプロイする運用。
    // 移行完了後はスタックごと破棄できる。
    // prettier-ignore
    new MigrationsStack(app, migrationsStackNameFor(stage), { // NOSONAR
      stageName: stage,
      env,
      terminationProtection: stage === "prod",
    });
  }

  // -------------------------
  // Preview Budgets スタック（PR プレビュー環境のコスト監視）
  // 通常のデプロイサイクルとは独立して 1 回だけ手動デプロイする:
  //   npx cdk deploy PreviewBudgetsStack
  // -------------------------
  // prettier-ignore
  new PreviewBudgetsStack(app, "PreviewBudgetsStack", { // NOSONAR
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      // Budgets はグローバルサービスのためリージョンは us-east-1 を使う慣例
      region: "us-east-1",
    },
    notifyEmail: "rt.konabe@gmail.com",
    monthlyLimitUsd: 20,
  });
}
