export type AuthTokens = {
  accessToken: string | undefined;
  idToken: string | undefined;
  refreshToken: string | undefined;
  tokenType: string;
  expiresIn: number | undefined;
};

export type RefreshedTokens = {
  accessToken: string | undefined;
  idToken: string | undefined;
  tokenType: string;
  expiresIn: number | undefined;
};

export type AuthRepository = {
  signUp(email: string, password: string): Promise<void>;
  initiateAuth(email: string, password: string): Promise<AuthTokens>;
  confirmSignUp(email: string, code: string): Promise<void>;
  resendConfirmationCode(email: string): Promise<void>;
  refreshToken(token: string): Promise<RefreshedTokens>;
  listUsersByEmail(
    userPoolId: string,
    email: string
  ): Promise<{ username: string; status: string }[]>;
  linkProviderForUser(
    userPoolId: string,
    destinationUsername: string,
    providerName: string,
    providerUserId: string
  ): Promise<void>;
};
