export function useCognitoConfig() {
  const config = useRuntimeConfig();
  return {
    domain: config.public.cognitoDomain as string,
    clientId: config.public.cognitoClientId as string,
  };
}
