import { describe, it, expect, vi, beforeEach } from "vitest";

import type { ListeningLogRepository } from "../domain/listening-log";
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
  findByIds: vi.fn().mockResolvedValue([]),
  findChildren: vi.fn().mockResolvedValue([]),
  saveMovement: vi.fn(),
  saveMovementWithOptimisticLock: vi.fn(),
  removeMovement: vi.fn(),
  replaceMovements: vi.fn(),
});

const makeMockListeningLogRepo = (): ListeningLogRepository => ({
  findById: vi.fn(),
  findByUserId: vi.fn(),
  existsByPieceIds: vi.fn().mockResolvedValue(false),
  save: vi.fn(),
  saveWithOptimisticLock: vi.fn(),
  remove: vi.fn(),
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

  describe("replaceAll", () => {
    it("Work が見つからない場合は 404", async () => {
      vi.mocked(repo.findRootById).mockResolvedValueOnce(undefined);

      await expect(
        usecase.replaceAll(PieceId.from(TEST_WORK_ID), [{ index: 0, title: "第1楽章" }]),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("既存子を全削除し、新規 Movement に id を採番して TransactWriteItems で書き込む", async () => {
      const work = makeWork();
      vi.mocked(repo.findRootById).mockResolvedValueOnce(work);
      vi.mocked(repo.findChildren).mockResolvedValueOnce([]);

      const result = await usecase.replaceAll(PieceId.from(TEST_WORK_ID), [
        { index: 0, title: "第1楽章" },
        { index: 1, title: "第2楽章" },
      ]);

      expect(result).toHaveLength(2);
      expect(result[0]?.kind).toBe("movement");
      expect(result[0]?.parentId).toBe(TEST_WORK_ID);
      expect(result[0]?.title).toBe("第1楽章");
      expect(result[0]?.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(result[1]?.id).not.toBe(result[0]?.id);

      expect(repo.replaceMovements).toHaveBeenCalledWith(
        expect.objectContaining({ value: TEST_WORK_ID }),
        result,
        expect.objectContaining({
          prevUpdatedAt: work.updatedAt,
          work: expect.objectContaining({ id: work.id, updatedAt: expect.any(String) }),
        }),
      );
    });

    it("既存 Movement と同じ id を渡すと createdAt を引き継ぎつつ updatedAt は新しくなる", async () => {
      const work = makeWork();
      const existing = makeMovement({
        id: TEST_MOVEMENT_ID,
        index: 0,
        createdAt: "2023-01-01T00:00:00.000Z",
      });
      vi.mocked(repo.findRootById).mockResolvedValueOnce(work);
      vi.mocked(repo.findChildren).mockResolvedValueOnce([existing]);

      const result = await usecase.replaceAll(PieceId.from(TEST_WORK_ID), [
        { id: TEST_MOVEMENT_ID, index: 0, title: "改題" },
      ]);

      expect(result[0]?.id).toBe(TEST_MOVEMENT_ID);
      expect(result[0]?.title).toBe("改題");
      expect(result[0]?.createdAt).toBe(existing.createdAt);
      expect(result[0]?.updatedAt).not.toBe(existing.updatedAt);
    });

    it("Work の updatedAt を ifMatch にして同一トランザクション内で更新する", async () => {
      const work = makeWork({ updatedAt: "2024-01-15T20:00:00.000Z" });
      vi.mocked(repo.findRootById).mockResolvedValueOnce(work);
      vi.mocked(repo.findChildren).mockResolvedValueOnce([]);

      await usecase.replaceAll(PieceId.from(TEST_WORK_ID), [{ index: 0, title: "第1楽章" }]);

      const call = vi.mocked(repo.replaceMovements).mock.calls[0];
      expect(call?.[2]).toMatchObject({
        prevUpdatedAt: "2024-01-15T20:00:00.000Z",
      });
      // updatedWork は新しい updatedAt に進んでいる
      const updatedWork = call?.[2]?.work as { updatedAt: string };
      expect(updatedWork.updatedAt).not.toBe("2024-01-15T20:00:00.000Z");
    });
  });
});

describe("PieceUsecase (facade)", () => {
  let repo: PieceRepository;
  let listeningLogRepo: ListeningLogRepository;
  let usecase: PieceUsecase;

  beforeEach(() => {
    repo = makeMockRepo();
    listeningLogRepo = makeMockListeningLogRepo();
    usecase = new PieceUsecase(repo, listeningLogRepo);
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

  describe("delete", () => {
    it("Work の場合は removeWorkCascade を呼ぶ", async () => {
      vi.mocked(repo.findById).mockResolvedValueOnce(makeWork());

      await usecase.delete(PieceId.from(TEST_WORK_ID));

      expect(repo.removeWorkCascade).toHaveBeenCalled();
      expect(repo.removeMovement).not.toHaveBeenCalled();
    });

    it("Movement の場合は removeMovement を呼ぶ", async () => {
      vi.mocked(repo.findById).mockResolvedValueOnce(makeMovement());

      await usecase.delete(PieceId.from(TEST_MOVEMENT_ID));

      expect(repo.removeMovement).toHaveBeenCalled();
      expect(repo.removeWorkCascade).not.toHaveBeenCalled();
    });

    it("存在しない id は冪等（何も呼ばない）", async () => {
      vi.mocked(repo.findById).mockResolvedValueOnce(undefined);

      await usecase.delete(PieceId.from(TEST_WORK_ID));

      expect(repo.removeWorkCascade).not.toHaveBeenCalled();
      expect(repo.removeMovement).not.toHaveBeenCalled();
    });

    it("ListeningLog から参照されている Work は 409 を投げる", async () => {
      vi.mocked(repo.findById).mockResolvedValueOnce(makeWork());
      vi.mocked(listeningLogRepo.existsByPieceIds).mockResolvedValueOnce(true);

      await expect(usecase.delete(PieceId.from(TEST_WORK_ID))).rejects.toMatchObject({
        statusCode: 409,
      });
      expect(repo.removeWorkCascade).not.toHaveBeenCalled();
    });

    it("ListeningLog から参照されている Movement は 409 を投げる", async () => {
      vi.mocked(repo.findById).mockResolvedValueOnce(makeMovement());
      vi.mocked(listeningLogRepo.existsByPieceIds).mockResolvedValueOnce(true);

      await expect(usecase.delete(PieceId.from(TEST_MOVEMENT_ID))).rejects.toMatchObject({
        statusCode: 409,
      });
      expect(repo.removeMovement).not.toHaveBeenCalled();
    });

    it("Work 配下の Movement も含めて参照チェックする", async () => {
      vi.mocked(repo.findById).mockResolvedValueOnce(makeWork());
      vi.mocked(repo.findChildren).mockResolvedValueOnce([
        makeMovement({ id: "mov-a" }),
        makeMovement({ id: "mov-b" }),
      ]);

      await usecase.delete(PieceId.from(TEST_WORK_ID));

      const arg = vi.mocked(listeningLogRepo.existsByPieceIds).mock.calls[0]?.[0];
      expect(arg).toHaveLength(3);
      expect(arg?.map((p) => p.value)).toEqual([TEST_WORK_ID, "mov-a", "mov-b"]);
    });
  });

  describe("resolveComposerId", () => {
    it("Work ノードはそのまま composerId を返す", async () => {
      const result = await usecase.resolveComposerId(makeWork());

      expect(result.value).toBe(TEST_COMPOSER_ID);
    });

    it("Movement ノードは親 Work の composerId を返す", async () => {
      const otherComposerId = "00000000-0000-4000-8000-000000000099";
      vi.mocked(repo.findRootById).mockResolvedValueOnce(makeWork({ composerId: otherComposerId }));

      const result = await usecase.resolveComposerId(makeMovement());

      expect(result.value).toBe(otherComposerId);
    });

    it("Movement の親 Work が存在しない場合は 404", async () => {
      vi.mocked(repo.findRootById).mockResolvedValueOnce(undefined);

      await expect(usecase.resolveComposerId(makeMovement())).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
