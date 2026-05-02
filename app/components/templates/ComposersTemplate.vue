<script setup lang="ts">
import type { Composer } from "~/types";

const props = defineProps<{
  composers: Composer[];
  error: Error | null;
  pending: boolean;
  isAdmin: boolean;
}>();

const emit = defineEmits<{
  detail: [composer: Composer];
  edit: [composer: Composer];
  delete: [composer: Composer];
  retry: [];
}>();

const composerCount = computed(() => props.composers.length);
</script>

<template>
  <div class="composers-page">
    <header class="composers-masthead">
      <div class="masthead-meta">
        <span class="meta-tag smallcaps">III / Composers</span>
        <span class="meta-rule" aria-hidden="true" />
        <span class="meta-count smallcaps numeric">
          {{ composerCount.toString().padStart(3, "0") }}
          {{ composerCount === 1 ? "name on file" : "names on file" }}
        </span>
      </div>

      <h1 class="masthead-title">
        <span class="title-jp">作曲家</span>
        <span class="title-en"><em>Composers</em></span>
      </h1>

      <p class="masthead-lede">
        <em>Lives written in sound.</em> &mdash; 作曲家を時代と地域で巡る索引。
      </p>

      <div v-if="props.isAdmin" class="masthead-actions">
        <ButtonPrimary @click="$router.push('/composers/new')"> + 新しい作曲家 </ButtonPrimary>
      </div>
    </header>

    <ComposerList
      :composers="props.composers"
      :error="props.error"
      @detail="emit('detail', $event)"
      @edit="emit('edit', $event)"
      @delete="emit('delete', $event)"
    />
    <output v-if="props.pending" class="list-status" aria-live="polite">読み込み中…</output>
    <output v-else-if="props.error" class="list-status list-status--error" aria-live="polite">
      <span>取得に失敗しました。</span>
      <button type="button" class="btn-retry" @click="emit('retry')">再試行</button>
    </output>
  </div>
</template>

<style scoped>
.composers-page {
  margin-bottom: 4rem;
}

.composers-masthead {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 1.2rem 0 2.6rem;
  border-bottom: 1px solid var(--color-hairline-strong);
  margin-bottom: 2rem;
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

.list-status {
  display: block;
  margin-top: 1rem;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  padding: 1rem 0;
}

.list-status--error {
  color: var(--color-danger);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.btn-retry {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-danger);
  background: var(--color-bg-surface);
  color: var(--color-danger);
  border-radius: 4px;
  cursor: pointer;
}

.btn-retry:hover {
  background: var(--color-danger-bg);
}
</style>
