<script setup lang="ts">
import type { ListeningLogStatistics } from "~/composables/useListeningLogStatistics";

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
  props.statistics.total === 0 ? "-" : props.statistics.averageRating.toFixed(2),
);

const formatMonthLabel = (month: string): string => {
  const [year, m] = month.split("-");
  return `${year}/${m}`;
};
</script>

<template>
  <div class="stats">
    <section class="summary">
      <div class="summary-card">
        <span class="summary-label">総鑑賞数</span>
        <span class="summary-value">{{ statistics.total }}</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">お気に入り</span>
        <span class="summary-value">{{ statistics.favoriteCount }}</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">平均評価</span>
        <span class="summary-value">{{ averageDisplay }}</span>
      </div>
    </section>

    <EmptyState v-if="statistics.total === 0">
      まだ鑑賞記録がありません。記録を追加すると統計が表示されます。
    </EmptyState>

    <template v-else>
      <section class="panel">
        <h2 class="panel-title">評価分布</h2>
        <ul class="bar-list">
          <li v-for="row in ratingRows" :key="row.rating" class="bar-row">
            <span class="bar-label">★{{ row.rating }}</span>
            <div class="bar-track">
              <div
                class="bar-fill"
                :style="{ width: `${(row.count / ratingMax) * 100}%` }"
                :data-empty="row.count === 0"
              />
            </div>
            <span class="bar-count">{{ row.count }}</span>
          </li>
        </ul>
      </section>

      <section class="panel">
        <h2 class="panel-title">よく聴く作曲家</h2>
        <ul class="bar-list">
          <li v-for="row in statistics.topComposers" :key="row.composer" class="bar-row">
            <span class="bar-label bar-label-name">{{ row.composer }}</span>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: `${(row.count / composerMax) * 100}%` }" />
            </div>
            <span class="bar-count">{{ row.count }}</span>
          </li>
        </ul>
      </section>

      <section class="panel">
        <h2 class="panel-title">月別の鑑賞数（直近 12 ヶ月）</h2>
        <ul class="bar-list">
          <li v-for="row in statistics.monthlyTrend" :key="row.month" class="bar-row">
            <span class="bar-label">{{ formatMonthLabel(row.month) }}</span>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: `${(row.count / monthlyMax) * 100}%` }" />
            </div>
            <span class="bar-count">{{ row.count }}</span>
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
  gap: 2rem;
}

.summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 600px) {
  .summary {
    grid-template-columns: 1fr;
  }
}

.summary-card {
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-secondary);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.summary-label {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.summary-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--color-text);
}

.panel {
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-secondary);
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
}

.panel-title {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.bar-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.bar-row {
  display: grid;
  grid-template-columns: 80px 1fr 40px;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
}

.bar-label {
  color: var(--color-text-muted);
}

.bar-label-name {
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bar-track {
  background: var(--color-bg-input);
  border-radius: 4px;
  height: 14px;
  overflow: hidden;
}

.bar-fill {
  background: var(--color-primary);
  height: 100%;
  transition: width 0.3s ease;
}

.bar-fill[data-empty="true"] {
  background: transparent;
}

.bar-count {
  text-align: right;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}
</style>
