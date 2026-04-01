import { describe, it, expect } from "vitest";

const API_BASE_URL = process.env.API_BASE_URL;

if (API_BASE_URL === undefined || API_BASE_URL === "") {
  throw new Error("API_BASE_URL environment variable is required");
}

describe("公開API IT", () => {
  describe("楽曲マスタ API", () => {
    it("GET /pieces が 200 を返す", async () => {
      const response = await fetch(`${API_BASE_URL}/pieces`);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
    });

    it("GET /pieces が CORS ヘッダーを返す", async () => {
      const response = await fetch(`${API_BASE_URL}/pieces`);

      const corsHeader = response.headers.get("access-control-allow-origin");
      expect(corsHeader).not.toBeNull();
    });

    let createdPieceId: string | undefined;

    it("POST /pieces で楽曲を作成できる", async () => {
      const response = await fetch(`${API_BASE_URL}/pieces`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "IT テスト用楽曲",
          composer: "テスト作曲家",
        }),
      });

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body.title).toBe("IT テスト用楽曲");
      expect(body.composer).toBe("テスト作曲家");
      expect(body.id).toBeDefined();
      createdPieceId = body.id;
    });

    it("GET /pieces/{id} で作成した楽曲を取得できる", async () => {
      if (createdPieceId === undefined) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/pieces/${createdPieceId}`);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.id).toBe(createdPieceId);
      expect(body.title).toBe("IT テスト用楽曲");
    });

    it("PUT /pieces/{id} で楽曲を更新できる", async () => {
      if (createdPieceId === undefined) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/pieces/${createdPieceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "IT テスト用楽曲（更新後）",
        }),
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.title).toBe("IT テスト用楽曲（更新後）");
    });

    it("DELETE /pieces/{id} で楽曲を削除できる", async () => {
      if (createdPieceId === undefined) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/pieces/${createdPieceId}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(204);
    });

    it("GET /pieces/{id} で削除した楽曲が 404 になる", async () => {
      if (createdPieceId === undefined) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/pieces/${createdPieceId}`);

      expect(response.status).toBe(404);
    });
  });

  describe("楽曲マスタ バリデーション", () => {
    it("POST /pieces で空ボディを送ると 400 を返す", async () => {
      const response = await fetch(`${API_BASE_URL}/pieces`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
    });

    it("GET /pieces/nonexistent-id が 404 を返す", async () => {
      const response = await fetch(`${API_BASE_URL}/pieces/nonexistent-id`);

      expect(response.status).toBe(404);
    });
  });
});

describe("認証API IT", () => {
  describe("POST /auth/login", () => {
    it("不正な認証情報で 401 を返す", async () => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "nonexistent@example.com",
          password: "WrongPass123",
        }),
      });

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe("InvalidCredentials");
    });

    it("空ボディで 400 を返す", async () => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /auth/verify-email", () => {
    it("不正なコードで 400 を返す", async () => {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "nonexistent@example.com",
          code: "000000",
        }),
      });

      // Cognito は存在しないユーザーでも 400 系を返す
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);
    });
  });
});

describe("認証保護 API IT", () => {
  it("GET /listening-logs が認証なしで 401 を返す", async () => {
    const response = await fetch(`${API_BASE_URL}/listening-logs`);

    expect(response.status).toBe(401);
  });

  it("POST /listening-logs が認証なしで 401 を返す", async () => {
    const response = await fetch(`${API_BASE_URL}/listening-logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listenedAt: "2024-01-15T19:30:00.000Z",
        composer: "テスト",
        piece: "テスト曲",
        rating: 3,
        isFavorite: false,
      }),
    });

    expect(response.status).toBe(401);
  });
});
