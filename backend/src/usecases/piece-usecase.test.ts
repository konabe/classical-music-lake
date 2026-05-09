import { describe, it, expect, vi, beforeEach } from "vitest";

import type { PieceRepository } from "../domain/piece";
import { PieceId } from "../domain/value-objects/ids";
import type { CreateMovementInput, CreateWorkInput, PieceMovement, PieceWork } from "../types";
import { MovementUsecase, PieceUsecase, WorkUsecase } from "./piece-usecase";

const TEST_COMPOSER_ID = "00000000-0000-4000-8000-000000000001";
const TEST_WORK_ID = "00000000-0000-4000-8000-00000000aaaa";
const TEST_MOVEMENT_ID = "00000000-0000-4000-8000-00000000bbbb";

const makeMockRepo = (): PieceRepository => ({
  findRootById: vi.fn(),
  findRootPage: vi.fn(),
  saveWork: vi.fn(),
  saveWorkWithOptimisticLock: vi.fn(),
  removeWorkCascade: vi.fn(),
  findById: vi.fn(),
  findChildren: vi.fn(),
  saveMovement: vi.fn(),
  saveMovementWithOptimisticLock: vi.fn(),
  removeMovement: vi.fn(),
  replaceMovements: vi.fn(),
});

const makeWork = (overrides: Partial<PieceWork> = {}): PieceWork => ({
  kind: "work",
  id: TEST_WORK_ID,
  title: "交響曲第9番",
  composerId: TEST_COMPOSER_ID,
  createdAt: "2024-01-15T20:00:00.000Z",
  updatedAt: "2024-01-15T20:00:00.000Z",
  ...overrides,
});

const makeMovement = (overrides: Partial<PieceMovement> = {}): PieceMovement => ({
  kind: "movement",
  id: TEST_MOVEMENT_ID,
  parentId: TEST_WORK_ID,
  index: 0,
  title: "第1楽章",
  createdAt: "2024-01-15T20:00:00.000Z",
  updatedAt: "2024-01-15T20:00:00.000Z",
  ...overrides,
});

