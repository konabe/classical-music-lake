import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { setup, createPage, url } from "@nuxt/test-utils/e2e";

process.env.NUXT_PUBLIC_API_BASE_URL = "http://api.test";

await setup({
  rootDir: fileURLToPath(new URL("../..", import.meta.url)),
  browser: true,
  server: true,
});

describe("認証ページ E2E テスト", () => {
  describe("ログインページ", () => {
    it("ログインフォームが表示される", async () => {
      const page = await createPage();

      await page.goto(url("/auth/login"));
      await page.waitForLoadState("networkidle");

      const bodyText = await page.textContent("body");
      expect(bodyText).toContain("ログイン");
      expect(bodyText).toContain("メールアドレス");
      expect(bodyText).toContain("パスワード");
    });

    it("送信ボタンが表示される", async () => {
      const page = await createPage();

      await page.goto(url("/auth/login"));
      await page.waitForLoadState("networkidle");

      await page.waitForSelector("button[type='submit']", { state: "visible" });
      const submitButton = await page.locator("button[type='submit']").textContent();
      expect(submitButton).toContain("ログイン");
    });

    it("新規登録リンクが表示される", async () => {
      const page = await createPage();

      await page.goto(url("/auth/login"));
      await page.waitForLoadState("networkidle");

      const bodyText = await page.textContent("body");
      expect(bodyText).toContain("新規登録");
    });
  });

  describe("ユーザー登録ページ", () => {
    it("登録フォームが表示される", async () => {
      const page = await createPage();

      await page.goto(url("/auth/user-register"));
      await page.waitForLoadState("networkidle");

      const bodyText = await page.textContent("body");
      expect(bodyText).toContain("メールアドレス");
      expect(bodyText).toContain("パスワード");
    });

    it("送信ボタンが表示される", async () => {
      const page = await createPage();

      await page.goto(url("/auth/user-register"));
      await page.waitForLoadState("networkidle");

      await page.waitForSelector("button[type='submit']", { state: "visible" });
      const count = await page.locator("button[type='submit']").count();
      expect(count).toBeGreaterThan(0);
    });
  });

  describe("認証ミドルウェア", () => {
    it("未ログイン状態で /listening-logs にアクセスするとログイン画面にリダイレクトされる", async () => {
      const page = await createPage();

      await page.goto(url("/listening-logs"));
      await page.waitForLoadState("networkidle");

      expect(page.url()).toContain("/auth/login");
    });

    it("未ログイン状態で /listening-logs/new にアクセスするとログイン画面にリダイレクトされる", async () => {
      const page = await createPage();

      await page.goto(url("/listening-logs/new"));
      await page.waitForLoadState("networkidle");

      expect(page.url()).toContain("/auth/login");
    });
  });

  describe("ページ間遷移", () => {
    it("ログインページから新規登録ページへ遷移できる", async () => {
      const page = await createPage();

      await page.goto(url("/auth/login"));
      await page.waitForLoadState("networkidle");

      await page.click("a[href='/auth/user-register']");
      await page.waitForURL("**/auth/user-register");

      expect(page.url()).toContain("/auth/user-register");
    });
  });
});
