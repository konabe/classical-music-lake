import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { setup, createPage, url } from "@nuxt/test-utils/e2e";
import { allPieceFixtures } from "../fixtures/pieces";

process.env.NUXT_PUBLIC_API_BASE_URL = "http://api.test";

await setup({
  rootDir: fileURLToPath(new URL("../..", import.meta.url)),
  browser: true,
  server: true,
});

describe("ホームページ E2E テスト", () => {
  describe("ヒーローセクション", () => {
    it("タイトルとサブタイトルが表示される", async () => {
      const page = await createPage();

      await page.route("http://api.test/pieces", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        })
      );

      await page.goto(url("/"));
      await page.waitForLoadState("networkidle");

      const bodyText = await page.textContent("body");
      expect(bodyText).toContain("Nocturne");
      expect(bodyText).toContain("鑑賞した音楽を、静かに記録する。");
    });

    it("CTA リンクが表示される", async () => {
      const page = await createPage();

      await page.route("http://api.test/pieces", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        })
      );

      await page.goto(url("/"));
      await page.waitForLoadState("networkidle");

      const bodyText = await page.textContent("body");
      expect(bodyText).toContain("鑑賞記録を残す");
      expect(bodyText).toContain("楽曲を探す");
    });
  });

  describe("メニューカード", () => {
    it("鑑賞記録と楽曲カードが表示される", async () => {
      const page = await createPage();

      await page.route("http://api.test/pieces", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        })
      );

      await page.goto(url("/"));
      await page.waitForLoadState("networkidle");

      const bodyText = await page.textContent("body");
      expect(bodyText).toContain("鑑賞記録");
      expect(bodyText).toContain("楽曲を探す");
    });
  });

  describe("楽曲データの表示", () => {
    it("楽曲一覧から取得したデータが表示される", async () => {
      const page = await createPage();

      await page.route("http://api.test/pieces", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(allPieceFixtures),
        })
      );

      await page.goto(url("/"));
      await page.waitForLoadState("networkidle");

      const bodyText = await page.textContent("body");
      expect(bodyText).toContain("ベートーヴェン");
    });
  });

  describe("ナビゲーション", () => {
    it("「鑑賞記録を残す」リンクから鑑賞記録ページに遷移できる", async () => {
      const page = await createPage();
      await page.addInitScript(() => localStorage.setItem("accessToken", "fake-token-for-test"));

      await page.route("http://api.test/pieces", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        })
      );
      await page.route("http://api.test/listening-logs", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        })
      );

      await page.goto(url("/"));
      await page.waitForLoadState("networkidle");

      await page.click(".cta-primary");
      await page.waitForURL("**/listening-logs");

      expect(page.url()).toContain("/listening-logs");
    });
  });
});
