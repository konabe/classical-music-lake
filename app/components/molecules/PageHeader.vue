<script setup lang="ts">
defineProps<{
  title: string;
  newPagePath?: string;
}>();

const router = useRouter();
</script>

<template>
  <header class="page-header">
    <div class="page-header-inner">
      <span class="page-header-rule" aria-hidden="true" />
      <h1 class="page-header-title">{{ title }}</h1>
      <ButtonPrimary v-if="newPagePath" @click="router.push(newPagePath!)">
        <slot />
      </ButtonPrimary>
    </div>
    <span class="page-header-trail" aria-hidden="true" />
  </header>
</template>

<style scoped>
.page-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2.4rem;
}

.page-header-inner {
  display: flex;
  align-items: baseline;
  gap: 1.4rem;
}

.page-header-rule {
  flex: 0 0 3rem;
  height: 1px;
  align-self: center;
  background: var(--color-accent);
  opacity: 0.7;
}

.page-header-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-style: italic;
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  line-height: 1.05;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  font-variation-settings:
    "opsz" 144,
    "SOFT" 50;
  flex: 1;
}

.page-header-trail {
  height: 1px;
  background: var(--color-hairline);
}

@media (max-width: 600px) {
  .page-header-inner {
    flex-wrap: wrap;
    gap: 0.8rem;
  }
  .page-header-rule {
    flex: 0 0 1.8rem;
  }
}
</style>
