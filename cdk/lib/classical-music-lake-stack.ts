import * as cdk from 'aws-cdk-lib'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import { Construct } from 'constructs'
import * as path from 'path'

export class ClassicalMusicLakeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // -------------------------
    // DynamoDB テーブル
    // -------------------------
    const listeningLogsTable = new dynamodb.Table(this, 'ListeningLogsTable', {
      tableName: 'classical-music-listening-logs',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    })

    const concertsTable = new dynamodb.Table(this, 'ConcertsTable', {
      tableName: 'classical-music-concerts',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    })

    // -------------------------
    // Lambda 共通設定
    // -------------------------
    const backendSrcDir = path.join(__dirname, '../../backend/src')

    const commonEnv: Record<string, string> = {
      DYNAMO_TABLE_LISTENING_LOGS: listeningLogsTable.tableName,
      DYNAMO_TABLE_CONCERTS: concertsTable.tableName,
    }

    const commonFnProps: Omit<lambdaNodejs.NodejsFunctionProps, 'entry'> = {
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: commonEnv,
      bundling: {
        minify: true,
        sourceMap: false,
        target: 'es2020',
      },
    }

    const fn = (id: string, entry: string): lambdaNodejs.NodejsFunction =>
      new lambdaNodejs.NodejsFunction(this, id, {
        ...commonFnProps,
        entry: path.join(backendSrcDir, entry),
        handler: 'handler',
      })

    // -------------------------
    // Lambda 関数
    // -------------------------
    const listeningLogsList   = fn('ListeningLogsList',   'listening-logs/list.ts')
    const listeningLogsGet    = fn('ListeningLogsGet',    'listening-logs/get.ts')
    const listeningLogsCreate = fn('ListeningLogsCreate', 'listening-logs/create.ts')
    const listeningLogsUpdate = fn('ListeningLogsUpdate', 'listening-logs/update.ts')
    const listeningLogsDelete = fn('ListeningLogsDelete', 'listening-logs/delete.ts')

    const concertsList   = fn('ConcertsList',   'concerts/list.ts')
    const concertsGet    = fn('ConcertsGet',    'concerts/get.ts')
    const concertsCreate = fn('ConcertsCreate', 'concerts/create.ts')
    const concertsUpdate = fn('ConcertsUpdate', 'concerts/update.ts')
    const concertsDelete = fn('ConcertsDelete', 'concerts/delete.ts')

    // -------------------------
    // DynamoDB 権限付与
    // -------------------------
    listeningLogsTable.grantReadData(listeningLogsList)
    listeningLogsTable.grantReadData(listeningLogsGet)
    listeningLogsTable.grantWriteData(listeningLogsCreate)
    listeningLogsTable.grantReadWriteData(listeningLogsUpdate)
    listeningLogsTable.grantWriteData(listeningLogsDelete)

    concertsTable.grantReadData(concertsList)
    concertsTable.grantReadData(concertsGet)
    concertsTable.grantWriteData(concertsCreate)
    concertsTable.grantReadWriteData(concertsUpdate)
    concertsTable.grantWriteData(concertsDelete)

    // -------------------------
    // API Gateway
    // -------------------------
    const api = new apigateway.RestApi(this, 'Api', {
      restApiName: 'classical-music-lake',
      deployOptions: { stageName: 'prod' },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type'],
      },
    })

    const integ = (fn: lambda.IFunction) =>
      new apigateway.LambdaIntegration(fn)

    // /listening-logs
    const listeningLogsResource = api.root.addResource('listening-logs')
    listeningLogsResource.addMethod('GET',  integ(listeningLogsList))
    listeningLogsResource.addMethod('POST', integ(listeningLogsCreate))

    // /listening-logs/{id}
    const listeningLogResource = listeningLogsResource.addResource('{id}')
    listeningLogResource.addMethod('GET',    integ(listeningLogsGet))
    listeningLogResource.addMethod('PUT',    integ(listeningLogsUpdate))
    listeningLogResource.addMethod('DELETE', integ(listeningLogsDelete))

    // /concerts
    const concertsResource = api.root.addResource('concerts')
    concertsResource.addMethod('GET',  integ(concertsList))
    concertsResource.addMethod('POST', integ(concertsCreate))

    // /concerts/{id}
    const concertResource = concertsResource.addResource('{id}')
    concertResource.addMethod('GET',    integ(concertsGet))
    concertResource.addMethod('PUT',    integ(concertsUpdate))
    concertResource.addMethod('DELETE', integ(concertsDelete))

    // -------------------------
    // S3 + CloudFront (SPA ホスティング)
    // -------------------------
    const spaBucket = new s3.Bucket(this, 'SpaBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    const distribution = new cloudfront.Distribution(this, 'SpaDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(spaBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        // SPA のクライアントサイドルーティング対応
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
    })

    new s3deploy.BucketDeployment(this, 'SpaDeployment', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../.output/public'))],
      destinationBucket: spaBucket,
      distribution,
      distributionPaths: ['/*'],
    })

    // -------------------------
    // Outputs
    // -------------------------
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL (API_BASE_URL に設定)',
    })

    new cdk.CfnOutput(this, 'SpaUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront URL (フロントエンド)',
    })
  }
}
