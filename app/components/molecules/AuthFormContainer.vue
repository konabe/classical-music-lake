<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<template>
  <div class="auth-form-container">
    <header class="auth-head">
      <span class="head-tag smallcaps">Sign in</span>
      <span class="head-rule" aria-hidden="true" />
    </header>
    <h1 class="auth-title">
      <span class="auth-title-text">{{ title }}</span>
    </h1>
    <slot />
  </div>
</template>

<style scoped>
.auth-form-container {
  background: var(--color-bg-paper);
  padding: 2.5rem 2.4rem 2.4rem;
  border-radius: 0;
  border: 1px solid var(--color-hairline-strong);
  width: 100%;
  max-width: 440px;
  position: relative;
}

/* ゴールドの 4 隅マーク */
.auth-form-container::before,
.auth-form-container::after {
  content: "";
  position: absolute;
  width: 16px;
  height: 16px;
  border: 1px solid var(--color-accent);
  pointer-events: none;
}
.auth-form-container::before {
  top: -1px;
  left: -1px;
  border-right: none;
  border-bottom: none;
}
.auth-form-container::after {
  bottom: -1px;
  right: -1px;
  border-left: none;
  border-top: none;
}

.auth-head {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.8rem;
}

.head-tag {
  color: var(--color-bordeaux);
}
:root.dark .head-tag {
  color: var(--color-accent);
}

.head-rule {
  flex: 1;
  height: 1px;
  background: var(--color-hairline);
}

.auth-title {
  font-family: var(--font-display);
  font-weight: 300;
  font-style: italic;
  font-size: clamp(2rem, 5vw, 2.8rem);
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  margin-bottom: 1.8rem;
  font-variation-settings:
    "opsz" 144,
    "SOFT" 60,
    "WONK" 1;
  line-height: 1.05;
}

@media (max-width: 600px) {
  .auth-form-container {
    padding: 2rem 1.6rem;
  }
}
</style>
