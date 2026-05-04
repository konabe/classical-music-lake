import { describe, it, expect, vi, beforeEach } from "vitest";
import createError from "http-errors";

import { MovementUsecase } from "./movement-usecase";
import { PieceId } from "../domain/value-objects/ids";
import type { PieceMovement, PieceWork } from "../types";

const COMPOSER_ID = "00000000-0000-4000-8000-000000000001";
const WORK_ID = "00000000-0000-4000-8000-0000000000aa";
const MOVEMENT_ID = "00000000-0000-4000-8000-0000000000bb";

const movement: PieceMovement = {
  kind: "movement",
  id: MOVEMENT_ID,
  parentId: WORK_ID,
  index: 0,
  title: "第1楽章",
  createdAt: "2024-01-15T20:00:00.000Z",
  updatedAt: "2024-01-15T20:00:00.000Z",
};

const work: PieceWork = {
  kind: "work",
  id: WORK_ID,
  title: "交響曲第9番",
  composerId: COMPOSER_ID,
  createdAt: movement.createdAt,
  updatedAt: movement.updatedAt,
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

describe("MovementUsecase.create", () => {
  it("Movement を作成して repo.saveMovement を呼ぶ", async () => {
    const repo = makeRepo();
    const usecase = new MovementUsecase(repo);
    const result = await usecase.create({
      kind: "movement",
      parentId: WORK_ID,
      index: 0,
      title: "第1楽章",
    });
    expect(result.kind).toBe("movement");
    expect(result.parentId).toBe(WORK_ID);
    expect(result.index).toBe(0);
    expect(repo.saveMovement).toHaveBeenCalledTimes(1);
    expect(repo.saveWork).not.toHaveBeenCalled();
  });
});

describe("MovementUsecase.update", () => {
  it("Movement の正常更新で saveMovementWithOptimisticLock を呼ぶ", async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValueOnce(movement);
    const usecase = new MovementUsecase(repo);
    const result = await usecase.update(PieceId.from(MOVEMENT_ID), {
      kind: "movement",
      title: "第1楽章（改訂）",
    });
    expect(result.title).toBe("第1楽章（改訂）");
    expect(repo.saveMovementWithOptimisticLock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "第1楽章（改訂）" }),
      movement.updatedAt,
    );
  });

  it("Movement が見つからなければ 404 を投げる", async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValueOnce(undefined);
    const usecase = new MovementUsecase(repo);
    await expect(
      usecase.update(PieceId.from(MOVEMENT_ID), { kind: "movement", title: "x" }),
    ).rejects.toThrow(createError.NotFound);
  });

  it("対象が Work（kind 不一致）なら TypeError を投げる", async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValueOnce(work);
    const usecase = new MovementUsecase(repo);
    await expect(
      usecase.update(PieceId.from(WORK_ID), { kind: "movement", title: "x" }),
    ).rejects.toThrow(TypeError);
  });
});

describe("MovementUsecase.delete", () => {
  it("removeMovement を呼ぶ", async () => {
    const repo = makeRepo();
    const usecase = new MovementUsecase(repo);
    await usecase.delete(PieceId.from(MOVEMENT_ID));
    expect(repo.removeMovement).toHaveBeenCalledWith(PieceId.from(MOVEMENT_ID));
  });
});

describe("MovementUsecase.replaceMovements", () => {
  it("入力を Entity 化したうえで repo.replaceMovements を呼ぶ", async () => {
    const repo = makeRepo();
    const usecase = new MovementUsecase(repo);
    const result = await usecase.replaceMovements(PieceId.from(WORK_ID), [
      { index: 0, title: "第1楽章" },
      { index: 1, title: "第2楽章" },
    ]);
    expect(result).toHaveLength(2);
    expect(result.every((m) => m.kind === "movement")).toBe(true);
    expect(result[0].parentId).toBe(WORK_ID);
    expect(result[0].index).toBe(0);
    expect(result[1].index).toBe(1);

    expect(repo.replaceMovements).toHaveBeenCalledWith(
      PieceId.from(WORK_ID),
      expect.arrayContaining([
        expect.objectContaining({ kind: "movement", parentId: WORK_ID, index: 0 }),
        expect.objectContaining({ kind: "movement", parentId: WORK_ID, index: 1 }),
      ]),
    );
  });

  it("空配列を渡すと repo.replaceMovements にも空配列が渡る", async () => {
    const repo = makeRepo();
    const usecase = new MovementUsecase(repo);
    const result = await usecase.replaceMovements(PieceId.from(WORK_ID), []);
    expect(result).toEqual([]);
    expect(repo.replaceMovements).toHaveBeenCalledWith(PieceId.from(WORK_ID), []);
  });

  it("不正な index は値オブジェクトで拒否される", async () => {
    const repo = makeRepo();
    const usecase = new MovementUsecase(repo);
    await expect(
      usecase.replaceMovements(PieceId.from(WORK_ID), [{ index: -1, title: "第1楽章" }]),
    ).rejects.toThrow(RangeError);
    expect(repo.replaceMovements).not.toHaveBeenCalled();
  });
});
