import { afterEach, vi } from "vitest";

/**
 * mountSuspended() でページコンポーネントをマウントすると、Nuxt ルーターが
 * すべてのルートを遅延的に解決し、その動的 import がテスト環境の teardown 後に
 * 完了して EnvironmentTeardownError（unhandled rejection）として表面化することがある。
 *
 * 各テスト終了時に保留中の動的 import を待ち合わせ、teardown 前に確実に
 * 解決させることでこのレースを根本から防ぐ。上流 vitest はこれをバグではなく
 * dynamicImportSettled の利用案件として扱っている。
 *   - https://github.com/vitest-dev/vitest/issues/9872
 */
afterEach(async () => {
  await vi.dynamicImportSettled();
});
