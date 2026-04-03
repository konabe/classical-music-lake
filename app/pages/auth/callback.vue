<script setup lang="ts">
definePageMeta({ layout: "auth" });

const route = useRoute();
const router = useRouter();
const { handleOAuthCallback } = useAuth();

const error = ref<string | null>(null);

onMounted(async () => {
  const code = route.query.code as string | undefined;
  if (code === undefined || code === "") {
    error.value = "ログインに失敗しました。もう一度お試しください。";
    return;
  }
  try {
    await handleOAuthCallback(code);
    await router.push("/");
  } catch {
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
  background-color: #f8f4ed;
}

.error-message {
  color: #c0392b;
  font-size: 1rem;
}

.loading-message {
  color: #7a5c38;
  font-size: 1rem;
}
</style>
