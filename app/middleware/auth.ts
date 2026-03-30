import {
  ACCESS_TOKEN_KEY,
  ID_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  TOKEN_EXPIRES_AT_KEY,
} from "~/composables/useAuth";

export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return;

  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token === null) {
    // NOTE: replace: true でヒストリーを置き換えることで、ブラウザの戻るボタンを押しても
    // 保護ページに戻って再リダイレクトされる無限ループを防ぐ
    return navigateTo("/auth/login", { replace: true });
  }

  // トークンの有効期限を確認し、期限切れの場合はリフレッシュを試行
  const expiresAt = localStorage.getItem(TOKEN_EXPIRES_AT_KEY);
  const parsedExpiresAt = expiresAt !== null ? Number(expiresAt) : NaN;
  const isExpired = Number.isFinite(parsedExpiresAt) && Date.now() >= parsedExpiresAt;
  if (isExpired) {
    const { refreshTokens } = useAuth();
    const refreshed = await refreshTokens();
    if (refreshed !== true) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(ID_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
      return navigateTo("/auth/login", { replace: true });
    }
  }
});
