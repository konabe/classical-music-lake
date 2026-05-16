export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) {
    return;
  }

  const { isAdmin } = useAuth();
  if (!isAdmin()) {
    return navigateTo("/", { replace: true });
  }
});
