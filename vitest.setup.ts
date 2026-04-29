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
 *
 * TODO: vitest の上流修正が入ったらこのファイルごと削除する。
 *   - https://github.com/vitest-dev/vitest/issues/9872
 *   検証履歴: vitest 4.1.5 + @nuxt/test-utils 4.0.3 の組み合わせでも未解消（2026-04-29 時点）。
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
