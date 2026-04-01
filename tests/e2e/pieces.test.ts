import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { setup, createPage, url } from "@nuxt/test-utils/e2e";
import {
  allPieceFixtures,
  beethovenSymphony5,
  chopinBallade1,
  debussyClairDeLune,
} from "../fixtures/pieces";

process.env.NUXT_PUBLIC_API_BASE_URL = "http://api.test";

await setup({
  rootDir: fileURLToPath(new URL("../..", import.meta.url)),
  browser: true,
  server: true,
});

describe("楽曲ページ E2E テスト", () => {
  describe("一覧ページ", () => {
    it("楽曲一覧のタイトルが表示される", async () => {
      const page = await createPage();

      await page.route("http://api.test/pieces", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(allPieceFixtures),
        })
      );

      await page.goto(url("/pieces"));
      await page.waitForLoadState("networkidle");

      const bodyText = await page.textContent("body");
      expect(bodyText).toContain("楽曲マスタ");
    });

    it("楽曲データが一覧表示される", async () => {
      const page = await createPage();

      await page.route("http://api.test/pieces", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(allPieceFixtures),
        })
      );

      await page.goto(url("/pieces"));
      await page.waitForLoadState("networkidle");

      const bodyText = await page.textContent("body");
      expect(bodyText).toContain("交響曲第5番「運命」");
      expect(bodyText).toContain("ベートーヴェン");
      expect(bodyText).toContain("ピアノ協奏曲第20番");
      expect(bodyText).toContain("モーツァルト");
      expect(bodyText).toContain("バラード第1番");
      expect(bodyText).toContain("ショパン");
    });

    it("楽曲が0件の場合に空状態が表示される", async () => {
      const page = await createPage();

      await page.route("http://api.test/pieces", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        })
      );

      await page.goto(url("/pieces"));
      await page.waitForLoadState("networkidle");

      const bodyText = await page.textContent("body");
      expect(bodyText).toContain("楽曲マスタ");
    });

    it("「新しい楽曲」ボタンが表示される", async () => {
      const page = await createPage();

      await page.route("http://api.test/pieces", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        })
      );

      await page.goto(url("/pieces"));
      await page.waitForLoadState("networkidle");

      const bodyText = await page.textContent("body");
      expect(bodyText).toContain("新しい楽曲");
    });
  });

  describe("詳細ページ", () => {
    it("楽曲の詳細情報が表示される", async () => {
      const page = await createPage();

      await page.route(`http://api.test/pieces/${beethovenSymphony5.id}`, (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(beethovenSymphony5),
        })
      );

      await page.goto(url(`/pieces/${beethovenSymphony5.id}`));
      await page.waitForLoadState("networkidle");

      const bodyText = await page.textContent("body");
      expect(bodyText).toContain("交響曲第5番「運命」");
      expect(bodyText).toContain("ベートーヴェン");
    });

    it("カテゴリバッジが表示される", async () => {
      const page = await createPage();

      await page.route(`http://api.test/pieces/${beethovenSymphony5.id}`, (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(beethovenSymphony5),
        })
      );

      await page.goto(url(`/pieces/${beethovenSymphony5.id}`));
      await page.waitForLoadState("networkidle");

      const bodyText = await page.textContent("body");
      expect(bodyText).toContain("交響曲");
      expect(bodyText).toContain("古典派");
      expect(bodyText).toContain("管弦楽");
    });

    it("カテゴリ未設定の楽曲はバッジが表示されない", async () => {
      const page = await createPage();

      await page.route(`http://api.test/pieces/${debussyClairDeLune.id}`, (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(debussyClairDeLune),
        })
      );

      await page.goto(url(`/pieces/${debussyClairDeLune.id}`));
      await page.waitForLoadState("networkidle");

      const bodyText = await page.textContent("body");
      expect(bodyText).toContain("月の光");
      expect(bodyText).toContain("ドビュッシー");
    });

    it("動画URLがある場合にVideoPlayerが表示される", async () => {
      const page = await createPage();

      await page.route(`http://api.test/pieces/${chopinBallade1.id}`, (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(chopinBallade1),
        })
      );

      await page.goto(url(`/pieces/${chopinBallade1.id}`));
      await page.waitForLoadState("networkidle");

      const iframe = await page.locator("iframe").count();
      expect(iframe).toBeGreaterThan(0);
    });

    it("「楽曲一覧」への戻りリンクが表示される", async () => {
      const page = await createPage();

      await page.route(`http://api.test/pieces/${beethovenSymphony5.id}`, (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(beethovenSymphony5),
        })
      );

      await page.goto(url(`/pieces/${beethovenSymphony5.id}`));
      await page.waitForLoadState("networkidle");

      const bodyText = await page.textContent("body");
      expect(bodyText).toContain("楽曲一覧");
    });
  });

  describe("新規作成ページ", () => {
    it("楽曲作成フォームが表示される", async () => {
      const page = await createPage();

      await page.goto(url("/pieces/new"));
      await page.waitForLoadState("networkidle");

      const bodyText = await page.textContent("body");
      expect(bodyText).toContain("曲名");
      expect(bodyText).toContain("作曲家");
    });
  });
});
