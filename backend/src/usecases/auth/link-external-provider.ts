import * as cognitoAuthRepository from "../../repositories/cognito-auth-repository";

export const linkExternalProvider = async (
  userPoolId: string,
  email: string,
  userName: string
): Promise<boolean> => {
  const users = await cognitoAuthRepository.listUsersByEmail(userPoolId, email);
  const existingUser = users.find((u) => u.status === "CONFIRMED");

  if (existingUser === undefined) {
    return false;
  }

  // userName は "google_<providerUserId>" の形式（Cognitoは小文字で渡す）
  const underscoreIndex = userName.indexOf("_");
  const rawProviderName = userName.substring(0, underscoreIndex);
  // Cognito の IdP 登録名と大文字小文字を一致させる（"google" → "Google"）
  const providerName = rawProviderName.charAt(0).toUpperCase() + rawProviderName.slice(1);
  const providerUserId = userName.substring(underscoreIndex + 1);

  await cognitoAuthRepository.linkProviderForUser(
    userPoolId,
    existingUser.username,
    providerName,
    providerUserId
  );

  return true;
};
