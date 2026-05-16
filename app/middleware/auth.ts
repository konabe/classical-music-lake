import { ACCESS_TOKEN_KEY } from "@/composables/useAuth";

export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) {
    return;
  }

  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token === null) {
    // NOTE: replace: true でヒストリーを置き換えることで、ブラウザの戻るボタンを押しても
    // 保護ページに戻って再リダイレクトされる無限ループを防ぐ
    return navigateTo("/auth/login", { replace: true });
  }

  const { isTokenExpired, refreshTokens, clearTokens } = useAuth();
  if (isTokenExpired() === true) {
    const refreshed = await refreshTokens();
    if (refreshed !== true) {
      clearTokens();
      return navigateTo("/auth/login", { replace: true });
    }
  }
});
