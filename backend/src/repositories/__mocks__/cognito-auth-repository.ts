export const mockCognitoAuthRepo = {
  signUp: vi.fn(),
  initiateAuth: vi.fn(),
  confirmSignUp: vi.fn(),
  resendConfirmationCode: vi.fn(),
  refreshToken: vi.fn(),
  listUsersByEmail: vi.fn(),
  linkProviderForUser: vi.fn(),
};

export const CognitoAuthRepository = vi.fn().mockImplementation(function () {
  return mockCognitoAuthRepo;
});
