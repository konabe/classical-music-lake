<script setup lang="ts">
const colorMode = useColorMode();

const isDark = computed(() => colorMode.value === "dark");

const toggle = () => {
  colorMode.preference = isDark.value === true ? "light" : "dark";
};

const ariaLabel = computed(() =>
  isDark.value === true ? "ライトモードに切り替え" : "ダークモードに切り替え",
);
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="ariaLabel"
    :aria-pressed="isDark"
    @click="toggle"
  >
    <ClientOnly>
      <span v-if="isDark" class="icon" aria-hidden="true">☀</span>
      <span v-else class="icon" aria-hidden="true">☾</span>
      <template #fallback>
        <span class="icon" aria-hidden="true">☾</span>
      </template>
    </ClientOnly>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid var(--color-header-text-muted);
  color: var(--color-header-text-muted);
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  transition:
    background-color 0.2s,
    color 0.2s,
    border-color 0.2s;
}

.theme-toggle:hover {
  background-color: var(--color-header-text-muted);
  color: var(--color-header-bg);
}

.icon {
  display: inline-block;
}
</style>
