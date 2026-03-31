import { ACCESS_TOKEN_KEY, TOKEN_EXPIRES_AT_KEY } from "~/composables/useAuth";

export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return;

  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token === null) {
    // NOTE: replace: true でヒストリーを置き換えることで、ブラウザの戻るボタンを押しても
    // 保護ページに戻って再リダイレクトされる無限ループを防ぐ
    return navigateTo("/auth/login", { replace: true });
  }

  const expiresAt = localStorage.getItem(TOKEN_EXPIRES_AT_KEY);
  const parsedExpiresAt = expiresAt !== null ? Number(expiresAt) : NaN;
  const isExpired = Number.isFinite(parsedExpiresAt) && Date.now() >= parsedExpiresAt;
  if (isExpired) {
    const { refreshTokens, clearTokens } = useAuth();
    const refreshed = await refreshTokens();
    if (refreshed !== true) {
      clearTokens();
      return navigateTo("/auth/login", { replace: true });
    }
  }
});
