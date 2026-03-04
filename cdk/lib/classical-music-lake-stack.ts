import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import type { Construct } from "constructs";
import * as path from "path";

export type StageName = "staging" | "prod";

export interface ClassicalMusicLakeStackProps extends cdk.StackProps {
  stageName: StageName;
}

export class ClassicalMusicLakeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ClassicalMusicLakeStackProps) {
    super(scope, id, props);

    const { stageName } = props;
    const isProd = stageName === "prod";

    // -------------------------
    // DynamoDB テーブル
    // -------------------------
    const tableName = isProd
      ? "classical-music-listening-logs"
      : `classical-music-listening-logs-${stageName}`;

    const listeningLogsTable = new dynamodb.Table(this, "ListeningLogsTable", {
      tableName,
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      // prod は RETAIN、staging は DESTROY（スタック削除時にテーブルも削除）
      removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    // -------------------------
    // Lambda 共通設定
    // -------------------------
    const backendSrcDir = path.join(__dirname, "../../backend/src");

    const commonEnv: Record<string, string> = {
      DYNAMO_TABLE_LISTENING_LOGS: listeningLogsTable.tableName,
    };

    const commonFnProps: Omit<lambdaNodejs.NodejsFunctionProps, "entry"> = {
      runtime: lambda.Runtime.NODEJS_24_X,
      environment: commonEnv,
      bundling: {
        minify: true,
        sourceMap: false,
        target: "es2022",
      },
    };

    const fn = (id: string, entry: string): lambdaNodejs.NodejsFunction =>
      new lambdaNodejs.NodejsFunction(this, id, {
        ...commonFnProps,
        entry: path.join(backendSrcDir, entry),
        handler: "handler",
      });

    // -------------------------
    // Lambda 関数
    // -------------------------
    const listeningLogsList = fn("ListeningLogsList", "listening-logs/list.ts");
    const listeningLogsGet = fn("ListeningLogsGet", "listening-logs/get.ts");
    const listeningLogsCreate = fn("ListeningLogsCreate", "listening-logs/create.ts");
    const listeningLogsUpdate = fn("ListeningLogsUpdate", "listening-logs/update.ts");
    const listeningLogsDelete = fn("ListeningLogsDelete", "listening-logs/delete.ts");

    // -------------------------
    // DynamoDB 権限付与
    // -------------------------
    listeningLogsTable.grantReadData(listeningLogsList);
    listeningLogsTable.grantReadData(listeningLogsGet);
    listeningLogsTable.grantWriteData(listeningLogsCreate);
    listeningLogsTable.grantReadWriteData(listeningLogsUpdate);
    listeningLogsTable.grantWriteData(listeningLogsDelete);

    // -------------------------
    // API Gateway
    // -------------------------
    const api = new apigateway.RestApi(this, "Api", {
      restApiName: `classical-music-lake-${stageName}`,
      deployOptions: { stageName },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ["Content-Type"],
      },
    });

    const integ = (fn: lambda.IFunction) => new apigateway.LambdaIntegration(fn);

    // /listening-logs
    const listeningLogsResource = api.root.addResource("listening-logs");
    listeningLogsResource.addMethod("GET", integ(listeningLogsList));
    listeningLogsResource.addMethod("POST", integ(listeningLogsCreate));

    // /listening-logs/{id}
    const listeningLogResource = listeningLogsResource.addResource("{id}");
    listeningLogResource.addMethod("GET", integ(listeningLogsGet));
    listeningLogResource.addMethod("PUT", integ(listeningLogsUpdate));
    listeningLogResource.addMethod("DELETE", integ(listeningLogsDelete));

    // -------------------------
    // S3 + CloudFront (SPA ホスティング)
    // -------------------------
    const spaBucket = new s3.Bucket(this, "SpaBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      // prod は S3 バージョニング有効（静的ファイルのロールバック用）
      versioned: isProd,
    });

    const distribution = new cloudfront.Distribution(this, "SpaDistribution", {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(spaBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      defaultRootObject: "index.html",
      errorResponses: [
        // SPA のクライアントサイドルーティング対応
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
      ],
    });

    new s3deploy.BucketDeployment(this, "SpaDeployment", {
      sources: [s3deploy.Source.asset(path.join(__dirname, "../../.output/public"))],
      destinationBucket: spaBucket,
      distribution,
      distributionPaths: ["/*"],
    });

    // -------------------------
    // Outputs
    // -------------------------
    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url,
      description: "API Gateway URL (API_BASE_URL に設定)",
    });

    new cdk.CfnOutput(this, "SpaUrl", {
      value: `https://${distribution.distributionDomainName}`,
      description: "CloudFront URL (フロントエンド)",
    });
  }
}
