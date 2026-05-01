<script setup lang="ts">
type Kind = "genre" | "era" | "formation" | "region";

const props = defineProps<{
  label: string;
  value: string;
  kind?: Kind;
}>();

const kindClass = computed(() =>
  props.kind !== undefined ? `kind-${props.kind}` : "kind-default",
);
const ariaLabel = computed(() => `${props.label}: ${props.value}`);
</script>

<template>
  <span class="category-badge" :class="kindClass" :aria-label="ariaLabel">{{ value }}</span>
</template>

<style scoped>
.category-badge {
  display: inline-block;
  border-radius: 4px;
  padding: 0.15rem 0.55rem;
  font-size: 0.8rem;
  line-height: 1.4;
  border: 1px solid transparent;
}

.kind-default {
  background: var(--color-badge-default-bg);
  border-color: var(--color-badge-default-border);
  color: var(--color-badge-default-text);
}

.kind-genre {
  background: var(--color-badge-genre-bg);
  border-color: var(--color-badge-genre-border);
  color: var(--color-badge-genre-text);
}

.kind-era {
  background: var(--color-badge-era-bg);
  border-color: var(--color-badge-era-border);
  color: var(--color-badge-era-text);
}

.kind-formation {
  background: var(--color-badge-formation-bg);
  border-color: var(--color-badge-formation-border);
  color: var(--color-badge-formation-text);
}

.kind-region {
  background: var(--color-badge-region-bg);
  border-color: var(--color-badge-region-border);
  color: var(--color-badge-region-text);
}
</style>
