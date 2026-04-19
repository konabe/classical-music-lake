<script setup lang="ts">
import type { Piece } from "~/types";

const props = defineProps<{
  pieces: Piece[];
  error: Error | null;
  pending: boolean;
  hasMore: boolean;
  composerNameById: Record<string, string>;
}>();

const emit = defineEmits<{
  delete: [piece: Piece];
  loadMore: [];
  retry: [];
}>();

// 無限スクロール: センチネル要素の可視化で次ページ取得を親に通知する
const sentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const startObserving = (el: HTMLElement) => {
  if (typeof IntersectionObserver === "undefined") {
    return;
  }
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        emit("loadMore");
      }
    }
  });
  observer.observe(el);
};

onMounted(() => {
  if (sentinel.value !== null) {
    startObserving(sentinel.value);
  }
});

onUnmounted(() => {
  observer?.disconnect();
  observer = null;
});

watch(sentinel, (el, _prev, onCleanup) => {
  if (el === null) {
    return;
  }
  if (observer === null) {
    startObserving(el);
  } else {
    observer.observe(el);
  }
  onCleanup(() => {
    observer?.unobserve(el);
  });
});
</script>

<template>
  <div>
    <PieceList
      :pieces="props.pieces"
      :error="props.error"
      :composer-name-by-id="props.composerNameById"
      @delete="emit('delete', $event)"
    />
    <output class="list-status" aria-live="polite">
      <span v-if="props.pending" class="status-text">読み込み中…</span>
      <span v-else-if="props.error" class="status-error">
        <span class="status-error-message">取得に失敗しました。</span>
        <button type="button" class="btn-retry" @click="emit('retry')">再試行</button>
      </span>
      <span v-else-if="!props.hasMore && props.pieces.length > 0" class="status-text">
        これ以上ありません
      </span>
      <span
        v-if="props.hasMore && !props.error"
        ref="sentinel"
        class="sentinel"
        aria-hidden="true"
      ></span>
    </output>
  </div>
</template>

<style scoped>
.list-status {
  display: block;
  margin-top: 1rem;
  text-align: center;
}

.status-text {
  display: block;
  color: #666;
  font-size: 0.9rem;
  padding: 1rem 0;
}

.status-error {
  display: block;
  padding: 1rem 0;
  color: #c33;
}

.status-error-message {
  display: block;
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
  display: block;
  height: 1px;
}
</style>
