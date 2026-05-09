<script setup lang="ts">
import type { Composer, PieceWork } from "~/types";
import { formatLifespan } from "~/utils/lifespan";

const props = defineProps<{
  composer: Composer | null;
  error: Error | null;
  isAdmin: boolean;
  pieces: PieceWork[];
  piecesError: Error | null;
  piecesPending: boolean;
}>();

const emit = defineEmits<{
  delete: [composer: Composer];
}>();

const shortId = computed(() => {
  if (props.composer === null) return "";
  return props.composer.id.slice(0, 6).toUpperCase();
});

const pieceCount = computed(() => props.pieces.length);

const lifespan = computed(() =>
  props.composer === null ? "" : formatLifespan(props.composer.birthYear, props.composer.deathYear),
);
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

          <p v-if="lifespan" class="composer-lifespan smallcaps numeric">{{ lifespan }}</p>

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

      <section class="works-section" aria-labelledby="works-heading">
        <header class="works-masthead">
          <span class="works-tag smallcaps">Works</span>
          <span class="works-rule" aria-hidden="true" />
          <span class="works-count smallcaps numeric">
            {{ pieceCount.toString().padStart(2, "0") }}
            {{ pieceCount === 1 ? "piece" : "pieces" }}
          </span>
        </header>

        <h2 id="works-heading" class="works-title">
          <span class="works-title-jp">楽曲</span>
          <span class="works-title-en"><em>Œuvres</em></span>
        </h2>

        <ErrorMessage
          v-if="piecesError"
          message="楽曲一覧の取得に失敗しました。時間をおいて再度お試しください。"
          variant="block"
        />
        <p v-else-if="piecesPending && pieces.length === 0" class="works-status">読み込み中…</p>
        <EmptyState v-else-if="pieces.length === 0">
          この作曲家の楽曲はまだ登録されていません。
        </EmptyState>
        <ol v-else class="works-list stagger-children">
          <li v-for="(piece, index) in pieces" :key="piece.id" class="works-item">
            <span class="works-index smallcaps numeric">
              N&deg; {{ (index + 1).toString().padStart(2, "0") }}
            </span>
            <NuxtLink :to="`/pieces/${piece.id}`" class="works-link">
              <span class="works-piece-title">{{ piece.title }}</span>
            </NuxtLink>
            <PieceCategoryList :piece="piece" class="works-categories" />
          </li>
        </ol>
      </section>
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

.composer-lifespan {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.85rem;
  letter-spacing: var(--tracking-wide);
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

.works-section {
  margin-top: 3rem;
}

.works-masthead {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin-bottom: 0.6rem;
}

.works-tag {
  color: var(--color-bordeaux);
}
:root.dark .works-tag {
  color: var(--color-accent);
}

.works-rule {
  flex: 1;
  height: 1px;
  background: var(--color-hairline);
}

.works-count {
  color: var(--color-text-muted);
}

.works-title {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  flex-wrap: wrap;
  font-family: var(--font-display);
  font-weight: 300;
  font-size: clamp(1.6rem, 4vw, 2.6rem);
  line-height: 1;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  margin: 0 0 1.5rem;
  font-variation-settings:
    "opsz" 144,
    "SOFT" 30;
}

.works-title-jp {
  font-style: normal;
  font-weight: 400;
}

.works-title-en {
  color: var(--color-accent);
  font-style: italic;
  font-size: 0.7em;
  font-variation-settings:
    "opsz" 144,
    "SOFT" 100,
    "WONK" 1;
}

.works-status {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  padding: 1rem 0;
}

.works-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--color-hairline);
}

.works-item {
  display: grid;
  grid-template-columns: 4rem 1fr;
  align-items: baseline;
  gap: 0.5rem 1.2rem;
  padding: 1.1rem 0;
  border-bottom: 1px solid var(--color-hairline);
}

.works-index {
  color: var(--color-text-faint);
}

.works-link {
  text-decoration: none;
  color: var(--color-text);
  transition: color 0.25s ease;
}

.works-link:hover {
  color: var(--color-accent);
}

.works-piece-title {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.25rem;
  line-height: 1.25;
  letter-spacing: var(--tracking-tight);
  font-variation-settings:
    "opsz" 144,
    "SOFT" 50;
}

.works-categories {
  grid-column: 2;
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

  .works-item {
    grid-template-columns: 1fr;
  }

  .works-index {
    display: block;
  }

  .works-categories {
    grid-column: 1;
  }
}
</style>
