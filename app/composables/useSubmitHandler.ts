/**
 * フォーム送信時の `try/catch` と成功後ナビゲーションを共通化する composable。
 *
 * - `error` は成功時に `null` にリセットし、失敗時に `errorMessage` を格納する
 * - `submit` 成功後は `redirectTo` に `navigateTo()` で遷移する
 */
export const useSubmitHandler = <TValues>(options: {
  submit: (values: TValues) => Promise<unknown>;
  redirectTo: string | (() => string);
  errorMessage: string;
}) => {
  const error = ref<string | null>(null);

  const handleSubmit = async (values: TValues): Promise<void> => {
    error.value = null;
    try {
      await options.submit(values);
      const to =
        typeof options.redirectTo === "function" ? options.redirectTo() : options.redirectTo;
      await navigateTo(to);
    } catch {
      error.value = options.errorMessage;
    }
  };

  return { error, handleSubmit };
};
