export const mockConcertLogRepo = {
  save: vi.fn(),
  findById: vi.fn(),
  findByUserId: vi.fn(),
  saveWithOptimisticLock: vi.fn(),
  remove: vi.fn(),
};

export const DynamoDBConcertLogRepository = vi.fn().mockImplementation(function () {
  return mockConcertLogRepo;
});
