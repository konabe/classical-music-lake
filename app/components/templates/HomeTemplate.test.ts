import { mountSuspended } from "@nuxt/test-utils/runtime";
import HomeTemplate from "./HomeTemplate.vue";

const stubs = { FeaturedPiece: true };

describe("HomeTemplate", () => {
  it("Nocturne タイトルが表示される", async () => {
    const wrapper = await mountSuspended(HomeTemplate, {
      props: { pieces: [], loading: false, isAdmin: false },
      global: { stubs },
    });
    expect(wrapper.text()).toContain("Nocturne");
  });

  it("鑑賞記録へのリンクが表示される", async () => {
    const wrapper = await mountSuspended(HomeTemplate, {
      props: { pieces: [], loading: false, isAdmin: false },
      global: { stubs },
    });
    expect(wrapper.find('a[href="/listening-logs"]').exists()).toBe(true);
  });

  it("楽曲を探すリンクが表示される", async () => {
    const wrapper = await mountSuspended(HomeTemplate, {
      props: { pieces: [], loading: false, isAdmin: false },
      global: { stubs },
    });
    expect(wrapper.find('a[href="/pieces"]').exists()).toBe(true);
  });

  describe("管理者向けセクション", () => {
    it("isAdmin が true のとき管理者メニューが表示される", async () => {
      const wrapper = await mountSuspended(HomeTemplate, {
        props: { pieces: [], loading: false, isAdmin: true },
        global: { stubs },
      });
      expect(wrapper.find(".admin-section").exists()).toBe(true);
      expect(wrapper.find('a[href="/pieces/new"]').exists()).toBe(true);
    });

    it("isAdmin が false のとき管理者メニューが表示されない", async () => {
      const wrapper = await mountSuspended(HomeTemplate, {
        props: { pieces: [], loading: false, isAdmin: false },
        global: { stubs },
      });
      expect(wrapper.find(".admin-section").exists()).toBe(false);
    });
  });
});
