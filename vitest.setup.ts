/**
 * Suppress EnvironmentTeardownError caused by @nuxt/test-utils lazy route resolution.
 *
 * When mountSuspended() mounts a page component, Nuxt's router starts resolving
 * all routes lazily. Some of these dynamic imports may complete after vitest 4.1+
 * tears down the test environment, causing EnvironmentTeardownError unhandled
 * rejections. All tests pass — this is purely a cleanup timing issue.
 */
process.on("unhandledRejection", (reason: unknown) => {
  if (reason instanceof Error && reason.name === "EnvironmentTeardownError") {
    return;
  }
  throw reason;
});
