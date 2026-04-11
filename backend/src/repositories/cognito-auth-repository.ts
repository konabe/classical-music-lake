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

const cognito = new CognitoIdentityProviderClient({});

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

export const signUp = async (email: string, password: string): Promise<void> => {
  const env = getEnv();
  await cognito.send(
    new SignUpCommand({
      ClientId: env.cognitoClientId,
      Username: email,
      Password: password,
      UserAttributes: [{ Name: "email", Value: email }],
    })
  );
};

export const initiateAuth = async (email: string, password: string): Promise<AuthTokens> => {
  const env = getEnv();
  const response = await cognito.send(
    new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: env.cognitoClientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    })
  );
  const result = response.AuthenticationResult;
  return {
    accessToken: result?.AccessToken,
    idToken: result?.IdToken,
    refreshToken: result?.RefreshToken,
    tokenType: result?.TokenType ?? "Bearer",
    expiresIn: result?.ExpiresIn,
  };
};

export const confirmSignUp = async (email: string, code: string): Promise<void> => {
  const env = getEnv();
  await cognito.send(
    new ConfirmSignUpCommand({
      ClientId: env.cognitoClientId,
      Username: email,
      ConfirmationCode: code,
    })
  );
};

export const resendConfirmationCode = async (email: string): Promise<void> => {
  const env = getEnv();
  await cognito.send(
    new ResendConfirmationCodeCommand({
      ClientId: env.cognitoClientId,
      Username: email,
    })
  );
};

export const refreshToken = async (token: string): Promise<RefreshedTokens> => {
  const env = getEnv();
  const response = await cognito.send(
    new InitiateAuthCommand({
      AuthFlow: "REFRESH_TOKEN_AUTH",
      ClientId: env.cognitoClientId,
      AuthParameters: {
        REFRESH_TOKEN: token,
      },
    })
  );
  const result = response.AuthenticationResult;
  return {
    accessToken: result?.AccessToken,
    idToken: result?.IdToken,
    tokenType: result?.TokenType ?? "Bearer",
    expiresIn: result?.ExpiresIn,
  };
};

export const listUsersByEmail = async (
  userPoolId: string,
  email: string
): Promise<{ username: string; status: string }[]> => {
  const result = await cognito.send(
    new ListUsersCommand({
      UserPoolId: userPoolId,
      Filter: `email = "${email}"`,
      Limit: 1,
    })
  );
  return (result.Users ?? [])
    .filter((u) => u.Username !== undefined)
    .map((u) => ({ username: u.Username!, status: u.UserStatus ?? "UNKNOWN" }));
};

export const linkProviderForUser = async (
  userPoolId: string,
  destinationUsername: string,
  providerName: string,
  providerUserId: string
): Promise<void> => {
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
    })
  );
};
