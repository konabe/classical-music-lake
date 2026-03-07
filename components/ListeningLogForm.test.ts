import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import ListeningLogForm from "./ListeningLogForm.vue";

describe("ListeningLogForm", () => {
  describe("デフォルト値でのレンダリング", () => {
    it("フォームが表示される", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      expect(wrapper.find("form.log-form").exists()).toBe(true);
    });

    it("デフォルトの評価は 3", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      const activeStars = wrapper.findAll(".star-btn.active");
      expect(activeStars).toHaveLength(3);
    });

    it("デフォルトのお気に入りは未チェック", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      const checkbox = wrapper.find('input[type="checkbox"]');
      expect((checkbox.element as HTMLInputElement).checked).toBe(false);
    });

    it("送信ラベルのデフォルトは「保存する」", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      expect(wrapper.find("button[type='submit']").text()).toBe("保存する");
    });
  });

  describe("initialValues での初期化", () => {
    it("初期値が入力フィールドに反映される", async () => {
      const wrapper = await mountSuspended(ListeningLogForm, {
        props: {
          initialValues: {
            piece: "魔笛",
            performer: "ウィーン・フィル",
            rating: 4,
            isFavorite: true,
          },
        },
      });

      const pieceInput = wrapper.find('input[placeholder="例: 交響曲第9番"]');
      expect((pieceInput.element as HTMLInputElement).value).toBe("魔笛");
    });

    it("初期評価が星の表示に反映される", async () => {
      const wrapper = await mountSuspended(ListeningLogForm, {
        props: {
          initialValues: { rating: 5, piece: "", performer: "", isFavorite: false },
        },
      });

      const activeStars = wrapper.findAll(".star-btn.active");
      expect(activeStars).toHaveLength(5);
    });

    it("初期お気に入りが反映される", async () => {
      const wrapper = await mountSuspended(ListeningLogForm, {
        props: {
          initialValues: { isFavorite: true, piece: "", performer: "", rating: 3 },
        },
      });

      const checkbox = wrapper.find('input[type="checkbox"]');
      expect((checkbox.element as HTMLInputElement).checked).toBe(true);
    });
  });

  describe("submitLabel prop", () => {
    it("カスタムラベルが反映される", async () => {
      const wrapper = await mountSuspended(ListeningLogForm, {
        props: { submitLabel: "記録する" },
      });
      expect(wrapper.find("button[type='submit']").text()).toBe("記録する");
    });
  });

  describe("フォーム送信", () => {
    it("フォーム送信時に submit イベントが emit される", async () => {
      const wrapper = await mountSuspended(ListeningLogForm, {
        props: {
          initialValues: {
            listenedAt: "2024-01-15T20:00",
            piece: "交響曲第9番",
            performer: "ベルリン・フィル",
            rating: 5,
            isFavorite: false,
          },
        },
      });

      await wrapper.find("form").trigger("submit.prevent");
      expect(wrapper.emitted("submit")).toBeTruthy();
    });

    it("submit イベントにフォームデータが含まれる", async () => {
      const wrapper = await mountSuspended(ListeningLogForm, {
        props: {
          initialValues: {
            listenedAt: "2024-01-15T20:00",
            piece: "交響曲第9番",
            performer: "ベルリン・フィル",
            rating: 5,
            isFavorite: true,
          },
        },
      });

      await wrapper.find("form").trigger("submit.prevent");
      const emitted = wrapper.emitted("submit");
      expect(emitted).toBeTruthy();
      const emittedData = emitted![0][0] as Record<string, unknown>;
      expect(emittedData.piece).toBe("交響曲第9番");
      expect(emittedData.isFavorite).toBe(true);
    });
  });

  describe("星評価の操作", () => {
    it("星ボタンをクリックすると評価が変わる", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      const starButtons = wrapper.findAll(".star-btn");

      // 1番目の星をクリック（評価を1に）
      await starButtons[0].trigger("click");
      const activeStars = wrapper.findAll(".star-btn.active");
      expect(activeStars).toHaveLength(1);
    });

    it("5番目の星をクリックすると評価が5になる", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      const starButtons = wrapper.findAll(".star-btn");

      await starButtons[4].trigger("click");
      const activeStars = wrapper.findAll(".star-btn.active");
      expect(activeStars).toHaveLength(5);
    });
  });
});
