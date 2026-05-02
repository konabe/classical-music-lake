<script setup lang="ts">
import type { Composer } from "~/types";
import { formatLifespan } from "~/utils/lifespan";

const props = defineProps<{
  composer: Composer;
}>();

const emit = defineEmits<{
  edit: [];
  delete: [];
  detail: [];
}>();

const lifespan = computed(() => formatLifespan(props.composer.birthYear, props.composer.deathYear));
</script>

<template>
  <article class="composer-item">
    <div class="composer-portrait">
      <img
        v-if="composer.imageUrl"
        :src="composer.imageUrl"
        :alt="composer.name"
        class="composer-thumb"
        loading="lazy"
        referrerpolicy="no-referrer"
      />
      <span v-else class="composer-thumb composer-thumb--empty" aria-hidden="true">
        {{ composer.name.slice(0, 1) }}
      </span>
    </div>

    <div class="composer-main">
      <h2 class="composer-name">{{ composer.name }}</h2>
      <div v-if="lifespan" class="composer-lifespan smallcaps numeric">{{ lifespan }}</div>
      <div class="composer-category-wrapper">
        <ComposerCategoryList :composer="composer" />
      </div>
    </div>

    <div class="composer-actions">
      <button type="button" class="btn-detail" @click="emit('detail')">
        <span>Read</span>
        <span aria-hidden="true">&rarr;</span>
      </button>
      <ButtonSecondary @click="emit('edit')">Edit</ButtonSecondary>
      <ButtonDanger @click="emit('delete')">Delete</ButtonDanger>
    </div>
  </article>
</template>

<style scoped>
.composer-item {
  position: relative;
  background: var(--color-bg-paper);
  border-bottom: 1px solid var(--color-hairline);
  padding: 1.5rem 0.5rem 1.5rem 0;
  display: grid;
  grid-template-columns: 80px 1fr auto;
  align-items: center;
  gap: 1.5rem;
  transition: background 0.25s ease;
}

.composer-item:hover {
  background: var(--color-bg-elevated);
}

.composer-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%) scaleY(0);
  height: 60%;
  width: 2px;
  background: var(--color-accent);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.composer-item:hover::before {
  transform: translateY(-50%) scaleY(1);
}

.composer-portrait {
  display: flex;
  align-items: center;
  justify-content: center;
}

.composer-thumb {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--color-bg-elevated);
  flex-shrink: 0;
  border: 1px solid var(--color-hairline-strong);
}

.composer-thumb--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.7rem;
  color: var(--color-accent);
  background: var(--color-bg-paper);
}

.composer-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.composer-name {
  font-family: var(--font-display);
  font-weight: 400;
  font-style: italic;
  font-size: clamp(1.3rem, 2.4vw, 1.7rem);
  line-height: 1.15;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  font-variation-settings:
    "opsz" 144,
    "SOFT" 50;
}

.composer-lifespan {
  color: var(--color-text-muted);
  font-size: 0.75rem;
  letter-spacing: var(--tracking-wide);
}

.composer-category-wrapper {
  margin-top: 0.3rem;
}

.composer-actions {
  display: flex;
  gap: 0.6rem;
  flex-shrink: 0;
  align-items: center;
}

.btn-detail {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  color: var(--color-text);
  padding: 0.7rem 1rem;
  border: 1px solid var(--color-bg-ink);
  font-family: var(--font-sans);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  cursor: pointer;
  transition:
    background 0.25s ease,
    color 0.25s ease;
}

.btn-detail:hover {
  background: var(--color-bg-ink);
  color: var(--color-bg-paper);
}

:root.dark .btn-detail {
  border-color: var(--color-text);
  color: var(--color-text);
}

@media (max-width: 720px) {
  .composer-item {
    grid-template-columns: 64px 1fr;
  }

  .composer-actions {
    grid-column: 1 / -1;
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
