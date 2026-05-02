<script setup lang="ts">
import type { Piece } from "~/types";
import { isYouTubeUrl } from "~/utils/video";

const props = defineProps<{
  piece: Piece;
  composerName: string;
}>();

const emit = defineEmits<{
  edit: [];
  delete: [];
  detail: [];
  play: [];
}>();

const firstVideoUrl = computed(() => props.piece.videoUrls?.[0]);

const hasYouTubeThumbnail = computed(
  () => firstVideoUrl.value !== undefined && isYouTubeUrl(firstVideoUrl.value),
);

const thumbnailAlt = computed(() => `${props.piece.title} の動画サムネイル`);
</script>

<template>
  <article class="piece-item">
    <button
      v-if="hasYouTubeThumbnail"
      type="button"
      class="piece-thumbnail"
      :aria-label="`${piece.title} の動画を再生`"
      @click="emit('play')"
    >
      <YouTubeThumbnail :video-url="firstVideoUrl" :alt="thumbnailAlt" />
      <span class="thumb-play" aria-hidden="true">&#9658;</span>
    </button>

    <div class="piece-main">
      <p class="piece-composer smallcaps">{{ composerName }}</p>
      <h2 class="piece-title">
        <NuxtLink :to="`/pieces/${piece.id}`">{{ piece.title }}</NuxtLink>
      </h2>
      <div class="piece-category-wrapper">
        <PieceCategoryList :piece="piece" />
      </div>
    </div>

    <div class="piece-actions">
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
.piece-item {
  position: relative;
  background: var(--color-bg-paper);
  border: none;
  border-bottom: 1px solid var(--color-hairline);
  padding: 1.6rem 0.5rem 1.6rem 0;
  display: grid;
  grid-template-columns: 160px 1fr auto;
  align-items: center;
  gap: 1.5rem;
  transition: background 0.25s ease;
}

.piece-item:hover {
  background: var(--color-bg-elevated);
}

.piece-item::before {
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

.piece-item:hover::before {
  transform: translateY(-50%) scaleY(1);
}

.piece-thumbnail {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  padding: 0;
  margin: 0;
  border: 1px solid var(--color-hairline);
  background: transparent;
  cursor: pointer;
  transition:
    transform 0.3s ease,
    border-color 0.3s ease;
  overflow: hidden;
  width: 160px;
  aspect-ratio: 16 / 9;
}

.piece-thumbnail:hover {
  border-color: var(--color-accent);
}

.piece-thumbnail:focus-visible {
  outline: 1px solid var(--color-accent);
  outline-offset: 2px;
}

.thumb-play {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-ink);
  color: var(--color-bg-paper);
  border: 1px solid var(--color-accent);
  font-size: 0.85rem;
  padding-left: 3px;
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}

.piece-thumbnail:hover .thumb-play {
  opacity: 1;
}

.piece-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.piece-composer {
  color: var(--color-bordeaux);
}
:root.dark .piece-composer {
  color: var(--color-accent);
}

.piece-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-style: italic;
  font-size: clamp(1.3rem, 2.4vw, 1.65rem);
  line-height: 1.15;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  font-variation-settings:
    "opsz" 144,
    "SOFT" 50;
}

.piece-title a {
  color: inherit;
  text-decoration: none;
}

.piece-title a::after {
  content: "";
  position: absolute;
  inset: 0;
}

.piece-title a:hover {
  color: var(--color-accent);
}

.piece-category-wrapper {
  margin-top: 0.4rem;
}

.piece-actions {
  display: flex;
  gap: 0.6rem;
  flex-shrink: 0;
  align-items: center;
  position: relative;
  z-index: 1;
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
    color 0.25s ease,
    border-color 0.25s ease;
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
  .piece-item {
    grid-template-columns: 1fr;
    padding: 1.5rem 0;
  }

  .piece-thumbnail {
    width: 100%;
    max-width: 280px;
    align-self: center;
  }

  .piece-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
