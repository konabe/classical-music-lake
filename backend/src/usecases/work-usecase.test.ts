import { describe, it, expect, vi, beforeEach } from "vitest";
import createError from "http-errors";

import { WorkUsecase } from "./work-usecase";
import { PieceId } from "../domain/value-objects/ids";
import type { PieceMovement, PieceWork } from "../types";

const COMPOSER_ID = "00000000-0000-4000-8000-000000000001";
const WORK_ID = "00000000-0000-4000-8000-0000000000aa";

const work: PieceWork = {
  kind: "work",
  id: WORK_ID,
  title: "交響曲第9番",
  composerId: COMPOSER_ID,
  createdAt: "2024-01-15T20:00:00.000Z",
  updatedAt: "2024-01-15T20:00:00.000Z",
};

const makeRepo = () => ({
  findRootById: vi.fn(),
  findRootPage: vi.fn(),
  saveWork: vi.fn(),
  saveWorkWithOptimisticLock: vi.fn(),
  removeWorkCascade: vi.fn(),
  findById: vi.fn(),
  saveMovement: vi.fn(),
  saveMovementWithOptimisticLock: vi.fn(),
  removeMovement: vi.fn(),
  replaceMovements: vi.fn(),
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("WorkUsecase.create", () => {
  it("Work を作成して repo.saveWork を呼ぶ", async () => {
    const repo = makeRepo();
    const usecase = new WorkUsecase(repo);
    const result = await usecase.create({
      kind: "work",
      title: "交響曲第5番",
      composerId: COMPOSER_ID,
    });
    expect(result.kind).toBe("work");
    expect(result.title).toBe("交響曲第5番");
    expect(repo.saveWork).toHaveBeenCalledTimes(1);
    expect(repo.saveMovement).not.toHaveBeenCalled();
  });
});

describe("WorkUsecase.list", () => {
  it("findRootPage の結果を Paginated にラップして返す", async () => {
    const repo = makeRepo();
    repo.findRootPage.mockResolvedValueOnce({ items: [work], lastEvaluatedKey: undefined });
    const usecase = new WorkUsecase(repo);
    const result = await usecase.list({ limit: 10 });
    expect(result.items).toEqual([work]);
    expect(result.nextCursor).toBeNull();
  });
});

describe("WorkUsecase.get", () => {
  it("findRootById で取得できれば返す", async () => {
    const repo = makeRepo();
    repo.findRootById.mockResolvedValueOnce(work);
    const usecase = new WorkUsecase(repo);
    const result = await usecase.get(PieceId.from(WORK_ID));
    expect(result).toEqual(work);
  });

  it("findRootById が undefined を返したら 404 を投げる", async () => {
    const repo = makeRepo();
    repo.findRootById.mockResolvedValueOnce(undefined);
    const usecase = new WorkUsecase(repo);
    await expect(usecase.get(PieceId.from(WORK_ID))).rejects.toThrow(createError.NotFound);
  });
});

describe("WorkUsecase.update", () => {
  it("正常更新で saveWorkWithOptimisticLock を呼ぶ", async () => {
    const repo = makeRepo();
    repo.findRootById.mockResolvedValueOnce(work);
    const usecase = new WorkUsecase(repo);
    const result = await usecase.update(PieceId.from(WORK_ID), {
      kind: "work",
      title: "交響曲第5番",
    });
    expect(result.title).toBe("交響曲第5番");
    expect(repo.saveWorkWithOptimisticLock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "交響曲第5番" }),
      work.updatedAt,
    );
  });

  it("Work が見つからなければ 404 を投げる", async () => {
    const repo = makeRepo();
    repo.findRootById.mockResolvedValueOnce(undefined);
    const usecase = new WorkUsecase(repo);
    await expect(
      usecase.update(PieceId.from(WORK_ID), { kind: "work", title: "新タイトル" }),
    ).rejects.toThrow(createError.NotFound);
  });
});

describe("WorkUsecase.delete", () => {
  it("removeWorkCascade を呼ぶ（Movement の有無に関わらず repo 側で吸収）", async () => {
    const repo = makeRepo();
    const usecase = new WorkUsecase(repo);
    await usecase.delete(PieceId.from(WORK_ID));
    expect(repo.removeWorkCascade).toHaveBeenCalledWith(PieceId.from(WORK_ID));
  });
});

describe("WorkUsecase は Movement に対する操作を行わない（型レベルでのガード補助）", () => {
  it("get は findRootById のみを呼ぶ（findById は呼ばない）", async () => {
    const repo = makeRepo();
    const movement: PieceMovement = {
      kind: "movement",
      id: WORK_ID,
      parentId: COMPOSER_ID,
      index: 0,
      title: "第1楽章",
      createdAt: work.createdAt,
      updatedAt: work.updatedAt,
    };
    // findRootById が undefined を返す前提（Movement なら除外される）
    repo.findRootById.mockResolvedValueOnce(undefined);
    void movement;
    const usecase = new WorkUsecase(repo);
    await expect(usecase.get(PieceId.from(WORK_ID))).rejects.toThrow(createError.NotFound);
    expect(repo.findById).not.toHaveBeenCalled();
  });
});
