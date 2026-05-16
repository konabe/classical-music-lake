<script setup lang="ts">
import type { ListeningLogStatistics } from "@/composables/useListeningLogStatistics";

const props = defineProps<{
  statistics: ListeningLogStatistics;
}>();

const ratingRows = computed(() =>
  ([5, 4, 3, 2, 1] as const).map((rating) => ({
    rating,
    count: props.statistics.ratingDistribution[rating],
  })),
);

const ratingMax = computed(() => Math.max(1, ...ratingRows.value.map((r) => r.count)));

const composerMax = computed(() =>
  Math.max(1, ...props.statistics.topComposers.map((c) => c.count)),
);

const monthlyMax = computed(() =>
  Math.max(1, ...props.statistics.monthlyTrend.map((m) => m.count)),
);

const averageDisplay = computed(() =>
  props.statistics.total === 0 ? "—" : props.statistics.averageRating.toFixed(2),
);

const formatMonthLabel = (month: string): string => {
  const [year, m] = month.split("-");
  return `${year}/${m}`;
};
</script>

<template>
  <div class="stats">
    <section class="summary stagger-children">
      <article class="summary-card">
        <span class="summary-num smallcaps">N&deg; 01</span>
        <span class="summary-label smallcaps">Total entries</span>
        <span class="summary-value numeric">{{ statistics.total }}</span>
        <span class="summary-meta">記録された鑑賞</span>
      </article>
      <article class="summary-card summary-card--accent">
        <span class="summary-num smallcaps">N&deg; 02</span>
        <span class="summary-label smallcaps">Favorites</span>
        <span class="summary-value numeric">{{ statistics.favoriteCount }}</span>
        <span class="summary-meta">心に残った演奏</span>
      </article>
      <article class="summary-card">
        <span class="summary-num smallcaps">N&deg; 03</span>
        <span class="summary-label smallcaps">Average rating</span>
        <span class="summary-value numeric">{{ averageDisplay }}</span>
        <span class="summary-meta">5 段階評価の平均</span>
      </article>
    </section>

    <EmptyState v-if="statistics.total === 0">
      まだ鑑賞記録がありません。記録を追加すると統計が表示されます。
    </EmptyState>

    <template v-else>
      <section class="panel">
        <header class="panel-head">
          <span class="panel-num">I</span>
          <h2 class="panel-title">Distribution of ratings</h2>
          <span class="smallcaps panel-meta">評価分布</span>
        </header>
        <ul class="bar-list">
          <li v-for="row in ratingRows" :key="row.rating" class="bar-row">
            <span class="bar-label numeric">★ {{ row.rating }}</span>
            <div class="bar-track">
              <div
                class="bar-fill"
                :style="{ width: `${(row.count / ratingMax) * 100}%` }"
                :data-empty="row.count === 0"
              />
            </div>
            <span class="bar-count numeric">{{ row.count }}</span>
          </li>
        </ul>
      </section>

      <section class="panel">
        <header class="panel-head">
          <span class="panel-num">II</span>
          <h2 class="panel-title">Most listened composers</h2>
          <span class="smallcaps panel-meta">よく聴く作曲家</span>
        </header>
        <ul class="bar-list">
          <li v-for="row in statistics.topComposers" :key="row.composerName" class="bar-row">
            <span class="bar-label bar-label-name">{{ row.composerName }}</span>
            <div class="bar-track">
              <div
                class="bar-fill bar-fill--accent"
                :style="{ width: `${(row.count / composerMax) * 100}%` }"
              />
            </div>
            <span class="bar-count numeric">{{ row.count }}</span>
          </li>
        </ul>
      </section>

      <section class="panel">
        <header class="panel-head">
          <span class="panel-num">III</span>
          <h2 class="panel-title">Monthly trend</h2>
          <span class="smallcaps panel-meta">直近 12 ヶ月の鑑賞数</span>
        </header>
        <ul class="bar-list">
          <li v-for="row in statistics.monthlyTrend" :key="row.month" class="bar-row">
            <span class="bar-label numeric">{{ formatMonthLabel(row.month) }}</span>
            <div class="bar-track">
              <div
                class="bar-fill bar-fill--bordeaux"
                :style="{ width: `${(row.count / monthlyMax) * 100}%` }"
              />
            </div>
            <span class="bar-count numeric">{{ row.count }}</span>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<style scoped>
.stats {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

/* ── Summary cards ── */
.summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  border: 1px solid var(--color-hairline-strong);
  background: var(--color-hairline);
}

@media (max-width: 760px) {
  .summary {
    grid-template-columns: 1fr;
  }
}

.summary-card {
  background: var(--color-bg-paper);
  padding: 1.8rem 1.5rem 1.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  position: relative;
}

.summary-card--accent {
  background: var(--color-bg-elevated);
}

.summary-num {
  color: var(--color-bordeaux);
  font-weight: 700;
}
:root.dark .summary-num {
  color: var(--color-accent);
}

.summary-label {
  color: var(--color-text-muted);
}

.summary-value {
  font-family: var(--font-display);
  font-weight: 300;
  font-size: clamp(3rem, 8vw, 5rem);
  line-height: 0.95;
  color: var(--color-text);
  margin: 0.4rem 0 0;
  font-variation-settings:
    "opsz" 144,
    "SOFT" 30,
    "WONK" 1;
}

.summary-card--accent .summary-value {
  color: var(--color-accent);
}

.summary-meta {
  font-family: var(--font-serif);
  font-style: italic;
  color: var(--color-text-faint);
  font-size: 0.85rem;
  margin-top: 0.2rem;
}

/* ── Panel ── */
.panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel-head {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-hairline-strong);
}

.panel-num {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.4rem;
  color: var(--color-accent);
}

.panel-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-style: italic;
  font-size: clamp(1.4rem, 2.5vw, 1.8rem);
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  flex: 1;
  font-variation-settings:
    "opsz" 144,
    "SOFT" 50;
}

.panel-meta {
  color: var(--color-text-muted);
}

/* ── Bar charts ── */
.bar-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 0;
  margin: 0;
}

.bar-row {
  display: grid;
  grid-template-columns: 110px 1fr 50px;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
}

.bar-label {
  color: var(--color-text-muted);
  font-family: var(--font-sans);
  font-size: 0.8rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.bar-label-name {
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1rem;
  text-transform: none;
  letter-spacing: 0;
}

.bar-track {
  height: 4px;
  background: var(--color-hairline);
  position: relative;
  overflow: hidden;
}

.bar-fill {
  background: var(--color-bg-ink);
  height: 100%;
  transition: width 0.6s cubic-bezier(0.2, 0.6, 0.2, 1);
  position: relative;
}

.bar-fill::after {
  content: "";
  position: absolute;
  right: -3px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  background: var(--color-accent);
  border-radius: 50%;
}

.bar-fill--accent {
  background: var(--color-accent);
}
.bar-fill--accent::after {
  background: var(--color-bg-ink);
}
:root.dark .bar-fill--accent::after {
  background: var(--color-text);
}

.bar-fill--bordeaux {
  background: var(--color-bordeaux);
}
.bar-fill--bordeaux::after {
  background: var(--color-accent);
}

.bar-fill[data-empty="true"] {
  background: transparent;
}
.bar-fill[data-empty="true"]::after {
  display: none;
}

.bar-count {
  text-align: right;
  color: var(--color-text);
  font-family: var(--font-display);
  font-weight: 400;
  font-style: italic;
  font-size: 1.1rem;
}
</style>
