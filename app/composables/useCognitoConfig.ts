export function useCognitoConfig() {
  const config = useRuntimeConfig();
  return {
    domain: config.public.cognitoDomain,
    clientId: config.public.cognitoClientId,
  };
}
