import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { setup, createPage, url } from "@nuxt/test-utils/e2e";

process.env.NUXT_PUBLIC_API_BASE_URL = "http://api.test";

await setup({
  rootDir: fileURLToPath(new URL("../..", import.meta.url)),
  browser: true,
  server: true,
});

describe("ユーザーログアウト E2E テスト", () => {
  describe("ログアウトボタンの表示", () => {
    it("ログイン状態のとき、ナビゲーションバーにログアウトボタンが表示される", async () => {
      const page = await createPage();
      await page.addInitScript(() => localStorage.setItem("accessToken", "fake-token-for-test"));

      await page.route("http://api.test/listening-logs", (route) =>
        route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
      );

      await page.goto(url("/listening-logs"));
      await page.waitForLoadState("networkidle");

      await page.waitForSelector("button.logout-button", { state: "visible" });
      const buttonText = await page.locator("button.logout-button").textContent();
      expect(buttonText).toBe("ログアウト");
    });

    it("未ログイン状態のとき、ログアウトボタンが表示されない", async () => {
      const page = await createPage();

      await page.goto(url("/auth/login"));
      await page.waitForLoadState("networkidle");

      const logoutButton = await page.locator("button.logout-button").count();
      expect(logoutButton).toBe(0);
    });
  });

  describe("ログアウト処理", () => {
    it("ログアウトボタン押下時、localStorage の accessToken が削除される", async () => {
      const page = await createPage();
      await page.addInitScript(() => localStorage.setItem("accessToken", "fake-token-for-test"));

      await page.route("http://api.test/listening-logs", (route) =>
        route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
      );

      await page.goto(url("/listening-logs"));
      await page.waitForLoadState("networkidle");

      await page.waitForSelector("button.logout-button", { state: "visible" });
      await page.click("button.logout-button");
      await page.waitForLoadState("networkidle");

      const token = await page.evaluate(() => localStorage.getItem("accessToken"));
      expect(token).toBeNull();
    });
  });

  describe("リダイレクト", () => {
    it("ログアウト後、ログイン画面にリダイレクトされる", async () => {
      const page = await createPage();
      await page.addInitScript(() => localStorage.setItem("accessToken", "fake-token-for-test"));

      await page.route("http://api.test/listening-logs", (route) =>
        route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
      );

      await page.goto(url("/listening-logs"));
      await page.waitForLoadState("networkidle");

      await page.waitForSelector("button.logout-button", { state: "visible" });
      await page.click("button.logout-button");
      await page.waitForURL("**/auth/login");

      expect(page.url()).toContain("/auth/login");
    });
  });

  describe("ログイン画面での動作確認", () => {
    it("ログアウト後、ログイン画面が表示される", async () => {
      const page = await createPage();
      await page.addInitScript(() => localStorage.setItem("accessToken", "fake-token-for-test"));

      await page.route("http://api.test/listening-logs", (route) =>
        route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
      );

      await page.goto(url("/listening-logs"));
      await page.waitForLoadState("networkidle");

      await page.waitForSelector("button.logout-button", { state: "visible" });
      await page.click("button.logout-button");
      await page.waitForURL("**/auth/login");
      await page.waitForLoadState("networkidle");

      const bodyText = await page.textContent("body");
      expect(bodyText).toContain("ログイン");
      expect(bodyText).toContain("メールアドレス");
      expect(bodyText).toContain("パスワード");
    });

    it("ログアウト後、保護されたページ（視聴ログ一覧）へのアクセスが制限される", async () => {
      const page = await createPage();

      await page.goto(url("/listening-logs"));
      await page.waitForLoadState("networkidle");

      expect(page.url()).toContain("/auth/login");
    });
  });
});
