import { ACCESS_TOKEN_KEY } from "~/composables/useAuth";

export default defineNuxtRouteMiddleware(() => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) {
    return navigateTo("/auth/login");
  }
});
