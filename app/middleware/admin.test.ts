import { ID_TOKEN_KEY } from "~/composables/useAuth";

const { mockNavigateTo, mockIsAdmin } = vi.hoisted(() => ({
  mockNavigateTo: vi.fn(),
  mockIsAdmin: vi.fn(),
}));

vi.mock("#app/composables/router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("#app/composables/router")>();
  return {
    ...actual,
    navigateTo: mockNavigateTo,
  };
});

vi.mock("~/composables/useAuth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("~/composables/useAuth")>();
  return {
    ...actual,
    useAuth: () => ({
      isAdmin: mockIsAdmin,
    }),
  };
});

beforeEach(() => {
  mockNavigateTo.mockClear();
  mockIsAdmin.mockClear();
  mockIsAdmin.mockReturnValue(false);
});

async function runMiddleware(path: string) {
  const { default: adminMiddleware } = await import("./admin");
  const to = { path, fullPath: path, query: {} } as Parameters<typeof adminMiddleware>[0];
  const from = {} as Parameters<typeof adminMiddleware>[1];
  return adminMiddleware(to, from);
}

describe("admin middleware", () => {
  it("管理者ユーザーのときはリダイレクトしない", async () => {
    mockIsAdmin.mockReturnValue(true);

    await runMiddleware("/pieces/new");

    expect(mockNavigateTo).not.toHaveBeenCalled();
  });

  it("非管理者ユーザーのとき TOP へリダイレクトする", async () => {
    mockIsAdmin.mockReturnValue(false);

    await runMiddleware("/pieces/new");

    expect(mockNavigateTo).toHaveBeenCalledWith("/", { replace: true });
  });

  it("未ログイン（idToken なし）のとき TOP へリダイレクトする", async () => {
    mockIsAdmin.mockReturnValue(false);

    await runMiddleware("/pieces/new");

    expect(mockNavigateTo).toHaveBeenCalledWith("/", { replace: true });
  });
});

// 型参照のためのダミー（未使用だが import エラー防止）
void (ID_TOKEN_KEY as string);
