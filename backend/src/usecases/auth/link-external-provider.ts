import * as cognitoAuthRepository from "../../repositories/cognito-auth-repository";

// Cognito が PreSignUp で渡す小文字のプロバイダー名と、IdP 登録名のマッピング
const providerNameMap: Record<string, string> = {
  google: "Google",
};

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

  // userName は "google_<providerUserId>" の形式
  const underscoreIndex = userName.indexOf("_");
  const rawProviderName = userName.substring(0, underscoreIndex);
  const providerName = providerNameMap[rawProviderName];
  if (providerName === undefined) {
    return false;
  }
  const providerUserId = userName.substring(underscoreIndex + 1);

  await cognitoAuthRepository.linkProviderForUser(
    userPoolId,
    existingUser.username,
    providerName,
    providerUserId
  );

  return true;
};
