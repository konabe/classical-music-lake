import { describe, it, expect, afterEach } from "vitest";

import { AppEnv } from "./env";

describe("AppEnv", () => {
  afterEach(() => {
    process.env.COGNITO_CLIENT_ID = "test-client-id";
  });

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
