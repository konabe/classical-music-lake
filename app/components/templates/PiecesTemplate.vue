<script setup lang="ts">
import type { Piece } from "~/types";

const props = defineProps<{
  pieces: Piece[];
  error: Error | null;
  pending: boolean;
  hasMore: boolean;
  isAdmin: boolean;
  composerNameById: Record<string, string>;
}>();

const emit = defineEmits<{
  delete: [piece: Piece];
  loadMore: [];
  retry: [];
}>();

const pieceCount = computed(() => props.pieces.length);
</script>

<template>
  <div class="pieces-page">
    <header class="pieces-masthead">
      <div class="masthead-meta">
        <span class="meta-tag smallcaps">II / Repertoire</span>
        <span class="meta-rule" aria-hidden="true" />
        <span class="meta-count smallcaps numeric">
          {{ pieceCount.toString().padStart(3, "0") }}
          {{ pieceCount === 1 ? "piece on file" : "pieces on file" }}
        </span>
      </div>

      <h1 class="masthead-title">
        <span class="title-jp">楽曲</span>
        <span class="title-en"><em>Pieces</em></span>
      </h1>

      <p class="masthead-lede">
        <em>A catalog of works.</em> &mdash; 交響曲、協奏曲、室内楽。<br />
        登録された楽曲を時代と編成で巡る。
      </p>

      <div v-if="props.isAdmin" class="masthead-actions">
        <ButtonPrimary @click="$router.push('/pieces/new')"> + 新しい楽曲 </ButtonPrimary>
      </div>
    </header>

    <PieceListInfinite
      :pieces="props.pieces"
      :error="props.error"
      :pending="props.pending"
      :has-more="props.hasMore"
      :composer-name-by-id="props.composerNameById"
      @delete="emit('delete', $event)"
      @load-more="emit('loadMore')"
      @retry="emit('retry')"
    />
  </div>
</template>

<style scoped>
.pieces-page {
  margin-bottom: 4rem;
}

.pieces-masthead {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 1.2rem 0 2.6rem;
  border-bottom: 1px solid var(--color-hairline-strong);
  margin-bottom: 2rem;
  position: relative;
}

.masthead-meta {
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

.meta-count {
  color: var(--color-text-muted);
}

.masthead-title {
  display: flex;
  align-items: baseline;
  gap: 1.5rem;
  flex-wrap: wrap;
  font-family: var(--font-display);
  font-weight: 300;
  font-size: clamp(2.5rem, 7vw, 5rem);
  line-height: 0.95;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  font-variation-settings:
    "opsz" 144,
    "SOFT" 30;
}

.title-jp {
  font-style: normal;
  font-weight: 400;
}

.title-en {
  color: var(--color-accent);
  font-style: italic;
  font-size: 0.7em;
  font-variation-settings:
    "opsz" 144,
    "SOFT" 100,
    "WONK" 1;
}

.masthead-lede {
  font-family: var(--font-serif);
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
  max-width: 38em;
}

.masthead-lede em {
  font-style: italic;
  color: var(--color-bordeaux);
  margin-right: 0.25em;
}
:root.dark .masthead-lede em {
  color: var(--color-accent);
}

.masthead-actions {
  margin-top: 0.4rem;
}

@media (max-width: 600px) {
  .pieces-masthead {
    padding-bottom: 2rem;
  }
  .masthead-title {
    gap: 0.8rem;
  }
}
</style>
