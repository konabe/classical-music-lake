import {
  ACCESS_TOKEN_KEY,
  ID_TOKEN_KEY,
  TOKEN_EXPIRES_AT_KEY,
  REFRESH_TOKEN_KEY,
} from "~/composables/useAuth";

const { mockNavigateTo, mockRefreshTokens } = vi.hoisted(() => ({
  mockNavigateTo: vi.fn(),
  mockRefreshTokens: vi.fn(),
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
      refreshTokens: mockRefreshTokens,
    }),
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
  mockRefreshTokens.mockClear();
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

  it("トークンがあり有効期限内の場合はリダイレクトしない", async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, "token-value");
    localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(Date.now() + 60000));

    await runMiddleware("/listening-logs");

    expect(mockNavigateTo).not.toHaveBeenCalled();
    expect(mockRefreshTokens).not.toHaveBeenCalled();
  });

  it("トークンがあり有効期限が切れている場合、リフレッシュを試行する", async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, "token-value");
    localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(Date.now() - 1000));
    localStorage.setItem(REFRESH_TOKEN_KEY, "refresh-token");
    mockRefreshTokens.mockResolvedValue(true);

    await runMiddleware("/listening-logs");

    expect(mockRefreshTokens).toHaveBeenCalled();
    expect(mockNavigateTo).not.toHaveBeenCalled();
  });

  it("トークンが期限切れでリフレッシュ失敗時はログインページにリダイレクトする", async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, "token-value");
    localStorage.setItem(ID_TOKEN_KEY, "id-token-value");
    localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(Date.now() - 1000));
    localStorage.setItem(REFRESH_TOKEN_KEY, "refresh-token");
    mockRefreshTokens.mockResolvedValue(false);

    await runMiddleware("/listening-logs");

    expect(mockRefreshTokens).toHaveBeenCalled();
    expect(mockNavigateTo).toHaveBeenCalledWith("/auth/login", { replace: true });
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(ID_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(TOKEN_EXPIRES_AT_KEY)).toBeNull();
  });

  it("tokenExpiresAt がない場合はリフレッシュせずそのまま通す", async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, "token-value");

    await runMiddleware("/listening-logs");

    expect(mockRefreshTokens).not.toHaveBeenCalled();
    expect(mockNavigateTo).not.toHaveBeenCalled();
  });
});
