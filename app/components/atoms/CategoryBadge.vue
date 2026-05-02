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
  <span class="category-badge" :class="kindClass" :aria-label="ariaLabel">
    <span class="badge-mark" aria-hidden="true">&middot;</span>
    <span class="badge-value">{{ value }}</span>
  </span>
</template>

<style scoped>
.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.65rem;
  font-family: var(--font-sans);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  line-height: 1.4;
  border: 1px solid;
  background: transparent;
}

.badge-mark {
  font-size: 0.85rem;
  line-height: 1;
  letter-spacing: 0;
}

.badge-value {
  font-size: 0.68rem;
}

.kind-default {
  border-color: var(--color-hairline-strong);
  color: var(--color-text-muted);
}

.kind-default .badge-mark {
  color: var(--color-text-faint);
}

.kind-genre {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
:root.dark .kind-genre {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.kind-genre .badge-mark {
  color: var(--color-accent);
}

.kind-era {
  border-color: var(--color-accent);
  color: var(--color-accent);
}
.kind-era .badge-mark {
  color: var(--color-accent-soft);
}

.kind-formation {
  border-color: var(--color-bordeaux);
  color: var(--color-bordeaux);
}
:root.dark .kind-formation {
  border-color: var(--color-bordeaux);
  color: var(--color-bordeaux);
}
.kind-formation .badge-mark {
  color: var(--color-bordeaux-soft);
}

.kind-region {
  border-color: var(--color-text-muted);
  color: var(--color-text-secondary);
}
.kind-region .badge-mark {
  color: var(--color-text-faint);
}
</style>
