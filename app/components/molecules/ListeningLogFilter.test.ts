import { mountSuspended } from "@nuxt/test-utils/runtime";
import ListeningLogFilter from "./ListeningLogFilter.vue";
import type { ListeningLogFilterState } from "~/composables/useListeningLogFilter";

const initialState: ListeningLogFilterState = {
  keyword: "",
  rating: "",
  favoriteOnly: false,
  fromDate: "",
  toDate: "",
};

describe("ListeningLogFilter", () => {
  describe("表示", () => {
    it("各フィルタ要素が表示される", async () => {
      const wrapper = await mountSuspended(ListeningLogFilter, {
        props: { modelValue: { ...initialState }, isActive: false },
      });
      expect(wrapper.text()).toContain("Keyword");
      expect(wrapper.text()).toContain("Rating");
      expect(wrapper.text()).toContain("Favorites only");
      expect(wrapper.text()).toContain("From");
      expect(wrapper.text()).toContain("To");
    });

    it("isActive が false のとき条件クリアボタンを表示しない", async () => {
      const wrapper = await mountSuspended(ListeningLogFilter, {
        props: { modelValue: { ...initialState }, isActive: false },
      });
      expect(wrapper.text()).not.toContain("Clear filter");
    });

    it("isActive が true のとき条件クリアボタンを表示する", async () => {
      const wrapper = await mountSuspended(ListeningLogFilter, {
        props: { modelValue: { ...initialState, keyword: "X" }, isActive: true },
      });
      expect(wrapper.text()).toContain("Clear filter");
    });
  });

  describe("イベント", () => {
    it("キーワード入力で update:modelValue を発火する", async () => {
      const wrapper = await mountSuspended(ListeningLogFilter, {
        props: { modelValue: { ...initialState }, isActive: false },
      });
      const input = wrapper.find('input[type="text"]');
      await input.setValue("ベートーヴェン");
      const events = wrapper.emitted("update:modelValue");
      expect(events).toBeDefined();
      const last = events?.[events.length - 1]?.[0] as ListeningLogFilterState;
      expect(last.keyword).toBe("ベートーヴェン");
    });

    it("お気に入りチェックで update:modelValue を発火する", async () => {
      const wrapper = await mountSuspended(ListeningLogFilter, {
        props: { modelValue: { ...initialState }, isActive: false },
      });
      const checkbox = wrapper.find('input[type="checkbox"]');
      await checkbox.setValue(true);
      const events = wrapper.emitted("update:modelValue");
      expect(events).toBeDefined();
      const last = events?.[events.length - 1]?.[0] as ListeningLogFilterState;
      expect(last.favoriteOnly).toBe(true);
    });

    it("条件クリアボタン押下で reset を発火する", async () => {
      const wrapper = await mountSuspended(ListeningLogFilter, {
        props: { modelValue: { ...initialState, keyword: "X" }, isActive: true },
      });
      await wrapper.find(".btn-secondary").trigger("click");
      expect(wrapper.emitted("reset")).toBeDefined();
    });
  });
});
