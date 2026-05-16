import { mountSuspended } from "@nuxt/test-utils/runtime";
import FavoriteIndicator from "@/components/molecules/FavoriteIndicator.vue";

describe("FavoriteIndicator", () => {
  it("isFavorite が true のとき ♥ が表示される", async () => {
    const wrapper = await mountSuspended(FavoriteIndicator, { props: { isFavorite: true } });
    expect(wrapper.text()).toBe("♥");
  });

  it("isFavorite が false のとき何も表示されない", async () => {
    const wrapper = await mountSuspended(FavoriteIndicator, { props: { isFavorite: false } });
    expect(wrapper.text()).toBe("");
  });

  it("favorite-indicator クラスが存在する", async () => {
    const wrapper = await mountSuspended(FavoriteIndicator, { props: { isFavorite: true } });
    expect(wrapper.find(".favorite-indicator").exists()).toBe(true);
  });
});
