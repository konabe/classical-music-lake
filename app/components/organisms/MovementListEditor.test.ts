import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import MovementListEditor from "@/components/organisms/MovementListEditor.vue";
import type { PieceMovement } from "@/types";

const mockReplaceMovements = vi.fn();

vi.mock("~/composables/useMovements", () => ({
  useMovements: vi.fn(),
  useReplaceMovements: () => ({ replaceMovements: mockReplaceMovements }),
}));

const sampleMovements: PieceMovement[] = [
  {
    kind: "movement",
    id: "mov-1",
    parentId: "work-1",
    index: 0,
    title: "第一楽章 アレグロ",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    kind: "movement",
    id: "mov-2",
    parentId: "work-1",
    index: 1,
    title: "第二楽章 アンダンテ",
    videoUrls: ["https://www.youtube.com/watch?v=abc123"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

beforeEach(() => {
  mockReplaceMovements.mockClear();
});

describe("MovementListEditor", () => {
  describe("表示", () => {
    it("初期楽章のタイトルが入力欄に反映される", async () => {
      const wrapper = await mountSuspended(MovementListEditor, {
        props: { workId: "work-1", initialMovements: sampleMovements },
      });
      const titleInput = wrapper.find('[data-testid="movement-title-0"]');
      expect((titleInput.element as HTMLInputElement).value).toBe("第一楽章 アレグロ");
    });

    it("楽章が空のとき movement-item が表示されない", async () => {
      const wrapper = await mountSuspended(MovementListEditor, {
        props: { workId: "work-1", initialMovements: [] },
      });
      expect(wrapper.findAll(".movement-item")).toHaveLength(0);
    });

    it("videoUrls が textarea に1行1URLで反映される", async () => {
      const wrapper = await mountSuspended(MovementListEditor, {
        props: { workId: "work-1", initialMovements: sampleMovements },
      });
      const textarea = wrapper.find('[data-testid="movement-video-urls-1"]');
      expect((textarea.element as HTMLTextAreaElement).value).toBe(
        "https://www.youtube.com/watch?v=abc123",
      );
    });
  });

  describe("楽章追加", () => {
    it("「楽章を追加」ボタンで行が1件追加される", async () => {
      const wrapper = await mountSuspended(MovementListEditor, {
        props: { workId: "work-1", initialMovements: [] },
      });
      await wrapper.find('[data-testid="add-movement"]').trigger("click");
      expect(wrapper.findAll(".movement-item")).toHaveLength(1);
    });

    it("複数回追加できる", async () => {
      const wrapper = await mountSuspended(MovementListEditor, {
        props: { workId: "work-1", initialMovements: [] },
      });
      await wrapper.find('[data-testid="add-movement"]').trigger("click");
      await wrapper.find('[data-testid="add-movement"]').trigger("click");
      expect(wrapper.findAll(".movement-item")).toHaveLength(2);
    });
  });

  describe("楽章削除", () => {
    it("削除ボタンで対象行が削除される", async () => {
      const wrapper = await mountSuspended(MovementListEditor, {
        props: { workId: "work-1", initialMovements: sampleMovements },
      });
      await wrapper.find('[data-testid="remove-movement-0"]').trigger("click");
      expect(wrapper.findAll(".movement-item")).toHaveLength(1);
    });
  });

  describe("保存", () => {
    it("保存ボタンで replaceMovements が workId と共に呼ばれる", async () => {
      mockReplaceMovements.mockResolvedValue([]);
      const wrapper = await mountSuspended(MovementListEditor, {
        props: { workId: "work-1", initialMovements: sampleMovements },
      });
      await wrapper.find('[data-testid="save-movements"]').trigger("click");
      await flushPromises();
      expect(mockReplaceMovements).toHaveBeenCalledWith("work-1", [
        { id: "mov-1", index: 0, title: "第一楽章 アレグロ", videoUrls: [] },
        {
          id: "mov-2",
          index: 1,
          title: "第二楽章 アンダンテ",
          videoUrls: ["https://www.youtube.com/watch?v=abc123"],
        },
      ]);
    });

    it("id を持たない新規行は id なしで送信される", async () => {
      mockReplaceMovements.mockResolvedValue([]);
      const wrapper = await mountSuspended(MovementListEditor, {
        props: { workId: "work-1", initialMovements: [] },
      });
      await wrapper.find('[data-testid="add-movement"]').trigger("click");
      await wrapper.find('[data-testid="save-movements"]').trigger("click");
      await flushPromises();
      expect(mockReplaceMovements).toHaveBeenCalledWith("work-1", [
        { index: 0, title: "", videoUrls: [] },
      ]);
    });

    it("保存失敗時にエラーメッセージが表示される", async () => {
      mockReplaceMovements.mockRejectedValue(new Error("failed"));
      const wrapper = await mountSuspended(MovementListEditor, {
        props: { workId: "work-1", initialMovements: [] },
      });
      await wrapper.find('[data-testid="save-movements"]').trigger("click");
      await flushPromises();
      expect(wrapper.findComponent({ name: "ErrorMessage" }).exists()).toBe(true);
    });
  });
});
