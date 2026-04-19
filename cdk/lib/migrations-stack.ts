import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import type { Construct } from "constructs";
import * as path from "node:path";

import type { StageName } from "./classical-music-lake-stack";

export interface MigrationsStackProps extends cdk.StackProps {
  stageName: StageName;
}

/**
 * データ移行スクリプト（一時的なもの）を集約する専用スタック。
 *
 * 本番のランタイム構成（`ClassicalMusicLakeStack`）から分離することで、
 * - 移行コードの依存関係がメインスタックに混ざらない
 * - 移行が終わったらスタックごと削除できる（スタック単位のライフサイクル管理）
 * - レイヤードアーキテクチャ（handlers / usecases / repositories / domain）の制約を受けない
 *
 * 対象テーブルは `ClassicalMusicLakeStack` で作成されたものをテーブル名で参照する。
 * メインスタックを先にデプロイしてから本スタックをデプロイすること。
 */
export class MigrationsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MigrationsStackProps) {
    super(scope, id, props);

    const { stageName } = props;
    const isProd = stageName === "prod";
    const removalPolicy = isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY;

    const piecesTableName = isProd
      ? "classical-music-pieces"
      : `classical-music-pieces-${stageName}`;
    const composersTableName = isProd
      ? "classical-music-composers"
      : `classical-music-composers-${stageName}`;

    const piecesTable = dynamodb.Table.fromTableName(this, "PiecesTable", piecesTableName);
    const composersTable = dynamodb.Table.fromTableName(this, "ComposersTable", composersTableName);

    const backendSrcDir = path.join(__dirname, "../../backend/src");

    // -------------------------
    // Migration: Piece.composer (string) → composerId (UUID reference)
    // 手動 invoke 専用。API Gateway には接続しない。
    // 全件 Scan + 新規 Composer 作成を含むため、タイムアウトとメモリを拡張し
    // reservedConcurrency=1 で同時実行禁止。
    // -------------------------
    const migratePieceComposerLogGroup = new logs.LogGroup(this, "MigratePieceComposerLogGroup", {
      retention: logs.RetentionDays.THREE_MONTHS,
      removalPolicy,
    });

    new lambdaNodejs.NodejsFunction(this, "MigratePieceComposer", {
      // prettier-ignore
      entry: path.join(backendSrcDir, "migrations/piece-composer-id/index.ts"), // NOSONAR
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_24_X,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 512,
      timeout: cdk.Duration.seconds(60),
      tracing: lambda.Tracing.ACTIVE,
      reservedConcurrentExecutions: 1,
      environment: {
        DYNAMO_TABLE_PIECES: piecesTableName,
        DYNAMO_TABLE_COMPOSERS: composersTableName,
      },
      logGroup: migratePieceComposerLogGroup,
      bundling: {
        minify: true,
        sourceMap: false,
        target: "es2022",
      },
      role: this.makeMigrationRole("MigratePieceComposerRole", [piecesTable, composersTable]),
    });
  }

  /**
   * 移行 Lambda 用の IAM ロールを作成する。
   * `Table.fromTableName` は `grantReadWriteData` を提供しないため、
   * インラインポリシーで対象テーブルへの読み書き権限を付与する。
   */
  private makeMigrationRole(id: string, tables: dynamodb.ITable[]): cdk.aws_iam.Role {
    const role = new cdk.aws_iam.Role(this, id, {
      assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName("AWSXRayDaemonWriteAccess"),
      ],
    });
    role.addToPolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.ALLOW,
        actions: [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:Scan",
          "dynamodb:Query",
        ],
        resources: tables.map((t) => t.tableArn),
      })
    );
    return role;
  }
}
