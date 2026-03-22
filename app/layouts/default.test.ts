import { describe, it, expect, vi, beforeEach } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import DefaultLayout from "./default.vue";

const mockLogout = vi.fn();
const mockIsAuthenticated = vi.fn();

vi.mock("~/composables/useAuth", () => ({
  useAuth: () => ({
    isAuthenticated: mockIsAuthenticated,
    logout: mockLogout,
  }),
}));

beforeEach(() => {
  mockLogout.mockClear();
  mockIsAuthenticated.mockClear();
});

describe("DefaultLayout - 未ログイン時", () => {
  beforeEach(() => {
    mockIsAuthenticated.mockReturnValue(false);
  });

  it("「新規登録」リンクが表示される", async () => {
    const wrapper = await mountSuspended(DefaultLayout);
    const link = wrapper.find('a[href="/auth/user-register"]');
    expect(link.exists()).toBe(true);
    expect(link.text()).toBe("新規登録");
  });

  it("「ログイン」リンクが表示される", async () => {
    const wrapper = await mountSuspended(DefaultLayout);
    const link = wrapper.find('a[href="/auth/login"]');
    expect(link.exists()).toBe(true);
    expect(link.text()).toBe("ログイン");
  });

  it("「ログアウト」ボタンが表示されない", async () => {
    const wrapper = await mountSuspended(DefaultLayout);
    expect(wrapper.find("button.logout-button").exists()).toBe(false);
  });
});

describe("DefaultLayout - ログイン済み時", () => {
  beforeEach(() => {
    mockIsAuthenticated.mockReturnValue(true);
  });

  it("「ログアウト」ボタンが表示される", async () => {
    const wrapper = await mountSuspended(DefaultLayout);
    expect(wrapper.find("button.logout-button").exists()).toBe(true);
  });

  it("「新規登録」リンクが表示されない", async () => {
    const wrapper = await mountSuspended(DefaultLayout);
    expect(wrapper.find('a[href="/auth/user-register"]').exists()).toBe(false);
  });

  it("「ログイン」リンクが表示されない", async () => {
    const wrapper = await mountSuspended(DefaultLayout);
    expect(wrapper.find('a[href="/auth/login"]').exists()).toBe(false);
  });

  it("「ログアウト」ボタンをクリックすると logout() が呼ばれる", async () => {
    const wrapper = await mountSuspended(DefaultLayout);
    await wrapper.find("button.logout-button").trigger("click");
    expect(mockLogout).toHaveBeenCalledOnce();
  });
});
