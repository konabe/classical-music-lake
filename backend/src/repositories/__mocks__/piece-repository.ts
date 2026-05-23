export const mockPieceRepo = {
  saveWork: vi.fn(),
  saveWorkWithOptimisticLock: vi.fn(),
  removeWorkCascade: vi.fn(),
  findRootById: vi.fn(),
  findRootPage: vi.fn(),
  findById: vi.fn(),
  findByIds: vi.fn().mockResolvedValue([]),
  findChildren: vi.fn().mockResolvedValue([]),
  saveMovement: vi.fn(),
  saveMovementWithOptimisticLock: vi.fn(),
  removeMovement: vi.fn(),
  replaceMovements: vi.fn(),
};

export const DynamoDBPieceRepository = vi.fn().mockImplementation(function () {
  return mockPieceRepo;
});
