#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ClassicalMusicLakeStack, type StageName } from "../lib/classical-music-lake-stack";
import { CertificateStack } from "../lib/certificate-stack";

const app = new cdk.App();

const rawStageName = process.env.STAGE_NAME ?? "prod";
const validStages: StageName[] = ["staging", "prod"];
if (!validStages.includes(rawStageName as StageName)) {
  throw new Error(
    `Invalid STAGE_NAME: "${rawStageName}". Must be one of: ${validStages.join(", ")}`
  );
}
const stageName = rawStageName as StageName;
const stackName =
  stageName === "prod" ? "ClassicalMusicLakeStack" : `ClassicalMusicLakeStack-${stageName}`;

// CloudFront の証明書は us-east-1 に配置する必要があるため独立したスタックで管理する
// 前提: Route 53 で nocturne.app を登録済みであること（ホストゾーンが存在すること）
const certStack = new CertificateStack(app, "CertificateStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-east-1",
  },
  crossRegionReferences: true,
});

new ClassicalMusicLakeStack(app, stackName, {
  stageName,
  certificate: certStack.certificate,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? "ap-northeast-1",
  },
  terminationProtection: stageName === "prod",
  crossRegionReferences: true,
});
