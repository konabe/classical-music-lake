<script setup lang="ts">
import { formatDate } from "~/utils/date";
import type { ListeningLog } from "~/types";

defineProps<{
  listeningLog: ListeningLog;
}>();

const emit = defineEmits<{
  edit: [];
  delete: [];
}>();
</script>

<template>
  <article class="log-item">
    <div class="log-main">
      <div class="log-meta">
        <FavoriteIndicator :is-favorite="listeningLog.isFavorite" />
        <span class="log-composer smallcaps">{{ listeningLog.composer }}</span>
        <span class="log-rule" aria-hidden="true" />
        <time class="log-date smallcaps numeric">{{ formatDate(listeningLog.listenedAt) }}</time>
      </div>

      <h2 class="log-title">
        <NuxtLink :to="`/listening-logs/${listeningLog.id}`">
          {{ listeningLog.piece }}
        </NuxtLink>
      </h2>

      <div class="log-rating">
        <RatingDisplay :rating="listeningLog.rating" />
      </div>

      <p v-if="listeningLog.memo" class="log-memo">
        <span class="memo-quote" aria-hidden="true">&ldquo;</span>
        {{ listeningLog.memo }}
        <span class="memo-quote" aria-hidden="true">&rdquo;</span>
      </p>
    </div>

    <div class="log-actions">
      <ButtonSecondary @click="emit('edit')">Edit</ButtonSecondary>
      <ButtonDanger @click="emit('delete')">Delete</ButtonDanger>
    </div>
  </article>
</template>

<style scoped>
.log-item {
  position: relative;
  background: var(--color-bg-paper);
  border-bottom: 1px solid var(--color-hairline);
  padding: 1.6rem 0.5rem 1.6rem 0;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1.5rem;
  transition: background 0.25s ease;
}

.log-item:hover {
  background: var(--color-bg-elevated);
}

.log-item::before {
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

.log-item:hover::before {
  transform: translateY(-50%) scaleY(1);
}

.log-main {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

.log-meta {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  flex-wrap: wrap;
}

.log-composer {
  color: var(--color-bordeaux);
}
:root.dark .log-composer {
  color: var(--color-accent);
}

.log-rule {
  width: 1.5rem;
  height: 1px;
  background: var(--color-hairline-strong);
}

.log-date {
  color: var(--color-text-muted);
}

.log-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-style: italic;
  font-size: clamp(1.3rem, 2.4vw, 1.65rem);
  line-height: 1.2;
  letter-spacing: var(--tracking-tight);
  font-variation-settings:
    "opsz" 144,
    "SOFT" 50;
}

.log-title a {
  color: var(--color-text);
  text-decoration: none;
  transition: color 0.25s ease;
}

.log-title a:hover {
  color: var(--color-accent);
}

.log-rating {
  margin-top: 0.1rem;
}

.log-memo {
  font-family: var(--font-serif);
  font-style: italic;
  color: var(--color-text-secondary);
  font-size: 1rem;
  line-height: 1.55;
  padding-left: 1rem;
  border-left: 1px solid var(--color-hairline-strong);
  max-width: 50em;
  margin-top: 0.25rem;
}

.memo-quote {
  font-family: var(--font-display);
  color: var(--color-accent);
  font-style: italic;
  font-size: 1.2em;
}

.log-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-shrink: 0;
  align-items: flex-end;
}

@media (max-width: 720px) {
  .log-item {
    grid-template-columns: 1fr;
  }
  .log-actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}
</style>
