/**
 * @nuxt/test-utils のルート遅延解決に起因する EnvironmentTeardownError を抑制する。
 *
 * mountSuspended() でページコンポーネントをマウントすると、Nuxt のルーターが
 * すべてのルートを遅延的に解決し始める。一部の動的インポートが vitest 4.1+ の
 * テスト環境ティアダウン後に完了するため、EnvironmentTeardownError が
 * unhandled rejection として発生する。テスト自体はすべて合格しており、
 * クリーンアップのタイミング問題にすぎない。
 */
process.on("unhandledRejection", (reason: unknown) => {
  if (reason instanceof Error && reason.name === "EnvironmentTeardownError") {
    return;
  }
  throw reason;
});
