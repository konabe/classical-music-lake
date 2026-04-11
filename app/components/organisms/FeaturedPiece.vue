<script setup lang="ts">
import type { Piece } from "~/types";

const props = defineProps<{
  pieces: Piece[];
  loading: boolean;
}>();

const piecesWithVideo = computed(() => props.pieces.filter((p) => p.videoUrl !== undefined));

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
    <div class="featured-header">
      <h2 class="featured-heading">今日の一曲</h2>
      <button v-if="canShuffle && !loading" class="shuffle-btn" type="button" @click="shuffle">
        ↺ 別の曲を見る
      </button>
    </div>

    <div v-if="loading" class="featured-loading">
      <div class="loading-pulse" />
    </div>

    <div v-else-if="!featured" class="featured-empty">動画付きの楽曲がまだ登録されていません</div>

    <div v-else class="featured-content">
      <VideoPlayer :key="featured.id" :video-url="featured.videoUrl!" />
      <div class="piece-info">
        <p class="piece-title">《{{ featured.title }}》</p>
        <p class="piece-composer">{{ featured.composer }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.featured {
  background: #fff;
  border: 1px solid #d4d9e3;
  border-radius: 16px;
  padding: 1.75rem;
}

.featured-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.featured-heading {
  font-size: 1.1rem;
  color: #1e2d5a;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.shuffle-btn {
  background: none;
  border: 1px solid #9aa5b4;
  border-radius: 6px;
  padding: 0.4rem 0.9rem;
  font-size: 0.85rem;
  color: #6b7a99;
  cursor: pointer;
  transition:
    border-color 0.2s,
    color 0.2s;
}

.shuffle-btn:hover {
  border-color: #1e2d5a;
  color: #1e2d5a;
}

.featured-loading {
  padding: 1rem 0;
}

.loading-pulse {
  width: 100%;
  height: 200px;
  background: linear-gradient(90deg, #eaeef4 25%, #d4d9e3 50%, #eaeef4 75%);
  background-size: 200% 100%;
  border-radius: 8px;
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
  padding: 3rem;
  text-align: center;
  color: #888;
  font-size: 0.95rem;
}

.featured-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.piece-info {
  text-align: center;
}

.piece-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: #1e2d5a;
  font-style: italic;
  letter-spacing: 0.04em;
}

.piece-composer {
  font-size: 0.9rem;
  color: #6b7a99;
  margin-top: 0.25rem;
}
</style>
