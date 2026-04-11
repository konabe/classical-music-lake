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
import * as cognito from "aws-cdk-lib/aws-cognito";
import type { Construct } from "constructs";
import * as path from "node:path";

export type StageName = "dev" | "stg" | "prod";

export interface ClassicalMusicLakeStackProps extends cdk.StackProps {
  stageName: StageName;
}

export class ClassicalMusicLakeStack extends cdk.Stack {
  private readonly corsAllowOrigin: string = "";
  private readonly corsAllowOrigins: string[] = [];

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
      removalPolicy: this.removalPolicy(isProd),
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
      removalPolicy: this.removalPolicy(isProd),
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

    // -------------------------
    // S3 + CloudFront (SPA ホスティング)
    // App Client の callback URL に CloudFront ドメインが必要なため先に作成する
    // -------------------------
    const spaBucket = new s3.Bucket(this, "SpaBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      // prod は RETAIN（本番アセットの誤削除防止）、stg/dev は DESTROY
      removalPolicy: this.removalPolicy(isProd),
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

    // -------------------------
    // Google Identity Provider
    // GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET 環境変数が設定されている場合のみ作成
    // -------------------------
    const googleClientId = process.env.GOOGLE_CLIENT_ID ?? "";
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ?? "";
    const hasGoogleCredentials = googleClientId !== "" && googleClientSecret !== "";

    let googleIdP: cognito.UserPoolIdentityProviderGoogle | undefined;
    if (hasGoogleCredentials) {
      googleIdP = new cognito.UserPoolIdentityProviderGoogle(this, "GoogleProvider", {
        userPool,
        clientId: googleClientId,
        clientSecretValue: cdk.SecretValue.unsafePlainText(googleClientSecret),
        scopes: ["email", "profile", "openid"],
        attributeMapping: {
          email: cognito.ProviderAttribute.GOOGLE_EMAIL,
          givenName: cognito.ProviderAttribute.GOOGLE_GIVEN_NAME,
          familyName: cognito.ProviderAttribute.GOOGLE_FAMILY_NAME,
        },
      });
    }

    // App Client: フロントエンド用
    const callbackUrls = [`https://${distribution.distributionDomainName}/auth/callback`];
    const logoutUrls = [`https://${distribution.distributionDomainName}/auth/login`];
    if (stageName === "dev") {
      callbackUrls.push("http://localhost:3010/auth/callback");
      logoutUrls.push("http://localhost:3010/auth/login");
    }

    const appClient = userPool.addClient("FrontendClient", {
      authFlows: {
        userPassword: true,
        custom: true,
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
        ...(hasGoogleCredentials ? [cognito.UserPoolClientIdentityProvider.GOOGLE] : []),
      ],
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.EMAIL, cognito.OAuthScope.OPENID, cognito.OAuthScope.PROFILE],
        callbackUrls,
        logoutUrls,
      },
      accessTokenValidity: cdk.Duration.minutes(60),
      idTokenValidity: cdk.Duration.minutes(60),
      refreshTokenValidity: cdk.Duration.days(30),
      preventUserExistenceErrors: true,
    });

    // Google IdP が存在する場合、App Client との依存関係を明示
    if (googleIdP !== undefined) {
      appClient.node.addDependency(googleIdP);
    }

    // Cognito Hosted UI ドメイン（Google OAuth のリダイレクト先として必要）
    const cognitoDomainPrefix = isProd
      ? "classical-music-lake"
      : `classical-music-lake-${stageName}`;
    userPool.addDomain("CognitoDomain", {
      cognitoDomain: { domainPrefix: cognitoDomainPrefix },
    });

    // NOTE: COGNITO_USER_POOL_ID / COGNITO_CLIENT_ID は commonEnv に含めない。
    // authPreSignUp を addTrigger すると userPool → authPreSignUp の依存が生まれ、
    // ここで userPool.userPoolId を参照すると authPreSignUp → userPool の依存も生まれて
    // 循環依存になる。authPreSignUp は event.userPoolId から取得するため不要。
    // これらは authPreSignUp を除く関数に個別に addEnvironment() で付与する。
    // -------------------------
    // DynamoDB テーブル（コンサート記録）
    // -------------------------
    const concertLogsTableName = isProd
      ? "classical-music-concert-logs"
      : `classical-music-concert-logs-${stageName}`;

    const concertLogsTable = new dynamodb.Table(this, "ConcertLogsTable", {
      tableName: concertLogsTableName,
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: this.removalPolicy(isProd),
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
    });

    // GSI1: userId + createdAt でユーザー別一覧取得
    concertLogsTable.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "createdAt", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    const commonEnv: Record<string, string> = {
      DYNAMO_TABLE_LISTENING_LOGS: listeningLogsTable.tableName,
      DYNAMO_TABLE_PIECES: piecesTable.tableName,
      DYNAMO_TABLE_CONCERT_LOGS: concertLogsTable.tableName,
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
        removalPolicy: this.removalPolicy(isProd),
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

    const listPieces = fn("ListPieces", "handlers/pieces/list.ts");
    const createPiece = fn("CreatePiece", "handlers/pieces/create.ts");
    const getPiece = fn("GetPiece", "handlers/pieces/get.ts");
    const updatePiece = fn("UpdatePiece", "handlers/pieces/update.ts");
    const deletePiece = fn("DeletePiece", "handlers/pieces/delete.ts");

    const authRegister = fn("AuthRegister", "auth/register.ts");
    const authLogin = fn("AuthLogin", "auth/login.ts");
    const authVerifyEmail = fn("AuthVerifyEmail", "auth/verify-email.ts");
    const authResendCode = fn("AuthResendCode", "auth/resend-verification-code.ts");
    const authRefresh = fn("AuthRefresh", "auth/refresh.ts");
    const authPreSignUp = fn("AuthPreSignUp", "auth/pre-signup.ts");

    const concertLogsList = fn("ConcertLogsList", "concert-logs/list.ts");
    const concertLogsCreate = fn("ConcertLogsCreate", "concert-logs/create.ts");
    const concertLogsGet = fn("ConcertLogsGet", "concert-logs/get.ts");
    const concertLogsUpdate = fn("ConcertLogsUpdate", "concert-logs/update.ts");
    const concertLogsDelete = fn("ConcertLogsDelete", "concert-logs/delete.ts");

    // PreSignUp トリガー: Google 等の外部プロバイダーで既存メールアドレスのユーザーが
    // いる場合に自動でアカウントリンクを行う
    userPool.addTrigger(cognito.UserPoolOperation.PRE_SIGN_UP, authPreSignUp);

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

    // auth/pre-signup: ListUsers + AdminLinkProviderForUser を実行
    // NOTE: userPool.userPoolArn を使うと CognitoUserPool ↔ AuthPreSignUp の循環依存が
    // 発生するため、リソースを "*" にして依存関係を断ち切る
    const cognitoPreSignUpPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["cognito-idp:ListUsers", "cognito-idp:AdminLinkProviderForUser"],
      resources: ["*"],
    });
    authPreSignUp.addToRolePolicy(cognitoPreSignUpPolicy);

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
    concertLogsTable.grantReadData(concertLogsList);
    concertLogsTable.grantWriteData(concertLogsCreate);
    concertLogsTable.grantReadData(concertLogsGet);
    concertLogsTable.grantReadWriteData(concertLogsUpdate);
    concertLogsTable.grantReadWriteData(concertLogsDelete);

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
      removalPolicy: this.removalPolicy(isProd),
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

    // /concert-logs
    const concertLogsResource = api.root.addResource("concert-logs");
    concertLogsResource.addMethod("GET", integ(concertLogsList), withAuth);
    concertLogsResource.addMethod("POST", integ(concertLogsCreate), withAuth);

    // /concert-logs/{id}
    const concertLogResource = concertLogsResource.addResource("{id}");
    concertLogResource.addMethod("GET", integ(concertLogsGet), withAuth);
    concertLogResource.addMethod("PUT", integ(concertLogsUpdate), withAuth);
    concertLogResource.addMethod("DELETE", integ(concertLogsDelete), withAuth);

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

    const authExcludedFunctions = [
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
      concertLogsList,
      concertLogsCreate,
      concertLogsGet,
      concertLogsUpdate,
      concertLogsDelete,
    ];

    authExcludedFunctions.forEach((fn) => {
      fn.addEnvironment("CORS_ALLOW_ORIGIN", this.corsAllowOrigins.join(","));
    });

    // authPreSignUp を除く関数に Cognito 環境変数を付与
    // （authPreSignUp は event.userPoolId から取得するため不要かつ循環依存を避けるため除外）
    authExcludedFunctions.forEach((fn) => {
      fn.addEnvironment("COGNITO_USER_POOL_ID", userPool.userPoolId);
      fn.addEnvironment("COGNITO_CLIENT_ID", appClient.userPoolClientId);
    });

    // API Gateway の CORS オリジンも CloudFront URL に限定
    // listening-logs は Authorization ヘッダーが必要なため allowHeaders に追加
    this.addCors(
      concertLogsResource,
      ["GET", "POST", "OPTIONS"],
      ["Content-Type", "Authorization"]
    );
    this.addCors(
      concertLogResource,
      ["GET", "PUT", "DELETE", "OPTIONS"],
      ["Content-Type", "Authorization"]
    );
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

    // NOTE: SPA ファイルの S3 アップロードは GitHub Actions ワークフローで実行する。
    // CDK デプロイ後にスタック出力を読み取ってフロントエンドをビルドするため、
    // CDK BucketDeployment ではなくワークフローの aws s3 sync で行う。

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

    // NOTE: Storybook ファイルの S3 アップロードも GitHub Actions ワークフローで実行する。

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
      authPreSignUp,
      concertLogsList,
      concertLogsCreate,
      concertLogsGet,
      concertLogsUpdate,
      concertLogsDelete,
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

    new cdk.CfnOutput(this, "CognitoDomainName", {
      value: `${cognitoDomainPrefix}.auth.${this.region}.amazoncognito.com`,
      description: "Cognito Hosted UI Domain (NUXT_PUBLIC_COGNITO_DOMAIN に設定)",
    });

    new cdk.CfnOutput(this, "SpaBucketName", {
      value: spaBucket.bucketName,
      description: "S3 Bucket Name for SPA static files",
    });

    new cdk.CfnOutput(this, "DistributionId", {
      value: distribution.distributionId,
      description: "CloudFront Distribution ID",
    });
  }

  private removalPolicy(isProd: boolean): cdk.RemovalPolicy {
    return isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY;
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
