import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  ListUsersCommand,
  AdminLinkProviderForUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import { getEnv } from "../utils/env";
import type { AuthRepository, AuthTokens, RefreshedTokens } from "../domain/auth";

const cognito = new CognitoIdentityProviderClient({});

export class CognitoAuthRepository implements AuthRepository {
  async signUp(email: string, password: string): Promise<void> {
    const env = getEnv();
    await cognito.send(
      new SignUpCommand({
        ClientId: env.cognitoClientId,
        Username: email,
        Password: password,
        UserAttributes: [{ Name: "email", Value: email }],
      }),
    );
  }

  async initiateAuth(email: string, password: string): Promise<AuthTokens> {
    const env = getEnv();
    const response = await cognito.send(
      new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: env.cognitoClientId,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      }),
    );
    const result = response.AuthenticationResult;
    return {
      accessToken: result?.AccessToken,
      idToken: result?.IdToken,
      refreshToken: result?.RefreshToken,
      tokenType: result?.TokenType ?? "Bearer",
      expiresIn: result?.ExpiresIn,
    };
  }

  async confirmSignUp(email: string, code: string): Promise<void> {
    const env = getEnv();
    await cognito.send(
      new ConfirmSignUpCommand({
        ClientId: env.cognitoClientId,
        Username: email,
        ConfirmationCode: code,
      }),
    );
  }

  async resendConfirmationCode(email: string): Promise<void> {
    const env = getEnv();
    await cognito.send(
      new ResendConfirmationCodeCommand({
        ClientId: env.cognitoClientId,
        Username: email,
      }),
    );
  }

  async refreshToken(token: string): Promise<RefreshedTokens> {
    const env = getEnv();
    const response = await cognito.send(
      new InitiateAuthCommand({
        AuthFlow: "REFRESH_TOKEN_AUTH",
        ClientId: env.cognitoClientId,
        AuthParameters: {
          REFRESH_TOKEN: token,
        },
      }),
    );
    const result = response.AuthenticationResult;
    return {
      accessToken: result?.AccessToken,
      idToken: result?.IdToken,
      tokenType: result?.TokenType ?? "Bearer",
      expiresIn: result?.ExpiresIn,
    };
  }

  async listUsersByEmail(
    userPoolId: string,
    email: string,
  ): Promise<{ username: string; status: string }[]> {
    const result = await cognito.send(
      new ListUsersCommand({
        UserPoolId: userPoolId,
        Filter: `email = "${email}"`,
        Limit: 1,
      }),
    );
    return (result.Users ?? [])
      .filter((u) => u.Username !== undefined)
      .map((u) => ({ username: u.Username!, status: u.UserStatus ?? "UNKNOWN" }));
  }

  async linkProviderForUser(
    userPoolId: string,
    destinationUsername: string,
    providerName: string,
    providerUserId: string,
  ): Promise<void> {
    await cognito.send(
      new AdminLinkProviderForUserCommand({
        UserPoolId: userPoolId,
        DestinationUser: {
          ProviderName: "Cognito",
          ProviderAttributeName: "Username",
          ProviderAttributeValue: destinationUsername,
        },
        SourceUser: {
          ProviderName: providerName,
          ProviderAttributeName: "Cognito_Subject",
          ProviderAttributeValue: providerUserId,
        },
      }),
    );
  }
}
