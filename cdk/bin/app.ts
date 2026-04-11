#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ClassicalMusicLakeStack, type StageName } from "../lib/classical-music-lake-stack";

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

new ClassicalMusicLakeStack(app, stackName, {
  // NOSONAR: CDK はスタックのインスタンス化時に app へ自動登録されるため戻り値は不要
  stageName,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? "ap-northeast-1",
  },
  terminationProtection: stageName === "prod",
});
