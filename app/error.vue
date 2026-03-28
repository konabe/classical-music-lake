<script setup lang="ts">
defineProps<{
  error: { statusCode: number; statusMessage: string };
}>();

const handleError = () => clearError({ redirect: "/" });
</script>

<template>
  <div class="error-page">
    <header class="error-header">
      <NuxtLink to="/" class="logo">
        <img src="/logo.svg" alt="Nocturne" class="logo-img" />
        <span class="logo-text">Nocturne</span>
      </NuxtLink>
    </header>
    <main class="error-main">
      <div class="error-content">
        <p class="error-code">404</p>
        <h1 class="error-title">ページが見つかりません</h1>
        <p class="error-message">お探しのページは存在しないか、移動した可能性があります。</p>
        <button class="btn-home" @click="handleError">ホームへ戻る</button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.error-page {
  min-height: 100vh;
  background-color: #f5f0e8;
  display: flex;
  flex-direction: column;
}

.error-header {
  background-color: #1e2d5a;
  padding: 1rem 2rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
}

.logo-img {
  height: 32px;
  width: auto;
  filter: brightness(0) invert(1);
}

.logo-text {
  font-size: 1.3rem;
  font-weight: bold;
  color: #fff;
  letter-spacing: 0.08em;
  font-style: italic;
}

.error-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.error-content {
  text-align: center;
}

.error-code {
  font-size: 6rem;
  font-weight: bold;
  color: #1e2d5a;
  line-height: 1;
  margin: 0 0 1rem;
  font-style: italic;
  font-family: Georgia, serif;
}

.error-title {
  font-size: 1.5rem;
  color: #1e2d5a;
  margin: 0 0 1rem;
}

.error-message {
  color: #666;
  margin: 0 0 2rem;
}

.btn-home {
  background-color: #1e2d5a;
  color: #fff;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-home:hover {
  background-color: #2a3f7e;
}
</style>
