export const mockListeningLogRepo = {
  save: vi.fn(),
  findById: vi.fn(),
  findByUserId: vi.fn(),
  existsByPieceIds: vi.fn(),
  saveWithOptimisticLock: vi.fn(),
  remove: vi.fn(),
};

export const DynamoDBListeningLogRepository = vi.fn().mockImplementation(function () {
  return mockListeningLogRepo;
});
