<script setup lang="ts">
import { formatDate } from "@/utils/date";
import type { ListeningLog, Piece, PieceMovement, PieceWork, Rating } from "@/types";

const props = defineProps<{
  piece: Piece | null;
  error: Error | null;
  isAdmin: boolean;
  composerName: string;
  listeningLogs?: ListeningLog[];
  movements?: PieceMovement[];
  parentWork?: PieceWork | null;
  quickLogPieceLabel?: string;
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

const logs = computed<ListeningLog[]>(() => props.listeningLogs ?? []);
const logCount = computed(() => logs.value.length);

const movementsList = computed<PieceMovement[]>(() => props.movements ?? []);
const isWork = computed(() => props.piece?.kind === "work");
const isMovement = computed(() => props.piece?.kind === "movement");

const quickLogPieceTitle = computed(() => {
  if (props.quickLogPieceLabel !== undefined) {
    return props.quickLogPieceLabel;
  }
  return props.piece?.title ?? "";
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
      <nav v-if="isMovement && parentWork" class="movement-breadcrumb" aria-label="親楽曲">
        <NuxtLink :to="`/pieces/${parentWork.id}`" class="breadcrumb-link">
          <span aria-hidden="true">&larr;</span>
          <span class="smallcaps">{{ parentWork.title }}</span>
        </NuxtLink>
      </nav>

      <header class="piece-masthead">
        <div class="piece-meta">
          <span class="meta-tag smallcaps">II / Repertoire</span>
          <span class="meta-rule" aria-hidden="true" />
          <span class="meta-id smallcaps numeric">N&deg; {{ shortId }}</span>
        </div>

        <p class="piece-composer">{{ composerName }}</p>

        <h1 class="piece-title">{{ piece.title }}</h1>

        <div v-if="isWork" class="piece-category-wrapper">
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

      <template v-if="piece.videoUrls && piece.videoUrls.length > 0">
        <section class="piece-stage">
          <span class="stage-tag smallcaps">
            Performance{{ piece.videoUrls.length > 1 ? "s" : "" }}
          </span>
          <div
            v-for="(url, index) in piece.videoUrls"
            :key="`${piece.id}-${index}`"
            class="stage-frame"
          >
            <p v-if="piece.videoUrls.length > 1" class="stage-index smallcaps numeric">
              N&deg; {{ String(index + 1).padStart(2, "0") }}
            </p>
            <VideoPlayer :video-url="url" @play="hasStartedPlaying = true" />
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
            :piece="quickLogPieceTitle"
            @submit="emit('save', $event)"
          />
        </section>
      </template>

      <section v-if="isWork && movementsList.length > 0" class="piece-movements">
        <header class="movements-masthead">
          <span class="movements-tag smallcaps">Movements</span>
          <span class="movements-rule" aria-hidden="true" />
          <span class="movements-count smallcaps numeric">
            {{ movementsList.length.toString().padStart(2, "0") }}
            {{ movementsList.length === 1 ? "movement" : "movements" }}
          </span>
        </header>

        <h2 class="movements-title">
          <span class="movements-title-jp">楽章</span>
          <span class="movements-title-en"><em>Mouvements</em></span>
        </h2>

        <ol class="movements-list stagger-children">
          <li v-for="movement in movementsList" :key="movement.id" class="movements-item">
            <MovementListItem :movement="movement" />
          </li>
        </ol>
      </section>

      <section v-if="logCount > 0" class="piece-listenings" aria-labelledby="listenings-heading">
        <header class="listenings-masthead">
          <span class="listenings-tag smallcaps">Listening records</span>
          <span class="listenings-rule" aria-hidden="true" />
          <span class="listenings-count smallcaps numeric">
            {{ logCount.toString().padStart(2, "0") }}
            {{ logCount === 1 ? "entry" : "entries" }}
          </span>
        </header>

        <h2 id="listenings-heading" class="listenings-title">
          <span class="listenings-title-jp">あなたの鑑賞記録</span>
          <span class="listenings-title-en"><em>Écoutes</em></span>
        </h2>

        <ol class="listenings-list stagger-children">
          <li v-for="(log, index) in logs" :key="log.id" class="listenings-item">
            <span class="listenings-index smallcaps numeric">
              N&deg; {{ (index + 1).toString().padStart(2, "0") }}
            </span>
            <NuxtLink :to="`/listening-logs/${log.id}`" class="listenings-link">
              <span class="listenings-meta">
                <FavoriteIndicator :is-favorite="log.isFavorite" />
                <time class="listenings-date smallcaps numeric">
                  {{ formatDate(log.listenedAt) }}
                </time>
                <span class="listenings-rule-mini" aria-hidden="true" />
                <RatingDisplay :rating="log.rating" />
              </span>
              <span v-if="log.memo" class="listenings-memo">{{ log.memo }}</span>
            </NuxtLink>
          </li>
        </ol>
      </section>
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

.movement-breadcrumb {
  margin: -1rem 0 1.5rem;
}

.breadcrumb-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--color-text-muted);
  text-decoration: none;
  transition:
    color 0.25s ease,
    gap 0.25s ease;
}

.breadcrumb-link:hover {
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
  gap: 1.4rem;
  margin-bottom: 3rem;
}

.stage-index {
  margin: 0 0 0.6rem;
  color: var(--color-text-muted);
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

.piece-movements {
  margin-top: 3rem;
}

.movements-masthead {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin-bottom: 0.6rem;
}

.movements-tag {
  color: var(--color-bordeaux);
}
:root.dark .movements-tag {
  color: var(--color-accent);
}

.movements-rule {
  flex: 1;
  height: 1px;
  background: var(--color-hairline);
}

.movements-count {
  color: var(--color-text-muted);
}

.movements-title {
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

.movements-title-jp {
  font-style: normal;
  font-weight: 400;
}

.movements-title-en {
  color: var(--color-accent);
  font-style: italic;
  font-size: 0.7em;
  font-variation-settings:
    "opsz" 144,
    "SOFT" 100,
    "WONK" 1;
}

.movements-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--color-hairline);
}

.piece-listenings {
  margin-top: 3rem;
}

.listenings-masthead {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin-bottom: 0.6rem;
}

.listenings-tag {
  color: var(--color-bordeaux);
}
:root.dark .listenings-tag {
  color: var(--color-accent);
}

.listenings-rule {
  flex: 1;
  height: 1px;
  background: var(--color-hairline);
}

.listenings-count {
  color: var(--color-text-muted);
}

.listenings-title {
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

.listenings-title-jp {
  font-style: normal;
  font-weight: 400;
}

.listenings-title-en {
  color: var(--color-accent);
  font-style: italic;
  font-size: 0.7em;
  font-variation-settings:
    "opsz" 144,
    "SOFT" 100,
    "WONK" 1;
}

.listenings-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--color-hairline);
}

.listenings-item {
  display: grid;
  grid-template-columns: 4rem 1fr;
  align-items: baseline;
  gap: 0.5rem 1.2rem;
  padding: 1.1rem 0;
  border-bottom: 1px solid var(--color-hairline);
}

.listenings-index {
  color: var(--color-text-faint);
}

.listenings-link {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  text-decoration: none;
  color: var(--color-text);
  transition: color 0.25s ease;
}

.listenings-link:hover {
  color: var(--color-accent);
}

.listenings-meta {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  flex-wrap: wrap;
}

.listenings-date {
  color: var(--color-text-muted);
}

.listenings-rule-mini {
  width: 1.5rem;
  height: 1px;
  background: var(--color-hairline-strong);
}

.listenings-memo {
  font-family: var(--font-serif);
  font-style: italic;
  color: var(--color-text-secondary);
  font-size: 1rem;
  line-height: 1.55;
  padding-left: 1rem;
  border-left: 1px solid var(--color-hairline-strong);
  max-width: 50em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 720px) {
  .listenings-item {
    grid-template-columns: 1fr;
  }

  .listenings-index {
    display: block;
  }
}
</style>
