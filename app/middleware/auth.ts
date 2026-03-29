import { ACCESS_TOKEN_KEY } from "~/composables/useAuth";

export default defineNuxtRouteMiddleware(() => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token === null) {
    // NOTE: replace: true でヒストリーを置き換えることで、ブラウザの戻るボタンを押しても
    // 保護ページに戻って再リダイレクトされる無限ループを防ぐ
    return navigateTo("/auth/login", { replace: true });
  }
});
