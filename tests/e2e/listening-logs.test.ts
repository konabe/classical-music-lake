import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { setup, createPage, url } from "@nuxt/test-utils/e2e";
import type { ListeningLog } from "../../types";

// テスト用 API ベース URL（Playwright の page.route() でインターセプト）
process.env.NUXT_PUBLIC_API_BASE_URL = "http://api.test";

await setup({
  rootDir: fileURLToPath(new URL("../..", import.meta.url)),
  browser: true,
  server: true,
});

const testLog: ListeningLog = {
  id: "e2e-test-id-001",
  listenedAt: "2024-01-15T20:00:00.000Z",
  composer: "ベートーヴェン",
  piece: "交響曲第9番「合唱」",
  rating: 5,
  isFavorite: true,
  memo: "圧倒的な第4楽章",
  createdAt: "2024-01-15T21:00:00.000Z",
  updatedAt: "2024-01-15T21:00:00.000Z",
};

const testLog2: ListeningLog = {
  id: "e2e-test-id-002",
  listenedAt: "2024-01-10T15:00:00.000Z",
  composer: "モーツァルト",
  piece: "レクイエム",
  rating: 4,
  isFavorite: false,
  createdAt: "2024-01-10T16:00:00.000Z",
  updatedAt: "2024-01-10T16:00:00.000Z",
};

/** 認証済み状態でページを開くヘルパー */
async function createAuthenticatedPage() {
  const page = await createPage();
  await page.addInitScript(() => localStorage.setItem("accessToken", "fake-token-for-test"));
  return page;
}

describe("鑑賞記録 E2E テスト", () => {
  describe("一覧ページ", () => {
    it("記録がない場合に空状態メッセージが表示される", async () => {
      const page = await createAuthenticatedPage();

      await page.route("http://api.test/listening-logs", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        }),
      );

      await page.goto(url("/listening-logs"));
      await page.waitForLoadState("networkidle");

      await page.waitForSelector("text=まだ記録がありません", { state: "visible" });
      const bodyText = await page.textContent("body");
      expect(bodyText).toContain("まだ記録がありません");
    });

    it("記録一覧が表示される", async () => {
      const page = await createAuthenticatedPage();

      await page.route("http://api.test/listening-logs", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([testLog, testLog2]),
        }),
      );

      await page.goto(url("/listening-logs"));
      await page.waitForLoadState("networkidle");

      const bodyText = await page.textContent("body");
      expect(bodyText).toContain("交響曲第9番「合唱」");
      expect(bodyText).toContain("ベートーヴェン");
      expect(bodyText).toContain("レクイエム");
      expect(bodyText).toContain("モーツァルト");
    });

    it("お気に入りバッジが表示される", async () => {
      const page = await createAuthenticatedPage();

      await page.route("http://api.test/listening-logs", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([testLog]),
        }),
      );

      await page.goto(url("/listening-logs"));
      await page.waitForLoadState("networkidle");

      await page.waitForSelector(".favorite-badge", { state: "visible" });
      const badge = await page.locator(".favorite-badge").count();
      expect(badge).toBeGreaterThan(0);
    });

    it("「新しい記録」ボタンが表示される", async () => {
      const page = await createAuthenticatedPage();

      await page.route("http://api.test/listening-logs", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        }),
      );

      await page.goto(url("/listening-logs"));
      await page.waitForLoadState("networkidle");

      const bodyText = await page.textContent("body");
      expect(bodyText).toContain("新しい記録");
    });
  });

  describe("新規作成ページ", () => {
    it("フォームが表示される", async () => {
      const page = await createAuthenticatedPage();
      await page.goto(url("/listening-logs/new"));
      await page.waitForLoadState("networkidle");

      const bodyText = await page.textContent("body");
      expect(bodyText).toContain("鑑賞記録を追加");
      expect(bodyText).toContain("作曲家");
    });

    it("送信ボタンのラベルが「記録する」", async () => {
      const page = await createAuthenticatedPage();
      await page.goto(url("/listening-logs/new"));
      await page.waitForLoadState("networkidle");

      await page.waitForSelector("button[type='submit']", { state: "visible" });
      const submitText = await page.locator("button[type='submit']").textContent();
      expect(submitText).toBe("記録する");
    });
  });

  describe("詳細ページ", () => {
    it("鑑賞ログの詳細が表示される", async () => {
      const page = await createAuthenticatedPage();

      await page.route("http://api.test/listening-logs/e2e-test-id-001", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(testLog),
        }),
      );

      await page.goto(url("/listening-logs/e2e-test-id-001"));
      await page.waitForLoadState("networkidle");

      const bodyText = await page.textContent("body");
      expect(bodyText).toContain("交響曲第9番「合唱」");
      expect(bodyText).toContain("ベートーヴェン");
    });

    it("メモが表示される", async () => {
      const page = await createAuthenticatedPage();

      await page.route("http://api.test/listening-logs/e2e-test-id-001", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(testLog),
        }),
      );

      await page.goto(url("/listening-logs/e2e-test-id-001"));
      await page.waitForLoadState("networkidle");

      const bodyText = await page.textContent("body");
      expect(bodyText).toContain("圧倒的な第4楽章");
    });
  });
});
