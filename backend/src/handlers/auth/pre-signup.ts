import type { PreSignUpTriggerHandler } from "aws-lambda";

import { linkExternalProvider } from "../../usecases/auth/link-external-provider";

export const handler: PreSignUpTriggerHandler = async (event) => {
  // 外部プロバイダー（Google等）経由のサインアップ以外はスキップ
  if (event.triggerSource !== "PreSignUp_ExternalProvider") {
    return event;
  }

  const email = event.request.userAttributes.email;
  if (email === undefined || email === "") {
    return event;
  }

  await linkExternalProvider(event.userPoolId, email, event.userName);

  return { ...event };
};
