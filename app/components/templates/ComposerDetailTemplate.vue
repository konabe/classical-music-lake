<script setup lang="ts">
import type { Composer } from "~/types";

const props = defineProps<{
  composer: Composer | null;
  error: Error | null;
  isAdmin: boolean;
}>();

const emit = defineEmits<{
  delete: [composer: Composer];
}>();

const shortId = computed(() => {
  if (props.composer === null) return "";
  return props.composer.id.slice(0, 6).toUpperCase();
});
</script>

<template>
  <article class="composer-detail">
    <NuxtLink to="/composers" class="back-link">
      <span aria-hidden="true">&larr;</span>
      <span class="smallcaps">Back to composers</span>
    </NuxtLink>

    <ErrorMessage
      v-if="error"
      message="作曲家の取得に失敗しました。時間をおいて再度お試しください。"
      variant="block"
    />

    <template v-else-if="composer">
      <div class="composer-grid">
        <aside v-if="composer.imageUrl" class="composer-portrait">
          <figure class="portrait-frame">
            <img
              :src="composer.imageUrl"
              :alt="composer.name"
              class="composer-image"
              loading="lazy"
              referrerpolicy="no-referrer"
            />
            <figcaption class="portrait-caption smallcaps">Portrait</figcaption>
          </figure>
        </aside>

        <header class="composer-masthead">
          <div class="composer-meta">
            <span class="meta-tag smallcaps">III / Composers</span>
            <span class="meta-rule" aria-hidden="true" />
            <span class="meta-id smallcaps numeric">N&deg; {{ shortId }}</span>
          </div>

          <h1 class="composer-name">{{ composer.name }}</h1>

          <div class="composer-category-wrapper">
            <ComposerCategoryList :composer="composer" />
          </div>

          <div v-if="isAdmin" class="admin-actions">
            <NuxtLink :to="`/composers/${composer.id}/edit`" class="admin-link">
              <span class="smallcaps">Edit</span>
            </NuxtLink>
            <span class="admin-sep" aria-hidden="true">/</span>
            <button class="admin-link admin-link--danger" @click="emit('delete', composer)">
              <span class="smallcaps">Delete</span>
            </button>
          </div>
        </header>
      </div>
    </template>
  </article>
</template>

<style scoped>
.composer-detail {
  margin-bottom: 4rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--color-text-muted);
  text-decoration: none;
  margin-bottom: 2rem;
  transition:
    color 0.25s ease,
    gap 0.25s ease;
}

.back-link:hover {
  color: var(--color-accent);
  gap: 0.65rem;
}

.composer-grid {
  display: grid;
  grid-template-columns: minmax(220px, 280px) 1fr;
  gap: 3rem;
  align-items: start;
}

.composer-grid:has(.composer-masthead:only-child) {
  grid-template-columns: 1fr;
}

.composer-portrait {
  position: sticky;
  top: 2rem;
}

.portrait-frame {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.composer-image {
  width: 100%;
  max-height: 380px;
  object-fit: cover;
  border: 1px solid var(--color-hairline-strong);
  background: var(--color-bg-elevated);
  filter: grayscale(0.15) sepia(0.05);
  transition: filter 0.5s ease;
}

.composer-image:hover {
  filter: none;
}

.portrait-caption {
  color: var(--color-text-faint);
  text-align: center;
}

.composer-masthead {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 2.5rem;
  border-bottom: 1px solid var(--color-hairline-strong);
}

.composer-meta {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.meta-tag {
  color: var(--color-bordeaux);
}
:root.dark .meta-tag {
  color: var(--color-accent);
}

.meta-rule {
  flex: 1;
  height: 1px;
  background: var(--color-hairline);
}

.meta-id {
  color: var(--color-text-muted);
}

.composer-name {
  font-family: var(--font-display);
  font-weight: 300;
  font-style: italic;
  font-size: clamp(2.4rem, 6vw, 4.6rem);
  line-height: 1;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  font-variation-settings:
    "opsz" 144,
    "SOFT" 60,
    "WONK" 1;
}

.composer-category-wrapper {
  margin-top: 0.4rem;
}

.admin-actions {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--color-hairline);
}

.admin-link {
  background: transparent;
  border: none;
  padding: 0.3rem 0;
  cursor: pointer;
  color: var(--color-text-muted);
  font-family: var(--font-sans);
  position: relative;
  text-decoration: none;
  transition: color 0.25s ease;
}

.admin-link::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 0;
  height: 1px;
  background: currentColor;
  transition: width 0.3s ease;
}

.admin-link:hover {
  color: var(--color-accent);
}

.admin-link:hover::after {
  width: 100%;
}

.admin-link--danger:hover {
  color: var(--color-bordeaux);
}
:root.dark .admin-link--danger:hover {
  color: var(--color-bordeaux);
}

.admin-sep {
  color: var(--color-text-faint);
  font-family: var(--font-display);
  font-style: italic;
}

@media (max-width: 760px) {
  .composer-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .composer-portrait {
    position: relative;
    top: 0;
    max-width: 240px;
  }
}
</style>
