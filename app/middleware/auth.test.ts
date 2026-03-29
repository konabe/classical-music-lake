import { ACCESS_TOKEN_KEY } from "~/composables/useAuth";

const { mockNavigateTo } = vi.hoisted(() => ({
  mockNavigateTo: vi.fn(),
}));

vi.mock("#app/composables/router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("#app/composables/router")>();
  return {
    ...actual,
    navigateTo: mockNavigateTo,
  };
});

const mockLocalStorage = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (key: string) => mockLocalStorage.get(key) ?? null,
  setItem: (key: string, value: string) => {
    mockLocalStorage.set(key, value);
  },
  removeItem: (key: string) => {
    mockLocalStorage.delete(key);
  },
  clear: () => {
    mockLocalStorage.clear();
  },
});

beforeEach(() => {
  mockNavigateTo.mockClear();
  localStorage.clear();
});

async function runMiddleware(path: string) {
  const { default: authMiddleware } = await import("./auth");
  const to = { path, fullPath: path, query: {} } as Parameters<typeof authMiddleware>[0];
  const from = {} as Parameters<typeof authMiddleware>[1];
  return authMiddleware(to, from);
}

describe("auth middleware", () => {
  it("トークンがない場合は replace: true でログインページにリダイレクトする", async () => {
    await runMiddleware("/listening-logs");

    expect(mockNavigateTo).toHaveBeenCalledWith("/auth/login", { replace: true });
  });

  it("トークンがある場合はリダイレクトしない", async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, "token-value");

    await runMiddleware("/listening-logs");

    expect(mockNavigateTo).not.toHaveBeenCalled();
  });
});
