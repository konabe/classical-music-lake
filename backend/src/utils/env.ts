export class AppEnv {
  readonly cognitoClientId: string;

  constructor() {
    const cognitoClientId = process.env.COGNITO_CLIENT_ID;
    if (!cognitoClientId) {
      throw new Error("COGNITO_CLIENT_ID environment variable is required");
    }
    this.cognitoClientId = cognitoClientId;
  }
}

export const env = new AppEnv();
