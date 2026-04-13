<script setup lang="ts">
import type { Piece } from "~/types";

const apiBase = useApiBase();
const { items, pending, error, hasMore, loadMore, reset, retry } = usePiecesPaginated();

// 初回ロード
void loadMore();

// 無限スクロール: センチネル要素の可視化で次ページを取得
const sentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (typeof IntersectionObserver === "undefined") {
    return;
  }
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        void loadMore();
      }
    }
  });
  if (sentinel.value !== null) {
    observer.observe(sentinel.value);
  }
});

onUnmounted(() => {
  observer?.disconnect();
  observer = null;
});

watch(sentinel, (el, _prev, onCleanup) => {
  if (observer === null || el === null) {
    return;
  }
  observer.observe(el);
  onCleanup(() => {
    observer?.unobserve(el);
  });
});

async function handleDelete(piece: Piece) {
  if (!confirm(`「${piece.title}」を削除しますか？`)) {
    return;
  }
  try {
    await $fetch(`${apiBase}/pieces/${piece.id}`, { method: "DELETE" });
    reset();
    await loadMore();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "削除に失敗しました。もう一度お試しください。";
    alert(message);
  }
}
</script>

<template>
  <div>
    <PiecesTemplate :pieces="items" :error="error" @delete="handleDelete" />
    <div class="list-status" role="status" aria-live="polite">
      <p v-if="pending" class="status-text">読み込み中…</p>
      <div v-else-if="error" class="status-error">
        <p>取得に失敗しました。</p>
        <button type="button" class="btn-retry" @click="retry">再試行</button>
      </div>
      <p v-else-if="!hasMore && items.length > 0" class="status-text">これ以上ありません</p>
      <div v-if="hasMore && !error" ref="sentinel" class="sentinel" aria-hidden="true"></div>
    </div>
  </div>
</template>

<style scoped>
.list-status {
  margin-top: 1rem;
  text-align: center;
}

.status-text {
  color: #666;
  font-size: 0.9rem;
  padding: 1rem 0;
}

.status-error {
  padding: 1rem 0;
  color: #c33;
}

.btn-retry {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #c33;
  background: #fff;
  color: #c33;
  border-radius: 4px;
  cursor: pointer;
}

.btn-retry:hover {
  background: #fee;
}

.sentinel {
  height: 1px;
}
</style>
