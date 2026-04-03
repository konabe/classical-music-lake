import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import type { IResource } from "aws-cdk-lib/aws-apigateway";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cognito from "aws-cdk-lib/aws-cognito";
import type { Construct } from "constructs";
import * as path from "path";

export type StageName = "dev" | "stg" | "prod";

export interface ClassicalMusicLakeStackProps extends cdk.StackProps {
  stageName: StageName;
}

export class ClassicalMusicLakeStack extends cdk.Stack {
  private corsAllowOrigin: string = "";
  private corsAllowOrigins: string[] = [];

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
      // prod は RETAIN、stg/dev は DESTROY（スタック削除時にテーブルも削除）
      removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      // ポイントインタイムリカバリ（PITR）有効化（35日間のバックアップ自動保持）
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
    });

    // GSI1: userId + createdAt でユーザー別一覧取得
    listeningLogsTable.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "createdAt", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // -------------------------
    // Lambda 共通設定
    // -------------------------
    const backendSrcDir = path.join(__dirname, "../../backend/src");

    // -------------------------
    // DynamoDB テーブル（楽曲マスタ）
    // -------------------------
    const piecesTableName = isProd
      ? "classical-music-pieces"
      : `classical-music-pieces-${stageName}`;

    const piecesTable = new dynamodb.Table(this, "PiecesTable", {
      tableName: piecesTableName,
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // -------------------------
    // AWS Cognito User Pool
    // -------------------------
    const userPoolName = isProd ? "classical-music-lake" : `classical-music-lake-${stageName}`;

    const userPool = new cognito.UserPool(this, "CognitoUserPool", {
      userPoolName,
      removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireDigits: true,
        requireSymbols: false,
        requireUppercase: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      userVerification: {
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
      signInCaseSensitive: false,
    });

    // App Client: フロントエンド用
    const appClient = userPool.addClient("FrontendClient", {
      authFlows: {
        userPassword: true,
        custom: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.EMAIL, cognito.OAuthScope.OPENID, cognito.OAuthScope.PROFILE],
        callbackUrls: ["https://classical-music-lake.example.com/auth/callback"],
        logoutUrls: ["https://classical-music-lake.example.com/login"],
      },
      accessTokenValidity: cdk.Duration.minutes(60),
      idTokenValidity: cdk.Duration.minutes(60),
      refreshTokenValidity: cdk.Duration.days(30),
      preventUserExistenceErrors: true,
    });

    const commonEnv: Record<string, string> = {
      DYNAMO_TABLE_LISTENING_LOGS: listeningLogsTable.tableName,
      DYNAMO_TABLE_PIECES: piecesTable.tableName,
      COGNITO_USER_POOL_ID: userPool.userPoolId,
      COGNITO_CLIENT_ID: appClient.userPoolClientId,
    };

    const commonFnProps: Omit<lambdaNodejs.NodejsFunctionProps, "entry" | "logGroup"> = {
      runtime: lambda.Runtime.NODEJS_24_X,
      // ARM64（Graviton2）: x86_64 比で約 20% 安価かつ高速
      architecture: lambda.Architecture.ARM_64,
      // 256MB: DynamoDB CRUD に十分で、128MB より CPU 割当が増えコールドスタートも短縮
      memorySize: 256,
      // 10s: DynamoDB 操作に対して十分な余裕を持たせつつ過剰な課金を防ぐ
      timeout: cdk.Duration.seconds(10),
      environment: commonEnv,
      // X-Ray トレーシング有効化（コールドスタート・レスポンスタイムの可視化）
      tracing: lambda.Tracing.ACTIVE,
      bundling: {
        minify: true,
        sourceMap: false,
        target: "es2022",
      },
    };

    const fn = (id: string, entry: string): lambdaNodejs.NodejsFunction => {
      // CloudWatch Logs 保持期間を 3 ヶ月に設定（カスタムリソース不要の explicit LogGroup）
      const logGroup = new logs.LogGroup(this, `${id}LogGroup`, {
        retention: logs.RetentionDays.THREE_MONTHS,
        removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      });
      return new lambdaNodejs.NodejsFunction(this, id, {
        ...commonFnProps,
        entry: path.join(backendSrcDir, entry),
        handler: "handler",
        logGroup,
      });
    };

    // -------------------------
    // Lambda 関数
    // -------------------------
    const listeningLogsList = fn("ListeningLogsList", "listening-logs/list.ts");
    const listeningLogsGet = fn("ListeningLogsGet", "listening-logs/get.ts");
    const listeningLogsCreate = fn("ListeningLogsCreate", "listening-logs/create.ts");
    const listeningLogsUpdate = fn("ListeningLogsUpdate", "listening-logs/update.ts");
    const listeningLogsDelete = fn("ListeningLogsDelete", "listening-logs/delete.ts");

    const listPieces = fn("ListPieces", "pieces/list.ts");
    const createPiece = fn("CreatePiece", "pieces/create.ts");
    const getPiece = fn("GetPiece", "pieces/get.ts");
    const updatePiece = fn("UpdatePiece", "pieces/update.ts");
    const deletePiece = fn("DeletePiece", "pieces/delete.ts");

    const authRegister = fn("AuthRegister", "auth/register.ts");
    const authLogin = fn("AuthLogin", "auth/login.ts");
    const authVerifyEmail = fn("AuthVerifyEmail", "auth/verify-email.ts");
    const authResendCode = fn("AuthResendCode", "auth/resend-verification-code.ts");
    const authRefresh = fn("AuthRefresh", "auth/refresh.ts");

    // -------------------------
    // Cognito 権限付与
    // -------------------------
    // auth/register: SignUp を実行
    const cognitoRegisterPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["cognito-idp:SignUp"],
      resources: [userPool.userPoolArn],
    });
    authRegister.addToRolePolicy(cognitoRegisterPolicy);

    // auth/login: InitiateAuth を実行
    const cognitoLoginPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["cognito-idp:InitiateAuth"],
      resources: [userPool.userPoolArn],
    });
    authLogin.addToRolePolicy(cognitoLoginPolicy);

    // auth/verify-email: ConfirmSignUp を実行
    const cognitoVerifyEmailPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["cognito-idp:ConfirmSignUp"],
      resources: [userPool.userPoolArn],
    });
    authVerifyEmail.addToRolePolicy(cognitoVerifyEmailPolicy);

    // auth/resend-verification-code: ResendConfirmationCode を実行
    const cognitoResendCodePolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["cognito-idp:ResendConfirmationCode"],
      resources: [userPool.userPoolArn],
    });
    authResendCode.addToRolePolicy(cognitoResendCodePolicy);

    // auth/refresh: InitiateAuth (REFRESH_TOKEN_AUTH) を実行
    const cognitoRefreshPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["cognito-idp:InitiateAuth"],
      resources: [userPool.userPoolArn],
    });
    authRefresh.addToRolePolicy(cognitoRefreshPolicy);

    // -------------------------
    // DynamoDB 権限付与
    // -------------------------
    listeningLogsTable.grantReadData(listeningLogsList);
    listeningLogsTable.grantReadData(listeningLogsGet);
    listeningLogsTable.grantWriteData(listeningLogsCreate);
    listeningLogsTable.grantReadWriteData(listeningLogsUpdate);
    listeningLogsTable.grantWriteData(listeningLogsDelete);
    piecesTable.grantReadData(listPieces);
    piecesTable.grantWriteData(createPiece);
    piecesTable.grantReadData(getPiece);
    piecesTable.grantReadWriteData(updatePiece);
    piecesTable.grantWriteData(deletePiece);

    // -------------------------
    // API Gateway
    // -------------------------
    // API Gateway が CloudWatch Logs に書き込むためのアカウントレベル設定
    // （アカウントに一度設定すれば全リージョン共通だが CDK では Stack ごとに管理）
    const apiGatewayCloudWatchRole = new iam.Role(this, "ApiGatewayCloudWatchRole", {
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AmazonAPIGatewayPushToCloudWatchLogs"
        ),
      ],
    });
    const apiGatewayAccount = new apigateway.CfnAccount(this, "ApiGatewayAccount", {
      cloudWatchRoleArn: apiGatewayCloudWatchRole.roleArn,
    });

    // API Gateway アクセスログ用ロググループ（保持期間 3 ヶ月）
    // logGroupName を指定しない（CDK 自動生成名）ことで既存リソースとの名前衝突を回避
    const apiAccessLogGroup = new logs.LogGroup(this, "ApiAccessLogs", {
      retention: logs.RetentionDays.THREE_MONTHS,
      removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    const api = new apigateway.RestApi(this, "Api", {
      restApiName: `classical-music-lake-${stageName}`,
      deployOptions: {
        stageName,
        // X-Ray トレーシング有効化（API Gateway → Lambda のレスポンスタイム可視化）
        tracingEnabled: true,
        // アクセスログ有効化（リクエスト・レスポンス・エラーを記録）
        accessLogDestination: new apigateway.LogGroupLogDestination(apiAccessLogGroup),
        accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
          caller: false,
          httpMethod: true,
          ip: false,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          user: false,
        }),
      },
    });

    // CfnAccount の設定完了後に API Gateway ステージが作成されるよう順序を保証
    api.node.addDependency(apiGatewayAccount);

    // Cognito Authorizer（/listening-logs エンドポイント保護用）
    const cognitoAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(this, "CognitoAuthorizer", {
      cognitoUserPools: [userPool],
      authorizerName: "CognitoAuthorizer",
    });
    const withAuth = { authorizer: cognitoAuthorizer };

    const integ = (fn: lambda.IFunction) => new apigateway.LambdaIntegration(fn);

    // /listening-logs
    const listeningLogsResource = api.root.addResource("listening-logs");
    listeningLogsResource.addMethod("GET", integ(listeningLogsList), withAuth);
    listeningLogsResource.addMethod("POST", integ(listeningLogsCreate), withAuth);

    // /listening-logs/{id}
    const listeningLogResource = listeningLogsResource.addResource("{id}");
    listeningLogResource.addMethod("GET", integ(listeningLogsGet), withAuth);
    listeningLogResource.addMethod("PUT", integ(listeningLogsUpdate), withAuth);
    listeningLogResource.addMethod("DELETE", integ(listeningLogsDelete), withAuth);

    // /pieces
    const piecesResource = api.root.addResource("pieces");
    piecesResource.addMethod("GET", integ(listPieces));
    piecesResource.addMethod("POST", integ(createPiece));

    // /pieces/{id}
    const pieceResource = piecesResource.addResource("{id}");
    pieceResource.addMethod("GET", integ(getPiece));
    pieceResource.addMethod("PUT", integ(updatePiece));
    pieceResource.addMethod("DELETE", integ(deletePiece));

    // /auth
    const authResource = api.root.addResource("auth");

    // /auth/register (登録フロー: 認証不要)
    const authRegisterResource = authResource.addResource("register");
    authRegisterResource.addMethod("POST", integ(authRegister));

    // /auth/login (ログインフロー: 認証不要)
    const authLoginResource = authResource.addResource("login");
    authLoginResource.addMethod("POST", integ(authLogin));

    // /auth/verify-email (メール確認: 認証不要)
    const authVerifyEmailResource = authResource.addResource("verify-email");
    authVerifyEmailResource.addMethod("POST", integ(authVerifyEmail));

    // /auth/resend-verification-code (認証コード再送信: 認証不要)
    const authResendCodeResource = authResource.addResource("resend-verification-code");
    authResendCodeResource.addMethod("POST", integ(authResendCode));

    // /auth/refresh (トークンリフレッシュ: 認証不要)
    const authRefreshResource = authResource.addResource("refresh");
    authRefreshResource.addMethod("POST", integ(authRefresh));

    // -------------------------
    // S3 + CloudFront (SPA ホスティング)
    // -------------------------
    const spaBucket = new s3.Bucket(this, "SpaBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      // prod は RETAIN（本番アセットの誤削除防止）、stg/dev は DESTROY
      removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: !isProd,
      // prod は S3 バージョニング有効（静的ファイルのロールバック用）
      versioned: isProd,
    });

    // セキュリティヘッダポリシー（SPA 用: X-Frame-Options: DENY）
    const securityHeadersPolicy = new cloudfront.ResponseHeadersPolicy(
      this,
      "SecurityHeadersPolicy",
      {
        securityHeadersBehavior: {
          strictTransportSecurity: {
            accessControlMaxAge: cdk.Duration.days(365),
            includeSubdomains: true,
            override: true,
          },
          contentTypeOptions: { override: true },
          frameOptions: {
            frameOption: cloudfront.HeadersFrameOption.DENY,
            override: true,
          },
          xssProtection: { protection: true, modeBlock: true, override: true },
          referrerPolicy: {
            referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
            override: true,
          },
        },
      }
    );

    // Storybook 用セキュリティヘッダポリシー（X-Frame-Options を除外: iframe プレビューに必要）
    const storybookHeadersPolicy = new cloudfront.ResponseHeadersPolicy(
      this,
      "StorybookHeadersPolicy",
      {
        securityHeadersBehavior: {
          strictTransportSecurity: {
            accessControlMaxAge: cdk.Duration.days(365),
            includeSubdomains: true,
            override: true,
          },
          contentTypeOptions: { override: true },
          contentSecurityPolicy: {
            contentSecurityPolicy: "frame-ancestors 'self';",
            override: true,
          },
          xssProtection: { protection: true, modeBlock: true, override: true },
          referrerPolicy: {
            referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
            override: true,
          },
        },
      }
    );

    const distribution = new cloudfront.Distribution(this, "SpaDistribution", {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(spaBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: securityHeadersPolicy,
      },
      // index.html はキャッシュしない（SPA デプロイ後に即反映させるため）
      additionalBehaviors: {
        "/index.html": {
          origin: origins.S3BucketOrigin.withOriginAccessControl(spaBucket),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          responseHeadersPolicy: securityHeadersPolicy,
        },
      },
      defaultRootObject: "index.html",
      errorResponses: [
        // SPA のクライアントサイドルーティング対応
        // ttl を 0 にして index.html の古いキャッシュが返らないようにする
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.seconds(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.seconds(0),
        },
      ],
    });

    // CloudFront URL を CORS オリジンとして Lambda 環境変数に設定
    this.corsAllowOrigin = `https://${distribution.distributionDomainName}`;
    // dev 環境のみローカル開発用に localhost を許可（NOTE: 3000だとなぜか起動できない）
    this.corsAllowOrigins =
      stageName === "dev"
        ? [this.corsAllowOrigin, "http://localhost:3010"]
        : [this.corsAllowOrigin];
    [
      listeningLogsList,
      listeningLogsGet,
      listeningLogsCreate,
      listeningLogsUpdate,
      listeningLogsDelete,
      listPieces,
      createPiece,
      getPiece,
      updatePiece,
      deletePiece,
      authRegister,
      authLogin,
      authVerifyEmail,
      authResendCode,
      authRefresh,
    ].forEach((fn) => {
      fn.addEnvironment("CORS_ALLOW_ORIGIN", this.corsAllowOrigins.join(","));
    });

    // API Gateway の CORS オリジンも CloudFront URL に限定
    // listening-logs は Authorization ヘッダーが必要なため allowHeaders に追加
    this.addCors(
      listeningLogsResource,
      ["GET", "POST", "OPTIONS"],
      ["Content-Type", "Authorization"]
    );
    this.addCors(
      listeningLogResource,
      ["GET", "PUT", "DELETE", "OPTIONS"],
      ["Content-Type", "Authorization"]
    );
    this.addCors(piecesResource, ["GET", "POST", "OPTIONS"]);
    this.addCors(pieceResource, ["GET", "PUT", "DELETE", "OPTIONS"]);
    this.addCors(authRegisterResource, ["POST", "OPTIONS"]);
    this.addCors(authLoginResource, ["POST", "OPTIONS"]);
    this.addCors(authVerifyEmailResource, ["POST", "OPTIONS"]);
    this.addCors(authResendCodeResource, ["POST", "OPTIONS"]);
    this.addCors(authRefreshResource, ["POST", "OPTIONS"]);

    // API Gateway 自身が返す 4XX/5XX にも CORS ヘッダを付与
    api.addGatewayResponse("Default4xxCors", {
      type: apigateway.ResponseType.DEFAULT_4XX,
      responseHeaders: {
        "Access-Control-Allow-Origin": `'${this.corsAllowOrigin}'`,
        "Access-Control-Allow-Headers": "'Content-Type'",
        "Access-Control-Allow-Methods": "'GET,POST,PUT,DELETE,OPTIONS'",
      },
    });

    api.addGatewayResponse("Default5xxCors", {
      type: apigateway.ResponseType.DEFAULT_5XX,
      responseHeaders: {
        "Access-Control-Allow-Origin": `'${this.corsAllowOrigin}'`,
        "Access-Control-Allow-Headers": "'Content-Type'",
        "Access-Control-Allow-Methods": "'GET,POST,PUT,DELETE,OPTIONS'",
      },
    });

    new s3deploy.BucketDeployment(this, "SpaDeployment", {
      sources: [s3deploy.Source.asset(path.join(__dirname, "../../.output/public"))],
      destinationBucket: spaBucket,
      distribution,
      distributionPaths: ["/*"],
      // storybook/* を prune 対象から除外することで StorybookDeployment との並列実行を可能にする
      exclude: ["storybook/*"],
    });

    // -------------------------
    // Storybook ホスティング（/storybook/ パス）
    // -------------------------
    // /storybook/ へのアクセスを /storybook/index.html にリライトする CloudFront Function
    const storybookRootRewrite = new cloudfront.Function(this, "StorybookRootRewrite", {
      code: cloudfront.FunctionCode.fromInline(
        `
function handler(event) {
  var request = event.request;
  if (request.uri === '/storybook/' || request.uri === '/storybook') {
    request.uri = '/storybook/index.html';
  }
  return request;
}
      `.trim()
      ),
      runtime: cloudfront.FunctionRuntime.JS_2_0,
    });

    // /storybook/* 用の CloudFront behavior を追加
    distribution.addBehavior(
      "/storybook/*",
      origins.S3BucketOrigin.withOriginAccessControl(spaBucket),
      {
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        responseHeadersPolicy: storybookHeadersPolicy,
        functionAssociations: [
          {
            function: storybookRootRewrite,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ],
      }
    );

    // SpaDeployment が storybook/* を exclude しているため、並列実行しても storybook ファイルは削除されない
    new s3deploy.BucketDeployment(this, "StorybookDeployment", {
      sources: [s3deploy.Source.asset(path.join(__dirname, "../../storybook-static"))],
      destinationBucket: spaBucket,
      destinationKeyPrefix: "storybook",
      distribution,
      distributionPaths: ["/storybook/*"],
    });

    // -------------------------
    // CloudWatch アラーム
    // -------------------------
    const allFunctions = [
      listeningLogsList,
      listeningLogsGet,
      listeningLogsCreate,
      listeningLogsUpdate,
      listeningLogsDelete,
      listPieces,
      createPiece,
      getPiece,
      updatePiece,
      deletePiece,
      authRegister,
      authLogin,
      authVerifyEmail,
      authResendCode,
      authRefresh,
    ];

    // Lambda エラー監視：各関数ごとにアラーム作成
    allFunctions.forEach((f, i) => {
      new cloudwatch.Alarm(this, `LambdaErrorAlarm${i}`, {
        alarmName: `classical-music-lake-${stageName}-lambda-${f.functionName}-errors`,
        alarmDescription: `Lambda 関数 ${f.functionName} でエラーが発生しています`,
        metric: f.metricErrors({ period: cdk.Duration.minutes(5) }),
        threshold: 1,
        evaluationPeriods: 1,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      });
    });

    // API Gateway 5xx エラー監視
    new cloudwatch.Alarm(this, "ApiGateway5xxAlarm", {
      alarmName: `classical-music-lake-${stageName}-api-5xx`,
      alarmDescription: "API Gateway で 5xx エラーが発生しています",
      metric: api.metricServerError({ period: cdk.Duration.minutes(5) }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    // DynamoDB スロットリング監視
    new cloudwatch.Alarm(this, "DynamoThrottleAlarm", {
      alarmName: `classical-music-lake-${stageName}-dynamo-throttle`,
      alarmDescription: "DynamoDB でスロットリングが発生しています",
      metric: listeningLogsTable.metric("ThrottledRequests", {
        statistic: "Sum",
        period: cdk.Duration.minutes(5),
      }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    // -------------------------
    // Outputs
    // -------------------------
    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url,
      description: "API Gateway URL (NUXT_PUBLIC_API_BASE_URL に設定)",
    });

    new cdk.CfnOutput(this, "SpaUrl", {
      value: this.corsAllowOrigin,
      description: "CloudFront URL (フロントエンド)",
    });

    new cdk.CfnOutput(this, "StorybookUrl", {
      value: `${this.corsAllowOrigin}/storybook/`,
      description: "Storybook URL",
    });

    new cdk.CfnOutput(this, "CognitoUserPoolId", {
      value: userPool.userPoolId,
      description: "Cognito User Pool ID",
    });

    new cdk.CfnOutput(this, "CognitoClientId", {
      value: appClient.userPoolClientId,
      description: "Cognito App Client ID",
    });

    new cdk.CfnOutput(this, "CognitoUserPoolArn", {
      value: userPool.userPoolArn,
      description: "Cognito User Pool ARN",
    });
  }

  private addCors(
    resource: IResource,
    methods: string[],
    allowHeaders: string[] = ["Content-Type"]
  ): void {
    resource.addCorsPreflight({
      allowOrigins: this.corsAllowOrigins,
      allowMethods: methods,
      allowHeaders,
    });
  }
}
