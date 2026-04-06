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
        {{ concertLog.title ?? concertLog.venue }}
      </div>
      <div v-if="concertLog.title" class="log-venue">{{ concertLog.venue }}</div>
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
  background: #eaeef4;
  border: 1px solid #9aa5b4;
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
  color: #1e2d5a;
  margin-bottom: 0.3rem;
}

.log-venue {
  font-size: 0.95rem;
  color: #444;
  margin-bottom: 0.2rem;
}

.log-meta {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}

.date {
  color: #999;
}

.log-sub {
  font-size: 0.9rem;
  color: #555;
  margin-top: 0.2rem;
}

.log-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-shrink: 0;
}
</style>
