export class AppEnv {
  readonly cognitoClientId: string;
  readonly corsAllowOrigins: string[];
  readonly awsRegion: string;
  readonly dynamoTableListeningLogs: string;
  readonly dynamoTablePieces: string;
  readonly dynamoTableConcertLogs: string;
  readonly dynamoTableComposers: string;

  constructor() {
    const cognitoClientId = process.env.COGNITO_CLIENT_ID;
    if (cognitoClientId === undefined || cognitoClientId === "") {
      throw new Error("COGNITO_CLIENT_ID environment variable is required");
    }
    this.cognitoClientId = cognitoClientId;
    this.corsAllowOrigins = (process.env.CORS_ALLOW_ORIGIN ?? "*").split(",").map((o) => {
      return o.trim();
    });
    this.awsRegion = process.env.AWS_REGION ?? "ap-northeast-1";
    this.dynamoTableListeningLogs =
      process.env.DYNAMO_TABLE_LISTENING_LOGS ?? "classical-music-listening-logs";
    this.dynamoTablePieces = process.env.DYNAMO_TABLE_PIECES ?? "classical-music-pieces";
    this.dynamoTableConcertLogs =
      process.env.DYNAMO_TABLE_CONCERT_LOGS ?? "classical-music-concert-logs";
    this.dynamoTableComposers = process.env.DYNAMO_TABLE_COMPOSERS ?? "classical-music-composers";
  }
}

export function getEnv(): AppEnv {
  return new AppEnv();
}
