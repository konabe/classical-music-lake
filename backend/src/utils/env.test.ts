import { describe, it, expect, afterEach } from "vitest";

import { AppEnv } from "./env";

describe("AppEnv", () => {
  afterEach(() => {
    process.env.COGNITO_CLIENT_ID = "test-client-id";
    delete process.env.CORS_ALLOW_ORIGIN;
    delete process.env.AWS_REGION;
    delete process.env.DYNAMO_TABLE_LISTENING_LOGS;
    delete process.env.DYNAMO_TABLE_PIECES;
  });

  describe("必須変数", () => {
    it("COGNITO_CLIENT_ID が設定されている場合はインスタンスを生成できる", () => {
      process.env.COGNITO_CLIENT_ID = "my-client-id";
      const appEnv = new AppEnv();
      expect(appEnv.cognitoClientId).toBe("my-client-id");
    });

    it("COGNITO_CLIENT_ID が未設定の場合は例外をスローする", () => {
      delete process.env.COGNITO_CLIENT_ID;
      expect(() => new AppEnv()).toThrow("COGNITO_CLIENT_ID environment variable is required");
    });
  });

  describe("オプション変数のデフォルト値", () => {
    it("CORS_ALLOW_ORIGIN が未設定の場合は * をデフォルトとして使用する", () => {
      const appEnv = new AppEnv();
      expect(appEnv.corsAllowOrigin).toBe("*");
    });

    it("AWS_REGION が未設定の場合は ap-northeast-1 をデフォルトとして使用する", () => {
      const appEnv = new AppEnv();
      expect(appEnv.awsRegion).toBe("ap-northeast-1");
    });

    it("DYNAMO_TABLE_LISTENING_LOGS が未設定の場合はデフォルト値を使用する", () => {
      const appEnv = new AppEnv();
      expect(appEnv.dynamoTableListeningLogs).toBe("classical-music-listening-logs");
    });

    it("DYNAMO_TABLE_PIECES が未設定の場合はデフォルト値を使用する", () => {
      const appEnv = new AppEnv();
      expect(appEnv.dynamoTablePieces).toBe("classical-music-pieces");
    });
  });

  describe("オプション変数の上書き", () => {
    it("環境変数が設定されている場合はその値を使用する", () => {
      process.env.CORS_ALLOW_ORIGIN = "https://example.com";
      process.env.AWS_REGION = "us-east-1";
      process.env.DYNAMO_TABLE_LISTENING_LOGS = "my-listening-logs";
      process.env.DYNAMO_TABLE_PIECES = "my-pieces";

      const appEnv = new AppEnv();
      expect(appEnv.corsAllowOrigin).toBe("https://example.com");
      expect(appEnv.awsRegion).toBe("us-east-1");
      expect(appEnv.dynamoTableListeningLogs).toBe("my-listening-logs");
      expect(appEnv.dynamoTablePieces).toBe("my-pieces");
    });
  });
});
