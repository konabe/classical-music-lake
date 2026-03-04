#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ClassicalMusicLakeStack, type StageName } from "../lib/classical-music-lake-stack";

const app = new cdk.App();

const stageName = (process.env.STAGE_NAME ?? "prod") as StageName;
const stackName =
  stageName === "prod" ? "ClassicalMusicLakeStack" : `ClassicalMusicLakeStack-${stageName}`;

new ClassicalMusicLakeStack(app, stackName, {
  stageName,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? "ap-northeast-1",
  },
  terminationProtection: stageName === "prod",
});
