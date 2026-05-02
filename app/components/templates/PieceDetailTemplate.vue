<script setup lang="ts">
import type { Piece, Rating } from "~/types";

const props = defineProps<{
  piece: Piece | null;
  error: Error | null;
  isAdmin: boolean;
  composerName: string;
}>();

const emit = defineEmits<{
  save: [values: { rating: Rating; isFavorite: boolean; memo: string }];
  delete: [piece: Piece];
}>();

const hasStartedPlaying = ref(false);

const shortId = computed(() => {
  if (props.piece === null) return "";
  return props.piece.id.slice(0, 6).toUpperCase();
});
</script>

<template>
  <article class="piece-detail">
    <NuxtLink to="/pieces" class="back-link">
      <span aria-hidden="true">&larr;</span>
      <span class="smallcaps">Back to repertoire</span>
    </NuxtLink>

    <ErrorMessage
      v-if="error"
      message="楽曲の取得に失敗しました。時間をおいて再度お試しください。"
      variant="block"
    />

    <template v-else-if="piece">
      <header class="piece-masthead">
        <div class="piece-meta">
          <span class="meta-tag smallcaps">II / Repertoire</span>
          <span class="meta-rule" aria-hidden="true" />
          <span class="meta-id smallcaps numeric">N&deg; {{ shortId }}</span>
        </div>

        <p class="piece-composer">{{ composerName }}</p>

        <h1 class="piece-title">{{ piece.title }}</h1>

        <div class="piece-category-wrapper">
          <PieceCategoryList :piece="piece" />
        </div>

        <div v-if="isAdmin" class="admin-actions">
          <NuxtLink :to="`/pieces/${piece.id}/edit`" class="admin-link">
            <span class="smallcaps">Edit</span>
          </NuxtLink>
          <span class="admin-sep" aria-hidden="true">/</span>
          <button class="admin-link admin-link--danger" @click="emit('delete', piece)">
            <span class="smallcaps">Delete</span>
          </button>
        </div>
      </header>

      <template v-if="piece.videoUrl">
        <section class="piece-stage">
          <span class="stage-tag smallcaps">Performance</span>
          <div class="stage-frame">
            <VideoPlayer :video-url="piece.videoUrl" @play="hasStartedPlaying = true" />
          </div>
        </section>

        <section v-if="hasStartedPlaying" class="piece-quicklog">
          <header class="quicklog-head">
            <span class="quicklog-num">&para;</span>
            <h2 class="quicklog-title">Mark this listening</h2>
            <span class="smallcaps quicklog-meta">いま聴いている演奏を、書き留める</span>
          </header>
          <QuickLogForm
            :composer="composerName"
            :piece="piece.title"
            @submit="emit('save', $event)"
          />
        </section>
      </template>
    </template>
  </article>
</template>

<style scoped>
.piece-detail {
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

.piece-masthead {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 2.5rem;
  border-bottom: 1px solid var(--color-hairline-strong);
  margin-bottom: 2.5rem;
  position: relative;
}

.piece-meta {
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

.piece-composer {
  font-family: var(--font-sans);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-top: 0.4rem;
}

.piece-title {
  font-family: var(--font-display);
  font-weight: 300;
  font-style: italic;
  font-size: clamp(2.2rem, 6vw, 4.4rem);
  line-height: 1;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  font-variation-settings:
    "opsz" 144,
    "SOFT" 50,
    "WONK" 1;
  max-width: 18em;
}

.piece-category-wrapper {
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

.piece-stage {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 3rem;
}

.stage-tag {
  color: var(--color-bordeaux);
}
:root.dark .stage-tag {
  color: var(--color-accent);
}

.stage-frame {
  position: relative;
  border: 1px solid var(--color-hairline);
  background: var(--color-bg-surface);
  padding: clamp(1rem, 2vw, 1.5rem);
}

.stage-frame::before,
.stage-frame::after {
  content: "";
  position: absolute;
  width: 14px;
  height: 14px;
  border: 1px solid var(--color-accent);
  pointer-events: none;
}
.stage-frame::before {
  top: -1px;
  left: -1px;
  border-right: none;
  border-bottom: none;
}
.stage-frame::after {
  bottom: -1px;
  right: -1px;
  border-left: none;
  border-top: none;
}

.piece-quicklog {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.quicklog-head {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-hairline);
}

.quicklog-num {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.4rem;
  color: var(--color-accent);
}

.quicklog-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-style: italic;
  font-size: clamp(1.4rem, 2.5vw, 1.8rem);
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  flex: 1;
}

.quicklog-meta {
  color: var(--color-text-muted);
}
</style>
