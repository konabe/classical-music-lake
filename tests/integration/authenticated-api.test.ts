import { describe, it, expect, beforeAll, afterAll } from "vitest";

const API_BASE_URL = process.env.API_BASE_URL;
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID;
const AWS_REGION = process.env.AWS_REGION ?? "ap-northeast-1";

if (API_BASE_URL === undefined || API_BASE_URL === "") {
  throw new Error("API_BASE_URL environment variable is required");
}
if (COGNITO_USER_POOL_ID === undefined || COGNITO_USER_POOL_ID === "") {
  throw new Error("COGNITO_USER_POOL_ID environment variable is required");
}
if (COGNITO_CLIENT_ID === undefined || COGNITO_CLIENT_ID === "") {
  throw new Error("COGNITO_CLIENT_ID environment variable is required");
}

const TEST_EMAIL = `it-test-${Date.now()}@example.com`;
const TEST_PASSWORD = "ItTest1234";

let accessToken: string | undefined;

async function adminCreateTestUser(): Promise<void> {
  const { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand } =
    await import("@aws-sdk/client-cognito-identity-provider");

  const client = new CognitoIdentityProviderClient({ region: AWS_REGION });

  await client.send(
    new AdminCreateUserCommand({
      UserPoolId: COGNITO_USER_POOL_ID,
      Username: TEST_EMAIL,
      UserAttributes: [
        { Name: "email", Value: TEST_EMAIL },
        { Name: "email_verified", Value: "true" },
      ],
      MessageAction: "SUPPRESS",
    })
  );

  await client.send(
    new AdminSetUserPasswordCommand({
      UserPoolId: COGNITO_USER_POOL_ID,
      Username: TEST_EMAIL,
      Password: TEST_PASSWORD,
      Permanent: true,
    })
  );
}

async function loginTestUser(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
  });

  if (response.status !== 200) {
    const body = await response.text();
    throw new Error(`Login failed (${response.status}): ${body}`);
  }

  const body = await response.json();
  return body.accessToken;
}

async function adminDeleteTestUser(): Promise<void> {
  const { CognitoIdentityProviderClient, AdminDeleteUserCommand } =
    await import("@aws-sdk/client-cognito-identity-provider");

  const client = new CognitoIdentityProviderClient({ region: AWS_REGION });

  try {
    await client.send(
      new AdminDeleteUserCommand({
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: TEST_EMAIL,
      })
    );
  } catch {
    // テストユーザーが存在しない場合は無視
  }
}

beforeAll(async () => {
  await adminCreateTestUser();
  accessToken = await loginTestUser();
}, 30000);

afterAll(async () => {
  await adminDeleteTestUser();
}, 15000);

function authHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
}

describe("認証付き API IT", () => {
  describe("視聴ログ CRUD", () => {
    let createdLogId: string | undefined;

    it("GET /listening-logs が認証付きで 200 を返す", async () => {
      const response = await fetch(`${API_BASE_URL}/listening-logs`, {
        headers: authHeaders(),
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
    });

    it("POST /listening-logs で視聴ログを作成できる", async () => {
      const response = await fetch(`${API_BASE_URL}/listening-logs`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          listenedAt: "2024-06-01T10:00:00.000Z",
          composer: "ベートーヴェン",
          piece: "交響曲第5番",
          rating: 5,
          isFavorite: true,
          memo: "IT テスト用データ",
        }),
      });

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body.composer).toBe("ベートーヴェン");
      expect(body.piece).toBe("交響曲第5番");
      expect(body.rating).toBe(5);
      expect(body.id).toBeDefined();
      createdLogId = body.id;
    });

    it("GET /listening-logs/{id} で作成したログを取得できる", async () => {
      if (createdLogId === undefined) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/listening-logs/${createdLogId}`, {
        headers: authHeaders(),
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.id).toBe(createdLogId);
      expect(body.composer).toBe("ベートーヴェン");
    });

    it("PUT /listening-logs/{id} でログを更新できる", async () => {
      if (createdLogId === undefined) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/listening-logs/${createdLogId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          rating: 4,
          memo: "IT テスト更新",
        }),
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.rating).toBe(4);
      expect(body.memo).toBe("IT テスト更新");
    });

    it("DELETE /listening-logs/{id} でログを削除できる", async () => {
      if (createdLogId === undefined) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/listening-logs/${createdLogId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      expect(response.status).toBe(204);
    });

    it("GET /listening-logs/{id} で削除したログが 404 になる", async () => {
      if (createdLogId === undefined) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/listening-logs/${createdLogId}`, {
        headers: authHeaders(),
      });

      expect(response.status).toBe(404);
    });
  });

  describe("視聴ログ バリデーション", () => {
    it("POST /listening-logs で空ボディが 400 を返す", async () => {
      const response = await fetch(`${API_BASE_URL}/listening-logs`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
    });

    it("POST /listening-logs で不正な rating が 400 を返す", async () => {
      const response = await fetch(`${API_BASE_URL}/listening-logs`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          listenedAt: "2024-06-01T10:00:00.000Z",
          composer: "テスト",
          piece: "テスト曲",
          rating: 10,
          isFavorite: false,
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe("トークンリフレッシュ", () => {
    it("POST /auth/refresh で無効なトークンが 401 を返す", async () => {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: "invalid-token" }),
      });

      expect(response.status).toBe(401);
    });
  });
});
