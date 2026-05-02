<script setup lang="ts">
defineProps<{
  eyebrow?: string;
  meta?: string;
}>();
</script>

<template>
  <header class="page-title-block">
    <div v-if="eyebrow || meta" class="page-title-meta">
      <span v-if="eyebrow" class="page-title-eyebrow smallcaps">{{ eyebrow }}</span>
      <span class="page-title-rule" aria-hidden="true" />
      <span v-if="meta" class="page-title-meta-text smallcaps">{{ meta }}</span>
    </div>
    <h1 class="page-title">
      <span class="page-title-text"><slot /></span>
    </h1>
  </header>
</template>

<style scoped>
.page-title-block {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 1.8rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-hairline);
}

.page-title-meta {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.page-title-eyebrow {
  color: var(--color-bordeaux);
}
:root.dark .page-title-eyebrow {
  color: var(--color-accent);
}

.page-title-rule {
  flex: 1;
  height: 1px;
  background: var(--color-hairline);
}

.page-title-meta-text {
  color: var(--color-text-muted);
}

.page-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-style: italic;
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  font-variation-settings:
    "opsz" 144,
    "SOFT" 50;
}

.page-title-text {
  display: inline-block;
  line-height: 1.1;
}
</style>
