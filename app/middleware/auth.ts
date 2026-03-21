export default defineNuxtRouteMiddleware(() => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    return navigateTo("/auth/login");
  }
});
