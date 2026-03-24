import { ref } from "vue";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { usePieces, usePiece } from "./usePieces";

const { mockUseFetch } = vi.hoisted(() => ({
  mockUseFetch: vi.fn(),
}));

mockUseFetch.mockReturnValue({ data: ref([]), error: ref(null), pending: ref(false) });

mockNuxtImport("useApiBase", () => () => "/api");
mockNuxtImport("useFetch", () => mockUseFetch);

const mockFetch = vi.fn().mockResolvedValue({});

beforeEach(() => {
  vi.stubGlobal("$fetch", mockFetch);
  mockFetch.mockClear();
  mockUseFetch.mockClear();
  mockUseFetch.mockReturnValue({ data: ref([]), error: ref(null), pending: ref(false) });
});

describe("usePieces", () => {
  it("正しい URL で useFetch を呼び出し、data と error を返す", () => {
    const result = usePieces();
    expect(mockUseFetch).toHaveBeenCalledWith("/api/pieces", expect.anything());
    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("error");
  });

  it("createPiece が正しい URL と body で POST リクエストを送信する", async () => {
    const { createPiece } = usePieces();
    await createPiece({ title: "交響曲第9番", composer: "ベートーヴェン" });
    expect(mockFetch).toHaveBeenCalledWith("/api/pieces", {
      method: "POST",
      body: { title: "交響曲第9番", composer: "ベートーヴェン" },
    });
  });

  it("updatePiece が正しい URL と body で PUT リクエストを送信する", async () => {
    const { updatePiece } = usePieces();
    await updatePiece("piece-123", { title: "更新後の曲名" });
    expect(mockFetch).toHaveBeenCalledWith("/api/pieces/piece-123", {
      method: "PUT",
      body: { title: "更新後の曲名" },
    });
  });
});

describe("usePiece", () => {
  it("正しい URL で useFetch を呼び出す", () => {
    usePiece(() => "piece-456");
    expect(mockUseFetch).toHaveBeenCalledWith(expect.any(Function), expect.anything());
  });
});