describe("WorkUsecase", () => {
  let repo: PieceRepository;
  let usecase: WorkUsecase;

  beforeEach(() => {
    repo = makeMockRepo();
    usecase = new WorkUsecase(repo);
  });

  describe("create", () => {
    it("Work を生成して saveWork を呼び出す", async () => {
      const input: CreateWorkInput = {
        kind: "work",
        title: "交響曲第9番",
        composerId: TEST_COMPOSER_ID,
      };
      const result = await usecase.create(input);

      expect(result.kind).toBe("work");
      expect(result.title).toBe("交響曲第9番");
      expect(result.composerId).toBe(TEST_COMPOSER_ID);
      expect(result.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(repo.saveWork).toHaveBeenCalledWith(result);
    });
  });

  describe("get", () => {
    it("findRootById で取得した Work を返す", async () => {
      const work = makeWork();
      vi.mocked(repo.findRootById).mockResolvedValueOnce(work);

      const result = await usecase.get(PieceId.from(TEST_WORK_ID));

      expect(result).toEqual(work);
    });

    it("Work が存在しない場合は NotFound 相当のエラー（404 Status）を投げる", async () => {
      vi.mocked(repo.findRootById).mockResolvedValueOnce(undefined);

      await expect(usecase.get(PieceId.from(TEST_WORK_ID))).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe("update", () => {
    it("既存 Work を更新して楽観的ロック付きで保存する", async () => {
      const existing = makeWork();
      vi.mocked(repo.findRootById).mockResolvedValueOnce(existing);

      const result = await usecase.update(PieceId.from(TEST_WORK_ID), {
        kind: "work",
        title: "更新後タイトル",
      });

      expect(result.title).toBe("更新後タイトル");
      expect(repo.saveWorkWithOptimisticLock).toHaveBeenCalledWith(
        expect.objectContaining({ title: "更新後タイトル" }),
        existing.updatedAt,
      );
    });
  });

  describe("delete", () => {
    it("removeWorkCascade を呼び出す", async () => {
      await usecase.delete(PieceId.from(TEST_WORK_ID));
      expect(repo.removeWorkCascade).toHaveBeenCalledWith(
        expect.objectContaining({ value: TEST_WORK_ID }),
      );
    });
  });

  describe("list", () => {
    it("findRootPage を呼び出して Paginated を返す", async () => {
      vi.mocked(repo.findRootPage).mockResolvedValueOnce({
        items: [makeWork()],
        lastEvaluatedKey: undefined,
      });

      const result = await usecase.list({ limit: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.nextCursor).toBeNull();
    });
  });
});

describe("MovementUsecase", () => {
  let repo: PieceRepository;
  let usecase: MovementUsecase;

  beforeEach(() => {
    repo = makeMockRepo();
    usecase = new MovementUsecase(repo);
  });

  describe("create", () => {
    it("Movement を生成して saveMovement を呼び出す", async () => {
      const input: CreateMovementInput = {
        kind: "movement",
        parentId: TEST_WORK_ID,
        index: 0,
        title: "第1楽章",
      };
      const result = await usecase.create(input);

      expect(result.kind).toBe("movement");
      expect(result.parentId).toBe(TEST_WORK_ID);
      expect(result.index).toBe(0);
      expect(repo.saveMovement).toHaveBeenCalledWith(result);
    });
  });

  describe("get", () => {
    it("Movement を返す", async () => {
      const movement = makeMovement();
      vi.mocked(repo.findById).mockResolvedValueOnce(movement);

      const result = await usecase.get(PieceId.from(TEST_MOVEMENT_ID));

      expect(result).toEqual(movement);
    });

    it("Work が返ってきた場合は 404", async () => {
      vi.mocked(repo.findById).mockResolvedValueOnce(makeWork());

      await expect(usecase.get(PieceId.from(TEST_MOVEMENT_ID))).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it("undefined の場合は 404", async () => {
      vi.mocked(repo.findById).mockResolvedValueOnce(undefined);

      await expect(usecase.get(PieceId.from(TEST_MOVEMENT_ID))).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe("update", () => {
    it("Movement の楽観的ロック付き保存が走る", async () => {
      vi.mocked(repo.findById).mockResolvedValueOnce(makeMovement());

      await usecase.update(PieceId.from(TEST_MOVEMENT_ID), {
        kind: "movement",
        title: "改題",
      });

      expect(repo.saveMovementWithOptimisticLock).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("removeMovement を呼び出す", async () => {
      await usecase.delete(PieceId.from(TEST_MOVEMENT_ID));
      expect(repo.removeMovement).toHaveBeenCalled();
    });
  });

  describe("listChildren", () => {
    it("findChildren の結果をそのまま返す", async () => {
      const m = makeMovement();
      vi.mocked(repo.findChildren).mockResolvedValueOnce([m]);

      const result = await usecase.listChildren(PieceId.from(TEST_WORK_ID));

      expect(result).toEqual([m]);
    });
  });

  describe("replaceMovements", () => {
    it("replaceMovements リポジトリ操作に委譲する", async () => {
      const m = makeMovement();
      await usecase.replaceMovements(PieceId.from(TEST_WORK_ID), [m]);
      expect(repo.replaceMovements).toHaveBeenCalledWith(
        expect.objectContaining({ value: TEST_WORK_ID }),
        [m],
      );
    });
  });
});

describe("PieceUsecase (facade)", () => {
  let repo: PieceRepository;
  let usecase: PieceUsecase;

  beforeEach(() => {
    repo = makeMockRepo();
    usecase = new PieceUsecase(repo);
  });

  describe("create", () => {
    it("kind=work の場合は Work を作成する", async () => {
      const result = await usecase.create({
        kind: "work",
        title: "交響曲第9番",
        composerId: TEST_COMPOSER_ID,
      });
      expect(result.kind).toBe("work");
      expect(repo.saveWork).toHaveBeenCalled();
      expect(repo.saveMovement).not.toHaveBeenCalled();
    });

    it("kind=movement の場合は Movement を作成する", async () => {
      const result = await usecase.create({
        kind: "movement",
        parentId: TEST_WORK_ID,
        index: 0,
        title: "第1楽章",
      });
      expect(result.kind).toBe("movement");
      expect(repo.saveMovement).toHaveBeenCalled();
      expect(repo.saveWork).not.toHaveBeenCalled();
    });
  });

  describe("getNode", () => {
    it("Work でも Movement でも kind を問わず取得できる", async () => {
      vi.mocked(repo.findById).mockResolvedValueOnce(makeMovement());

      const result = await usecase.getNode(PieceId.from(TEST_MOVEMENT_ID));

      expect(result.kind).toBe("movement");
    });

    it("見つからない場合は 404", async () => {
      vi.mocked(repo.findById).mockResolvedValueOnce(undefined);

      await expect(usecase.getNode(PieceId.from(TEST_MOVEMENT_ID))).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe("update", () => {
    it("Work レコードに対する update は saveWorkWithOptimisticLock を呼ぶ", async () => {
      vi.mocked(repo.findById).mockResolvedValueOnce(makeWork());

      await usecase.update(PieceId.from(TEST_WORK_ID), { kind: "work", title: "改題" });

      expect(repo.saveWorkWithOptimisticLock).toHaveBeenCalled();
      expect(repo.saveMovementWithOptimisticLock).not.toHaveBeenCalled();
    });

    it("Movement レコードに対する update は saveMovementWithOptimisticLock を呼ぶ", async () => {
      vi.mocked(repo.findById).mockResolvedValueOnce(makeMovement());

      await usecase.update(PieceId.from(TEST_MOVEMENT_ID), { kind: "movement", title: "改題" });

      expect(repo.saveMovementWithOptimisticLock).toHaveBeenCalled();
      expect(repo.saveWorkWithOptimisticLock).not.toHaveBeenCalled();
    });

    it("kind 不一致は TypeError", async () => {
      vi.mocked(repo.findById).mockResolvedValueOnce(makeWork());

      await expect(
        usecase.update(PieceId.from(TEST_WORK_ID), { kind: "movement", title: "改題" }),
      ).rejects.toThrow(TypeError);
    });
  });
});
