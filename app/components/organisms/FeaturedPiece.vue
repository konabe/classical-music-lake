<script setup lang="ts">
import type { PieceWork } from "~/types";

const props = defineProps<{
  pieces: PieceWork[];
  loading: boolean;
  composerNameById: Record<string, string>;
}>();

const piecesWithVideo = computed(() =>
  props.pieces.filter((p) => p.videoUrls !== undefined && p.videoUrls.length > 0),
);

const currentIndex = ref(0);

onMounted(() => {
  if (piecesWithVideo.value.length > 0) {
    currentIndex.value = Math.floor(Math.random() * piecesWithVideo.value.length); // NOSONAR: セキュリティ目的ではなく表示曲のランダム選択に使用
  }
});

watch(piecesWithVideo, (pieces) => {
  if (pieces.length > 0) {
    currentIndex.value = Math.floor(Math.random() * pieces.length); // NOSONAR: セキュリティ目的ではなく表示曲のランダム選択に使用
  }
});

const featured = computed(() => piecesWithVideo.value[currentIndex.value] ?? null);

const canShuffle = computed(() => piecesWithVideo.value.length > 1);

const shuffle = () => {
  if (!canShuffle.value) {
    return;
  }
  let next = currentIndex.value;
  while (next === currentIndex.value) {
    next = Math.floor(Math.random() * piecesWithVideo.value.length); // NOSONAR: セキュリティ目的ではなく表示曲のシャッフルに使用
  }
  currentIndex.value = next;
};
</script>

<template>
  <div class="featured">
    <div class="featured-meta">
      <span class="meta-tag smallcaps">Now playing</span>
      <span class="meta-rule" aria-hidden="true" />
      <button v-if="canShuffle && !loading" class="shuffle-btn" type="button" @click="shuffle">
        <span aria-hidden="true">&#x2934;</span>
        <span>Shuffle</span>
      </button>
    </div>

    <div v-if="loading" class="featured-loading">
      <div class="loading-pulse" />
    </div>

    <div v-else-if="!featured" class="featured-empty">
      <p class="empty-quote">&ldquo;A song unsung is silence.&rdquo;</p>
      <p class="empty-help">動画付きの楽曲がまだ登録されていません</p>
    </div>

    <div v-else class="featured-content">
      <div class="featured-video">
        <VideoPlayer :key="featured.id" :video-url="featured.videoUrls![0]" />
      </div>
      <div class="piece-info">
        <p class="piece-composer">
          {{ (props.composerNameById ?? {})[featured.composerId] ?? "(不明な作曲家)" }}
        </p>
        <p class="piece-title">{{ featured.title }}</p>
        <p class="piece-attr smallcaps">a piece selected for you tonight</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.featured {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
}

.featured-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.meta-tag {
  color: var(--color-bordeaux);
  font-weight: 700;
}
:root.dark .meta-tag {
  color: var(--color-accent);
}

.meta-rule {
  flex: 1;
  height: 1px;
  background: var(--color-hairline);
}

.shuffle-btn {
  background: transparent;
  border: 1px solid var(--color-hairline-strong);
  color: var(--color-text-muted);
  padding: 0.45rem 0.95rem;
  font-family: var(--font-sans);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  transition:
    border-color 0.25s ease,
    color 0.25s ease,
    background 0.25s ease;
}

.shuffle-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.featured-loading {
  padding: 1rem 0;
}

.loading-pulse {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: linear-gradient(
    90deg,
    var(--color-bg-subtle) 25%,
    var(--color-border) 50%,
    var(--color-bg-subtle) 75%
  );
  background-size: 200% 100%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.featured-empty {
  padding: 3rem 1rem;
  text-align: center;
}

.empty-quote {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.6rem;
  color: var(--color-text);
  line-height: 1.3;
  margin-bottom: 0.4rem;
  font-variation-settings: "opsz" 144;
}

.empty-help {
  font-family: var(--font-sans);
  font-size: 0.85rem;
  color: var(--color-text-faint);
  letter-spacing: 0.04em;
}

.featured-content {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 1.8rem;
  align-items: center;
}

.featured-video {
  width: 100%;
}

.piece-info {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 1rem;
  border-left: 1px solid var(--color-hairline);
}

.piece-composer {
  font-family: var(--font-sans);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.piece-title {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(1.6rem, 2.5vw, 2.1rem);
  color: var(--color-text);
  line-height: 1.15;
  letter-spacing: var(--tracking-tight);
  font-variation-settings:
    "opsz" 144,
    "SOFT" 60;
}

.piece-attr {
  margin-top: 0.6rem;
  color: var(--color-text-faint);
  font-family: var(--font-serif);
  font-style: italic;
  text-transform: none;
  letter-spacing: 0.04em;
  font-size: 0.85rem;
  font-weight: 400;
}

@media (max-width: 760px) {
  .featured-content {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }
  .piece-info {
    border-left: none;
    border-top: 1px solid var(--color-hairline);
    padding: 1.2rem 0 0;
  }
}
</style>
