export function useApiBase(): string {
  const config = useRuntimeConfig();
  const baseUrl = config.public.apiBaseUrl;
  // Remove trailing slash to avoid double slashes when appending paths
  return baseUrl.replace(/\/$/, "");
}
