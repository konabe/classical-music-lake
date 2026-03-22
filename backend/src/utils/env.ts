export class AppEnv {
  readonly cognitoClientId: string;
  readonly corsAllowOrigin: string;
  readonly awsRegion: string;
  readonly dynamoTableListeningLogs: string;
  readonly dynamoTablePieces: string;

  constructor() {
    const cognitoClientId = process.env.COGNITO_CLIENT_ID;
    if (!cognitoClientId) {
      throw new Error("COGNITO_CLIENT_ID environment variable is required");
    }
    this.cognitoClientId = cognitoClientId;
    this.corsAllowOrigin = process.env.CORS_ALLOW_ORIGIN ?? "*";
    this.awsRegion = process.env.AWS_REGION ?? "ap-northeast-1";
    this.dynamoTableListeningLogs =
      process.env.DYNAMO_TABLE_LISTENING_LOGS ?? "classical-music-listening-logs";
    this.dynamoTablePieces = process.env.DYNAMO_TABLE_PIECES ?? "classical-music-pieces";
  }
}

export const env = new AppEnv();
