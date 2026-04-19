<script setup lang="ts">
import { formatDate } from "~/utils/date";
import type { ConcertLog } from "~/types";

defineProps<{
  concertLog: ConcertLog;
}>();

const emit = defineEmits<{
  detail: [];
}>();
</script>

<template>
  <div class="log-item">
    <div class="log-main">
      <div class="log-title">
        {{ concertLog.title }}
      </div>
      <div class="log-venue">{{ concertLog.venue }}</div>
      <div class="log-meta">
        <span class="date">{{ formatDate(concertLog.concertDate) }}</span>
      </div>
      <div v-if="concertLog.conductor" class="log-sub conductor">
        指揮: {{ concertLog.conductor }}
      </div>
      <div v-if="concertLog.orchestra" class="log-sub">
        {{ concertLog.orchestra }}
      </div>
      <div v-if="concertLog.soloist" class="log-sub">ソリスト: {{ concertLog.soloist }}</div>
    </div>
    <div class="log-actions">
      <ButtonSecondary label="詳細" @click="emit('detail')" />
    </div>
  </div>
</template>

<style scoped>
.log-item {
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-secondary);
  border-radius: 10px;
  padding: 1.2rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.log-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--color-text);
  margin-bottom: 0.3rem;
}

.log-venue {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.2rem;
}

.log-meta {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}

.date {
  color: var(--color-text-disabled);
}

.log-sub {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-top: 0.2rem;
}

.log-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-shrink: 0;
}
</style>
