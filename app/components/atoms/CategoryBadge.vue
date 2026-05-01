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
  background: #f0ebe0;
  border-color: #e0d8cc;
  color: #555;
}

.kind-genre {
  background: #eef2fb;
  border-color: #c9d5ec;
  color: #2a3f6e;
}

.kind-era {
  background: #f4efe5;
  border-color: #d9c9a8;
  color: #6a5424;
}

.kind-formation {
  background: #eaf2ec;
  border-color: #c3d9c9;
  color: #28623e;
}

.kind-region {
  background: #f8ecec;
  border-color: #e6c9c9;
  color: #7b3a3a;
}

:global(.dark) .kind-default {
  background: #2a2820;
  border-color: #3d3a30;
  color: #c9c2b0;
}

:global(.dark) .kind-genre {
  background: #1c2540;
  border-color: #2c3e6b;
  color: #b8c8e8;
}

:global(.dark) .kind-era {
  background: #2a2418;
  border-color: #4a3f25;
  color: #d9c280;
}

:global(.dark) .kind-formation {
  background: #1c2a1f;
  border-color: #2e4a35;
  color: #a8d6b0;
}

:global(.dark) .kind-region {
  background: #2c1f1f;
  border-color: #4a2c2c;
  color: #e0a8a8;
}
</style>
