/**
 * @nuxt/test-utils のルート遅延解決に起因する EnvironmentTeardownError を抑制する。
 *
 * mountSuspended() でページコンポーネントをマウントすると、Nuxt のルーターが
 * すべてのルートを遅延的に解決し始める。一部の動的インポートが vitest 4.1+ の
 * テスト環境ティアダウン後に完了するため、EnvironmentTeardownError が
 * unhandled rejection として発生する。テスト自体はすべて合格しており、
 * クリーンアップのタイミング問題にすぎない。
 *
 * Vite の reviveInvokeError が元の EnvironmentTeardownError を通常の Error でラップ
 * するため、name だけでなく message でも判定する。
 */
process.on("unhandledRejection", (reason: unknown) => {
  if (
    reason instanceof Error &&
    (reason.name === "EnvironmentTeardownError" ||
      reason.message.includes("after the environment was torn down") ||
      (reason.cause instanceof Error && reason.cause.name === "EnvironmentTeardownError"))
  ) {
    return;
  }
  throw reason;
});
