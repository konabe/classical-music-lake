import {
  AdminLinkProviderForUserCommand,
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import type { PreSignUpTriggerHandler } from "aws-lambda";

const cognito = new CognitoIdentityProviderClient({});

export const handler: PreSignUpTriggerHandler = async (event) => {
  // 外部プロバイダー（Google等）経由のサインアップ以外はスキップ
  if (event.triggerSource !== "PreSignUp_ExternalProvider") {
    return event;
  }

  const email = event.request.userAttributes.email;
  if (email === undefined || email === "") {
    return event;
  }

  const userPoolId = event.userPoolId;

  // 同じメールアドレスを持つ既存の確認済みユーザーを検索
  const listResult = await cognito.send(
    new ListUsersCommand({
      UserPoolId: userPoolId,
      Filter: `email = "${email}"`,
      Limit: 1,
    })
  );

  const existingUser = (listResult.Users ?? []).find(
    (u) => u.UserStatus === "CONFIRMED" && u.Username !== undefined
  );

  if (existingUser === undefined || existingUser.Username === undefined) {
    return event;
  }

  // userName は "Google_<providerUserId>" の形式
  const underscoreIndex = event.userName.indexOf("_");
  const providerName = event.userName.substring(0, underscoreIndex); // "Google"
  const providerUserId = event.userName.substring(underscoreIndex + 1);

  // 既存の Cognito ユーザーに外部アカウントをリンク
  await cognito.send(
    new AdminLinkProviderForUserCommand({
      UserPoolId: userPoolId,
      DestinationUser: {
        ProviderName: "Cognito",
        ProviderAttributeName: "Username",
        ProviderAttributeValue: existingUser.Username,
      },
      SourceUser: {
        ProviderName: providerName,
        ProviderAttributeName: "Cognito_Subject",
        ProviderAttributeValue: providerUserId,
      },
    })
  );

  return event;
};
