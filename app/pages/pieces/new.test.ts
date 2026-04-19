import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import PieceNewPage from "./new.vue";
import type { CreatePieceInput } from "~/types";

const mockCreatePiece = vi.fn();

vi.mock("~/composables/usePieces", () => {
  return {
    usePiecesPaginated: () => {
      return {
        items: ref([]),
        nextCursor: ref(null),
        pending: ref(false),
        error: ref(null),
        hasMore: ref(true),
        loadMore: vi.fn(),
        reset: vi.fn(),
        retry: vi.fn(),
        createPiece: mockCreatePiece,
        updatePiece: vi.fn(),
      };
    },
    usePiecesAll: () => {
      return {
        data: ref([]),
        error: ref(null),
        pending: ref(false),
        refresh: vi.fn(),
        createPiece: vi.fn(),
        updatePiece: vi.fn(),
      };
    },
    usePiece: () => {
      return { data: ref(null), error: ref(null) };
    },
  };
});

beforeEach(() => {
  mockCreatePiece.mockClear();
});

describe("PieceNewPage", () => {
  it("PieceNewTemplate が表示される", async () => {
    const wrapper = await mountSuspended(PieceNewPage);
    expect(wrapper.find("form.piece-form").exists()).toBe(true);
  });

  it("登録成功時に createPiece が呼ばれる", async () => {
    mockCreatePiece.mockResolvedValue({ id: "new-1" });
    const wrapper = await mountSuspended(PieceNewPage);
    const vm = wrapper.vm as {
      handleSubmit: (values: CreatePieceInput) => Promise<void>;
    };
    await vm.handleSubmit({ title: "交響曲第9番", composer: "ベートーヴェン" });
    await flushPromises();
    expect(mockCreatePiece).toHaveBeenCalledWith({
      title: "交響曲第9番",
      composer: "ベートーヴェン",
    });
  });

  it("登録失敗時にエラーメッセージを設定する", async () => {
    mockCreatePiece.mockRejectedValue(new Error("failed"));
    const wrapper = await mountSuspended(PieceNewPage);
    const vm = wrapper.vm as {
      handleSubmit: (values: CreatePieceInput) => Promise<void>;
      errorMessage: string;
    };
    await vm.handleSubmit({ title: "交響曲第9番", composer: "ベートーヴェン" });
    await flushPromises();
    expect(vm.errorMessage).toContain("失敗");
  });
});
