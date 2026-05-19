export const mockComposerRepo = {
  findById: vi.fn(),
  findByIds: vi.fn(),
  findPage: vi.fn(),
  save: vi.fn(),
  saveWithOptimisticLock: vi.fn(),
  remove: vi.fn(),
};

export const DynamoDBComposerRepository = vi.fn().mockImplementation(function () {
  return mockComposerRepo;
});
