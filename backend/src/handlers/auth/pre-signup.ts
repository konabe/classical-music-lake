import type { PreSignUpTriggerHandler } from "aws-lambda";

import { createAuthUsecase } from "../../usecases/auth-usecase";

const usecase = createAuthUsecase();

export const handler: PreSignUpTriggerHandler = async (event) => {
  if (event.triggerSource !== "PreSignUp_ExternalProvider") {
    return event;
  }

  const email = event.request.userAttributes.email;
  if (email === undefined || email === "") {
    return event;
  }

  await usecase.linkExternalProvider(event.userPoolId, email, event.userName);

  return { ...event };
};
