export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) {
    return;
  }

  const { isAdmin } = useAuth();
  if (isAdmin() !== true) {
    return navigateTo("/", { replace: true });
  }
});
