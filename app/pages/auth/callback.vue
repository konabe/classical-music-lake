<script setup lang="ts">
definePageMeta({ layout: "auth" });

const route = useRoute();
const router = useRouter();
const { handleOAuthCallback } = useAuth();

const error = ref<string | null>(null);

onMounted(async () => {
  // Cognito がエラー時に ?error=...&error_description=... を付けてリダイレクトする
  const cognitoError = route.query.error as string | undefined;
  if (cognitoError !== undefined && cognitoError !== "") {
    const description = route.query.error_description as string | undefined;
    error.value =
      description !== undefined && description !== ""
        ? `ログインに失敗しました: ${description}`
        : "ログインに失敗しました。もう一度お試しください。";
    return;
  }

  const code = route.query.code as string | undefined;
  if (code === undefined || code === "") {
    error.value = "ログインに失敗しました。もう一度お試しください。";
    return;
  }
  const result = await handleOAuthCallback(code);
  if (result.success) {
    await router.push("/");
  } else {
    error.value = "ログインに失敗しました。もう一度お試しください。";
  }
});
</script>

<template>
  <div class="callback-page">
    <p v-if="error !== null" class="error-message">{{ error }}</p>
    <p v-else class="loading-message">ログイン処理中...</p>
  </div>
</template>

<style scoped>
.callback-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--color-bg-base);
}

.error-message {
  color: var(--color-danger);
  font-size: 1rem;
}

.loading-message {
  color: #7a5c38;
  font-size: 1rem;
}

:global(.dark) .loading-message {
  color: #d4c5b0;
}
</style>
