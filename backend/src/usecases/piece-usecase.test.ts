import { describe, it, expect, vi, beforeEach } from "vitest";
import createError from "http-errors";

import { PieceUsecase } from "./piece-usecase";
import { MovementUsecase } from "./movement-usecase";
import { WorkUsecase } from "./work-usecase";
import { PieceId } from "../domain/value-objects/ids";
import type { PieceMovement, PieceWork } from "../types";

const COMPOSER_ID = "00000000-0000-4000-8000-000000000001";
const WORK_ID = "00000000-0000-4000-8000-0000000000aa";
const MOVEMENT_ID = "00000000-0000-4000-8000-0000000000bb";

const work: PieceWork = {
  kind: "work",
  id: WORK_ID,
  title: "交響曲第9番",
  composerId: COMPOSER_ID,
  createdAt: "2024-01-15T20:00:00.000Z",
  updatedAt: "2024-01-15T20:00:00.000Z",
};

const movement: PieceMovement = {
  kind: "movement",
  id: MOVEMENT_ID,
  parentId: WORK_ID,
  index: 0,
  title: "第1楽章",
  createdAt: work.createdAt,
  updatedAt: work.updatedAt,
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

const makeFacade = () => {
  const repo = makeRepo();
  const usecase = new PieceUsecase(new WorkUsecase(repo), new MovementUsecase(repo), repo);
  return { repo, usecase };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PieceUsecase.create (kind dispatch)", () => {
  it("kind=work は WorkUsecase（saveWork）に委譲される", async () => {
    const { repo, usecase } = makeFacade();
    await usecase.create({ kind: "work", title: "交響曲", composerId: COMPOSER_ID });
    expect(repo.saveWork).toHaveBeenCalledTimes(1);
    expect(repo.saveMovement).not.toHaveBeenCalled();
  });

  it("kind=movement は MovementUsecase（saveMovement）に委譲される", async () => {
    const { repo, usecase } = makeFacade();
    await usecase.create({ kind: "movement", parentId: WORK_ID, index: 0, title: "第1楽章" });
    expect(repo.saveMovement).toHaveBeenCalledTimes(1);
    expect(repo.saveWork).not.toHaveBeenCalled();
  });
});

describe("PieceUsecase.update (kind dispatch)", () => {
  it("kind=work は WorkUsecase（findRootById + saveWorkWithOptimisticLock）に委譲", async () => {
    const { repo, usecase } = makeFacade();
    repo.findRootById.mockResolvedValueOnce(work);
    await usecase.update(PieceId.from(WORK_ID), { kind: "work", title: "交響曲第5番" });
    expect(repo.findRootById).toHaveBeenCalledTimes(1);
    expect(repo.saveWorkWithOptimisticLock).toHaveBeenCalledTimes(1);
  });

  it("kind=movement は MovementUsecase（findById + saveMovementWithOptimisticLock）に委譲", async () => {
    const { repo, usecase } = makeFacade();
    repo.findById.mockResolvedValueOnce(movement);
    await usecase.update(PieceId.from(MOVEMENT_ID), { kind: "movement", title: "第1楽章（改訂）" });
    expect(repo.findById).toHaveBeenCalledTimes(1);
    expect(repo.saveMovementWithOptimisticLock).toHaveBeenCalledTimes(1);
  });
});

describe("PieceUsecase.list / get / delete (Work-only)", () => {
  it("list は WorkUsecase.list に委譲する（Movement は除外される）", async () => {
    const { repo, usecase } = makeFacade();
    repo.findRootPage.mockResolvedValueOnce({ items: [work], lastEvaluatedKey: undefined });
    const result = await usecase.list({ limit: 10 });
    expect(result.items).toEqual([work]);
  });

  it("get は WorkUsecase.get に委譲する（Movement なら 404）", async () => {
    const { repo, usecase } = makeFacade();
    repo.findRootById.mockResolvedValueOnce(undefined);
    await expect(usecase.get(PieceId.from(WORK_ID))).rejects.toThrow(createError.NotFound);
  });

  it("delete は WorkUsecase.delete（removeWorkCascade）に委譲する", async () => {
    const { repo, usecase } = makeFacade();
    await usecase.delete(PieceId.from(WORK_ID));
    expect(repo.removeWorkCascade).toHaveBeenCalledTimes(1);
  });
});

describe("PieceUsecase.getNode (kind 横断取得)", () => {
  it("Work を返せる", async () => {
    const { repo, usecase } = makeFacade();
    repo.findById.mockResolvedValueOnce(work);
    const result = await usecase.getNode(PieceId.from(WORK_ID));
    expect(result).toEqual(work);
  });

  it("Movement も返せる", async () => {
    const { repo, usecase } = makeFacade();
    repo.findById.mockResolvedValueOnce(movement);
    const result = await usecase.getNode(PieceId.from(MOVEMENT_ID));
    expect(result).toEqual(movement);
  });

  it("見つからなければ 404 を投げる", async () => {
    const { repo, usecase } = makeFacade();
    repo.findById.mockResolvedValueOnce(undefined);
    await expect(usecase.getNode(PieceId.from(WORK_ID))).rejects.toThrow(createError.NotFound);
  });
});
